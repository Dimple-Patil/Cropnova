import React, { useEffect, useState } from 'react';
import { Bell, ShieldAlert, CloudRain, Droplet, CheckCircle } from 'lucide-react';

export const NotificationsPage = () => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetch('/api/notifications')
      .then(res => res.json())
      .then(d => setAlerts(d))
      .catch(() => {
        setAlerts([
          { id: 1, title: 'Extreme Weather Advisory', message: 'Heavy rainfall predicted in 48 hours across your regional agricultural sector. Secure harvested crop stock and clear field drainage channels.', isRead: false, date: '2026-09-02' },
          { id: 2, title: 'Smart Irrigation Reminder', message: 'East Block B Basmati paddy field irrigation scheduled for tomorrow at 06:00 AM.', isRead: true, date: '2026-09-01' },
          { id: 3, title: 'New Government Subsidy Announcement', message: 'Applications open for SMAM 50% Agricultural Machinery Subsidy program.', isRead: true, date: '2026-08-30' }
        ]);
      });
  }, []);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2>Notifications & Real-Time Alerts 🔔</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Automated weather advisories, pest outbreak warnings, irrigation reminders, and market updates.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {alerts.map(alert => (
          <div key={alert.id} className="card" style={{ borderLeft: alert.isRead ? '4px solid var(--border)' : '4px solid var(--primary)', background: alert.isRead ? 'var(--card-bg)' : 'var(--light-green)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <ShieldAlert size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '1.1rem' }}>{alert.title}</h3>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{alert.date}</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{alert.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
