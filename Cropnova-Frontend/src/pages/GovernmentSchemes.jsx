import React, { useEffect, useState } from 'react';
import { Building2, ExternalLink, ShieldCheck, CheckCircle2, Search } from 'lucide-react';

export const GovernmentSchemes = () => {
  const [schemes, setSchemes] = useState([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetch('/api/schemes')
      .then(res => res.json())
      .then(d => setSchemes(d))
      .catch(() => {
        setSchemes([
          { id: 801, title: 'PM-Kisan Samman Nidhi Scheme', category: 'Direct Benefit Transfer', subsidyAmount: '₹6,000 / year', eligibility: 'Small & marginal farm owners with land record up to 2 hectares.', deadline: 'Ongoing 2026', link: 'https://pmkisan.gov.in' },
          { id: 802, title: 'Sub-Mission on Agricultural Mechanization (SMAM)', category: 'Equipment Subsidy', subsidyAmount: '40% - 50% Subsidy on Tractors & Harvesters', eligibility: 'Registered farmer groups, individual farmers with valid Aadhaar.', deadline: '31st Oct 2026', link: 'https://agrimachinery.nic.in' },
          { id: 803, title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)', category: 'Crop Insurance', subsidyAmount: 'Up to 90% Premium Subsidy against Flood/Drought', eligibility: 'All farmers growing notified food crops and oilseeds.', deadline: '15th Nov 2026', link: 'https://pmfby.gov.in' }
        ]);
      });
  }, []);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2>Government Agricultural Schemes & Subsidies 🏛️</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Explore central & state schemes, eligibility requirements, and direct application links.</p>
      </div>

      {/* Schemes Grid */}
      <div className="grid-2">
        {schemes.map(scheme => (
          <div key={scheme.id} className="card" style={{ borderLeft: '4px solid var(--primary)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <span className="badge badge-primary">{scheme.category}</span>
              <h3 style={{ fontSize: '1.2rem', margin: '0.6rem 0' }}>{scheme.title}</h3>
              
              <div style={{ background: 'var(--light-green)', padding: '0.8rem', borderRadius: 'var(--radius-md)', margin: '0.8rem 0' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)' }}>SUBSIDY VALUE</span>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--primary-hover)' }}>{scheme.subsidyAmount}</div>
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <strong>Eligibility:</strong> {scheme.eligibility}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.2rem', paddingTop: '0.8rem', borderTop: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--warning)' }}>Deadline: {scheme.deadline}</span>
              <a href={scheme.link} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                Apply Online <ExternalLink size={14} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
