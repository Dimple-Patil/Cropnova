import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Sprout, TestTube2,
  Bug, Droplet, DollarSign, ShoppingCart, MessageSquare,
  Building2, Newspaper, Wallet, Wheat, ShieldAlert, BarChart3, UserCog, LogIn, Lock
} from 'lucide-react';

export const Sidebar = () => {
  const { user } = useAuth();

  // If user is not logged in, show Guest navigation menu
  if (!user) {
    return (
      <aside style={{
        width: '260px',
        background: 'var(--card-bg)',
        borderRight: '1px solid var(--glass-border)',
        padding: '1.5rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.4rem',
        height: 'calc(100vh - 70px)',
        position: 'sticky',
        top: '70px'
      }}>
        <div style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-secondary)', padding: '0 0.8rem 0.5rem' }}>
          Public Features
        </div>

        <NavLink to="/" style={({ isActive }) => ({
          display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: isActive ? '700' : '500', color: isActive ? '#FFF' : 'var(--text-primary)', background: isActive ? 'var(--primary)' : 'transparent'
        })}>
          <LayoutDashboard size={18} />
          <span>Home / About</span>
        </NavLink>

        <div style={{ marginTop: '1.5rem', background: 'var(--light-green)', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
          <Lock size={28} color="var(--primary)" style={{ marginBottom: '0.5rem' }} />
          <h4 style={{ fontSize: '0.9rem', color: 'var(--primary)' }}>Role-Based Access</h4>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.4rem 0 0.8rem' }}>
            Sign in or create an account to unlock your Farmer, Expert, Vendor, or Admin portal.
          </p>
          <NavLink to="/login" className="btn btn-primary" style={{ width: '100%', fontSize: '0.85rem' }}>
            <LogIn size={14} /> Sign In / Sign Up
          </NavLink>
        </div>
      </aside>
    );
  }

  // Strict Role-based access control navigation schema (AI Disease Detection moved to AI Chatbot)
  const navItems = [
    { title: 'Farmer Dashboard', path: '/', icon: LayoutDashboard, roles: ['farmer'] },
    { title: 'Expert Dashboard', path: '/', icon: LayoutDashboard, roles: ['expert'] },
    { title: 'Vendor Dashboard', path: '/', icon: LayoutDashboard, roles: ['vendor'] },
    { title: 'Admin Master Panel', path: '/admin', icon: UserCog, roles: ['admin'] },
    
    // Farmer-only and Farmer+Expert routes
    { title: 'Crop Management', path: '/crops', icon: Sprout, roles: ['farmer'] },
    { title: 'Soil Analysis & Health', path: '/soil', icon: TestTube2, roles: ['farmer', 'expert'] },
    { title: 'Fertilizer Calculator', path: '/fertilizers', icon: DollarSign, roles: ['farmer', 'expert'] },
    { title: 'Farm Expenses & Income', path: '/finance', icon: Wallet, roles: ['farmer'] },
    { title: 'Harvest Management', path: '/harvest', icon: Wheat, roles: ['farmer'] },

    // Vendor-specific routes
    { title: 'Agri Marketplace', path: '/marketplace', icon: ShoppingCart, roles: ['farmer', 'vendor'] },
    { title: 'Vendor Inventory & Sales', path: '/vendor', icon: ShoppingCart, roles: ['vendor'] },

    // Shared routes
    { title: 'Expert Consultation Board', path: '/expert', icon: MessageSquare, roles: ['farmer', 'expert'] },
    { title: 'Government Schemes', path: '/schemes', icon: Building2, roles: ['farmer', 'expert'] },
    { title: 'News & Agri Updates', path: '/news', icon: Newspaper, roles: ['farmer', 'expert', 'vendor'] },
    { title: 'Alerts & Reminders', path: '/notifications', icon: ShieldAlert, roles: ['farmer', 'expert', 'vendor'] },
    { title: 'Reports & Analytics', path: '/reports', icon: BarChart3, roles: ['farmer'] }
  ];

  const filteredItems = navItems.filter(item => item.roles.includes(user.role));

  return (
    <aside style={{
      width: '260px',
      background: 'var(--card-bg)',
      borderRight: '1px solid var(--glass-border)',
      padding: '1.5rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.4rem',
      height: 'calc(100vh - 70px)',
      position: 'sticky',
      top: '70px',
      overflowY: 'auto'
    }}>
      <div style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-secondary)', padding: '0 0.8rem 0.5rem' }}>
        {user.role} Portal Menu ({filteredItems.length})
      </div>

      {filteredItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={index}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: isActive ? '700' : '500',
              color: isActive ? '#FFFFFF' : 'var(--text-primary)',
              background: isActive ? 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' : 'transparent',
              transition: 'all 0.2s ease'
            })}
          >
            <Icon size={18} />
            <span>{item.title}</span>
          </NavLink>
        );
      })}
    </aside>
  );
};
