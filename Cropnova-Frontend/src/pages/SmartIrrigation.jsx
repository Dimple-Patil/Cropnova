import React, { useEffect, useState } from 'react';
import { Droplet, Clock, CheckCircle2, Waves, Calendar } from 'lucide-react';

export const SmartIrrigation = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/irrigation')
      .then(res => res.json())
      .then(d => setData(d))
      .catch(() => {
        setData({
          moistureStatus: '45% (Optimal Field Capacity)',
          nextIrrigation: 'Tomorrow, 06:00 AM (Duration: 2 Hours)',
          waterSavedThisMonthLiters: 14500,
          schedules: [
            { id: 1, zone: 'North Wheat Field (Plot A)', status: 'Completed', date: '2026-08-30', duration: '1.5 hrs' },
            { id: 2, zone: 'East Basmati Field (Plot B)', status: 'Scheduled', date: '2026-09-03', duration: '2.0 hrs' }
          ]
        });
      });
  }, []);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2>Smart Irrigation & Water Management 💧</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Automated soil moisture telemetry, drip controller schedules, and water saving analytics.</p>
      </div>

      {data && (
        <>
          <div className="grid-3">
            <div className="card" style={{ borderLeft: '4px solid #0288D1' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>SOIL MOISTURE TELEMETRY</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0.4rem 0', color: '#0288D1' }}>{data.moistureStatus}</div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid var(--accent)' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>NEXT SCHEDULED WATERING</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '800', margin: '0.4rem 0', color: 'var(--warning)' }}>{data.nextIrrigation}</div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid var(--success)' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>WATER SAVED THIS MONTH</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0.4rem 0', color: 'var(--success)' }}>{data.waterSavedThisMonthLiters} L</div>
            </div>
          </div>

          <div className="card">
            <h3>Field Irrigation Timetable</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1rem' }}>
              {data.schedules.map(sch => (
                <div key={sch.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 1rem', background: 'var(--bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontWeight: '700' }}>{sch.zone}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Date: {sch.date} • Duration: {sch.duration}</div>
                  </div>
                  <span className={`badge ${sch.status === 'Completed' ? 'badge-success' : 'badge-warning'}`}>{sch.status}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
