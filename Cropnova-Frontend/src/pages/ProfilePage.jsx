import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  User, MapPin, Save, CheckCircle2, Phone, Mail,
  ArrowLeft, Edit3, Shield, Leaf
} from 'lucide-react';

export const ProfilePage = () => {
  const { user, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    village: user?.village || '',
    district: user?.district || '',
    state: user?.state || '',
    pincode: user?.pincode || ''
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || '',
        village: user.village || '',
        district: user.district || '',
        state: user.state || '',
        pincode: user.pincode || ''
      });
    }
  }, [user]);

  const handleProfileSave = (e) => {
    e.preventDefault();
    updateUserProfile(profileForm);
    setSaveSuccessMsg('Profile & Location updated successfully!');
    setIsEditing(false);
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  const roleBadgeColor = {
    farmer: 'var(--primary)',
    expert: '#7c3aed',
    vendor: '#d97706',
    admin: '#dc2626'
  };

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-secondary)', fontSize: '0.9rem',
          fontWeight: '600', marginBottom: '1.5rem', padding: 0
        }}
      >
        <ArrowLeft size={18} /> Back
      </button>

      {/* Header Card */}
      <div className="card animate-fade-in" style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
        color: '#fff', borderRadius: 'var(--radius-lg)',
        padding: '2rem', marginBottom: '1.5rem',
        display: 'flex', alignItems: 'center', gap: '1.5rem',
        flexWrap: 'wrap'
      }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.25)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontSize: '2rem', fontWeight: '800', flexShrink: 0,
          border: '3px solid rgba(255,255,255,0.5)'
        }}>
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: '1.6rem', fontFamily: 'var(--font-heading)', fontWeight: '800' }}>
            {user?.name || 'Farmer Account'}
          </h1>
          <p style={{ margin: '0.3rem 0 0', opacity: 0.85, fontSize: '0.9rem' }}>
            {user?.email}
          </p>
          <div style={{ marginTop: '0.6rem' }}>
            <span style={{
              background: 'rgba(255,255,255,0.25)', borderRadius: '50px',
              padding: '0.25rem 0.8rem', fontSize: '0.78rem', fontWeight: '700',
              textTransform: 'uppercase', letterSpacing: '0.05em'
            }}>
              🌾 {user?.role || 'farmer'}
            </span>
          </div>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          style={{
            background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)',
            color: '#fff', borderRadius: 'var(--radius-md)', padding: '0.55rem 1.1rem',
            cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem',
            display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0
          }}
        >
          <Edit3 size={16} /> {isEditing ? 'Cancel Edit' : 'Edit Profile'}
        </button>
      </div>

      {/* Success Banner */}
      {saveSuccessMsg && (
        <div className="animate-fade-in" style={{
          background: 'var(--light-green)', color: 'var(--primary-hover)',
          padding: '0.9rem 1.2rem', borderRadius: 'var(--radius-md)',
          marginBottom: '1.2rem', display: 'flex', alignItems: 'center',
          gap: '0.6rem', fontWeight: '600', fontSize: '0.9rem',
          border: '1px solid var(--primary)'
        }}>
          <CheckCircle2 size={20} color="var(--primary)" />
          {saveSuccessMsg}
        </div>
      )}

      <form onSubmit={handleProfileSave}>
        {/* Personal Info Section */}
        <div className="card animate-fade-in" style={{ marginBottom: '1.2rem' }}>
          <h2 style={{
            fontSize: '1rem', color: 'var(--primary)', margin: '0 0 1.2rem',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            paddingBottom: '0.8rem', borderBottom: '1px solid var(--border)'
          }}>
            <User size={18} /> Personal Identification
          </h2>
          <div className="grid-2" style={{ gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Ramesh Kumar"
                  value={profileForm.name}
                  onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                  required
                />
              ) : (
                <p style={{ margin: 0, fontWeight: '600', fontSize: '0.95rem' }}>{profileForm.name || '—'}</p>
              )}
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                <Phone size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />Mobile Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  className="input-field"
                  placeholder="+91 9876543210"
                  value={profileForm.phone}
                  onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                />
              ) : (
                <p style={{ margin: 0, fontWeight: '600', fontSize: '0.95rem' }}>{profileForm.phone || '—'}</p>
              )}
            </div>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
              <Mail size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />Email Address
            </label>
            {isEditing ? (
              <input
                type="email"
                className="input-field"
                placeholder="farmer@cropnova.com"
                value={profileForm.email}
                onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
              />
            ) : (
              <p style={{ margin: 0, fontWeight: '600', fontSize: '0.95rem' }}>{profileForm.email || '—'}</p>
            )}
          </div>
        </div>

        {/* Location Section */}
        <div className="card animate-fade-in" style={{ marginBottom: '1.2rem' }}>
          <h2 style={{
            fontSize: '1rem', color: 'var(--primary)', margin: '0 0 1.2rem',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            paddingBottom: '0.8rem', borderBottom: '1px solid var(--border)'
          }}>
            <MapPin size={18} /> Location & Regional Details
            <span style={{ fontSize: '0.72rem', fontWeight: '600', color: 'var(--text-secondary)', marginLeft: 'auto' }}>
              Updates Weather Telemetry
            </span>
          </h2>
          <div className="grid-2" style={{ gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                Village / Town
              </label>
              {isEditing ? (
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Village Rampur"
                  value={profileForm.village}
                  onChange={e => setProfileForm({ ...profileForm, village: e.target.value })}
                  required
                />
              ) : (
                <p style={{ margin: 0, fontWeight: '600', fontSize: '0.95rem' }}>{profileForm.village || '—'}</p>
              )}
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                District / Region
              </label>
              {isEditing ? (
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Karnal, Ludhiana"
                  value={profileForm.district}
                  onChange={e => setProfileForm({ ...profileForm, district: e.target.value })}
                  required
                />
              ) : (
                <p style={{ margin: 0, fontWeight: '600', fontSize: '0.95rem' }}>{profileForm.district || '—'}</p>
              )}
            </div>
          </div>
          <div className="grid-2" style={{ gap: '1rem', marginTop: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                State
              </label>
              {isEditing ? (
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Haryana, Punjab"
                  value={profileForm.state}
                  onChange={e => setProfileForm({ ...profileForm, state: e.target.value })}
                  required
                />
              ) : (
                <p style={{ margin: 0, fontWeight: '600', fontSize: '0.95rem' }}>{profileForm.state || '—'}</p>
              )}
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                Pincode
              </label>
              {isEditing ? (
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. 132001"
                  value={profileForm.pincode}
                  onChange={e => setProfileForm({ ...profileForm, pincode: e.target.value })}
                />
              ) : (
                <p style={{ margin: 0, fontWeight: '600', fontSize: '0.95rem' }}>{profileForm.pincode || '—'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Account Info Card */}
        <div className="card animate-fade-in" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{
            fontSize: '1rem', color: 'var(--primary)', margin: '0 0 1.2rem',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            paddingBottom: '0.8rem', borderBottom: '1px solid var(--border)'
          }}>
            <Shield size={18} /> Account Details
          </h2>
          <div className="grid-2" style={{ gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                Account Role
              </label>
              <span style={{
                display: 'inline-block',
                background: roleBadgeColor[user?.role] || 'var(--primary)',
                color: '#fff', borderRadius: '50px',
                padding: '0.3rem 1rem', fontSize: '0.82rem', fontWeight: '700',
                textTransform: 'capitalize'
              }}>
                <Leaf size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                {user?.role || 'farmer'}
              </span>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                User ID
              </label>
              <p style={{ margin: 0, fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                #{user?.id || '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Save Button (only show when editing) */}
        {isEditing && (
          <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.65rem 1.6rem' }}>
              <Save size={16} /> Save Changes
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ProfilePage;
