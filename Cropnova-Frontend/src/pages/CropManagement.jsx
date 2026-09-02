import React, { useState, useEffect } from 'react';
import { Sprout, Plus, Calendar, MapPin, Trash2, Droplet, Zap, CheckCircle2, AlertCircle, Wallet } from 'lucide-react';
import { api } from '../utils/api';

// --- Per-acre cost & income estimates by crop ---
const CROP_COSTS = {
  wheat:     { seeds: 2200, fertilizers: 3500, pesticides: 1200, labor: 4500, irrigation: 1500, misc: 800,  yieldPerAcre: 22,  msp: 2275 },
  paddy:     { seeds: 1800, fertilizers: 4200, pesticides: 1800, labor: 7000, irrigation: 2000, misc: 1000, yieldPerAcre: 28,  msp: 2183 },
  rice:      { seeds: 1800, fertilizers: 4200, pesticides: 1800, labor: 7000, irrigation: 2000, misc: 1000, yieldPerAcre: 28,  msp: 2183 },
  mustard:   { seeds: 1500, fertilizers: 2800, pesticides: 900,  labor: 3200, irrigation: 800,  misc: 600,  yieldPerAcre: 12,  msp: 5650 },
  cotton:    { seeds: 3500, fertilizers: 5500, pesticides: 4000, labor: 8000, irrigation: 2500, misc: 1500, yieldPerAcre: 15,  msp: 6620 },
  sugarcane: { seeds: 5000, fertilizers: 6000, pesticides: 2500, labor: 10000,irrigation: 3500, misc: 2000, yieldPerAcre: 350, msp: 340  },
  maize:     { seeds: 2500, fertilizers: 3800, pesticides: 1500, labor: 5000, irrigation: 1200, misc: 900,  yieldPerAcre: 25,  msp: 2090 },
  default:   { seeds: 2000, fertilizers: 3500, pesticides: 1500, labor: 5000, irrigation: 1500, misc: 1000, yieldPerAcre: 20,  msp: 2500 }
};

const getCropKey = (name) => {
  const n = (name || '').toLowerCase();
  return Object.keys(CROP_COSTS).find(k => n.includes(k)) || 'default';
};

const calcBudget = (cropName, acreage, budget) => {
  const acres = parseFloat(acreage) || 1;
  const key   = getCropKey(cropName);
  const c     = CROP_COSTS[key];
  const total = (c.seeds + c.fertilizers + c.pesticides + c.labor + c.irrigation + c.misc) * acres;
  const estIncome   = c.yieldPerAcre * acres * c.msp;
  const inputBudget = parseFloat(budget) || 0;
  const shortfall   = inputBudget > 0 ? total - inputBudget : null;
  return {
    acres, total, estIncome,
    netProfit: estIncome - total,
    inputBudget, shortfall,
    breakdown: [
      { label: 'Seeds / Planting Material', val: c.seeds        * acres },
      { label: 'Fertilizers (NPK, DAP, Urea)',val: c.fertilizers* acres },
      { label: 'Pesticides & Crop Protection',val: c.pesticides * acres },
      { label: 'Labor & Land Preparation',   val: c.labor       * acres },
      { label: 'Irrigation & Electricity',   val: c.irrigation  * acres },
      { label: 'Misc & Transport',            val: c.misc        * acres }
    ]
  };
};

