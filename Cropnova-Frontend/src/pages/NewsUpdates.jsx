import React, { useEffect, useState } from 'react';
import { Newspaper, TrendingUp, Calendar, ExternalLink } from 'lucide-react';

export const NewsUpdates = () => {
  const [news, setNews] = useState([]);

  useEffect(() => {
    fetch('/api/news')
      .then(res => res.json())
      .then(d => setNews(d))
      .catch(() => {
        setNews([
          { id: 901, title: 'Bumper Monsoon Rainfall Boosts Kharif Crop Yield Predictions', category: 'Weather & Forecast', content: 'Agricultural ministry reports favorable soil moisture reserves across northern and central plains supporting paddy and pulse sowings.', source: 'AgriNews India', date: '2026-09-01' },
          { id: 902, title: 'Government Revises MSP for Wheat & Mustard for 2026-27 Season', category: 'Market Prices', content: 'Minimum Support Price (MSP) increased by 7% per quintal to support farmer income stability and counter fertilizer inflation.', source: 'Market Express', date: '2026-08-29' },
          { id: 903, title: 'Solar Powered Drip Irrigation Subsidies Extended in Punjab', category: 'Technology', content: 'Farmers can now claim up to 80% subsidy on solar pump installations registered through state portal.', source: 'TechAgri Portal', date: '2026-08-25' }
        ]);
      });
  }, []);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2>Agri News, Mandi Prices & Daily Tips 📰</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Stay updated with agricultural technology trends, commodity market prices, and seasonal advisories.</p>
      </div>

      <div className="grid-3">
        {news.map(item => (
          <div key={item.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-primary">{item.category}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.date}</span>
              </div>
              <h3 style={{ fontSize: '1.1rem', margin: '0.8rem 0 0.4rem' }}>{item.title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.content}</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '0.6rem', borderTop: '1px solid var(--border)', fontSize: '0.8rem' }}>
              <span style={{ fontWeight: '600', color: 'var(--primary)' }}>Source: {item.source}</span>
              <button className="btn btn-secondary" style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}>Read Article</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
