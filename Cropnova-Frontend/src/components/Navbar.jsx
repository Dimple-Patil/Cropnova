import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sprout, Sun, Moon, Bell, LogIn, LogOut,
  LayoutDashboard, TestTube2, DollarSign, Wallet, Wheat, Building2, UserCog, ShoppingCart,
  User, MapPin, Save, X, CheckCircle2, ChevronDown, Edit3
} from 'lucide-react';

export const Navbar = () => {
  const { user, updateUserProfile, theme, toggleTheme, logout } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Local state for profile modal inputs
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    village: user?.village || 'Village Rampur',
    district: user?.district || 'Karnal',
    state: user?.state || 'Haryana',
    pincode: user?.pincode || '132001'
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || '',
        village: user.village || 'Village Rampur',
        district: user.district || 'Karnal',
        state: user.state || 'Haryana',
        pincode: user.pincode || '132001'
      });
    }
  }, [user]);

  // Role-based horizontal navbar items (NEWS REMOVED FROM NAVBAR AS REQUESTED)
  const getNavItems = () => {
    if (!user) {
      return [
        { title: 'Home / About', path: '/', icon: LayoutDashboard }
      ];
    }

    const items = [];
    if (user.role === 'farmer') {
      items.push(
        { title: 'Dashboard', path: '/', icon: LayoutDashboard },
        { title: 'Crops', path: '/crops', icon: Sprout },
        { title: 'Soil Health', path: '/soil', icon: TestTube2 },
        { title: 'Fertilizers', path: '/fertilizers', icon: DollarSign },
        { title: 'Expenses & Income', path: '/finance', icon: Wallet },
        { title: 'Harvest', path: '/harvest', icon: Wheat },
        { title: 'Govt Schemes', path: '/schemes', icon: Building2 }
      );
    } else if (user.role === 'expert') {
      items.push(
        { title: 'Dashboard', path: '/', icon: LayoutDashboard },
        { title: 'Soil Health', path: '/soil', icon: TestTube2 },
        { title: 'Fertilizers', path: '/fertilizers', icon: DollarSign },
        { title: 'Govt Schemes', path: '/schemes', icon: Building2 }
      );
    } else if (user.role === 'vendor') {
      items.push(
        { title: 'Dashboard', path: '/', icon: LayoutDashboard },
        { title: 'Inventory & Sales', path: '/vendor', icon: ShoppingCart }
      );
    } else if (user.role === 'admin') {
      items.push(
        { title: 'Admin Master Panel', path: '/admin', icon: UserCog }
      );
    }

    return items;
  };

  const navItems = getNavItems();

  const handleProfileSave = (e) => {
    e.preventDefault();
    updateUserProfile(profileForm);
    setSaveSuccessMsg('Profile & Location updated successfully! Dashboard telemetry updated.');
    setTimeout(() => {
      setSaveSuccessMsg('');
      setShowProfileModal(false);
    }, 1200);
  };

  return (
    <>
      <nav style={{
        background: 'var(--card-bg)',
        borderBottom: '1px solid var(--glass-border)',
        padding: '0.6rem 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            <Sprout size={22} />
          </div>
          <div>
            <span style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>Crop</span>
            <span style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--accent)', fontFamily: 'var(--font-heading)' }}>Nova</span>
            <span style={{ fontSize: '0.65rem', display: 'block', color: 'var(--text-secondary)', marginTop: '-4px', fontWeight: '600' }}>SMART AGRI PLATFORM</span>
          </div>
        </Link>

        {/* Horizontal Nav Links */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
          flex: 1
        }}>
          {navItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={index}
                to={item.path}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.5rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  fontWeight: isActive ? '700' : '500',
                  color: isActive ? '#FFFFFF' : 'var(--text-primary)',
                  background: isActive ? 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' : 'transparent',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                })}
              >
                <Icon size={16} />
                <span>{item.title}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Right Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexShrink: 0 }}>
          <button onClick={toggleTheme} className="btn btn-secondary" style={{ padding: '0.4rem 0.7rem', borderRadius: '50px' }} title="Toggle Theme">
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          {user ? (
            <>
              <Link to="/notifications" style={{ position: 'relative', color: 'var(--text-primary)', textDecoration: 'none', padding: '0.3rem' }} title="Notifications">
                <Bell size={20} />
                <span style={{
                  position: 'absolute', top: '-2px', right: '-2px', background: 'var(--error)', color: '#fff', fontSize: '0.6rem', fontWeight: 'bold', borderRadius: '50%', width: '15px', height: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>2</span>
              </Link>

              {/* Clickable User Name Badge Trigger for Profile & Location Details in Top Right Corner */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'var(--light-green)',
                    border: '1px solid var(--primary)',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '50px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  title="Click to manage profile & location details"
                >
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    fontSize: '0.85rem'
                  }}>
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--primary-hover)', lineHeight: 1.1 }}>
                      {user.name || 'Farmer Account'}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <MapPin size={10} color="var(--primary)" /> {user.district || 'Location Details'}
                    </div>
                  </div>
                  <ChevronDown size={14} color="var(--primary)" />
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    top: '110%',
                    width: '220px',
                    background: 'var(--card-bg)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                    zIndex: 1001,
                    overflow: 'hidden'
                  }}>
                    <button
                      onClick={() => { setShowProfileModal(true); setShowDropdown(false); }}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        textAlign: 'left',
                        borderBottom: '1px solid var(--border)'
                      }}
                    >
                      <User size={16} color="var(--primary)" />
                      <span>Profile & Location Details</span>
                    </button>

                    <button
                      onClick={() => { logout(); setShowDropdown(false); }}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        background: 'none',
                        border: 'none',
                        color: 'var(--error)',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <Link to="/login" className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '0.45rem 0.9rem' }}>
                <LogIn size={14} /> Sign In / Register
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Profile & Location Modal (Opens from top right corner click) */}
      {showProfileModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          backdropFilter: 'blur(4px)',
          padding: '1rem'
        }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '580px', background: 'var(--card-bg)', borderLeft: '5px solid var(--primary)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', paddingBottom: '0.8rem', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ background: 'var(--light-green)', padding: '0.5rem', borderRadius: '50%' }}>
                  <User size={22} color="var(--primary)" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Farmer Profile & Location Details 🧑‍🌾</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Update your personal info and farm location details</span>
                </div>
              </div>
              <button onClick={() => setShowProfileModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={20} />
              </button>
            </div>

            {saveSuccessMsg && (
              <div style={{ background: 'var(--light-green)', color: 'var(--primary-hover)', padding: '0.8rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', fontSize: '0.85rem' }}>
                <CheckCircle2 size={18} color="var(--primary)" />
                {saveSuccessMsg}
              </div>
            )}

            <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: 'var(--bg)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--primary)', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <User size={16} /> Personal Identification
                </h4>
                <div className="grid-2">
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>Full Name</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Ramesh Kumar"
                      value={profileForm.name}
                      onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>Mobile Phone Number</label>
                    <input
                      type="tel"
                      className="input-field"
                      placeholder="+91 9876543210"
                      value={profileForm.phone}
                      onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div style={{ marginTop: '0.8rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>Email Address</label>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="farmer@cropnova.com"
                    value={profileForm.email}
                    onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ background: 'var(--bg)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--primary)', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={16} /> Location & Regional Details (Updates Weather Telemetry)
                </h4>
                <div className="grid-2">
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>Village / Town</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Village Rampur"
                      value={profileForm.village}
                      onChange={e => setProfileForm({ ...profileForm, village: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>District / Region</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Karnal, Ludhiana, Jaipur"
                      value={profileForm.district}
                      onChange={e => setProfileForm({ ...profileForm, district: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid-2" style={{ marginTop: '0.8rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>State</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Haryana, Punjab, Rajasthan"
                      value={profileForm.state}
                      onChange={e => setProfileForm({ ...profileForm, state: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>Pincode</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. 132001"
                      value={profileForm.pincode}
                      onChange={e => setProfileForm({ ...profileForm, pincode: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowProfileModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1.4rem' }}>
                  <Save size={16} /> Approve & Update Profile Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
