import React, { useState } from 'react';
import { Calculator, DollarSign, Sprout, CheckCircle } from 'lucide-react';

export const FertilizerCalculator = () => {
  const [crop, setCrop] = useState('Wheat');
  const [acres, setAcres] = useState(2);
  const [result, setResult] = useState(null);

  const handleCalculate = (e) => {
    e.preventDefault();
    fetch('/api/fertilizers/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ crop, acreSize: Number(acres) })
    })
      .then(res => res.json())
      .then(d => setResult(d))
      .catch(() => {
        setResult({
          crop,
          acreSize: acres,
          recommendedDosage: {
            urea: Math.round(acres * 45) + ' kg (Split in 3 equal doses)',
            dap: Math.round(acres * 25) + ' kg (Basal dose at sowing)',
            mop: Math.round(acres * 15) + ' kg (Basal dose at sowing)',
            bioFertilizer: 'Azotobacter @ 250g / acre seed culture'
          }
        });
      });
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2>Fertilizer Dosage & Nutrient Calculator 💊</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Calculate exact bag requirements for Nitrogen (Urea), Phosphorus (DAP), and Potash (MOP) per acre.</p>
      </div>

      <div className="grid-2">
        {/* Form Container */}
        <div className="card">
          <h3>Field Parameters</h3>
          <form onSubmit={handleCalculate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Select Crop Type</label>
              <select className="input-field" value={crop} onChange={e => setCrop(e.target.value)}>
                <option>Wheat</option>
                <option>Rice (Paddy)</option>
                <option>Mustard</option>
                <option>Maize</option>
                <option>Cotton</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Land Area (Acres)</label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                className="input-field"
                value={acres}
                onChange={e => setAcres(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary">
              <Calculator size={18} /> Calculate Nutrient Requirement
            </button>
          </form>
        </div>

        {/* Results Display */}
        {result && (
          <div className="card animate-fade-in" style={{ borderLeft: '4px solid var(--primary)' }}>
            <h3>Recommended Dosage ({result.crop} - {result.acreSize} Acres)</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1rem' }}>
              <div style={{ background: 'var(--light-green)', padding: '0.8rem 1rem', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '700', color: 'var(--primary)' }}>Urea (Nitrogen 46%)</span>
                <span style={{ fontWeight: '800', fontSize: '1.1rem' }}>{result.recommendedDosage.urea}</span>
              </div>

              <div style={{ background: '#FFF8E1', padding: '0.8rem 1rem', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '700', color: 'var(--warning)' }}>DAP (Di-Ammonium Phosphate)</span>
                <span style={{ fontWeight: '800', fontSize: '1.1rem' }}>{result.recommendedDosage.dap}</span>
              </div>

              <div style={{ background: 'var(--bg)', padding: '0.8rem 1rem', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border)' }}>
                <span style={{ fontWeight: '700' }}>MOP (Muriate of Potash)</span>
                <span style={{ fontWeight: '800', fontSize: '1.1rem' }}>{result.recommendedDosage.mop}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
