import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sprout, Sun, Moon, Bell, LogIn, LogOut,
  LayoutDashboard, TestTube2, DollarSign, Wallet, Wheat, Building2, Newspaper, UserCog, ShoppingCart
} from 'lucide-react';

export const Navbar = () => {
  const { user, theme, toggleTheme, logout } = useAuth();

  // Role-based horizontal navbar items
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
        { title: 'Govt Schemes', path: '/schemes', icon: Building2 },
        { title: 'News', path: '/news', icon: Newspaper }
      );
    } else if (user.role === 'expert') {
      items.push(
        { title: 'Dashboard', path: '/', icon: LayoutDashboard },
        { title: 'Soil Health', path: '/soil', icon: TestTube2 },
        { title: 'Fertilizers', path: '/fertilizers', icon: DollarSign },
        { title: 'Govt Schemes', path: '/schemes', icon: Building2 },
        { title: 'News', path: '/news', icon: Newspaper }
      );
    } else if (user.role === 'vendor') {
      items.push(
        { title: 'Dashboard', path: '/', icon: LayoutDashboard },
        { title: 'Inventory & Sales', path: '/vendor', icon: ShoppingCart },
        { title: 'News', path: '/news', icon: Newspaper }
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
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.6rem', shrink: 0 }}>
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', shrink: 0 }}>
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: '700', lineHeight: 1.1 }}>{user.name}</div>
                <span className="badge badge-primary" style={{ fontSize: '0.6rem', textTransform: 'uppercase' }}>{user.role}</span>
              </div>
              <button onClick={logout} className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem' }} title="Logout">
                <LogOut size={15} />
              </button>
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
  );
};