// --- Smart Irrigation engine ---
const getIrrigationPlan = ({ cropName, irrigationSource, currentMethod, acreage }) => {
  const crop = cropName.toLowerCase();
  let waterRequirement = '', baseSchedule = '', suggestedSystem = '', advancedTip = '';

  if (crop.includes('paddy') || crop.includes('rice')) {
    waterRequirement = '1200–1500 mm per season';
    baseSchedule     = 'Maintain 5 cm standing water from transplanting to panicle initiation. Drain field 10 days before harvest.';
    suggestedSystem  = 'Alternate Wetting & Drying (AWD) — saves 30% water vs. continuous flooding.';
    advancedTip      = 'Install tensiometers at 20 cm depth; irrigate only when reading >20 kPa.';
  } else if (crop.includes('wheat')) {
    waterRequirement = '400–500 mm per season';
    baseSchedule     = '6 critical irrigations: CRI (21 days), Tillering (40 days), Jointing (65 days), Flowering (90 days), Grain Fill (105 days), Dough stage (120 days).';
    suggestedSystem  = 'Furrow Irrigation or Drip-line system — reduces water use by 40%.';
    advancedTip      = 'Skip 1st irrigation if good pre-sowing moisture. Monitor ET₀ from weather station.';
  } else if (crop.includes('cotton')) {
    waterRequirement = '700–900 mm per season';
    baseSchedule     = 'Irrigate at sowing, squaring, flowering, boll development. Avoid water stress at boll opening.';
    suggestedSystem  = 'Drip Irrigation + Fertigation — saves 45% water & 30% fertilizer simultaneously.';
    advancedTip      = 'Use soil moisture sensor at 30 cm depth. Trigger irrigation when soil moisture < 50% field capacity.';
  } else if (crop.includes('sugarcane')) {
    waterRequirement = '1500–2500 mm per season';
    baseSchedule     = 'Irrigate every 7–10 days during grand growth phase. Reduce to once in 20 days during ripening.';
    suggestedSystem  = 'Drip Irrigation — saves up to 50% water compared to flood/furrow.';
    advancedTip      = 'Apply mulching between rows to conserve soil moisture and reduce evaporation losses.';
  } else if (crop.includes('mustard') || crop.includes('canola')) {
    waterRequirement = '250–350 mm per season';
    baseSchedule     = '2–3 irrigations: at branching (30 days), flowering (55 days), and pod-filling (75 days).';
    suggestedSystem  = 'Sprinkler Irrigation — uniform coverage suits branching mustard crop geometry.';
    advancedTip      = 'Avoid waterlogging — mustard is extremely sensitive to standing water at root zone.';
  } else if (crop.includes('maize') || crop.includes('corn')) {
    waterRequirement = '500–800 mm per season';
    baseSchedule     = 'Critical stages: knee-high (V6), tasseling (VT), and silking (R1). Drought at silking causes 50% yield loss.';
    suggestedSystem  = 'Furrow or Drip Irrigation — efficient for row-spaced maize crop.';
    advancedTip      = 'Irrigate 24 hrs before tasseling if no rainfall. Use soil tensiometer for precision scheduling.';
  } else {
    waterRequirement = '400–700 mm per season (general)';
    baseSchedule     = 'Irrigate at key growth stages: establishment, vegetative, flowering, and grain fill. Monitor soil moisture weekly.';
    suggestedSystem  = 'Drip or Sprinkler Irrigation — recommended for water-efficient farming.';
    advancedTip      = 'Collect soil samples and measure field capacity to calibrate exact irrigation depths.';
  }

  let sourceTip = '';
  if (irrigationSource === 'Canal')       sourceTip = 'Canal water: Ensure warabandi schedule is followed. Store water in farm ponds if supply is intermittent.';
  else if (irrigationSource === 'Borewell') sourceTip = 'Borewell: Monitor water table monthly. Install flow meter to track extraction volume.';
  else if (irrigationSource === 'Rainfed') sourceTip = 'Rainfed: Build contour bunds to harvest rainwater. Consider drought-tolerant varieties.';
  else if (irrigationSource === 'River / Lift') sourceTip = 'River lift: Pump during off-peak hours (night) to reduce electricity costs by 40%.';

  let upgradeSuggestion = '';
  if (currentMethod === 'Flood / Traditional')
    upgradeSuggestion = `⬆️ Upgrade from Flood irrigation to ${suggestedSystem} — save up to 45% water and ₹3,000–₹5,000/acre per season in pumping costs.`;
  else if (currentMethod === 'Drip')
    upgradeSuggestion = '✅ You are already using Drip Irrigation — the most efficient system! Enable automation with soil moisture sensors for further savings.';
  else if (currentMethod === 'Sprinkler')
    upgradeSuggestion = '✅ Sprinkler is efficient! Add pressure gauges to ensure uniform distribution across all laterals.';

  return { waterRequirement, baseSchedule, suggestedSystem, advancedTip, sourceTip, upgradeSuggestion };
};

