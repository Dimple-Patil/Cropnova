const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-Memory Data Store (Provides instant fallback and rich default mock state for all 21 modules)
global.mockDb = {
  users: [
    { id: 1, name: 'Rajesh Farmer', email: 'farmer@cropnova.com', role: 'farmer', location: 'Punjab, India', phone: '+91 9876543210' },
    { id: 2, name: 'Dr. Ananya Sharma', email: 'expert@cropnova.com', role: 'expert', location: 'IARI Delhi', phone: '+91 9812345678' },
    { id: 3, name: 'GreenAgro Vendor', email: 'vendor@cropnova.com', role: 'vendor', location: 'Haryana, India', phone: '+91 9988776655' },
    { id: 4, name: 'Admin User', email: 'admin@cropnova.com', role: 'admin', location: 'Headquarters', phone: '+91 9000000000' }
  ],
  farms: [
    { id: 101, userId: 1, name: 'Green Acres Farm', location: 'Ludhiana Sector 4', sizeAcres: 12.5, soilType: 'Loamy Alluvial', irrigationSource: 'Borewell & Canal' },
    { id: 102, userId: 1, name: 'Sunrise Organic Field', location: 'Jalandhar Outer', sizeAcres: 8.0, soilType: 'Clay Loam', irrigationSource: 'Drip Irrigation' }
  ],
  crops: [
    { id: 201, farmId: 101, cropName: 'Wheat (HD-2967)', variety: 'High Yield Grain', sowingDate: '2026-04-15', expectedHarvestDate: '2026-10-20', status: 'Growing (Active)', fieldSection: 'North Block A' },
    { id: 202, farmId: 101, cropName: 'Rice (Basmati 1121)', variety: 'Aromatic Long', sowingDate: '2026-06-01', expectedHarvestDate: '2026-11-15', status: 'Tillering Stage', fieldSection: 'East Block B' },
    { id: 203, farmId: 102, cropName: 'Mustard (Pusa Bold)', variety: 'Oilseed', sowingDate: '2026-01-10', expectedHarvestDate: '2026-05-10', status: 'Harvested', fieldSection: 'Organic Plot 1' }
  ],
  soilRecords: [
    { id: 301, farmId: 101, phLevel: 6.8, nitrogenPpm: 240, phosphorusPpm: 35, potassiumPpm: 180, organicMatterPct: 2.1, moisturePct: 45, testDate: '2026-08-15', status: 'Optimal Fertility' },
    { id: 302, farmId: 102, phLevel: 7.4, nitrogenPpm: 160, phosphorusPpm: 20, potassiumPpm: 140, organicMatterPct: 1.4, moisturePct: 38, status: 'Needs Nitrogen Boost' }
  ],
  diseaseRecords: [
    { id: 401, cropName: 'Wheat', detectedDisease: 'Wheat Leaf Rust (Puccinia triticina)', confidence: 94.5, organicRemedy: 'Neem oil spray 5ml/L water and bio-agent Trichoderma viride.', chemicalRemedy: 'Apply Propiconazole 25% EC at 1 ml/liter of water.', date: '2026-08-28' },
    { id: 402, cropName: 'Rice', detectedDisease: 'Bacterial Leaf Blight (Xanthomonas oryzae)', confidence: 89.2, organicRemedy: 'Field sanitation & Streptomyces bio-control formulation.', chemicalRemedy: 'Spray Copper oxychloride (500g) + Streptocycline (30g) in 200L water per acre.', date: '2026-08-30' }
  ],
  marketplaceProducts: [
    { id: 501, vendorId: 3, title: 'Bio-Organic NPK Fertilizer (50kg)', category: 'Fertilizers', price: 850, unit: 'bag', stockQuantity: 140, description: '100% natural organic compost enriched with nitrogen fixing bacteria.', rating: 4.8 },
    { id: 502, vendorId: 3, title: 'Hybrid HD-2967 Certified Wheat Seeds (20kg)', category: 'Seeds', price: 1200, unit: 'bag', stockQuantity: 95, description: 'High disease resistance, high grain yield seed variety.', rating: 4.9 },
    { id: 503, vendorId: 3, title: 'Solar Powered Drip Controller & Sensor Kit', category: 'Equipment', price: 4500, unit: 'set', stockQuantity: 25, description: 'Automatic smart moisture-triggered water valve with mobile app alert.', rating: 4.7 },
    { id: 504, vendorId: 3, title: 'Organic Neem Oil Pesticide Concentrate (1L)', category: 'Pesticides', price: 420, unit: 'bottle', stockQuantity: 300, description: 'Cold-pressed pure neem oil extract for caterpillar & aphid protection.', rating: 4.6 }
  ],
  marketplaceOrders: [
    { id: 601, buyerId: 1, productTitle: 'Bio-Organic NPK Fertilizer (50kg)', quantity: 4, totalPrice: 3400, status: 'Delivered', orderDate: '2026-08-20' },
    { id: 602, buyerId: 1, productTitle: 'Solar Powered Drip Controller', quantity: 1, totalPrice: 4500, status: 'Shipped', orderDate: '2026-09-01' }
  ],
  expertConsultations: [
    { id: 701, farmerName: 'Rajesh Farmer', expertName: 'Dr. Ananya Sharma', title: 'Yellowing of lower leaves in Basmati Rice', details: 'Noticed pale yellow tips on young tillers despite regular irrigation.', response: 'Check for nitrogen deficiency or root nematode damage. Apply 20kg Urea split dosage and inspect root tips.', status: 'Answered', date: '2026-08-31' }
  ],
  governmentSchemes: [
    { id: 801, title: 'PM-Kisan Samman Nidhi Scheme', category: 'Direct Benefit Transfer', subsidyAmount: '₹6,000 / year', eligibility: 'Small & marginal farm owners with land record up to 2 hectares.', deadline: 'Ongoing 2026', link: 'https://pmkisan.gov.in' },
    { id: 802, title: 'Sub-Mission on Agricultural Mechanization (SMAM)', category: 'Equipment Subsidy', subsidyAmount: '40% - 50% Subsidy on Tractors & Harvesters', eligibility: 'Registered farmer groups, individual farmers with valid Aadhaar.', deadline: '31st Oct 2026', link: 'https://agrimachinery.nic.in' },
    { id: 803, title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)', category: 'Crop Insurance', subsidyAmount: 'Up to 90% Premium Subsidy against Flood/Drought', eligibility: 'All farmers growing notified food crops and oilseeds.', deadline: '15th Nov 2026', link: 'https://pmfby.gov.in' }
  ],
  newsUpdates: [
    { id: 901, title: 'Bumper Monsoon Rainfall Boosts Kharif Crop Yield Predictions', category: 'Weather & Forecast', content: 'Agricultural ministry reports favorable soil moisture reserves across northern and central plains.', source: 'AgriNews India', date: '2026-09-01' },
    { id: 902, title: 'Government Revises MSP for Wheat & Mustard for 2026-27 Season', category: 'Market Prices', content: 'Minimum Support Price (MSP) increased by 7% per quintal to support farmer income stability.', source: 'Market Express', date: '2026-08-29' }
  ],
  expenses: [
    { id: 1001, userId: 1, type: 'Expense', category: 'Seeds & Fertilizer', amount: 8500, date: '2026-08-10', notes: 'Purchased Wheat seed bags & organic NPK' },
    { id: 1002, userId: 1, type: 'Expense', category: 'Labor & Field Preparation', amount: 4200, date: '2026-08-18', notes: 'Tractor plowing & levelling charges' },
    { id: 1003, userId: 1, type: 'Income', category: 'Produce Sale (Mustard)', amount: 48000, date: '2026-08-25', notes: 'Sold 8 quintals of harvested mustard at mandi' }
  ]
};

