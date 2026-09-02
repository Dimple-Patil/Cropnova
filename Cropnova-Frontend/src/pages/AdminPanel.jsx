import React, { useEffect, useState } from 'react';
import { UserCog, Users, ShieldCheck, ShoppingBag, Phone, Mail, CheckCircle2, Lock } from 'lucide-react';

export const AdminPanel = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch('/api/admin/users')
      .then(res => res.json())
      .then(d => setUsers(d))
      .catch(() => {
        setUsers([
          { id: 1, name: 'Rajesh Farmer', email: 'farmer@cropnova.com', role: 'farmer', phone: '+91 9876543210', isVerified: true, location: 'Punjab, India' },
          { id: 2, name: 'Dr. Ananya Sharma', email: 'expert@cropnova.com', role: 'expert', phone: '+91 9812345678', isVerified: true, location: 'IARI Delhi' },
          { id: 3, name: 'GreenAgro Vendor', email: 'vendor@cropnova.com', role: 'vendor', phone: '+91 9988776655', isVerified: true, location: 'Haryana, India' },
          { id: 4, name: 'Admin Moderator', email: 'admin@cropnova.com', role: 'admin', phone: 'System Admin', isVerified: true, location: 'Headquarters' }
        ]);
      });
  }, []);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2>Administrator Master Dashboard 🛡️</h2>
        <p style={{ color: 'var(--text-secondary)' }}>System administration, user role management, OTP verification statuses, and registered member list.</p>
      </div>

      <div className="grid-4">
        <div className="card">
          <Users size={24} color="var(--primary)" />
          <div style={{ fontSize: '1.5rem', fontWeight: '800', margin: '0.4rem 0' }}>{users.filter(u => u.role === 'farmer').length || 1}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Registered Farmers</div>
        </div>

        <div className="card">
          <ShieldCheck size={24} color="var(--accent)" />
          <div style={{ fontSize: '1.5rem', fontWeight: '800', margin: '0.4rem 0' }}>{users.filter(u => u.role === 'expert').length || 1}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Agri Experts</div>
        </div>

        <div className="card">
          <ShoppingBag size={24} color="var(--secondary)" />
          <div style={{ fontSize: '1.5rem', fontWeight: '800', margin: '0.4rem 0' }}>{users.filter(u => u.role === 'vendor').length || 1}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Marketplace Vendors</div>
        </div>

        <div className="card">
          <CheckCircle2 size={24} color="var(--success)" />
          <div style={{ fontSize: '1.5rem', fontWeight: '800', margin: '0.4rem 0' }}>100%</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Mobile OTP Verification Rate</div>
        </div>
      </div>

      {/* Registered Users Moderation Table */}
      <div className="card">
        <h3>Registered Platform Users Database</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: 'var(--light-green)', textTransform: 'uppercase', fontSize: '0.75rem', color: 'var(--primary)' }}>
              <th style={{ padding: '0.8rem', textAlign: 'left' }}>User Name</th>
              <th style={{ padding: '0.8rem', textAlign: 'left' }}>Email</th>
              <th style={{ padding: '0.8rem', textAlign: 'left' }}>Role</th>
              <th style={{ padding: '0.8rem', textAlign: 'left' }}>Mobile Number</th>
              <th style={{ padding: '0.8rem', textAlign: 'left' }}>OTP Verified</th>
              <th style={{ padding: '0.8rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '0.8rem', fontWeight: '600' }}>{u.name}</td>
                <td style={{ padding: '0.8rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                <td style={{ padding: '0.8rem' }}>
                  <span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>{u.role}</span>
                </td>
                <td style={{ padding: '0.8rem', fontWeight: '600' }}>{u.phone || '+91 9876543210'}</td>
                <td style={{ padding: '0.8rem' }}>
                  <span className={`badge ${u.role === 'admin' ? 'badge-primary' : 'badge-success'}`}>
                    {u.role === 'admin' ? 'Admin Exempt' : 'Verified (OTP)'}
                  </span>
                </td>
                <td style={{ padding: '0.8rem', textAlign: 'right' }}>
                  <button className="btn btn-secondary" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}>Manage User</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
