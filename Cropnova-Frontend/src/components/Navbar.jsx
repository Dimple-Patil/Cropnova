import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sprout, Sun, Moon, Bell, LogIn, LogOut } from 'lucide-react';

export const Navbar = () => {
  const { user, theme, toggleTheme, logout } = useAuth();

  return (
    <nav style={{
      background: 'var(--card-bg)',
      borderBottom: '1px solid var(--glass-border)',
      padding: '0.8rem 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      {/* Brand Logo */}
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff'
        }}>
          <Sprout size={24} />
        </div>
        <div>
          <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>Crop</span>
          <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--accent)', fontFamily: 'var(--font-heading)' }}>Nova</span>
          <span style={{ fontSize: '0.7rem', display: 'block', color: 'var(--text-secondary)', marginTop: '-4px', fontWeight: '600' }}>SMART AGRI PLATFORM</span>
        </div>
      </Link>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
        <button onClick={toggleTheme} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', borderRadius: '50px' }}>
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {user ? (
          <>
            <Link to="/notifications" style={{ position: 'relative', color: 'var(--text-primary)', textDecoration: 'none' }}>
              <Bell size={22} />
              <span style={{
                position: 'absolute', top: '-4px', right: '-4px', background: 'var(--error)', color: '#fff', fontSize: '0.65rem', fontWeight: 'bold', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>2</span>
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: '700' }}>{user.name}</div>
                <span className="badge badge-primary" style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>{user.role}</span>
              </div>
              <button onClick={logout} className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem' }} title="Logout">
                <LogOut size={16} />
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <Link to="/login" className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
              <LogIn size={14} /> Login / Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};