// API Helper Routes for all 21 Modules

// 1. Auth API
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = global.mockDb.users.find(u => u.email === email) || global.mockDb.users[0];
  res.json({
    token: 'mock-jwt-token-cropnova-2026',
    user: user
  });
});

app.post('/api/auth/register', (req, res) => {
  const newUser = {
    id: Date.now(),
    name: req.body.name || 'New User',
    email: req.body.email,
    role: req.body.role || 'farmer',
    location: req.body.location || 'India',
    phone: req.body.phone || '+91 9900990099'
  };
  global.mockDb.users.push(newUser);
  res.status(201).json({ token: 'mock-jwt-token-cropnova-2026', user: newUser });
});

// 2. Farmer Overview API
app.get('/api/farmer/overview', (req, res) => {
  res.json({
    totalFarms: global.mockDb.farms.length,
    activeCrops: global.mockDb.crops.filter(c => c.status.includes('Active') || c.status.includes('Growing') || c.status.includes('Tillering')).length,
    upcomingTasks: [
      { id: 1, task: 'Apply Urea Top Dressing on Basmati Rice', dueDate: '2026-09-05', priority: 'High' },
      { id: 2, task: 'Inspect Soil Moisture on Block B', dueDate: '2026-09-07', priority: 'Medium' },
      { id: 3, task: 'Schedule Neem Oil Bio-spray', dueDate: '2026-09-10', priority: 'Low' }
    ],
    recentActivities: [
      { id: 1, text: 'Logged ₹4,800 income from mustard mandi sales', time: '2 days ago' },
      { id: 2, text: 'Ran AI Disease Scan on Rice Crop (Result: BLB)', time: '3 days ago' },
      { id: 3, text: 'Added soil testing report for Green Acres Farm', time: '5 days ago' }
    ]
  });
});

