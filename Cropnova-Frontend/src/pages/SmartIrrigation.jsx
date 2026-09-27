import React, { useEffect, useState } from 'react';
import { Droplet, Clock, CheckCircle2, Waves, Calendar } from 'lucide-react';
import { api } from '../utils/api';

const wateringIntervalDays = (cropName) => {
  const crop = (cropName || '').toLowerCase();
  if (crop.includes('rice') || crop.includes('paddy')) return 5;
  if (crop.includes('wheat')) return 15;
  if (crop.includes('cotton') || crop.includes('sugarcane')) return 10;
  if (crop.includes('mustard')) return 20;
  if (crop.includes('maize') || crop.includes('corn')) return 7;
  return 10;
};

const nextWateringDate = (crop) => {
  const interval = wateringIntervalDays(crop.crop_name);
  const start = crop.sowing_date ? new Date(crop.sowing_date) : new Date();
  const today = new Date();
  let next = new Date(start);
  while (next <= today) next.setDate(next.getDate() + interval);
  return next.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

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
            date: nextWateringDate(crop),
            harvestDate: crop.expected_harvest_date || 'Harvest date not set',
            duration: `${wateringIntervalDays(crop.crop_name)}-day crop plan`
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
                {data.crops.length ? 'Sensor not connected' : 'Add an active crop'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Live percentage requires a soil-moisture sensor reading.
              </div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid var(--accent)' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>NEXT SCHEDULED WATERING</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '800', margin: '0.4rem 0', color: 'var(--warning)' }}>
                {data.schedules[0]?.date || 'Add an active crop'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {data.schedules[0] ? 'Estimated from the saved crop plan' : 'No crop schedule available'}
              </div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid var(--success)' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>WATER SAVED THIS MONTH</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '800', margin: '0.4rem 0', color: 'var(--success)' }}>
                No savings logged
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Add irrigation history to calculate monthly savings.
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
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Next watering: {sch.date} • {sch.duration}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Water source: {sch.source} • Harvest: {sch.harvestDate}</div>
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
