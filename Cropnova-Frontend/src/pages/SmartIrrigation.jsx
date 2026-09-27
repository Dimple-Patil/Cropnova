import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
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

const followingWateringDate = (cropName) => {
  const next = new Date();
  next.setDate(next.getDate() + wateringIntervalDays(cropName));
  return next.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const irrigationRecommendation = (crop, farm) => {
  const name = (crop?.crop_name || '').toLowerCase();
  const acres = Number(crop?.acreage || crop?.area_acres || farm?.size_acres || 1);
  if (name.includes('rice') || name.includes('paddy')) {
    return { amount: `${(acres * 18000).toLocaleString('en-IN')} L per watering`, method: 'Alternate wetting and drying', detail: 'Use shallow flooding only when the soil surface dries; avoid continuous standing water.' };
  }
  if (name.includes('wheat')) {
    return { amount: `${(acres * 5000).toLocaleString('en-IN')} L per watering`, method: 'Furrow or sprinkler irrigation', detail: 'Apply evenly at the CRI, tillering, flowering, and grain-fill stages.' };
  }
  if (name.includes('cotton')) {
    return { amount: `${(acres * 7000).toLocaleString('en-IN')} L per watering`, method: 'Drip irrigation', detail: 'Deliver water slowly near the root zone, especially during flowering and boll development.' };
  }
  if (name.includes('maize') || name.includes('corn')) {
    return { amount: `${(acres * 6000).toLocaleString('en-IN')} L per watering`, method: 'Furrow or drip irrigation', detail: 'Prioritize knee-high, tasseling, and silking stages; avoid waterlogging.' };
  }
  if (name.includes('mustard')) {
    return { amount: `${(acres * 3500).toLocaleString('en-IN')} L per watering`, method: 'Sprinkler irrigation', detail: 'Use light irrigation at branching, flowering, and pod-filling stages.' };
  }
  return { amount: `${(acres * 5000).toLocaleString('en-IN')} L per watering`, method: 'Drip or sprinkler irrigation', detail: 'Apply gradually at establishment, flowering, and grain-filling stages.' };
};

export const SmartIrrigation = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [wateringResponses, setWateringResponses] = useState({});

  const storageKey = `cropnova-irrigation-${user?.id || 'guest'}`;

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
      setWateringResponses(saved);
    } catch {
      setWateringResponses({});
    }
  }, [storageKey]);

  const recordWateringResponse = (schedule, answer) => {
    const nextDate = answer === 'yes' ? followingWateringDate(schedule.cropName) : schedule.date;
    const updated = {
      ...wateringResponses,
      [schedule.id]: {
        answer,
        scheduledDate: schedule.date,
        nextDate,
        recordedAt: new Date().toISOString()
      }
    };
    setWateringResponses(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));

    if (answer === 'yes') {
      setData(previous => previous ? {
        ...previous,
        schedules: previous.schedules.map(item => item.id === schedule.id ? { ...item, date: nextDate } : item)
      } : previous);
    }
  };

  useEffect(() => {
    const loadIrrigationData = async () => {
      try {
        const [farms, crops] = await Promise.all([api.get('/farms'), api.get('/crops')]);
        const activeCrops = (Array.isArray(crops) ? crops : [])
          .filter(crop => (crop.status || 'Active').toLowerCase() !== 'harvested');
        const savedResponses = JSON.parse(localStorage.getItem(storageKey) || '{}');
        const schedules = activeCrops.map(crop => {
          const farm = (Array.isArray(farms) ? farms : []).find(item => String(item.id) === String(crop.farm_id));
          const recommendation = irrigationRecommendation(crop, farm);
          const plannedDate = nextWateringDate(crop);
          const saved = savedResponses[crop.id];
          return {
            id: crop.id,
            zone: `${crop.crop_name || 'Crop'}${crop.field_section ? ` - ${crop.field_section}` : ''}`,
            cropName: crop.crop_name || 'Crop',
            source: farm?.irrigation_source || 'Irrigation source not recorded',
            status: 'Active',
            date: saved?.answer === 'yes' && saved.nextDate ? saved.nextDate : plannedDate,
            harvestDate: crop.expected_harvest_date || 'Harvest date not set',
            duration: `${wateringIntervalDays(crop.crop_name)}-day crop plan`,
            recommendation
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
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>RECOMMENDED WATERING</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '800', margin: '0.4rem 0', color: '#0288D1' }}>
                {data.schedules[0]?.recommendation.amount || 'Add an active crop'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {data.schedules[0]?.recommendation.method || 'Crop-specific guidance will appear here.'}
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
                {Object.values(wateringResponses).filter(item => item.answer === 'yes').length
                  ? `${Object.values(wateringResponses).filter(item => item.answer === 'yes').length} watering recorded`
                  : 'No watering recorded'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Confirmed events will build your irrigation history.
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
                <div key={sch.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', padding: '0.8rem 1rem', background: 'var(--bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontWeight: '700' }}>{sch.zone}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Next watering: {sch.date} • {sch.duration}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Water source: {sch.source} • Harvest: {sch.harvestDate}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '0.35rem' }}>{sch.recommendation.amount} • {sch.recommendation.method}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{sch.recommendation.detail}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {wateringResponses[sch.id] ? (
                      <div style={{ textAlign: 'right' }}>
                        <span className={`badge ${wateringResponses[sch.id].answer === 'yes' ? 'badge-success' : 'badge-warning'}`}>
                          {wateringResponses[sch.id].answer === 'yes' ? 'Watering recorded' : 'Follow-up needed'}
                        </span>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                          {wateringResponses[sch.id].answer === 'yes'
                            ? `Next cycle: ${followingWateringDate(sch.cropName)}`
                            : 'Inspect the field and try again later'}
                        </div>
                      </div>
                    ) : (
                      <>
                        <span style={{ fontSize: '0.78rem', fontWeight: '700' }}>Watered?</span>
                        <button type="button" className="btn btn-primary" style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }} onClick={() => recordWateringResponse(sch, 'yes')}>
                          Yes
                        </button>
                        <button type="button" className="btn btn-secondary" style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }} onClick={() => recordWateringResponse(sch, 'no')}>
                          No
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
