import React, { useEffect, useState } from 'react';
import { BarChart3, Download, TrendingUp, Award } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const ReportsAnalytics = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch('/api/reports/summary')
      .then(res => res.json())
      .then(d => setStats(d))
      .catch(() => {
        setStats({
          cropHealthIndex: '92%',
          waterEfficiencyScore: '88/100',
          overallROI: '+34.5%',
          monthlyYieldHistory: [
            { month: 'May', yield: 18 },
            { month: 'Jun', yield: 24 },
            { month: 'Jul', yield: 15 },
            { month: 'Aug', yield: 42 }
          ]
        });
      });
  }, []);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Platform Reports & Analytical Performance 📊</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Downloadable productivity analytics, water efficiency metrics, and financial ROI summaries.</p>
        </div>
        <button className="btn btn-primary">
          <Download size={18} /> Export Full PDF Report
        </button>
      </div>

      {stats && (
        <>
          <div className="grid-3">
            <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>CROP HEALTH INDEX</div>
              <div style={{ fontSize: '2rem', fontWeight: '800', margin: '0.4rem 0', color: 'var(--primary)' }}>{stats.cropHealthIndex}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--success)' }}>Optimal Canopy & Chlorophyll</div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid #0288D1' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>WATER EFFICIENCY SCORE</div>
              <div style={{ fontSize: '2rem', fontWeight: '800', margin: '0.4rem 0', color: '#0288D1' }}>{stats.waterEfficiencyScore}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Drip & Telemetry Optimization</div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid var(--accent)' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>SEASONAL FINANCIAL ROI</div>
              <div style={{ fontSize: '2rem', fontWeight: '800', margin: '0.4rem 0', color: 'var(--warning)' }}>{stats.overallROI}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--success)' }}>Compared to Regional Average</div>
            </div>
          </div>

          <div className="card">
            <h3>Monthly Harvest Production Volume (Quintals)</h3>
            <div style={{ width: '100%', height: 280, marginTop: '1rem' }}>
              <ResponsiveContainer>
                <BarChart data={stats.monthlyYieldHistory}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="yield" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
