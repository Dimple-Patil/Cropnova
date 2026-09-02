import React, { useState } from 'react';
import { Lightbulb, Sparkles, CheckCircle2 } from 'lucide-react';

export const SmartCropRecommendationWidget = () => {
  const [soilType, setSoilType] = useState('Loamy Alluvial');
  const [season, setSeason] = useState('Rabi (Winter)');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRecommend = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setResults([
        { crop: 'Wheat (HD-3086)', suitability: '96%', waterReq: 'Medium', expectedYield: '22-25 Quintals/Acre', reason: `High compatibility with ${soilType} soil during ${season} season.` },
        { crop: 'Mustard (Pusa Bold)', suitability: '91%', waterReq: 'Low', expectedYield: '8-10 Quintals/Acre', reason: 'Drought-tolerant high oil seed variety suitable for regional climate.' }
      ]);
      setLoading(false);
    }, 500);
  };

  return (
    <div className="card" style={{ borderLeft: '4px solid var(--accent)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem' }}>
        <Lightbulb size={24} color="var(--accent)" />
        <h3 style={{ margin: 0 }}>Smart Crop Recommendation AI 💡</h3>
      </div>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
        Select your soil type and farming season to receive instant AI crop suitability recommendations.
      </p>

      <form onSubmit={handleRecommend} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', alignItems: 'end' }}>
        <div>
          <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Soil Type</label>
          <select className="input-field" value={soilType} onChange={e => setSoilType(e.target.value)}>
            <option>Loamy Alluvial</option>
            <option>Clay Loam</option>
            <option>Black Cotton Soil</option>
            <option>Sandy Loam</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Season</label>
          <select className="input-field" value={season} onChange={e => setSeason(e.target.value)}>
            <option>Rabi (Winter - Oct to Mar)</option>
            <option>Kharif (Monsoon - Jun to Oct)</option>
            <option>Zaid (Summer - Mar to Jun)</option>
          </select>
        </div>

        <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem' }}>
          <Sparkles size={16} /> {loading ? 'Analyzing...' : 'Get AI Crop Match'}
        </button>
      </form>

      {results && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1.2rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
          {results.map((rec, i) => (
            <div key={i} style={{ padding: '0.8rem', background: 'var(--light-green)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ color: 'var(--primary)', fontSize: '1rem' }}>{rec.crop}</strong>
                <span className="badge badge-success">{rec.suitability} Match</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.3rem 0' }}>{rec.reason}</p>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)' }}>
                Water Req: {rec.waterReq} • Est. Yield: {rec.expectedYield}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