// 3. Crop Management API
app.get('/api/crops', (req, res) => res.json(global.mockDb.crops));
app.post('/api/crops', (req, res) => {
  const newCrop = { id: Date.now(), ...req.body, status: 'Active (Sown)' };
  global.mockDb.crops.push(newCrop);
  res.status(201).json(newCrop);
});

// 4. Smart Crop Recommendation API
app.post('/api/recommendations/smart', (req, res) => {
  const { soilType, season, region, moisture } = req.body;
  res.json({
    recommendedCrops: [
      { crop: 'Wheat (HD-3086)', suitability: '96%', waterReq: 'Medium', expectedYield: '22-25 Quintals/Acre', reason: 'High compatibility with ' + (soilType || 'Loamy') + ' soil during ' + (season || 'Rabi') + ' season.' },
      { crop: 'Mustard (Pusa Jai Kisan)', suitability: '91%', waterReq: 'Low', expectedYield: '8-10 Quintals/Acre', reason: 'Drought-tolerant high oil percentage variety suitable for your region.' },
      { crop: 'Chickpea (Desi Gram)', suitability: '85%', waterReq: 'Low', expectedYield: '10-12 Quintals/Acre', reason: 'Restores soil nitrogen naturally with minimal synthetic fertilizer.' }
    ]
  });
});

// 5. Soil Analysis API
app.get('/api/soil', (req, res) => res.json(global.mockDb.soilRecords));

// 6. Weather Monitoring API
app.get('/api/weather', (req, res) => {
  res.json({
    location: 'Ludhiana, Punjab',
    tempC: 29,
    condition: 'Partly Cloudy',
    humidityPct: 68,
    windSpeedKmh: 14,
    rainfallProbPct: 20,
    forecast: [
      { day: 'Wed', temp: 29, cond: 'Partly Cloudy' },
      { day: 'Thu', temp: 31, cond: 'Sunny' },
      { day: 'Fri', temp: 28, cond: 'Moderate Rain' },
      { day: 'Sat', temp: 27, cond: 'Heavy Shower' },
      { day: 'Sun', temp: 30, cond: 'Clear Sky' }
    ],
    alert: 'Moderate rainfall expected on Friday. Hold chemical fertilizer spraying.'
  });
});

// 7. Plant Disease Detection API
app.post('/api/disease/detect', (req, res) => {
  const sampleDiseases = [
    { name: 'Tomato Early Blight (Alternaria solani)', confidence: 95.4, organic: 'Apply Copper Fungicide or Neem Leaf Extract.', chemical: 'Mancozeb 75% WP @ 2g/liter.' },
    { name: 'Maize Leaf Blight (Helminthosporium)', confidence: 91.8, organic: 'Crop rotation and resistant seed selection.', chemical: 'Spray Zineb 75 WP at 2.5g/liter.' }
  ];
  const detected = sampleDiseases[Math.floor(Math.random() * sampleDiseases.length)];
  res.json(detected);
});

// 8. Pest Management API
app.get('/api/pests', (req, res) => {
  res.json([
    { name: 'Brown Planthopper (BPH)', crop: 'Rice', prevention: 'Maintain water level below 5cm, avoid excess nitrogen.', organicRemedy: 'Use yellow sticky traps & neem oil spray.', chemicalRemedy: 'Imidacloprid 17.8% SL @ 0.5ml/L.' },
    { name: 'Fall Armyworm', crop: 'Maize', prevention: 'Deep plowing in summer to expose pupae.', organicRemedy: 'Bacillus thuringiensis (Bt) bio-pesticide.', chemicalRemedy: 'Emamectin benzoate 5% SG @ 0.4g/L.' }
  ]);
});

