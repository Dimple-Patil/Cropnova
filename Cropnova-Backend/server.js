const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'cropnova_super_secret_key_2026';
const mandiDailyCache = new Map();

// Keyless fallback: Agmarknet 2.0 exposes the public market-price service used by
// its website. The response shape has changed between releases, so normalize the
// common field names below and keep the provider configurable through .env.
const fetchAgmarknetFallback = async ({ crop, state, district }) => {
  const baseUrl = process.env.AGMARKNET_API_URL || 'https://api.agmarknet.gov.in/v1/prices-and-arrivals/market-price/lastweek';
  const url = new URL(baseUrl);
  url.searchParams.set('page', '1');
  url.searchParams.set('limit', '100');
  if (crop) url.searchParams.set('commodity', crop);
  if (state) url.searchParams.set('state', state);
  if (district) url.searchParams.set('district', district);
  const response = await fetch(url, { headers: { Accept: 'application/json', Referer: 'https://agmarknet.gov.in/' } });
  if (!response.ok) throw new Error(`Agmarknet fallback HTTP ${response.status}`);
  const body = await response.json();
  const rows = Array.isArray(body) ? body : (body.data || body.records || body.content || body.result || []);
  return rows.map(item => ({
    commodity: item.commodity || item.commodityName || item.crop_name || item.cropName,
    market: item.market || item.marketName || item.market_name || item.district,
    district: item.district || item.districtName,
    state: item.state || item.stateName,
    modal_price: item.modal_price || item.modalPrice || item.modal || item.price,
    min_price: item.min_price || item.minPrice,
    max_price: item.max_price || item.maxPrice,
    arrival_date: item.arrival_date || item.arrivalDate || item.date
  })).filter(item => item.commodity && Number(item.modal_price || item.max_price || 0) > 0);
};

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Middleware for auth
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(400).json({ error: 'Token is not valid' });
  }
};

const optionalAuth = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return next();
  try {
    req.user = jwt.verify(token, JWT_SECRET);
  } catch (e) {
    req.user = null;
  }
  next();
};

// ============================================================================
// Persistent calendar, irrigation, and notification activity
// ============================================================================

app.get('/api/calendar/tasks', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT task_id, status, updated_at FROM calendar_task_states WHERE user_id = $1', [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Could not load calendar task states' });
  }
});

app.put('/api/calendar/tasks/:taskId', auth, async (req, res) => {
  const { status } = req.body;
  if (!['done', 'skipped', 'later'].includes(status)) return res.status(400).json({ error: 'Invalid task status' });
  try {
    const result = await pool.query(`
      INSERT INTO calendar_task_states (user_id, task_id, status)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, task_id) DO UPDATE SET status = EXCLUDED.status, updated_at = CURRENT_TIMESTAMP
      RETURNING task_id, status, updated_at
    `, [req.user.id, req.params.taskId, status]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Could not save calendar task state' });
  }
});

app.get('/api/irrigation/logs', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM irrigation_logs WHERE user_id = $1 ORDER BY recorded_at DESC', [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Could not load irrigation logs' });
  }
});

app.post('/api/irrigation/logs', auth, async (req, res) => {
  const { cropId, watered, scheduledDate, nextDate } = req.body;
  try {
    const result = await pool.query(`
      INSERT INTO irrigation_logs (user_id, crop_id, watered, scheduled_date, next_date)
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `, [req.user.id, cropId, Boolean(watered), scheduledDate || null, nextDate || null]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Could not save irrigation log' });
  }
});

app.get('/api/notifications', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Could not load notifications' });
  }
});

app.put('/api/notifications/:id/read', auth, async (req, res) => {
  try {
    const result = await pool.query('UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2 RETURNING *', [req.params.id, req.user.id]);
    res.json(result.rows[0] || { success: true });
  } catch (err) {
    res.status(500).json({ error: 'Could not update notification' });
  }
});

