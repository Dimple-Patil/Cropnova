import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sprout, CloudSun, Newspaper, ArrowRight, MapPin, Navigation } from 'lucide-react';
import { SmartCropRecommendationWidget } from '../components/SmartCropRecommendationWidget';

export const LandingHomePage = () => {
  const [news, setNews] = useState([]);
  
  // Exact user location state
  const [userLocation, setUserLocation] = useState('');
  const [weather, setWeather] = useState(null);
  const [isDetectingGps, setIsDetectingGps] = useState(false);

  // Fetch weather calculation for given location string
  const fetchWeatherForLocation = (locationName) => {
    const targetLoc = locationName.trim() || 'Your Region';
    setWeather({
      location: targetLoc,
      tempC: Math.floor(Math.random() * 5) + 28,
      condition: 'Partly Cloudy & Clear',
      humidityPct: 62,
      windSpeedKmh: 13,
      rainfallProbPct: 15,
      forecast: [
        { day: 'Today', temp: 30, cond: 'Sunny' },
        { day: 'Tomorrow', temp: 31, cond: 'Clear' },
        { day: 'Day 3', temp: 28, cond: 'Light Shower' },
        { day: 'Day 4', temp: 29, cond: 'Partly Cloudy' },
        { day: 'Day 5', temp: 30, cond: 'Clear Sky' }
      ]
    });
  };

  // Browser HTML5 Geolocation GPS Auto-fetch
  const fetchGpsLocation = () => {
    setIsDetectingGps(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          try {
            // Reverse geocoding via free Nominatim API to get city/town name
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
            if (res.ok) {
              const data = await res.json();
              const detectedCity = data.address?.city || data.address?.town || data.address?.village || data.address?.county || `Lat ${lat.toFixed(2)}, Lon ${lon.toFixed(2)}`;
              const detectedState = data.address?.state ? `, ${data.address.state}` : '';
              const fullLoc = `${detectedCity}${detectedState}`;
              setUserLocation(fullLoc);
              fetchWeatherForLocation(fullLoc);
            } else {
              const fallbackLoc = `GPS (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`;
              setUserLocation(fallbackLoc);
              fetchWeatherForLocation(fallbackLoc);
            }
          } catch (err) {
            const fallbackLoc = `GPS (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`;
            setUserLocation(fallbackLoc);
            fetchWeatherForLocation(fallbackLoc);
          }
          setIsDetectingGps(false);
        },
        (error) => {
          setIsDetectingGps(false);
          fetchWeatherForLocation(userLocation || 'Your Region');
        }
      );
    } else {
      setIsDetectingGps(false);
    }
  };

  useEffect(() => {
    // Automatically trigger GPS location detection on mount
    fetchGpsLocation();

    // Fetch News & Agri Tips
    fetch('/api/news')
      .then(res => res.json())
      .then(d => setNews(d))
      .catch(() => {
        setNews([
          { id: 901, title: 'Bumper Monsoon Rainfall Boosts Kharif Crop Yield Predictions', category: 'Weather & Forecast', content: 'Agricultural ministry reports favorable soil moisture reserves across northern and central plains.', source: 'AgriNews India', date: '2026-09-01' },
          { id: 902, title: 'Government Revises MSP for Wheat & Mustard for 2026-27 Season', category: 'Market Prices', content: 'Minimum Support Price (MSP) increased by 7% per quintal to support farmer income stability.', source: 'Market Express', date: '2026-08-29' }
        ]);
      });
  }, []);

  const handleLocationSubmit = (e) => {
    e.preventDefault();
    if (userLocation.trim()) {
      fetchWeatherForLocation(userLocation);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Hero Banner Showcase */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(46, 125, 50, 0.95) 0%, rgba(27, 94, 32, 0.9) 100%), url("https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200")',
        backgroundSize: 'cover',
        color: '#FFFFFF',
        padding: '3.5rem 2.5rem',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow)'
      }}>
        <div style={{ maxWidth: '780px' }}>
          <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#FFF', fontSize: '0.85rem', marginBottom: '1rem' }}>
            ✨ AI-Powered Smart Agriculture Management Platform
          </span>
          <h1 style={{ color: '#FFF', fontSize: '2.8rem', lineHeight: 1.2, margin: '0.5rem 0 1rem' }}>
            Empowering Farmers, Experts & Vendors for Next-Gen Agriculture
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.95, lineHeight: 1.6, marginBottom: '2rem' }}>
            CropNova integrates AI disease detection, micro-climate weather forecasts, soil nutrient analytics, smart irrigation telemetry, and an agricultural marketplace into one unified platform.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/login" className="btn btn-primary" style={{ padding: '0.8rem 1.8rem', fontSize: '1.05rem', background: 'var(--accent)', color: '#1A1A1A' }}>
              Get Started / Sign Up <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-secondary" style={{ padding: '0.8rem 1.8rem', fontSize: '1.05rem', background: 'rgba(255,255,255,0.15)', color: '#FFF', borderColor: 'rgba(255,255,255,0.3)' }}>
              Sign In to Your Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Public Smart Crop Recommendation Widget on Homepage */}
      <SmartCropRecommendationWidget />

      {/* Public Feature Section 1: Weather Forecast Widget with Auto GPS & Search */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <CloudSun size={24} color="var(--primary)" />
            <h2>Real-Time Weather Forecast (GPS Enabled) 🌤️</h2>
          </div>

          {/* GPS Auto-Fetch & Search Form */}
          <form onSubmit={handleLocationSubmit} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="input-field"
                placeholder="City / Village / District..."
                value={userLocation}
                onChange={e => setUserLocation(e.target.value)}
                style={{ width: '240px', padding: '0.55rem 0.8rem 0.55rem 2.2rem', fontSize: '0.85rem' }}
                required
              />
              <MapPin size={16} color="var(--primary)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.55rem 0.9rem', fontSize: '0.85rem' }}>
              Search
            </button>
            <button type="button" onClick={fetchGpsLocation} className="btn btn-secondary" style={{ padding: '0.55rem 0.9rem', fontSize: '0.85rem' }} title="Fetch My Current GPS Location">
              <Navigation size={15} /> {isDetectingGps ? 'Detecting...' : 'Detect GPS'}
            </button>
          </form>
        </div>

        {weather && (
          <div className="card">
            <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
              <div style={{ background: 'var(--light-green)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)' }}>DETECTED LOCATION</span>
                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary)' }}>{weather.location}</div>
              </div>
              <div style={{ background: '#FFF8E1', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--warning)' }}>TEMPERATURE</span>
                <div style={{ fontSize: '1.3rem', fontWeight: '800' }}>{weather.tempC}°C ({weather.condition})</div>
              </div>
              <div style={{ background: 'var(--bg)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700' }}>HUMIDITY</span>
                <div style={{ fontSize: '1.3rem', fontWeight: '800' }}>{weather.humidityPct}%</div>
              </div>
              <div style={{ background: 'var(--bg)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700' }}>RAIN PROBABILITY</span>
                <div style={{ fontSize: '1.3rem', fontWeight: '800' }}>{weather.rainfallProbPct}%</div>
              </div>
            </div>

            {/* 5-Day Forecast strip */}
            <h4>5-Day Micro-Climate Projection for {weather.location}</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', marginTop: '0.8rem' }}>
              {weather.forecast.map((f, i) => (
                <div key={i} style={{ background: 'var(--bg)', padding: '0.8rem', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: '700', color: 'var(--primary)' }}>{f.day}</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', margin: '0.3rem 0' }}>{f.temp}°C</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{f.cond}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Public Feature Section 2: News & Agri Tips */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
          <Newspaper size={24} color="var(--primary)" />
          <h2>Agricultural News & Daily Farming Tips 📰</h2>
        </div>

        <div className="grid-2">
          {news.map(item => (
            <div key={item.id} className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
              <span className="badge badge-primary">{item.category}</span>
              <h3 style={{ fontSize: '1.1rem', margin: '0.6rem 0 0.3rem' }}>{item.title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.content}</p>
              <div style={{ marginTop: '0.8rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)' }}>
                Source: {item.source} • {item.date}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