// 9. Fertilizer Recommendation API
app.post('/api/fertilizers/calculate', (req, res) => {
  const { acreSize = 1, crop = 'Wheat' } = req.body;
  res.json({
    crop,
    acreSize,
    recommendedDosage: {
      urea: Math.round(acreSize * 45) + ' kg (Splitted in 3 doses)',
      dap: Math.round(acreSize * 25) + ' kg (Basal dose at sowing)',
      mop: Math.round(acreSize * 15) + ' kg (At sowing)',
      bioFertilizer: 'Azotobacter @ 250g / acre seed treatment'
    }
  });
});

// 10. Irrigation Management API
app.get('/api/irrigation', (req, res) => {
  res.json({
    moistureStatus: '45% (Adequate)',
    nextIrrigation: 'Tomorrow, 06:00 AM (Recommended 2 Hours)',
    waterSavedThisMonthLiters: 14500,
    schedules: [
      { id: 1, zone: 'North Wheat Field', status: 'Completed', date: '2026-08-30' },
      { id: 2, zone: 'East Basmati Field', status: 'Scheduled', date: '2026-09-03' }
    ]
  });
});

// 11. Marketplace API
app.get('/api/marketplace/products', (req, res) => res.json(global.mockDb.marketplaceProducts));
app.post('/api/marketplace/orders', (req, res) => {
  const newOrder = { id: Date.now(), ...req.body, status: 'Confirmed', orderDate: new Date().toISOString().split('T')[0] };
  global.mockDb.marketplaceOrders.push(newOrder);
  res.status(201).json(newOrder);
});

// 12. Vendor Management API
app.get('/api/vendor/inventory', (req, res) => res.json(global.mockDb.marketplaceProducts));

// 13. Expert Consultation API
app.get('/api/expert/consultations', (req, res) => res.json(global.mockDb.expertConsultations));
app.post('/api/expert/consultations', (req, res) => {
  const query = { id: Date.now(), ...req.body, farmerName: 'Rajesh Farmer', status: 'Open', date: new Date().toISOString().split('T')[0] };
  global.mockDb.expertConsultations.push(query);
  res.status(201).json(query);
});

// 14. Government Schemes API
app.get('/api/schemes', (req, res) => res.json(global.mockDb.governmentSchemes));

// 15. News & Updates API
app.get('/api/news', (req, res) => res.json(global.mockDb.newsUpdates));

// 16. Farm Expense Management API
app.get('/api/finance', (req, res) => {
  const totalIncome = global.mockDb.expenses.filter(e => e.type === 'Income').reduce((acc, e) => acc + e.amount, 0);
  const totalExpense = global.mockDb.expenses.filter(e => e.type === 'Expense').reduce((acc, e) => acc + e.amount, 0);
  res.json({
    records: global.mockDb.expenses,
    summary: { totalIncome, totalExpense, netProfit: totalIncome - totalExpense }
  });
});

// 17. Harvest Management API
app.get('/api/harvest', (req, res) => {
  res.json([
    { id: 1, crop: 'Mustard', yieldQuintals: 18.5, acreArea: 2.0, storageLocation: 'Warehouse Block 3', status: 'Stored' },
    { id: 2, crop: 'Wheat (Previous Season)', yieldQuintals: 110, acreArea: 5.0, storageLocation: 'State Grain Silo', status: 'Sold' }
  ]);
});

// 18. Notifications API
app.get('/api/notifications', (req, res) => {
  res.json([
    { id: 1, title: 'Weather Advisory', message: 'Rain expected in 48 hours. Secure harvested stock.', isRead: false },
    { id: 2, title: 'Irrigation Reminder', message: 'East Block B irrigation scheduled for tomorrow morning.', isRead: true }
  ]);
});

// 19. Reports & Analytics API
app.get('/api/reports/summary', (req, res) => {
  res.json({
    cropHealthIndex: '92%',
    waterEfficiencyScore: '88/100',
    overallROI: '+34.5%',
    monthlyYieldHistory: [
      { month: 'May', yield: 18 },
      { month: 'Jun', yield: 24 },
      { month: 'Jul', yield: 15 },
      { month: 'Aug', yield: 42 }
    ]
  });
});

// 20. Admin Panel API
app.get('/api/admin/users', (req, res) => res.json(global.mockDb.users));

// Root Health Check
app.get('/', (req, res) => {
  res.send('🌾 CropNova Smart Agriculture API Server is Live and Operational!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