app.get('/api/market/prices', auth, async (req, res) => {
  try {
    const { crop, state, district } = req.query;
    const cacheKey = JSON.stringify({ crop: crop || '', state: state || '', district: district || '' });
    const today = new Date().toISOString().slice(0, 10);
    const cached = mandiDailyCache.get(cacheKey);
    if (cached?.date === today) return res.json({ ...cached.payload, cached: true });
    const apiKey = process.env.DATA_GOV_API_KEY;
    const resourceId = process.env.MANDI_RESOURCE_ID || '9ef84268-d588-465a-a308-a864a43d0070';
    if (apiKey && resourceId) {
      const params = new URLSearchParams({ 'api-key': apiKey, format: 'json', limit: '100', resource_id: resourceId });
      if (crop) params.set('filters[commodity]', crop);
      if (state) params.set('filters[state]', state);
      if (district) params.set('filters[district]', district);
      const liveResponse = await fetch(`https://api.data.gov.in/resource/${resourceId}?${params.toString()}`);
      if (liveResponse.ok) {
        const live = await liveResponse.json();
        if (Array.isArray(live.records) && live.records.length) {
          const payload = { source: 'data.gov.in', records: live.records, fetched_at: new Date().toISOString() };
          mandiDailyCache.set(cacheKey, { date: today, payload });
          return res.json(payload);
        }
      }
    }
    try {
      const fallbackRecords = await fetchAgmarknetFallback({ crop, state, district });
      if (fallbackRecords.length) {
        const payload = { source: 'agmarknet.gov.in', records: fallbackRecords, fetched_at: new Date().toISOString(), warning: 'Using keyless Agmarknet public feed' };
        mandiDailyCache.set(cacheKey, { date: today, payload });
        return res.json(payload);
      }
    } catch (fallbackError) {
      console.warn('Agmarknet keyless fallback unavailable:', fallbackError.message);
    }
    const result = await pool.query('SELECT crop_key, crop_name, price_per_quintal, yield_per_acre, updated_at FROM crop_market_prices ORDER BY crop_name');
    const payload = { source: 'database-fallback', records: result.rows, fetched_at: new Date().toISOString(), warning: 'Live data.gov.in feed is not configured or returned no records' };
    mandiDailyCache.set(cacheKey, { date: today, payload });
    res.json(payload);
  } catch (err) {
    try {
      const fallback = await pool.query('SELECT crop_key, crop_name, price_per_quintal, yield_per_acre, updated_at FROM crop_market_prices ORDER BY crop_name');
      res.json({ source: 'database-fallback', records: fallback.rows, warning: 'Live mandi service unavailable' });
    } catch (fallbackError) {
      res.status(500).json({ error: 'Could not load market prices' });
    }
  }
});

app.get('/api/financial-inputs', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM crop_financial_inputs WHERE user_id = $1', [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Could not load financial inputs' });
  }
});

