import React, { useState } from 'react';
import { Wallet, TrendingUp, TrendingDown, Plus, Calculator, Trash2, Sparkles, CheckCircle2 } from 'lucide-react';
import { usePersistedState } from '../hooks/usePersistedState';

// Per-acre estimated input costs by crop (₹)
const CROP_COST_ESTIMATES = {
  wheat:     { seeds: 2200, fertilizers: 3500, pesticides: 1200, labor: 4500, irrigation: 1500, misc: 800 },
  paddy:     { seeds: 1800, fertilizers: 4200, pesticides: 1800, labor: 7000, irrigation: 2000, misc: 1000 },
  rice:      { seeds: 1800, fertilizers: 4200, pesticides: 1800, labor: 7000, irrigation: 2000, misc: 1000 },
  mustard:   { seeds: 1500, fertilizers: 2800, pesticides: 900,  labor: 3200, irrigation: 800,  misc: 600  },
  cotton:    { seeds: 3500, fertilizers: 5500, pesticides: 4000, labor: 8000, irrigation: 2500, misc: 1500 },
  sugarcane: { seeds: 5000, fertilizers: 6000, pesticides: 2500, labor: 10000,irrigation: 3500, misc: 2000 },
  maize:     { seeds: 2500, fertilizers: 3800, pesticides: 1500, labor: 5000, irrigation: 1200, misc: 900  },
  default:   { seeds: 2000, fertilizers: 3500, pesticides: 1500, labor: 5000, irrigation: 1500, misc: 1000 }
};

// Expected yield & MSP per quintal by crop
const CROP_YIELD_MSP = {
  wheat:     { yieldPerAcre: 22, mspPerQuintal: 2275 },
  paddy:     { yieldPerAcre: 28, mspPerQuintal: 2183 },
  rice:      { yieldPerAcre: 28, mspPerQuintal: 2183 },
  mustard:   { yieldPerAcre: 12, mspPerQuintal: 5650 },
  cotton:    { yieldPerAcre: 15, mspPerQuintal: 6620 },
  sugarcane: { yieldPerAcre: 350,mspPerQuintal: 340  },
  maize:     { yieldPerAcre: 25, mspPerQuintal: 2090 },
  default:   { yieldPerAcre: 20, mspPerQuintal: 2500 }
};

const getCropKey = (name) => {
  const n = (name || '').toLowerCase();
  return Object.keys(CROP_COST_ESTIMATES).find(k => n.includes(k)) || 'default';
};

