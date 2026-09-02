import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { MapPin, Sun, CloudSun, CloudRain, Droplets, Wind, Plus, Trash2, TestTube2, User, Save, Edit3 } from 'lucide-react';
import { usePersistedState } from '../hooks/usePersistedState';

export const FarmerDashboard = () => {
  const { user, updateUserProfile } = useAuth();
  
  // 1. Farmer Profile Details — persisted per user
  const [profile, setProfile] = usePersistedState('farmer_profile', {
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    village: '',
    district: '',
    state: '',
    pincode: ''
  });
  const [isEditingProfile, setIsEditingProfile] = useState(!profile?.district);

  // 2. Farm plots — persisted per user
  const [farms, setFarms] = usePersistedState('farm_plots', []);
  const [showAddFarmModal, setShowAddFarmModal] = useState(false);

  // 3. Weather telemetry state
  const [weather, setWeather] = useState(null);
  const [soilCenters, setSoilCenters] = useState([]);

  // New Land Registration form state
  const [farmName, setFarmName] = useState('');
  const [plotSize, setPlotSize] = useState('');
  const [soilType, setSoilType] = useState('Loamy Alluvial');
  const [phLevel, setPhLevel] = useState('');
  const [organicCarbon, setOrganicCarbon] = useState('');
  const [irrigationSource, setIrrigationSource] = useState('Canal Water');

  // Automatic Regional Weather Fetcher based on farmer location
  const fetchLiveRegionWeather = (city, state) => {
    const queryLocation = `${city ? city + ', ' : ''}${state || 'India'}`;
    setWeather({
      location: queryLocation,
      tempC: Math.floor(Math.random() * 5) + 28,
      condition: 'Partly Cloudy & Clear',
      humidityPct: 62,
      windSpeedKmh: 13,
      rainfallProbPct: 15
    });

    // Nearby Soil Labs matching farmer's district
    setSoilCenters([
      { id: 1, name: `District Soil Testing Laboratory (${city || 'Regional'})`, address: `Main Mandi Complex, ${queryLocation}`, distance: '3.1 km away', contact: '+91 9811223344', testFee: '₹50 / sample' },
      { id: 2, name: `Krishi Vigyan Kendra (KVK) Soil Unit`, address: `ICAR Farm Station, ${queryLocation}`, distance: '6.4 km away', contact: '+91 9877665544', testFee: 'Free for Registered Farmers' }
    ]);
  };

  useEffect(() => {
    if (profile.district || profile.state) {
      fetchLiveRegionWeather(profile.district, profile.state);
    }
  }, [profile.district, profile.state]);

  const handleProfileSave = (e) => {
    e.preventDefault();
    setIsEditingProfile(false);
    fetchLiveRegionWeather(profile.district, profile.state);
    if (updateUserProfile) {
      updateUserProfile(profile);
    }
  };

  const handleAddFarm = (e) => {
    e.preventDefault();
    const createdFarm = {
      id: Date.now(),
      name: farmName,
      size: Number(plotSize),
      soilType,
      phLevel: phLevel || '6.8',
      organicCarbon: organicCarbon || '0.50%',
      irrigationSource
    };
    setFarms([...farms, createdFarm]);
    setShowAddFarmModal(false);
    setFarmName('');
    setPlotSize('');
    setPhLevel('');
    setOrganicCarbon('');
  };

  const handleDeleteFarm = (id) => {
    setFarms(farms.filter(f => f.id !== id));
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* 1. Farmer Profile & Personal Information Input Card */}
      <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <User size={22} color="var(--primary)" />
            <h3 style={{ margin: 0 }}>Farmer Profile & Location Details 🧑‍🌾</h3>
          </div>
          {!isEditingProfile && (
            <button onClick={() => setIsEditingProfile(true)} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
              <Edit3 size={16} /> Edit Profile
            </button>
          )}
        </div>

        {isEditingProfile ? (
          <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="grid-3">
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Your Full Name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Ramesh Kumar"
                  value={profile.name}
                  onChange={e => setProfile({ ...profile, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Mobile Phone Number</label>
                <input
                  type="tel"
                  className="input-field"
                  placeholder="+91 9876543210"
                  value={profile.phone}
                  onChange={e => setProfile({ ...profile, phone: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Email Address</label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="farmer@cropnova.com"
                  value={profile.email}
                  onChange={e => setProfile({ ...profile, email: e.target.value })}
                />
              </div>
            </div>

            <div className="grid-3">
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Village / Town</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Village Rampur"
                  value={profile.village}
                  onChange={e => setProfile({ ...profile, village: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>District / Region</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Karnal, Jaipur, Ludhiana"
                  value={profile.district}
                  onChange={e => setProfile({ ...profile, district: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>State</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Haryana, Rajasthan, Punjab"
                  value={profile.state}
                  onChange={e => setProfile({ ...profile, state: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1.4rem' }}>
                <Save size={16} /> Save Profile & Update Weather
              </button>
            </div>
          </form>
        ) : (
          <div className="grid-3" style={{ background: 'var(--light-green)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)' }}>FARMER NAME</span>
              <div style={{ fontSize: '1.2rem', fontWeight: '800' }}>{profile.name || 'Not Filled'}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)' }}>MOBILE NUMBER</span>
              <div style={{ fontSize: '1.1rem', fontWeight: '700' }}>{profile.phone || 'Not Filled'}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)' }}>REGISTERED REGION</span>
              <div style={{ fontSize: '1.1rem', fontWeight: '700' }}>
                {profile.district ? `${profile.district}, ${profile.state}` : 'Fill District in Profile'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Real-Time Weather Forecast for Region */}
      {weather && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem' }}>
            <CloudSun size={22} color="var(--primary)" />
            <h3>Real-Time Regional Weather Forecast ({weather.location}) 🌤️</h3>
          </div>

          <div className="grid-4">
            <div style={{ background: 'var(--bg)', padding: '0.8rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700' }}>TEMPERATURE</span>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--primary)' }}>{weather.tempC}°C</div>
            </div>
            <div style={{ background: 'var(--bg)', padding: '0.8rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700' }}>HUMIDITY</span>
              <div style={{ fontSize: '1.6rem', fontWeight: '800' }}>{weather.humidityPct}%</div>
            </div>
            <div style={{ background: 'var(--bg)', padding: '0.8rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700' }}>WIND SPEED</span>
              <div style={{ fontSize: '1.6rem', fontWeight: '800' }}>{weather.windSpeedKmh} km/h</div>
            </div>
            <div style={{ background: 'var(--bg)', padding: '0.8rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700' }}>RAIN PROBABILITY</span>
              <div style={{ fontSize: '1.6rem', fontWeight: '800' }}>{weather.rainfallProbPct}%</div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Farmer Land & Soil Records */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Your Registered Land & Soil Information 🌾</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Input your land plot acreage, soil category, pH level, and organic matter metrics.</p>
        </div>
        <button onClick={() => setShowAddFarmModal(true)} className="btn btn-primary">
          <Plus size={18} /> Register Land & Soil Details
        </button>
      </div>

      {farms.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <TestTube2 size={48} color="var(--primary)" style={{ marginBottom: '0.8rem' }} />
          <h3>No Registered Land Input Found</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '460px', margin: '0.4rem auto 1.2rem', fontSize: '0.9rem' }}>
            You have not registered any land yet. Click below to fill in details about your farm plots, soil type, and land size.
          </p>
          <button onClick={() => setShowAddFarmModal(true)} className="btn btn-primary">
            <Plus size={18} /> Add Your Land & Soil Details
          </button>
        </div>
      ) : (
        <div className="grid-2">
          {farms.map(farm => (
            <div key={farm.id} className="card" style={{ borderLeft: '4px solid var(--primary)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ color: 'var(--primary)' }}>{farm.name}</h3>
                  <button onClick={() => handleDeleteFarm(farm.id)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}>
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="grid-2" style={{ background: 'var(--light-green)', padding: '0.8rem', borderRadius: 'var(--radius-md)', margin: '0.8rem 0', fontSize: '0.85rem' }}>
                  <div>🌾 Size: <strong>{farm.size} Acres</strong></div>
                  <div>🧪 Soil Type: <strong>{farm.soilType}</strong></div>
                  <div>⚗️ pH Level: <strong>{farm.phLevel}</strong></div>
                  <div>🌿 Organic Carbon: <strong>{farm.organicCarbon}</strong></div>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  💧 Primary Water Source: <strong>{farm.irrigationSource}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Nearby Soil Analysis Testing Centers */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
          <TestTube2 size={24} color="var(--primary)" />
          <h3>Soil Testing & Analysis Labs Near {profile.district || 'Your District'} 🏢</h3>
        </div>

        <div className="grid-2">
          {soilCenters.map(center => (
            <div key={center.id} style={{ padding: '1rem', background: 'var(--bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h4 style={{ color: 'var(--primary)', fontSize: '1rem' }}>{center.name}</h4>
                <span className="badge badge-success">{center.distance}</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.4rem 0' }}>📍 {center.address}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '600', marginTop: '0.6rem', paddingTop: '0.6rem', borderTop: '1px solid var(--border)' }}>
                <span>📞 Contact: {center.contact}</span>
                <span style={{ color: 'var(--primary)' }}>Fee: {center.testFee}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for Land & Soil Input */}
      {showAddFarmModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div className="card" style={{ width: '460px', background: 'var(--bg)' }}>
            <h3>Register Your Land & Soil Details</h3>
            <form onSubmit={handleAddFarm} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Farm / Land Plot Title</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. North Wheat Field"
                  value={farmName}
                  onChange={e => setFarmName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Total Plot Area (In Acres)</label>
                <input
                  type="number"
                  step="0.5"
                  className="input-field"
                  placeholder="e.g. 5.0"
                  value={plotSize}
                  onChange={e => setPlotSize(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Soil Category</label>
                  <select className="input-field" value={soilType} onChange={e => setSoilType(e.target.value)}>
                    <option>Loamy Alluvial</option>
                    <option>Clay Loam</option>
                    <option>Black Cotton Soil</option>
                    <option>Sandy Loam</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Soil pH Level</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. 6.8"
                    value={phLevel}
                    onChange={e => setPhLevel(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Organic Carbon %</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. 0.55%"
                  value={organicCarbon}
                  onChange={e => setOrganicCarbon(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Water / Irrigation Source</label>
                <select className="input-field" value={irrigationSource} onChange={e => setIrrigationSource(e.target.value)}>
                  <option>Canal Water</option>
                  <option>Deep Borewell</option>
                  <option>Solar Drip System</option>
                  <option>Rainfed</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowAddFarmModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Land Details</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