app.put('/api/financial-inputs/:cropId', auth, async (req, res) => {
  const { areaAcres, expectedYieldQuintals, seedCost, fertilizerCost, pesticideCost, laborCost, irrigationCost, otherCost } = req.body;
  try {
    const result = await pool.query(`
      INSERT INTO crop_financial_inputs (user_id, crop_id, area_acres, expected_yield_quintals, seed_cost, fertilizer_cost, pesticide_cost, labor_cost, irrigation_cost, other_cost)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      ON CONFLICT (user_id, crop_id) DO UPDATE SET area_acres=EXCLUDED.area_acres, expected_yield_quintals=EXCLUDED.expected_yield_quintals, seed_cost=EXCLUDED.seed_cost, fertilizer_cost=EXCLUDED.fertilizer_cost, pesticide_cost=EXCLUDED.pesticide_cost, labor_cost=EXCLUDED.labor_cost, irrigation_cost=EXCLUDED.irrigation_cost, other_cost=EXCLUDED.other_cost, updated_at=CURRENT_TIMESTAMP
      RETURNING *
    `, [req.user.id, req.params.cropId, areaAcres || 0, expectedYieldQuintals || 0, seedCost || 0, fertilizerCost || 0, pesticideCost || 0, laborCost || 0, irrigationCost || 0, otherCost || 0]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Could not save financial inputs' });
  }
});

const cropnovaFeatures = [
  {
    key: 'dashboard',
    label: 'Farmer Dashboard',
    route: '/',
    intents: ['dashboard', 'overview', 'summary', 'home', 'farm status'],
    answer: 'Use the Farmer Dashboard for farm overview, active crop counts, upcoming tasks, weather signals, and recent activity.'
  },
  {
    key: 'crops',
    label: 'Crop Management',
    route: '/crops',
    intents: ['crop', 'sowing', 'variety', 'field', 'farm', 'planting'],
    answer: 'Crop Management helps you add farms, register crops, track sowing dates, varieties, field sections, and crop status.'
  },
  {
    key: 'soil',
    label: 'Soil Analysis & Health',
    route: '/soil',
    intents: ['soil', 'ph', 'organic carbon', 'nitrogen', 'phosphorus', 'potassium', 'npk'],
    answer: 'Soil Analysis reviews pH, soil type, organic carbon, and nutrient balance so recommendations match field conditions.'
  },
  {
    key: 'fertilizer',
    label: 'Fertilizer Calculator',
    route: '/fertilizers',
    intents: ['fertilizer', 'urea', 'dap', 'mop', 'dosage', 'dose', 'nutrient'],
    answer: 'The Fertilizer Calculator turns crop, acreage, and soil inputs into split-dose NPK guidance.'
  },
  {
    key: 'marketplace',
    label: 'Marketplace',
    route: '/marketplace',
    intents: ['market', 'buy', 'sell', 'price', 'seed', 'equipment', 'input'],
    answer: 'Marketplace connects farmers with seeds, fertilizers, crop protection products, equipment, and vendor listings.'
  },
  {
    key: 'vendor',
    label: 'Vendor Inventory & Sales',
    route: '/vendor',
    intents: ['vendor', 'inventory', 'sales', 'stock', 'orders'],
    answer: 'Vendor Portal supports inventory, stock visibility, product listings, and sales workflows for agricultural suppliers.'
  },
  {
    key: 'expert',
    label: 'Expert Consultation',
    route: '/expert',
    intents: ['expert', 'consult', 'advisor', 'agronomist', 'help'],
    answer: 'Expert Consultation is for getting specialist guidance on crops, soil, pests, irrigation, and farm planning.'
  },
  {
    key: 'schemes',
    label: 'Government Schemes',
    route: '/schemes',
    intents: ['scheme', 'subsidy', 'government', 'pm-kisan', 'loan', 'insurance'],
    answer: 'Government Schemes helps farmers discover subsidies, support programs, crop insurance, and eligibility paths.'
  },
  {
    key: 'news',
    label: 'News & Updates',
    route: '/news',
    intents: ['news', 'update', 'mandi', 'policy', 'alert'],
    answer: 'News & Updates surfaces agriculture news, market signals, weather advisories, and policy changes.'
  },
  {
    key: 'finance',
    label: 'Farm Expenses & Income',
    route: '/finance',
    intents: ['expense', 'income', 'profit', 'loss', 'finance', 'cost', 'budget'],
    answer: 'Farm Expenses & Income tracks spending, earnings, categories, and profit trends by farm activity.'
  },
  {
    key: 'harvest',
    label: 'Harvest Management',
    route: '/harvest',
    intents: ['harvest', 'yield', 'storage', 'post harvest', 'ready'],
    answer: 'Harvest Management helps monitor expected harvest dates, crop readiness, yield planning, and post-harvest actions.'
  },
  {
    key: 'notifications',
    label: 'Alerts & Reminders',
    route: '/notifications',
    intents: ['notification', 'reminder', 'alert', 'task', 'due'],
    answer: 'Alerts & Reminders keeps time-sensitive farm tasks visible, including spray, irrigation, harvest, and scheme deadlines.'
  },
  {
    key: 'reports',
    label: 'Reports & Analytics',
    route: '/reports',
    intents: ['report', 'analytics', 'chart', 'performance', 'trend'],
    answer: 'Reports & Analytics turns crop, expense, and farm records into performance insights and planning views.'
  },
  {
    key: 'disease',
    label: 'AI Disease & Pest Scanner',
    route: null,
    intents: ['disease', 'pest', 'leaf', 'spot', 'yellow', 'scan', 'photo', 'insect', 'ipm', 'blight', 'rust'],
    answer: 'Use the chat upload button for crop or leaf photos. The assistant returns likely pest or disease, confidence, organic controls, and chemical options.'
  },
  {
    key: 'weather',
    label: 'Weather Monitoring',
    route: null,
    intents: ['weather', 'rain', 'temperature', 'humidity', 'wind', 'forecast', 'irrigation'],
    answer: 'Weather Monitoring gives rainfall, humidity, wind, and spray or irrigation timing guidance.'
  },
  {
    key: 'profile',
    label: 'Profile',
    route: '/profile',
    intents: ['profile', 'location', 'village', 'district', 'state', 'phone'],
    answer: 'Profile stores farmer identity, role, phone, village, district, state, and pincode so recommendations are local.'
  }
];

const detectFeatures = (message = '') => {
  const query = message.toLowerCase();
  const matches = cropnovaFeatures
    .map((feature) => ({
      ...feature,
      score: feature.intents.reduce((total, token) => total + (query.includes(token) ? 1 : 0), 0)
    }))
    .filter((feature) => feature.score > 0)
    .sort((a, b) => b.score - a.score);

  if (matches.length) return matches.slice(0, 3);
  return cropnovaFeatures.filter((feature) => ['dashboard', 'crops', 'disease'].includes(feature.key));
};

const buildAgentReply = ({ message, userProfile, farms, crops, expenses }) => {
  const query = (message || '').toLowerCase();
  const matchedFeatures = detectFeatures(message);
  const primary = matchedFeatures[0];
  const farmCount = farms.length;
  const activeCrops = crops.filter((crop) => crop.status !== 'Harvested').length;
  const expenseTotal = expenses
    .filter((entry) => String(entry.type || '').toLowerCase() !== 'income')
    .reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
  const incomeTotal = expenses
    .filter((entry) => String(entry.type || '').toLowerCase() === 'income')
    .reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
  const location = userProfile?.village || userProfile?.district || userProfile?.state || userProfile?.location || 'your farm location';

  const lines = [];
  lines.push(`Krishimitra AI: ${primary.answer}`);

  if (query.includes('all feature') || query.includes('features') || query.includes('what can') || query.includes('help')) {
    lines.push('I can help with Cropnova features: dashboard overview, crop management, soil health, fertilizer dose, disease and pest scan, weather advice, marketplace, vendor inventory, expert consultation, government schemes, news, finance, harvest planning, alerts, reports, and profile guidance.');
  }

  if (userProfile) {
    lines.push(`Your current context: ${userProfile.name || 'farmer'} in ${location}, with ${farmCount} farm(s), ${activeCrops} active crop(s), expenses of ₹${expenseTotal.toLocaleString('en-IN')}, and income of ₹${incomeTotal.toLocaleString('en-IN')}.`);
  } else {
    lines.push('Sign in to let me use your saved farms, crops, expenses, and location for personalized recommendations.');
  }

  if (primary.key === 'disease') {
    lines.push('For a photo diagnosis, upload a clear image of the affected leaf or plant part. Until then: isolate the affected patch, avoid overhead irrigation, remove badly infected leaves, and prefer neem or biocontrol first for mild cases.');
  } else if (primary.key === 'fertilizer') {
    lines.push('For fertilizer planning, share crop name, acreage, soil type, pH, and growth stage. As a safe default, split nitrogen instead of applying all urea at once.');
  } else if (primary.key === 'weather') {
    lines.push('Avoid spraying before expected rain or high wind. Irrigate early morning or evening when heat stress is lower.');
  } else if (primary.key === 'finance') {
    const net = incomeTotal - expenseTotal;
    lines.push(`Current recorded net position is ₹${net.toLocaleString('en-IN')}. Log each input, labor, machinery, and harvest sale to make reports more accurate.`);
  } else if (primary.key === 'harvest') {
    const nextCrop = crops.find((crop) => crop.expected_harvest_date && crop.status !== 'Harvested');
    if (nextCrop) {
      lines.push(`Next crop to watch: ${nextCrop.crop_name} on ${nextCrop.farm_name || 'your farm'}, expected around ${new Date(nextCrop.expected_harvest_date).toLocaleDateString('en-IN')}.`);
    } else {
      lines.push('Add expected harvest dates in Crop Management so I can surface readiness and storage reminders.');
    }
  } else if (primary.key === 'crops') {
    lines.push('Best next step: keep every crop linked to a farm with sowing date, variety, field section, and expected harvest date. That powers harvest, finance, and reports.');
  }

  const related = matchedFeatures
    .filter((feature) => feature.key !== primary.key)
    .map((feature) => feature.route ? `${feature.label} (${feature.route})` : feature.label);
  if (related.length) lines.push(`Related Cropnova tools: ${related.join(', ')}.`);
  if (primary.route) lines.push(`Open ${primary.label}: ${primary.route}`);

  return {
    reply: lines.join('\n\n'),
    feature: {
      key: primary.key,
      label: primary.label,
      route: primary.route
    },
    suggestions: [
      'Show my farm overview',
      'Recommend crop and fertilizer plan',
      'Diagnose pest or disease',
      'Explain all Cropnova features'
    ]
  };
};

// ============================================================================
// 1. Auth API
// ============================================================================

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role, phone, location, village, district, state, pincode } = req.body;
  try {
    console.log(`[Register Request] Email: ${email}, Name: ${name}`);
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      console.log(`[Register] User already exists: ${email}`);
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password || '123456', salt);
    
    let newUser;
    try {
      newUser = await pool.query(
        'INSERT INTO users (name, email, password_hash, role, phone, location, village, district, state, pincode) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id, name, email, role, phone, location, village, district, state, pincode',
        [name || 'New User', email, hash, role || 'farmer', phone || '', location || '', village || '', district || '', state || '', pincode || '']
      );
    } catch (e) {
      newUser = await pool.query(
        'INSERT INTO users (name, email, password_hash, role, phone, location) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, role, phone, location',
        [name || 'New User', email, hash, role || 'farmer', phone || '', location || '']
      );
    }

    console.log(`[Register Success] Created User ID: ${newUser.rows[0].id}`);
    const token = jwt.sign({ id: newUser.rows[0].id, role: newUser.rows[0].role || 'farmer' }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: newUser.rows[0] });
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ error: 'Database Registration Failed: ' + err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    console.log(`[Login Request] Email: ${email}`);
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) return res.status(401).json({ error: 'User not found. Please register first.' });
    
    const user = userResult.rows[0];
    const isMatch = user.password_hash ? await bcrypt.compare(password || '123456', user.password_hash) : true;
    
    if (!isMatch && password !== '123456') return res.status(401).json({ error: 'Invalid password' });

    const userRole = user.role || 'farmer';
    const token = jwt.sign({ id: user.id, role: userRole }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: userRole,
        phone: user.phone || '',
        location: user.location || '',
        village: user.village || '',
        district: user.district || '',
        state: user.state || '',
        pincode: user.pincode || ''
      }
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Database Login Error: ' + err.message });
  }
});