export const FarmExpense = () => {
  // Clean state – no pre-existing sample data
  const [records, setRecords] = usePersistedState('expenses', []);
  const [showModal, setShowModal] = useState(false);
  const [showEstimator, setShowEstimator] = useState(false);

  // Farm input estimator form
  const [estimatorForm, setEstimatorForm] = useState({
    cropName: '',
    acreage: '',
    sellingPrice: ''
  });
  const [estimate, setEstimate] = useState(null);

  // Manual entry form states
  const [type, setType] = useState('Expense');
  const [category, setCategory] = useState('Seeds & Hybrid Varieties');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Live totals from farmer-entered records
  const totalIncome  = records.filter(r => r.type === 'Income').reduce((a, r) => a + Number(r.amount), 0);
  const totalExpense = records.filter(r => r.type === 'Expense').reduce((a, r) => a + Number(r.amount), 0);
  const netProfit    = totalIncome - totalExpense;

  const handleAddTransaction = (e) => {
    e.preventDefault();
    setRecords([{
      id: Date.now(), type, category,
      amount: Number(amount), date,
      notes: notes || `${type} — ${category}`
    }, ...records]);
    setShowModal(false);
    setAmount(''); setNotes('');
  };

  const handleDeleteRecord = (id) => setRecords(records.filter(r => r.id !== id));

  const handleGenerateEstimate = (e) => {
    e.preventDefault();
    const { cropName, acreage, sellingPrice } = estimatorForm;
    const acres    = parseFloat(acreage) || 1;
    const key      = getCropKey(cropName);
    const costs    = CROP_COST_ESTIMATES[key];
    const yieldMsp = CROP_YIELD_MSP[key];

    const perAcreCosts = {
      seeds:        costs.seeds,
      fertilizers:  costs.fertilizers,
      pesticides:   costs.pesticides,
      labor:        costs.labor,
      irrigation:   costs.irrigation,
      misc:         costs.misc
    };
    const totalPerAcre   = Object.values(perAcreCosts).reduce((a, b) => a + b, 0);
    const totalCostAll   = totalPerAcre * acres;
    const estYield       = yieldMsp.yieldPerAcre * acres;
    const pricePerQ      = parseFloat(sellingPrice) || yieldMsp.mspPerQuintal;
    const estIncome      = estYield * pricePerQ;
    const estProfit      = estIncome - totalCostAll;

    setEstimate({ cropName, acres, perAcreCosts, totalPerAcre, totalCostAll, estYield, pricePerQ, estIncome, estProfit });
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
        <div>
          <h2>Farm Expenses, Income & Cost Estimator 💰</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Add your actual expenses & income. Use the AI Cost Estimator to get predicted fertilizer, pesticide & labor costs for any crop before spending.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.7rem' }}>
          <button onClick={() => setShowEstimator(true)} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Sparkles size={16} /> AI Cost Estimator
          </button>
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            <Plus size={18} /> Add Income / Expense
          </button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid-3">
        <div className="card" style={{ borderLeft: '4px solid var(--success)' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: '600' }}>TOTAL INCOME ENTERED</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0.4rem 0', color: 'var(--success)' }}>₹{totalIncome.toLocaleString()}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>From all mandi & produce sales you added</div>
        </div>
        <div className="card" style={{ borderLeft: '4px solid var(--error)' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: '600' }}>TOTAL EXPENSES ENTERED</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0.4rem 0', color: 'var(--error)' }}>₹{totalExpense.toLocaleString()}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Seeds, labor, fertilizer & fuel costs</div>
        </div>
        <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: '600' }}>NET PROFIT / LOSS</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0.4rem 0', color: netProfit >= 0 ? 'var(--primary)' : 'var(--error)' }}>
            ₹{netProfit.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: netProfit >= 0 ? 'var(--success)' : 'var(--error)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            {netProfit >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {records.length === 0 ? 'No entries yet' : netProfit >= 0 ? 'Profitable this season' : 'Expenses exceed income'}
          </div>
        </div>
      </div>

      {/* Transaction Ledger */}
      <div className="card">
        <h3>Farm Financial Ledger ({records.length} entries)</h3>
        {records.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-secondary)' }}>
            <Wallet size={44} color="var(--border)" style={{ marginBottom: '0.8rem' }} />
            <p>No entries yet. Click <strong>Add Income / Expense</strong> to log your farm transactions.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: 'var(--light-green)', textTransform: 'uppercase', fontSize: '0.72rem', color: 'var(--primary)' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Date</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Type</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Category</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Notes</th>
                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Amount (₹)</th>
                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Del</th>
              </tr>
            </thead>
            <tbody>
              {records.map(rec => (
                <tr key={rec.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{rec.date}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span className={`badge ${rec.type === 'Income' ? 'badge-success' : 'badge-error'}`}>{rec.type}</span>
                  </td>
                  <td style={{ padding: '0.75rem', fontWeight: '600' }}>{rec.category}</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{rec.notes}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '800', color: rec.type === 'Income' ? 'var(--success)' : 'var(--error)' }}>
                    {rec.type === 'Income' ? '+' : '-'}₹{Number(rec.amount).toLocaleString()}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                    <button onClick={() => handleDeleteRecord(rec.id)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}>
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* AI Cost Estimator Modal */}
      {showEstimator && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem' }}>
          <div className="card" style={{ width: '560px', maxHeight: '90vh', overflowY: 'auto', background: 'var(--bg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h3 style={{ color: 'var(--primary)' }}>🧮 AI Farm Cost & Income Estimator</h3>
              <button onClick={() => { setShowEstimator(false); setEstimate(null); }} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>✕</button>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.2rem' }}>
              Enter your crop details below — AI will calculate estimated seed, fertilizer, pesticide, labor costs and your approximate income at market price.
            </p>

            <form onSubmit={handleGenerateEstimate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: '600' }}>Crop Name *</label>
                <input type="text" className="input-field" placeholder="e.g. Wheat, Paddy, Mustard, Cotton"
                  value={estimatorForm.cropName}
                  onChange={e => setEstimatorForm({ ...estimatorForm, cropName: e.target.value })}
                  required />
              </div>
              <div className="grid-2">
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: '600' }}>Total Acreage *</label>
                  <input type="number" className="input-field" placeholder="e.g. 3" step="0.5" min="0.5"
                    value={estimatorForm.acreage}
                    onChange={e => setEstimatorForm({ ...estimatorForm, acreage: e.target.value })}
                    required />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: '600' }}>Expected Selling Price (₹/Quintal)</label>
                  <input type="number" className="input-field" placeholder="Leave blank for MSP rate"
                    value={estimatorForm.sellingPrice}
                    onChange={e => setEstimatorForm({ ...estimatorForm, sellingPrice: e.target.value })} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary">
                <Calculator size={16} /> Calculate Estimated Costs & Income
              </button>
            </form>

            {/* Generated Estimate Results */}
            {estimate && (
              <div className="animate-fade-in" style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ background: 'var(--light-green)', padding: '0.8rem', borderRadius: 'var(--radius-md)' }}>
                  <strong style={{ color: 'var(--primary)', fontSize: '0.85rem' }}>Estimate for {estimate.cropName} — {estimate.acres} Acres</strong>
                </div>

                {/* Per-acre cost breakdown */}
                <div className="card" style={{ padding: '1rem', borderLeft: '4px solid var(--error)' }}>
                  <h4 style={{ color: 'var(--error)', marginBottom: '0.8rem' }}>Estimated Input Costs (Per Acre)</h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' }}>
                    <tbody>
                      {[
                        ['Seeds / Planting Material', estimate.perAcreCosts.seeds],
                        ['Fertilizers (NPK, DAP, Urea)', estimate.perAcreCosts.fertilizers],
                        ['Pesticides & Crop Protection Sprays', estimate.perAcreCosts.pesticides],
                        ['Labor & Land Preparation', estimate.perAcreCosts.labor],
                        ['Irrigation & Electricity / Fuel', estimate.perAcreCosts.irrigation],
                        ['Miscellaneous & Transport', estimate.perAcreCosts.misc],
                      ].map(([label, val]) => (
                        <tr key={label} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '0.5rem 0.3rem', color: 'var(--text-secondary)' }}>{label}</td>
                          <td style={{ padding: '0.5rem 0.3rem', textAlign: 'right', fontWeight: '700' }}>₹{val.toLocaleString()}</td>
                        </tr>
                      ))}
                      <tr style={{ background: '#FFF0F0', fontWeight: '800' }}>
                        <td style={{ padding: '0.6rem 0.3rem' }}>Total Cost per Acre</td>
                        <td style={{ padding: '0.6rem 0.3rem', textAlign: 'right', color: 'var(--error)' }}>₹{estimate.totalPerAcre.toLocaleString()}</td>
                      </tr>
                      <tr style={{ background: '#FFE8E8', fontWeight: '800' }}>
                        <td style={{ padding: '0.6rem 0.3rem' }}>Total Cost for {estimate.acres} Acres</td>
                        <td style={{ padding: '0.6rem 0.3rem', textAlign: 'right', color: 'var(--error)', fontSize: '1rem' }}>₹{estimate.totalCostAll.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Income & Profit Summary */}
                <div className="grid-2">
                  <div style={{ background: '#E8F5E9', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #A5D6A7' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)' }}>EST. YIELD</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--primary)' }}>{estimate.estYield} Quintals</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>@ ₹{estimate.pricePerQ}/Quintal</div>
                  </div>
                  <div style={{ background: '#E8F5E9', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #A5D6A7' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)' }}>ESTIMATED INCOME</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--primary)' }}>₹{estimate.estIncome.toLocaleString()}</div>
                  </div>
                </div>

                <div style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: estimate.estProfit >= 0 ? '#E8F5E9' : '#FFEBEE',
                  border: `2px solid ${estimate.estProfit >= 0 ? 'var(--primary)' : 'var(--error)'}`,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.85rem', color: estimate.estProfit >= 0 ? 'var(--primary)' : 'var(--error)' }}>
                      ESTIMATED NET PROFIT / LOSS
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Income minus all input costs</div>
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: '900', color: estimate.estProfit >= 0 ? 'var(--primary)' : 'var(--error)' }}>
                    {estimate.estProfit >= 0 ? '+' : ''}₹{estimate.estProfit.toLocaleString()}
                  </div>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'var(--bg)', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  ⚠️ These are AI estimates based on average market rates. Actual costs may vary by region and season.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Expense / Income Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div className="card" style={{ width: '460px', background: 'var(--bg)' }}>
            <h3>Log Farm Income or Expense</h3>
            <form onSubmit={handleAddTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Transaction Type *</label>
                <select className="input-field" value={type} onChange={e => setType(e.target.value)}>
                  <option value="Expense">Expense (Cost Paid)</option>
                  <option value="Income">Income (Money Received)</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Category *</label>
                <select className="input-field" value={category} onChange={e => setCategory(e.target.value)}>
                  {type === 'Expense' ? (
                    <>
                      <option>Seeds & Hybrid Varieties</option>
                      <option>Fertilizers (NPK, DAP, Urea)</option>
                      <option>Pesticides & Crop Protection</option>
                      <option>Labor & Land Preparation</option>
                      <option>Irrigation & Electricity / Fuel</option>
                      <option>Equipment Hire / Tractor</option>
                      <option>Miscellaneous</option>
                    </>
                  ) : (
                    <>
                      <option>Mandi Produce Sale</option>
                      <option>Direct Wholesale Contract</option>
                      <option>Government MSP Sale</option>
                      <option>Government Subsidy / Scheme</option>
                      <option>Equipment Rental Income</option>
                    </>
                  )}
                </select>
              </div>
              <div className="grid-2">
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Amount (₹) *</label>
                  <input type="number" className="input-field" placeholder="e.g. 5000" value={amount} onChange={e => setAmount(e.target.value)} required min="1" />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Date *</label>
                  <input type="date" className="input-field" value={date} onChange={e => setDate(e.target.value)} required />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Notes / Description</label>
                <input type="text" className="input-field" placeholder="e.g. Purchased 50 kg NPK bag from market" value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save & Recalculate</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
