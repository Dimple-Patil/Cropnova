import React, { useEffect, useState } from 'react';
import { Bug, ShieldCheck, AlertCircle, Info, Filter } from 'lucide-react';

export const PestManagement = () => {
  const [pests, setPests] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState('All');

  useEffect(() => {
    fetch('/api/pests')
      .then(res => res.json())
      .then(d => setPests(d))
      .catch(() => {
        setPests([
          { id: 1, name: 'Brown Planthopper (BPH)', crop: 'Rice', prevention: 'Maintain water depth below 5cm during tillering, avoid excessive nitrogen application.', organicRemedy: 'Install yellow sticky traps (10/acre) & spray 5% Neem Seed Kernel Extract (NSKE).', chemicalRemedy: 'Apply Imidacloprid 17.8% SL @ 0.5ml per liter of water.' },
          { id: 2, name: 'Fall Armyworm (FAW)', crop: 'Maize', prevention: 'Conduct deep summer plowing to expose pupae to solar heat.', organicRemedy: 'Release Trichogramma egg parasitoids @ 50,000/acre.', chemicalRemedy: 'Spray Emamectin benzoate 5% SG @ 0.4g/liter of water.' },
          { id: 3, name: 'Pink Bollworm', crop: 'Cotton', prevention: 'Grow non-Bt border rows and erect pheromone traps.', organicRemedy: 'Spray Neem oil 1500 ppm @ 5ml/liter.', chemicalRemedy: 'Profex Super (Profenofos + Cypermethrin) @ 2ml/L.' }
        ]);
      });
  }, []);

  const filtered = selectedCrop === 'All' ? pests : pests.filter(p => p.crop === selectedCrop);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2>Integrated Pest Management (IPM) 🐛</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Identify destructive field pests, economic threshold levels (ETL), and organic bio-control guidelines.</p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.8rem' }}>
        {['All', 'Rice', 'Wheat', 'Maize', 'Cotton'].map(c => (
          <button
            key={c}
            onClick={() => setSelectedCrop(c)}
            className={`btn ${selectedCrop === c ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '30px' }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Pest Cards */}
      <div className="grid-2">
        {filtered.map(pest => (
          <div key={pest.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ color: 'var(--error)' }}>{pest.name}</h3>
              <span className="badge badge-primary">{pest.crop} Target</span>
            </div>

            <div style={{ fontSize: '0.85rem' }}>
              <strong>Cultural Prevention:</strong>
              <p style={{ color: 'var(--text-secondary)' }}>{pest.prevention}</p>
            </div>

            <div style={{ background: 'var(--light-green)', padding: '0.8rem', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <ShieldCheck size={16} /> Organic & Bio-Control
              </span>
              <p style={{ fontSize: '0.85rem', marginTop: '0.2rem' }}>{pest.organicRemedy}</p>
            </div>

            <div style={{ background: '#FFF8E1', padding: '0.8rem', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontWeight: '700', color: 'var(--warning)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <AlertCircle size={16} /> Chemical Remedy (ETL Breached)
              </span>
              <p style={{ fontSize: '0.85rem', marginTop: '0.2rem' }}>{pest.chemicalRemedy}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
