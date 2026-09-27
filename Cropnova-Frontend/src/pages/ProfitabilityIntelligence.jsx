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
  const [marketData, setMarketData] = useState(DEFAULT_MARKET_DATA);

  useEffect(() => {
    Promise.all([api.get('/crops'), api.get('/farms'), api.get('/expenses'), api.get('/market/prices')])
      .then(([cropData, farmData, expenseData, priceData]) => {
        setCrops(Array.isArray(cropData) ? cropData : []);
        setFarms(Array.isArray(farmData) ? farmData : []);
        setExpenses(Array.isArray(expenseData) ? expenseData : []);
        if (Array.isArray(priceData) && priceData.length) {
          setMarketData({ ...DEFAULT_MARKET_DATA, ...Object.fromEntries(priceData.map(item => [item.crop_key, { price: Number(item.price_per_quintal), yield: Number(item.yield_per_acre) }])) });
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
    const acres = Number(crop.acreage || crop.area_acres || farm?.size_acres || 1);
    const linkedExpenses = expenses.filter(expense => String(expense.farm_id || '') === String(crop.farm_id || crop.farmId || ''));
    const recordedCost = linkedExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
    const estimatedCost = acres * 18000;
    const cost = recordedCost || estimatedCost;
    const revenue = acres * market.yield * market.price;
    return { id: crop.id, name: crop.crop_name || crop.cropName || 'Crop', acres, cost, revenue, profit: revenue - cost, price: market.price, yield: market.yield, usesRecordedCost: recordedCost > 0 };
  }), [crops, farms, expenses, marketData]);

  const totals = analysis.reduce((result, item) => ({ cost: result.cost + item.cost, revenue: result.revenue + item.revenue, profit: result.profit + item.profit }), { cost: 0, revenue: 0, profit: 0 });
  const money = value => `₹${Math.round(value).toLocaleString('en-IN')}`;

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

      <div className="card" style={{ background: 'var(--light-green)' }}><div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}><TrendingUp size={20} color="var(--primary)" /><strong>How these estimates work</strong></div><p style={{ margin: '0.5rem 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Recorded expenses are used when available. Otherwise, CropNova uses an estimated per-acre input cost and reference market prices. Replace estimates with your actual expenses for a more accurate result.</p></div>
    </div>
  );
};

export default ProfitabilityIntelligence;
