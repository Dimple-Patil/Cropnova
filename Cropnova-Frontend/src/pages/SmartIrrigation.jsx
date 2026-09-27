import React, { useEffect, useState } from 'react';
import { Droplet, Clock, CheckCircle2, Waves, Calendar } from 'lucide-react';
import { api } from '../utils/api';

export const SmartIrrigation = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const loadIrrigationData = async () => {
      try {
        const [farms, crops] = await Promise.all([api.get('/farms'), api.get('/crops')]);
        const activeCrops = (Array.isArray(crops) ? crops : [])
          .filter(crop => (crop.status || 'Active').toLowerCase() !== 'harvested');
        const schedules = activeCrops.map(crop => {
          const farm = (Array.isArray(farms) ? farms : []).find(item => String(item.id) === String(crop.farm_id));
          return {
            id: crop.id,
            zone: `${crop.crop_name || 'Crop'}${crop.field_section ? ` - ${crop.field_section}` : ''}`,
            source: farm?.irrigation_source || 'Irrigation source not recorded',
            status: 'Active',
            date: crop.expected_harvest_date || 'Harvest date not set',
            duration: 'Use crop plan'
          };
        });
        setData({ farms: Array.isArray(farms) ? farms : [], crops: activeCrops, schedules });
      } catch (error) {
        setData({ farms: [], crops: [], schedules: [] });
      }
    };
    loadIrrigationData();
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
              <div style={{ fontSize: '1.1rem', fontWeight: '800', margin: '0.4rem 0', color: '#0288D1' }}>
                {data.crops.length ? `${data.crops.length} active crop${data.crops.length === 1 ? '' : 's'}` : 'No crop data'}
              </div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid var(--accent)' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>NEXT SCHEDULED WATERING</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '800', margin: '0.4rem 0', color: 'var(--warning)' }}>
                {data.crops.length ? 'Open crop-specific plan' : 'Add an active crop'}
              </div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid var(--success)' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>WATER SAVED THIS MONTH</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '800', margin: '0.4rem 0', color: 'var(--success)' }}>
                {data.farms.length ? `${data.farms.length} registered farm${data.farms.length === 1 ? '' : 's'}` : 'No farm data'}
              </div>
            </div>
          </div>

          <div className="card">
            <h3>Field Irrigation Timetable</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1rem' }}>
              {data.schedules.length === 0 && (
                <div style={{ color: 'var(--text-secondary)', padding: '1rem 0' }}>
                  Add a farm and active crop to see irrigation guidance here.
                </div>
              )}
              {data.schedules.map(sch => (
                <div key={sch.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 1rem', background: 'var(--bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontWeight: '700' }}>{sch.zone}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Water source: {sch.source} • Harvest: {sch.date}</div>
                  </div>
                  <span className="badge badge-primary">{sch.status}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
