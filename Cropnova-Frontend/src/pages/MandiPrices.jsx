import React, { useMemo, useState } from 'react';
import { MapPin, Search, TrendingDown, TrendingUp, RefreshCw } from 'lucide-react';

const initialPrices = [
  { crop: 'Wheat', local: 'गेहूँ', market: 'Lasalgaon', state: 'Maharashtra', price: 2600, change: 80, updated: 'Today, 10:30 AM' },
  { crop: 'Onion', local: 'प्याज', market: 'Pimpalgaon', state: 'Maharashtra', price: 4750, change: -50, updated: 'Today, 10:25 AM' },
  { crop: 'Tomato', local: 'टमाटर', market: 'Kolar', state: 'Karnataka', price: 2600, change: 100, updated: 'Today, 10:18 AM' },
  { crop: 'Rice', local: 'धान', market: 'Karnal', state: 'Haryana', price: 3600, change: 0, updated: 'Today, 10:12 AM' },
  { crop: 'Soybean', local: 'सोयाबीन', market: 'Indore', state: 'Madhya Pradesh', price: 5700, change: 49, updated: 'Today, 09:55 AM' },
  { crop: 'Cotton', local: 'कपास', market: 'Akola', state: 'Maharashtra', price: 8785, change: -15, updated: 'Today, 09:42 AM' },
  { crop: 'Mustard', local: 'सरसों', market: 'Bharatpur', state: 'Rajasthan', price: 7325, change: -145, updated: 'Today, 09:30 AM' },
  { crop: 'Garlic', local: 'लहसुन', market: 'Mandsaur', state: 'Madhya Pradesh', price: 16500, change: 1500, updated: 'Today, 09:20 AM' }
];

export const MandiPrices = () => {
  const [query, setQuery] = useState('');
  const [state, setState] = useState('All states');
  const [refreshed, setRefreshed] = useState(false);
  const states = ['All states', ...new Set(initialPrices.map(item => item.state))];
  const prices = useMemo(() => initialPrices.filter(item => {
    const matchesSearch = `${item.crop} ${item.local} ${item.market}`.toLowerCase().includes(query.toLowerCase());
    return matchesSearch && (state === 'All states' || item.state === state);
  }), [query, state]);
  const money = value => `₹${value.toLocaleString('en-IN')}`;

  return <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
    <div><h2>Mandi Prices</h2><p style={{ color: 'var(--text-secondary)' }}>Compare today’s crop prices across nearby agricultural markets.</p></div>
    <div className="card" style={{ background: 'var(--navy-light)' }}>
      <div className="grid-3">
        <div style={{ position: 'relative' }}><Search size={17} style={{ position: 'absolute', left: 12, top: 13, color: 'var(--text-secondary)' }} /><input className="input-field" style={{ paddingLeft: '2.4rem' }} placeholder="Search crop or market" value={query} onChange={e => setQuery(e.target.value)} /></div>
        <select className="input-field" value={state} onChange={e => setState(e.target.value)}>{states.map(item => <option key={item}>{item}</option>)}</select>
        <button className="btn btn-secondary" onClick={() => { setRefreshed(true); setTimeout(() => setRefreshed(false), 1400); }}><RefreshCw size={16} /> {refreshed ? 'Updated' : 'Refresh prices'}</button>
      </div>
    </div>
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}><h3 style={{ margin: 0 }}>Today’s market board</h3><span className="badge badge-success">Demo data · ready for API connection</span></div>
      <div style={{ overflowX: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '650px' }}><thead><tr style={{ textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{['Crop','Market','State','Price / quintal','Movement','Updated'].map(item => <th key={item} style={{ padding: '0.9rem 1rem', borderBottom: '1px solid var(--border)' }}>{item}</th>)}</tr></thead><tbody>{prices.map(item => <tr key={item.crop} style={{ borderBottom: '1px solid var(--border)' }}><td style={{ padding: '1rem', fontWeight: 700 }}>{item.crop} <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>· {item.local}</span></td><td style={{ padding: '1rem' }}><MapPin size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />{item.market}</td><td style={{ padding: '1rem' }}>{item.state}</td><td style={{ padding: '1rem', fontWeight: 800 }}>{money(item.price)}</td><td style={{ padding: '1rem', color: item.change > 0 ? 'var(--success)' : item.change < 0 ? 'var(--error)' : 'var(--text-secondary)' }}>{item.change > 0 ? <TrendingUp size={15} /> : item.change < 0 ? <TrendingDown size={15} /> : '—'} {item.change ? `${item.change > 0 ? '+' : ''}${item.change}` : 'Stable'}</td><td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{item.updated}</td></tr>)}</tbody></table></div>
      {!prices.length && <p style={{ padding: '2rem', color: 'var(--text-secondary)' }}>No market prices match your search.</p>}
    </div>
  </div>;
};

export default MandiPrices;
