import React, { useEffect, useMemo, useState } from 'react';
import { BarChart3, IndianRupee, TrendingUp, Wallet } from 'lucide-react';
import { api } from '../utils/api';

const DEFAULT_MARKET_DATA = { rice: { price: 2183, yield: 28 }, paddy: { price: 2183, yield: 28 }, wheat: { price: 2275, yield: 22 }, cotton: { price: 6620, yield: 15 }, maize: { price: 2090, yield: 25 }, mustard: { price: 5650, yield: 12 } };

const cropKey = name => {
  const value = (name || '').toLowerCase();
  return Object.keys(DEFAULT_MARKET_DATA).find(key => value.includes(key)) || 'wheat';
};

export const ProfitabilityIntelligence = () => {
  const [crops, setCrops] = useState([]);
  const [farms, setFarms] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [financialInputs, setFinancialInputs] = useState([]);
  const [selectedCropId, setSelectedCropId] = useState('');
  const [inputForm, setInputForm] = useState({ areaAcres: '', expectedYieldQuintals: '', seedCost: '', fertilizerCost: '', pesticideCost: '', laborCost: '', irrigationCost: '', otherCost: '' });
  const [marketData, setMarketData] = useState(DEFAULT_MARKET_DATA);
  const [marketSource, setMarketSource] = useState('database fallback');

  useEffect(() => {
    Promise.allSettled([api.get('/crops'), api.get('/farms'), api.get('/expenses'), api.get('/financial-inputs'), api.get('/market/prices')])
      .then(results => {
        const value = index => results[index].status === 'fulfilled' ? results[index].value : null;
        const cropData = value(0);
        const farmData = value(1);
        const expenseData = value(2);
        const inputData = value(3);
        const priceResponse = value(4);
        setCrops(Array.isArray(cropData) ? cropData : []);
        setFarms(Array.isArray(farmData) ? farmData : []);
        setExpenses(Array.isArray(expenseData) ? expenseData : []);
        setFinancialInputs(Array.isArray(inputData) ? inputData : []);
        setMarketSource(priceResponse?.source === 'data.gov.in' ? 'live data.gov.in' : 'database fallback');
        const priceData = Array.isArray(priceResponse) ? priceResponse : priceResponse?.records;
        if (Array.isArray(priceData) && priceData.length) {
          const livePrices = priceResponse?.source === 'data.gov.in'
            ? Object.fromEntries(priceData.map(item => [cropKey(item.commodity || item.Commodity), { price: Number(item.modal_price || item.Modal_Price || item.max_price || item.Max_Price), yield: DEFAULT_MARKET_DATA[cropKey(item.commodity || item.Commodity)]?.yield || 20 }]).filter(([, value]) => Number.isFinite(value.price) && value.price > 0))
            : Object.fromEntries(priceData.map(item => [item.crop_key, { price: Number(item.price_per_quintal), yield: Number(item.yield_per_acre) }]));
          setMarketData({ ...DEFAULT_MARKET_DATA, ...livePrices });
        }
      })
      .catch(() => {
        setCrops([]);
        setFarms([]);
        setExpenses([]);
      });
  }, []);

  const analysis = useMemo(() => crops.map(crop => {
    const key = cropKey(crop.crop_name || crop.cropName);
    const market = marketData[key] || DEFAULT_MARKET_DATA.wheat;
    const farm = farms.find(item => String(item.id) === String(crop.farm_id || crop.farmId));
    const savedInput = financialInputs.find(item => String(item.crop_id) === String(crop.id));
    const acres = Number(savedInput?.area_acres || crop.acreage || crop.area_acres || farm?.size_acres || 1);
    const linkedExpenses = expenses.filter(expense => String(expense.farm_id || '') === String(crop.farm_id || crop.farmId || ''));
    const recordedCost = linkedExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
    const enteredCost = savedInput ? ['seed_cost', 'fertilizer_cost', 'pesticide_cost', 'labor_cost', 'irrigation_cost', 'other_cost'].reduce((sum, key) => sum + Number(savedInput[key] || 0), 0) : 0;
    const estimatedCost = acres * 18000;
    const cost = recordedCost || enteredCost || estimatedCost;
    const yieldQuintals = Number(savedInput?.expected_yield_quintals || acres * market.yield);
    const revenue = yieldQuintals * market.price;
    return { id: crop.id, name: crop.crop_name || crop.cropName || 'Crop', acres, cost, revenue, profit: revenue - cost, price: market.price, yield: market.yield, usesRecordedCost: recordedCost > 0 };
  }), [crops, farms, expenses, financialInputs, marketData]);

  const totals = analysis.reduce((result, item) => ({ cost: result.cost + item.cost, revenue: result.revenue + item.revenue, profit: result.profit + item.profit }), { cost: 0, revenue: 0, profit: 0 });
  const money = value => `₹${Math.round(value).toLocaleString('en-IN')}`;
  const saveInputs = async event => {
    event.preventDefault();
    if (!selectedCropId) return;
    const saved = await api.put(`/financial-inputs/${selectedCropId}`, inputForm);
    setFinancialInputs(previous => [...previous.filter(item => String(item.crop_id) !== String(selectedCropId)), saved]);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2>Profitability & Market Intelligence</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Estimate crop revenue and compare it with your recorded or estimated input costs.</p>
      </div>

      <div className="grid-3">
        <div className="card" style={{ borderLeft: '4px solid var(--error)' }}><div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: '700' }}>TOTAL INPUT COST</div><div style={{ fontSize: '1.6rem', fontWeight: '800', marginTop: '0.4rem' }}>{money(totals.cost)}</div></div>
        <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}><div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: '700' }}>EXPECTED REVENUE</div><div style={{ fontSize: '1.6rem', fontWeight: '800', marginTop: '0.4rem' }}>{money(totals.revenue)}</div></div>
        <div className="card" style={{ borderLeft: `4px solid ${totals.profit >= 0 ? 'var(--success)' : 'var(--error)'}` }}><div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: '700' }}>ESTIMATED PROFIT</div><div style={{ fontSize: '1.6rem', fontWeight: '800', marginTop: '0.4rem', color: totals.profit >= 0 ? 'var(--success)' : 'var(--error)' }}>{money(totals.profit)}</div></div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}><BarChart3 size={22} color="var(--primary)" /><h3 style={{ margin: 0 }}>Crop Profitability Comparison</h3></div>
        {analysis.length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>Add a crop and farm record to see profitability estimates.</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {analysis.map(item => <div key={item.id} style={{ padding: '1rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}><h3 style={{ margin: 0, color: 'var(--primary)' }}>{item.name}</h3><span className={`badge ${item.profit >= 0 ? 'badge-success' : 'badge-warning'}`}>{item.profit >= 0 ? 'Projected profit' : 'Review costs'}</span></div>
              <div className="grid-4" style={{ marginTop: '0.8rem', fontSize: '0.82rem' }}><div>Area<strong style={{ display: 'block' }}>{item.acres} acres</strong></div><div>Market price<strong style={{ display: 'block' }}>{money(item.price)}/quintal</strong></div><div>Input cost<strong style={{ display: 'block' }}>{money(item.cost)} {item.usesRecordedCost ? '(recorded)' : '(estimated)'}</strong></div><div>Expected profit<strong style={{ display: 'block', color: item.profit >= 0 ? 'var(--success)' : 'var(--error)' }}>{money(item.profit)}</strong></div></div>
            </div>)}
          </div>
        )}
      </div>

      <div className="card">
        <h3>Enter Your Crop Costs</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Use your own numbers for a more accurate profit estimate.</p>
        <form onSubmit={saveInputs} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <select className="input-field" value={selectedCropId} onChange={event => setSelectedCropId(event.target.value)} required><option value="">Select crop</option>{crops.map(crop => <option key={crop.id} value={crop.id}>{crop.crop_name || crop.cropName}</option>)}</select>
          <div className="grid-3">{[['areaAcres','Area (acres)'],['expectedYieldQuintals','Expected yield (quintals)'],['seedCost','Seed cost']].map(([key,label]) => <input key={key} className="input-field" type="number" min="0" placeholder={label} value={inputForm[key]} onChange={event => setInputForm({ ...inputForm, [key]: event.target.value })} />)}</div>
          <div className="grid-3">{[['fertilizerCost','Fertilizer cost'],['pesticideCost','Pesticide cost'],['laborCost','Labor cost'],['irrigationCost','Irrigation cost'],['otherCost','Other cost']].map(([key,label]) => <input key={key} className="input-field" type="number" min="0" placeholder={label} value={inputForm[key]} onChange={event => setInputForm({ ...inputForm, [key]: event.target.value })} />)}</div>
          <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}><Wallet size={16} /> Save crop inputs</button>
        </form>
      </div>

      <div className="card" style={{ background: 'var(--light-green)' }}><div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}><TrendingUp size={20} color="var(--primary)" /><strong>Market source: {marketSource}</strong></div><p style={{ margin: '0.5rem 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Recorded expenses are used when available. Otherwise, CropNova uses an estimated per-acre input cost. Live mandi prices require valid data.gov.in environment variables.</p></div>
    </div>
  );
};

export default ProfitabilityIntelligence;
