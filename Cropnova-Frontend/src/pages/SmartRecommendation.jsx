import React, { useState } from 'react';
import { Lightbulb, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';

export const SmartRecommendation = () => {
  const [form, setForm] = useState({ soilType: 'Loamy', season: 'Rabi (Winter)', region: 'Northern Plains', moisture: 'Medium' });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRecommend = (e) => {
    e.preventDefault();
    setLoading(true);
    fetch('/api/recommendations/smart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
      .then(res => res.json())
      .then(data => {
        setResults(data.recommendedCrops);
        setLoading(false);
      })
      .catch(() => {
        setResults([
          { crop: 'Wheat (HD-3086)', suitability: '96%', waterReq: 'Medium', expectedYield: '22-25 Q/Acre', reason: 'High compatibility with Loamy soil during Rabi season.' },
          { crop: 'Mustard (Pusa Bold)', suitability: '91%', waterReq: 'Low', expectedYield: '8-10 Q/Acre', reason: 'Drought-tolerant high oil seed suitable for regional climate.' }
        ]);
        setLoading(false);
      });
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2>Smart Crop Recommendation AI 🤖</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Get tailored crop selections based on soil type, seasonal weather, and regional climate analysis.</p>
      </div>

      <div className="grid-2">
        {/* Parameters Form */}
        <div className="card">
          <h3>Input Field Parameters</h3>
          <form onSubmit={handleRecommend} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Soil Texture & Type</label>
              <select className="input-field" value={form.soilType} onChange={e => setForm({ ...form, soilType: e.target.value })}>
                <option>Loamy Alluvial</option>
                <option>Clay Loam</option>
                <option>Sandy Loam</option>
                <option>Black Cotton Soil</option>
                <option>Red Soil</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Farming Season</label>
              <select className="input-field" value={form.season} onChange={e => setForm({ ...form, season: e.target.value })}>
                <option>Rabi (Winter - Oct to Mar)</option>
                <option>Kharif (Monsoon - Jun to Oct)</option>
                <option>Zaid (Summer - Mar to Jun)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Geographical Region</label>
              <select className="input-field" value={form.region} onChange={e => setForm({ ...form, region: e.target.value })}>
                <option>Northern Plains (Punjab/Haryana/UP)</option>
                <option>Central Plateau (MP/Maharashtra)</option>
                <option>Coastal South (Tamil Nadu/Kerala)</option>
                <option>Eastern Belt (West Bengal/Bihar)</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
              <Sparkles size={18} /> {loading ? 'Analyzing Parameters...' : 'Generate AI Recommendations'}
            </button>
          </form>
        </div>

        {/* Results Showcase */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {results ? (
            results.map((rec, index) => (
              <div key={index} className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ color: 'var(--primary)' }}>{rec.crop}</h3>
                  <span className="badge badge-success" style={{ fontSize: '0.9rem' }}>{rec.suitability} Match</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.5rem 0' }}>{rec.reason}</p>
                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', fontWeight: '600', marginTop: '0.5rem' }}>
                  <span>💧 Water Requirement: <strong>{rec.waterReq}</strong></span>
                  <span>🌾 Est. Yield: <strong>{rec.expectedYield}</strong></span>
                </div>
              </div>
            ))
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              <Lightbulb size={48} color="var(--accent)" style={{ marginBottom: '1rem' }} />
              <p>Select your field parameters and click generate to receive AI-backed crop suggestions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