// =====================================================================
export const CropManagement = () => {
  const [crops, setCrops]               = useState([]);
  const [showModal, setShowModal]       = useState(false);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [newCrop, setNewCrop]           = useState({
    cropName: '', sowingDate: '', expectedHarvestDate: '',
    fieldSection: '', acreage: '', irrigationSource: '',
    currentMethod: '', soilType: '', budget: ''
  });

  useEffect(() => {
    loadCrops();
  }, []);

  const loadCrops = async () => {
    try {
      const data = await api.get('/crops');
      // Calculate missing AI derivations (budget/irrigation) that aren't stored in basic DB row
      const enhancedData = data.map(crop => ({
        ...crop,
        irrigationPlan: getIrrigationPlan({ cropName: crop.crop_name, irrigationSource: crop.irrigation_source || 'Rainfed', currentMethod: 'Flood / Traditional' }),
        budgetCalc: calcBudget(crop.crop_name, crop.acreage || 1, crop.budget || 0),
        cropName: crop.crop_name, // Map DB snake_case to frontend camelCase
        fieldSection: crop.field_section,
        sowingDate: crop.sowing_date ? crop.sowing_date.split('T')[0] : '',
        expectedHarvestDate: crop.expected_harvest_date ? crop.expected_harvest_date.split('T')[0] : ''
      }));
      setCrops(enhancedData);
    } catch (err) {
      console.error('Failed to load crops', err);
    }
  };

  const handleAddCrop = async (e) => {
    e.preventDefault();
    try {
      // Create crop in DB (requires a farmId, for now we can just grab the first farm if available, or pass null)
      // We will need farms to be loaded to attach a crop properly.
      const farmsRes = await api.get('/farms').catch(() => []);
      const defaultFarmId = farmsRes.length > 0 ? farmsRes[0].id : null;

      const createdDbCrop = await api.post('/crops', {
        farmId: defaultFarmId,
        cropName: newCrop.cropName,
        variety: 'Standard',
        sowingDate: newCrop.sowingDate,
        expectedHarvestDate: newCrop.expectedHarvestDate,
        status: 'Active (Sown)',
        fieldSection: newCrop.fieldSection
      });
      
      await loadCrops();
      setShowModal(false);
      setNewCrop({ cropName: '', sowingDate: '', expectedHarvestDate: '', fieldSection: '', acreage: '', irrigationSource: '', currentMethod: '', soilType: '', budget: '' });
    } catch (err) {
      console.error('Failed to add crop', err);
      alert('Error adding crop. Ensure you have added a Farm in the Dashboard first.');
    }
  };

  const handleDeleteCrop = async (id) => {
    try {
      await api.delete(`/crops/${id}`);
      setCrops(crops.filter(c => c.id !== id));
      if (selectedCrop?.id === id) setSelectedCrop(null);
    } catch (err) {
      console.error('Failed to delete crop', err);
    }
  };

  const set = (key, val) => setNewCrop(prev => ({ ...prev, [key]: val }));

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Header ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Crop Lifecycle, Budget & Smart Irrigation 🌾💧💰</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Add your crops with water management & budget details — AI instantly generates irrigation schedules and cost/income estimates.
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={18} /> Add Crop
        </button>
      </div>

      {/* ── Empty state ──────────────────────────────────────── */}
      {crops.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <Sprout size={52} color="var(--primary)" style={{ marginBottom: '1rem' }} />
          <h3>No Crop Records Yet</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0.4rem auto 1.2rem', fontSize: '0.9rem' }}>
            Add your crop name, water source, and budget — AI will instantly generate an optimal irrigation schedule and cost/income estimate.
          </p>
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            <Plus size={18} /> Add Your First Crop
          </button>
        </div>
      )}

      {/* ── Crop Cards Grid ──────────────────────────────────── */}
      {crops.length > 0 && (
        <div className="grid-3">
          {crops.map((crop) => (
            <div
              key={crop.id}
              className="card"
              style={{
                cursor: 'pointer',
                border: selectedCrop?.id === crop.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                transition: 'all 0.2s ease'
              }}
              onClick={() => setSelectedCrop(selectedCrop?.id === crop.id ? null : crop)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>{crop.cropName}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span className="badge badge-success">{crop.status}</span>
                  <button
                    onClick={e => { e.stopPropagation(); handleDeleteCrop(crop.id); }}
                    style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={13} color="var(--primary)" />
                  <span>Plot: <strong>{crop.fieldSection || '—'}</strong> · {crop.acreage} Acres</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Calendar size={13} color="var(--primary)" />
                  <span>Sown: <strong>{crop.sowingDate}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Calendar size={13} color="var(--accent)" />
                  <span>Harvest: <strong>{crop.expectedHarvestDate}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                  <Droplet size={13} color="#2196F3" />
                  <span>{crop.irrigationSource} · {crop.currentMethod}</span>
                </div>
              </div>

              <div style={{ marginTop: '0.8rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)' }}>
                {selectedCrop?.id === crop.id ? '▲ Hide Plans' : '▼ View Irrigation & Budget Plan'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Expanded Detail Panels ───────────────────────────── */}
      {selectedCrop && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Smart Irrigation Plan */}
          <div className="animate-fade-in card" style={{ borderLeft: '4px solid #2196F3', background: 'linear-gradient(135deg, rgba(33,150,243,0.04) 0%, rgba(46,125,50,0.04) 100%)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
              <div style={{ background: '#E3F2FD', padding: '0.6rem', borderRadius: '50%' }}>
                <Droplet size={22} color="#2196F3" />
              </div>
              <div>
                <h3 style={{ color: '#1565C0' }}>Smart Irrigation Plan — {selectedCrop.cropName} ({selectedCrop.fieldSection})</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>AI-generated based on crop type, soil & water source</span>
              </div>
            </div>

            <div className="grid-2" style={{ marginBottom: '1.2rem' }}>
              <div style={{ background: '#E3F2FD', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#1565C0' }}>TOTAL WATER REQUIREMENT</span>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1565C0', marginTop: '0.3rem' }}>{selectedCrop.irrigationPlan.waterRequirement}</div>
              </div>
              <div style={{ background: 'var(--light-green)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--primary)' }}>RECOMMENDED SYSTEM</span>
                <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--primary)', marginTop: '0.3rem' }}>{selectedCrop.irrigationPlan.suggestedSystem}</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div style={{ background: 'var(--bg)', padding: '0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                  <Calendar size={15} color="var(--primary)" />
                  <strong style={{ fontSize: '0.83rem' }}>Critical Stage Irrigation Schedule</strong>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>{selectedCrop.irrigationPlan.baseSchedule}</p>
              </div>

              {selectedCrop.irrigationPlan.sourceTip && (
                <div style={{ background: '#FFF8E1', padding: '0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid #FFE082' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                    <Zap size={15} color="var(--warning)" />
                    <strong style={{ fontSize: '0.83rem', color: 'var(--warning)' }}>Water Source Tip ({selectedCrop.irrigationSource})</strong>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>{selectedCrop.irrigationPlan.sourceTip}</p>
                </div>
              )}

              <div style={{ background: '#E8F5E9', padding: '0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid #A5D6A7' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                  <CheckCircle2 size={15} color="var(--primary)" />
                  <strong style={{ fontSize: '0.83rem', color: 'var(--primary)' }}>Advanced Precision Agriculture Tip</strong>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>{selectedCrop.irrigationPlan.advancedTip}</p>
              </div>

              {selectedCrop.irrigationPlan.upgradeSuggestion && (
                <div style={{ background: selectedCrop.irrigationPlan.upgradeSuggestion.startsWith('✅') ? '#E8F5E9' : '#FFF3E0', padding: '0.9rem', borderRadius: 'var(--radius-md)', border: `1px solid ${selectedCrop.irrigationPlan.upgradeSuggestion.startsWith('✅') ? '#A5D6A7' : '#FFCC80'}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                    <AlertCircle size={15} color={selectedCrop.irrigationPlan.upgradeSuggestion.startsWith('✅') ? 'var(--primary)' : 'var(--warning)'} />
                    <strong style={{ fontSize: '0.83rem' }}>Irrigation System Assessment ({selectedCrop.currentMethod})</strong>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>{selectedCrop.irrigationPlan.upgradeSuggestion}</p>
                </div>
              )}
            </div>
          </div>

          {/* Budget & Income Estimate Panel */}
          <div className="animate-fade-in card" style={{ borderLeft: '4px solid #F57F17', background: 'linear-gradient(135deg, rgba(255,193,7,0.05) 0%, rgba(46,125,50,0.04) 100%)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
              <div style={{ background: '#FFF8E1', padding: '0.6rem', borderRadius: '50%' }}>
                <Wallet size={22} color="#E65100" />
              </div>
              <div>
                <h3 style={{ color: '#E65100' }}>Budget & Income Estimate — {selectedCrop.cropName}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>AI-calculated per-acre input costs and MSP income projection</span>
              </div>
            </div>

            <div className="grid-3" style={{ marginBottom: '1.2rem' }}>
              <div style={{ background: '#FFEBEE', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--error)' }}>EST. TOTAL COST</span>
                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--error)', marginTop: '0.3rem' }}>₹{selectedCrop.budgetCalc.total.toLocaleString()}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>for {selectedCrop.budgetCalc.acres} acres</div>
              </div>
              <div style={{ background: '#E8F5E9', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--primary)' }}>EST. HARVEST INCOME</span>
                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary)', marginTop: '0.3rem' }}>₹{selectedCrop.budgetCalc.estIncome.toLocaleString()}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>at MSP market rates</div>
              </div>
              <div style={{ background: selectedCrop.budgetCalc.netProfit >= 0 ? '#E8F5E9' : '#FFEBEE', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: '700', color: selectedCrop.budgetCalc.netProfit >= 0 ? 'var(--primary)' : 'var(--error)' }}>EST. NET PROFIT</span>
                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: selectedCrop.budgetCalc.netProfit >= 0 ? 'var(--primary)' : 'var(--error)', marginTop: '0.3rem' }}>
                  {selectedCrop.budgetCalc.netProfit >= 0 ? '+' : ''}₹{selectedCrop.budgetCalc.netProfit.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Cost breakdown table */}
            <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', overflow: 'hidden', marginBottom: '1rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: 'var(--light-green)' }}>
                    <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--primary)' }}>Input Cost Category</th>
                    <th style={{ padding: '0.6rem 0.8rem', textAlign: 'right', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--primary)' }}>Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedCrop.budgetCalc.breakdown.map(row => (
                    <tr key={row.label} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.55rem 0.8rem', color: 'var(--text-secondary)' }}>{row.label}</td>
                      <td style={{ padding: '0.55rem 0.8rem', textAlign: 'right', fontWeight: '700' }}>₹{row.val.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Budget shortfall / surplus */}
            {selectedCrop.budgetCalc.inputBudget > 0 && (
              <div style={{
                padding: '0.9rem', borderRadius: 'var(--radius-md)',
                background: selectedCrop.budgetCalc.shortfall > 0 ? '#FFEBEE' : '#E8F5E9',
                border: `1px solid ${selectedCrop.budgetCalc.shortfall > 0 ? '#FFCDD2' : '#A5D6A7'}`
              }}>
                <strong style={{ fontSize: '0.83rem', color: selectedCrop.budgetCalc.shortfall > 0 ? 'var(--error)' : 'var(--primary)' }}>
                  {selectedCrop.budgetCalc.shortfall > 0
                    ? `⚠️ Budget Shortfall: You need ₹${selectedCrop.budgetCalc.shortfall.toLocaleString()} more than your entered budget of ₹${selectedCrop.budgetCalc.inputBudget.toLocaleString()}.`
                    : `✅ Your budget of ₹${selectedCrop.budgetCalc.inputBudget.toLocaleString()} covers the estimated cost with ₹${Math.abs(selectedCrop.budgetCalc.shortfall).toLocaleString()} to spare.`}
                </strong>
              </div>
            )}

            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.8rem' }}>
              ⚠️ These are AI estimates based on average market rates. Actual costs may vary by region and season.
            </div>
          </div>
        </div>
      )}

      {/* ── Add Crop Modal ───────────────────────────────────── */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem' }}>
          <div className="card" style={{ width: '520px', maxHeight: '90vh', overflowY: 'auto', background: 'var(--bg)' }}>
            <h3 style={{ color: 'var(--primary)', marginBottom: '0.3rem' }}>Add Crop Details</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.2rem' }}>
              Fill in crop info, water management & budget — AI will generate your irrigation schedule and cost/income estimate instantly.
            </p>

            <form onSubmit={handleAddCrop} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              {/* Section A: Crop Info */}
              <div style={{ background: 'var(--light-green)', padding: '0.7rem 0.9rem', borderRadius: 'var(--radius-md)' }}>
                <strong style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>🌾 CROP INFORMATION</strong>
              </div>

              <div className="grid-2">
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: '600' }}>Crop Name *</label>
                  <input type="text" className="input-field" placeholder="e.g. Wheat, Paddy, Mustard"
                    value={newCrop.cropName} onChange={e => set('cropName', e.target.value)} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: '600' }}>Farm Field / Plot Name</label>
                  <input type="text" className="input-field" placeholder="e.g. North Field, Plot A"
                    value={newCrop.fieldSection} onChange={e => set('fieldSection', e.target.value)} />
                </div>
              </div>

              <div className="grid-2">
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: '600' }}>Total Acreage (Acres) *</label>
                  <input type="number" className="input-field" placeholder="e.g. 2.5" step="0.1" min="0.1"
                    value={newCrop.acreage} onChange={e => set('acreage', e.target.value)} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: '600' }}>Soil Type</label>
                  <select className="input-field" value={newCrop.soilType} onChange={e => set('soilType', e.target.value)}>
                    <option value="">Select soil type</option>
                    <option>Sandy Loam</option>
                    <option>Clay Loam</option>
                    <option>Black Cotton Soil</option>
                    <option>Red Laterite</option>
                    <option>Alluvial Soil</option>
                    <option>Silty Loam</option>
                  </select>
                </div>
              </div>

              <div className="grid-2">
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: '600' }}>Sowing Date *</label>
                  <input type="date" className="input-field"
                    value={newCrop.sowingDate} onChange={e => set('sowingDate', e.target.value)} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: '600' }}>Expected Harvest Date *</label>
                  <input type="date" className="input-field"
                    value={newCrop.expectedHarvestDate} onChange={e => set('expectedHarvestDate', e.target.value)} required />
                </div>
              </div>

              {/* Section B: Water Management */}
              <div style={{ background: '#E3F2FD', padding: '0.7rem 0.9rem', borderRadius: 'var(--radius-md)' }}>
                <strong style={{ fontSize: '0.8rem', color: '#1565C0' }}>💧 WATER & IRRIGATION MANAGEMENT</strong>
              </div>

              <div className="grid-2">
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: '600' }}>Water Source *</label>
                  <select className="input-field" value={newCrop.irrigationSource} onChange={e => set('irrigationSource', e.target.value)} required>
                    <option value="">Select water source</option>
                    <option>Canal</option>
                    <option>Borewell</option>
                    <option>Rainfed</option>
                    <option>River / Lift</option>
                    <option>Farm Pond</option>
                    <option>Tube Well</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: '600' }}>Current Irrigation Method *</label>
                  <select className="input-field" value={newCrop.currentMethod} onChange={e => set('currentMethod', e.target.value)} required>
                    <option value="">Select method</option>
                    <option>Flood / Traditional</option>
                    <option>Furrow Irrigation</option>
                    <option>Drip</option>
                    <option>Sprinkler</option>
                    <option>Rainwater Harvesting</option>
                  </select>
                </div>
              </div>

              {/* Section C: Budget */}
              <div style={{ background: '#FFF8E1', padding: '0.7rem 0.9rem', borderRadius: 'var(--radius-md)' }}>
                <strong style={{ fontSize: '0.8rem', color: '#E65100' }}>💰 BUDGET & EXPECTED INCOME</strong>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: '600' }}>Your Available Budget for this Season (₹)</label>
                <input type="number" className="input-field"
                  placeholder="e.g. 25000  (Leave blank to just get AI cost estimate)"
                  value={newCrop.budget} onChange={e => set('budget', e.target.value)} min="0" />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginTop: '0.25rem' }}>
                  AI will estimate total input costs (seeds, fertilizer, pesticide, labor) and approx harvest income at MSP rates.
                </span>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">
                  <Wallet size={16} /> Save & Generate Plans
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
