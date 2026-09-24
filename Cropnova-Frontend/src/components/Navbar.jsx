import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sprout, Sun, Moon, Bell, LogIn, LogOut,
  LayoutDashboard, TestTube2, DollarSign, Wallet, Wheat, Building2, UserCog, ShoppingCart,
  User, MapPin, ChevronDown, Menu, X
} from 'lucide-react';

export const Navbar = () => {
  const { user, updateUserProfile, theme, toggleTheme, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        <div className="desktop-nav" style={{
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
          
          <button onClick={() => setIsMobileMenuOpen(true)} className="mobile-menu-btn btn btn-secondary" style={{ padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-sm)' }} title="Open Menu">
            <Menu size={20} />
          </button>

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
                      onClick={() => { navigate('/profile'); setShowDropdown(false); }}
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

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <>
          <div 
            onClick={() => setIsMobileMenuOpen(false)} 
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1999 }} 
          />
          <div style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            width: '260px',
            background: 'var(--card-bg)',
            backdropFilter: 'blur(12px)',
            borderLeft: '1px solid var(--glass-border)',
            zIndex: 2000,
            padding: '1.5rem',
            boxShadow: '-5px 0 25px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }} className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: 'var(--primary)' }}>Menu</h3>
              <button onClick={() => setIsMobileMenuOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {navItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={index}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.8rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      textDecoration: 'none',
                      fontSize: '0.95rem',
                      fontWeight: isActive ? '700' : '500',
                      color: isActive ? '#FFFFFF' : 'var(--text-primary)',
                      background: isActive ? 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' : 'var(--bg)',
                      transition: 'all 0.2s ease',
                    })}
                  >
                    <Icon size={18} />
                    <span>{item.title}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        </>
      )}

    </>
  );
};
