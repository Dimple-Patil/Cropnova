import React, { useEffect, useState } from 'react';
import { CloudSun, Sun, CloudRain, Wind, Droplets, AlertTriangle } from 'lucide-react';

export const WeatherMonitoring = () => {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    fetch('/api/weather')
      .then(res => res.json())
      .then(data => setWeather(data))
      .catch(() => {
        setWeather({
          location: 'Your Region',
          tempC: 29,
          condition: 'Partly Cloudy',
          humidityPct: 68,
          windSpeedKmh: 14,
          rainfallProbPct: 20,
          forecast: [
            { day: 'Wed', temp: 29, cond: 'Partly Cloudy' },
            { day: 'Thu', temp: 31, cond: 'Sunny' },
            { day: 'Fri', temp: 28, cond: 'Moderate Rain' },
            { day: 'Sat', temp: 27, cond: 'Heavy Shower' },
            { day: 'Sun', temp: 30, cond: 'Clear Sky' }
          ],
          alert: 'Moderate rainfall expected on Friday. Hold chemical pesticide/fertilizer spraying.'
        });
      });
  }, []);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2>Real-Time Micro-Weather Monitoring 🌤️</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Live hyper-local weather telemetry, humidity tracking, wind speed, and rain alerts for field operations.</p>
      </div>

      {weather && (
        <>
          {/* Weather Alert Header Banner */}
          <div className="card" style={{ background: '#FFF8E1', borderLeft: '4px solid var(--warning)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <AlertTriangle size={28} color="var(--warning)" />
            <div>
              <span style={{ fontWeight: '700', color: 'var(--warning)', fontSize: '0.85rem' }}>FARMLAND WEATHER ADVISORY</span>
              <p style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{weather.alert}</p>
            </div>
          </div>

          {/* Main Weather Metrics Cards */}
          <div className="grid-4">
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Sun size={36} color="var(--accent)" />
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>TEMPERATURE</span>
                <div style={{ fontSize: '1.8rem', fontWeight: '800' }}>{weather.tempC}°C</div>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Droplets size={36} color="#0288D1" />
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>HUMIDITY</span>
                <div style={{ fontSize: '1.8rem', fontWeight: '800' }}>{weather.humidityPct}%</div>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Wind size={36} color="var(--primary)" />
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>WIND SPEED</span>
                <div style={{ fontSize: '1.8rem', fontWeight: '800' }}>{weather.windSpeedKmh} <span style={{ fontSize: '0.8rem' }}>km/h</span></div>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <CloudRain size={36} color="#7B1FA2" />
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>RAIN PROBABILITY</span>
                <div style={{ fontSize: '1.8rem', fontWeight: '800' }}>{weather.rainfallProbPct}%</div>
              </div>
            </div>
          </div>

          {/* 5-Day Forecast Grid */}
          <div className="card">
            <h3>5-Day Field Weather Forecast</h3>
            <div className="grid-5" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
              {weather.forecast.map((f, i) => (
                <div key={i} style={{ background: 'var(--bg)', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: '700', color: 'var(--primary)' }}>{f.day}</div>
                  <CloudSun size={28} color="var(--accent)" style={{ margin: '0.5rem 0' }} />
                  <div style={{ fontSize: '1.2rem', fontWeight: '800' }}>{f.temp}°C</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{f.cond}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