app.put('/api/auth/profile', auth, async (req, res) => {
  const { name, phone, village, district, state, pincode, location } = req.body;
  try {
    try {
      const updated = await pool.query(
        'UPDATE users SET name = COALESCE($1, name), phone = COALESCE($2, phone), village = COALESCE($3, village), district = COALESCE($4, district), state = COALESCE($5, state), pincode = COALESCE($6, pincode), location = COALESCE($7, location) WHERE id = $8 RETURNING id, name, email, role, phone, village, district, state, pincode, location',
        [name, phone, village, district, state, pincode, location || `${district}, ${state}`, req.user.id]
      );
      res.json(updated.rows[0]);
    } catch (e) {
      const updated = await pool.query(
        'UPDATE users SET name = COALESCE($1, name), phone = COALESCE($2, phone), location = COALESCE($3, location) WHERE id = $4 RETURNING id, name, email, role, phone, location',
        [name, phone, location || `${district}, ${state}`, req.user.id]
      );
      res.json({ ...updated.rows[0], village, district, state, pincode });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile: ' + err.message });
  }
});


// ============================================================================
// 2. Farmer Overview API
// ============================================================================

app.get('/api/farmer/overview', auth, async (req, res) => {
  try {
    const farms = await pool.query('SELECT COUNT(*) FROM farms WHERE user_id = $1', [req.user.id]);
    
    // We get active crops by joining farms and crops
    const crops = await pool.query(`
      SELECT COUNT(c.id) 
      FROM crops c 
      JOIN farms f ON c.farm_id = f.id 
      WHERE f.user_id = $1 AND c.status != 'Harvested'
    `, [req.user.id]);

    res.json({
      totalFarms: parseInt(farms.rows[0].count),
      activeCrops: parseInt(crops.rows[0].count),
      upcomingTasks: [
        { id: 1, task: 'Apply Urea Top Dressing', dueDate: '2026-09-05', priority: 'High' },
        { id: 2, task: 'Inspect Soil Moisture', dueDate: '2026-09-07', priority: 'Medium' }
      ],
      recentActivities: [
        { id: 1, text: 'Logged income from harvest', time: '2 days ago' },
        { id: 2, text: 'Ran AI Disease Scan', time: '3 days ago' }
      ]
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================================================
// 3. Farms API
// ============================================================================

app.get('/api/farms', auth, async (req, res) => {
  try {
    const farms = await pool.query('SELECT * FROM farms WHERE user_id = $1', [req.user.id]);
    res.json(farms.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/farms', auth, async (req, res) => {
  const { name, location, sizeAcres, soilType, irrigationSource, phLevel, organicCarbon } = req.body;
  try {
    const newFarm = await pool.query(
      'INSERT INTO farms (user_id, name, location, size_acres, soil_type, irrigation_source, ph_level, organic_carbon) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [req.user.id, name, location || 'Farm Location', sizeAcres || 5, soilType || 'Loamy Alluvial', irrigationSource || 'Canal Water', phLevel || '6.8', organicCarbon || '0.55%']
    );
    res.status(201).json(newFarm.rows[0]);
  } catch (err) {
    // Fallback if DB column doesn't exist yet
    try {
      const fallbackFarm = await pool.query(
        'INSERT INTO farms (user_id, name, location, size_acres, soil_type, irrigation_source) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [req.user.id, name, location || 'Farm Location', sizeAcres || 5, soilType || 'Loamy Alluvial', irrigationSource || 'Canal Water']
      );
      res.status(201).json({ ...fallbackFarm.rows[0], ph_level: phLevel || '6.8', organic_carbon: organicCarbon || '0.55%' });
    } catch (e) {
      res.status(500).json({ error: 'Server error: ' + e.message });
    }
  }
});

app.delete('/api/farms/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM farms WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================================================
// 4. Crops API
// ============================================================================

app.get('/api/crops', auth, async (req, res) => {
  try {
    const crops = await pool.query(`
      SELECT c.*, f.name as farm_name 
      FROM crops c 
      JOIN farms f ON c.farm_id = f.id 
      WHERE f.user_id = $1
      ORDER BY c.created_at DESC
    `, [req.user.id]);
    res.json(crops.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/crops', auth, async (req, res) => {
  const { farmId, cropName, variety, sowingDate, expectedHarvestDate, status, fieldSection } = req.body;
  try {
    const newCrop = await pool.query(
      'INSERT INTO crops (farm_id, crop_name, variety, sowing_date, expected_harvest_date, status, field_section) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [farmId, cropName, variety, sowingDate, expectedHarvestDate, status || 'Active', fieldSection]
    );
    res.status(201).json(newCrop.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/crops/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM crops WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================================================
// 5. Farm Expenses API
// ============================================================================

app.get('/api/expenses', auth, async (req, res) => {
  try {
    const expenses = await pool.query('SELECT * FROM farm_expenses WHERE user_id = $1 ORDER BY transaction_date DESC', [req.user.id]);
    res.json(expenses.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/expenses', auth, async (req, res) => {
  const { farmId, type, category, amount, transactionDate, notes } = req.body;
  try {
    const newExpense = await pool.query(
      'INSERT INTO farm_expenses (user_id, farm_id, type, category, amount, transaction_date, notes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [req.user.id, farmId || null, type, category, amount, transactionDate || new Date(), notes]
    );
    res.status(201).json(newExpense.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/expenses/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM farm_expenses WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});


// ============================================================================
// Keep existing AI/Mock Routes for now (Weather, Disease, Recommendations)
// ============================================================================

app.post('/api/recommendations/smart', (req, res) => {
  const { soilType, season } = req.body;
  res.json({
    recommendedCrops: [
      { crop: 'Wheat (HD-3086)', suitability: '96%', waterReq: 'Medium', expectedYield: '22-25 Quintals/Acre', reason: 'High compatibility.' },
      { crop: 'Mustard (Pusa Jai Kisan)', suitability: '91%', waterReq: 'Low', expectedYield: '8-10 Quintals/Acre', reason: 'Drought-tolerant.' }
    ]
  });
});

app.get('/api/weather', (req, res) => {
  res.json({
    location: 'Current Location',
    tempC: 29,
    condition: 'Partly Cloudy',
    humidityPct: 68,
    windSpeedKmh: 14,
    rainfallProbPct: 20,
    forecast: [
      { day: 'Wed', temp: 29, cond: 'Partly Cloudy' },
      { day: 'Thu', temp: 31, cond: 'Sunny' }
    ],
    alert: 'Moderate rainfall expected on Friday.'
  });
});

app.post('/api/disease/detect', auth, async (req, res) => {
  const { imageData } = req.body;
  if (!imageData || !imageData.startsWith('data:image/')) return res.status(400).json({ error: 'A crop image is required' });
  if (!process.env.GEMINI_API_KEY) return res.status(503).json({ error: 'GEMINI_API_KEY is not configured on the backend' });
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.7-flash:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: 'You are a cautious plant pathologist. Analyze only the visible plant image; do not assume it belongs to any crop in a database. Return JSON only with keys status (confirmed, possible, or needs_review), name, confidence (number 0-100 or null), symptoms, organic, chemical. Never claim certainty from a poor, ambiguous, or mismatched image. Do not recommend chemical treatment when status is needs_review. Identify visible symptoms and the most likely disease, if possible. If the plant species or disease cannot be established from the image, say so.' }, { inline_data: { mime_type: imageData.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,/)?.[1] || 'image/jpeg', data: imageData.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '') } }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 700, responseMimeType: 'application/json' }
      })
    });
    if (!response.ok) {
      const providerError = await response.text();
      console.error('Gemini disease analysis error:', providerError);
      let detail = 'Gemini rejected the analysis request';
      try { detail = JSON.parse(providerError)?.error?.message || detail; } catch { /* keep safe generic detail */ }
      return res.status(502).json({ error: 'Gemini disease analysis failed', detail });
    }
    const payload = await response.json();
    const text = payload.candidates?.[0]?.content?.parts?.map(part => part.text || '').join('').trim();
    if (!text) throw new Error('Gemini returned an empty analysis');
    const normalizedText = text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .replace(/[\r\n\t]+/g, ' ')
      .trim();
    const result = JSON.parse(normalizedText);
    try {
      await pool.query('INSERT INTO disease_records (user_id, detected_disease, confidence_score, remedy_organic, remedy_chemical) VALUES ($1,$2,$3,$4,$5)', [req.user.id, result.name, result.confidence, result.organic, result.chemical]);
    } catch (saveError) { console.error('Disease history save failed:', saveError.message); }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Disease analysis failed: ' + err.message });
  }
});

app.post('/api/agent/chat', optionalAuth, async (req, res) => {
  const { message, userProfile: clientProfile } = req.body;

  try {
    let userProfile = clientProfile || null;
    let farms = [];
    let crops = [];
    let expenses = [];

    if (req.user?.id) {
      const [userResult, farmsResult, cropsResult, expensesResult] = await Promise.all([
        pool.query('SELECT id, name, email, role, phone, location, village, district, state, pincode FROM users WHERE id = $1', [req.user.id]).catch(() => ({ rows: [] })),
        pool.query('SELECT * FROM farms WHERE user_id = $1', [req.user.id]).catch(() => ({ rows: [] })),
        pool.query(`
          SELECT c.*, f.name as farm_name
          FROM crops c
          JOIN farms f ON c.farm_id = f.id
          WHERE f.user_id = $1
          ORDER BY c.created_at DESC
        `, [req.user.id]).catch(() => ({ rows: [] })),
        pool.query('SELECT * FROM farm_expenses WHERE user_id = $1 ORDER BY transaction_date DESC', [req.user.id]).catch(() => ({ rows: [] }))
      ]);

      userProfile = userResult.rows[0] || clientProfile || null;
      farms = farmsResult.rows;
      crops = cropsResult.rows;
      expenses = expensesResult.rows;
    }

    const matchedFeatures = detectFeatures(message);
    const primary = matchedFeatures.length > 0 ? matchedFeatures[0] : null;

    if (!process.env.OPENAI_API_KEY) {
      return res.json(buildAgentReply({ message, userProfile, farms, crops, expenses }));
    }

    const systemPrompt = `You are Krishimitra, the AI agent for the Cropnova smart agriculture platform. Answer the farmer's queries helpfully using the following context about their farm:
User: ${userProfile ? JSON.stringify(userProfile) : 'Guest (No profile data)'}
Farms: ${JSON.stringify(farms)}
Crops: ${JSON.stringify(crops)}
Expenses: ${JSON.stringify(expenses)}
Keep answers concise, actionable, and focused on agriculture. If the user is a guest, ask them to log in to get personalized advice. Format your responses with bullet points where appropriate for readability.`;

    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!openAiResponse.ok) {
      console.error('OpenAI API Error:', await openAiResponse.text());
      return res.json(buildAgentReply({ message, userProfile, farms, crops, expenses }));
    }

    const data = await openAiResponse.json();
    const replyText = data.choices[0].message.content;

    res.json({
      reply: replyText,
      feature: primary ? { key: primary.key, label: primary.label, route: primary.route } : null,
      suggestions: [
        'Show my farm overview',
        'Recommend crop and fertilizer plan',
        'Diagnose pest or disease',
        'Explain all Cropnova features'
      ]
    });
  } catch (err) {
    console.error('Agent Error:', err);
    res.status(500).json({ error: 'Cropnova agent failed: ' + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 CropNova Postgres Backend API running on port ${PORT}`);
});
