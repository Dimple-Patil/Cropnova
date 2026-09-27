import React, { useEffect, useState } from 'react';
import { Bell, CheckCircle, CalendarDays } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

const buildReminders = crops => crops.flatMap(crop => {
  const sowingValue = crop.sowing_date || crop.sowingDate;
  const parsedSowing = sowingValue ? new Date(sowingValue) : new Date();
  const sowing = Number.isNaN(parsedSowing.getTime()) ? new Date() : parsedSowing;
  const cropName = crop.crop_name || crop.cropName || 'Crop';
  return [['irrigation', 'Irrigation check', 7], ['fertilizer', 'Fertilizer application', 21], ['pest', 'Pest inspection', 28]].map(([type, label, offset]) => {
    const due = new Date(sowing.getTime() + offset * 86400000);
    return { id: `${crop.id}-${type}`, title: `${label}: ${cropName}`, message: `${label} is scheduled for ${cropName}. Open your Farming Calendar to update the task.`, date: due.toISOString().slice(0, 10), isRead: false };
  });
});

export const NotificationsPage = () => {
  const { user } = useAuth();
  const storageKey = `cropnova-notifications-${user?.id || 'guest'}`;
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const crops = await api.get('/crops');
        const calendarStates = JSON.parse(localStorage.getItem(`cropnova-calendar-${user?.id || 'guest'}`) || '{}');
        const generated = buildReminders(Array.isArray(crops) ? crops : [])
          .filter(alert => calendarStates[alert.id] !== 'done' && calendarStates[alert.id] !== 'skipped');
        const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
        setAlerts(generated.map(alert => ({ ...alert, ...(saved[alert.id] || {}) })).sort((a, b) => new Date(a.date) - new Date(b.date)));
      } catch {
        setAlerts([]);
      }
    };
    loadNotifications();
  }, [storageKey]);

  const saveAlerts = updated => {
    setAlerts(updated);
    localStorage.setItem(storageKey, JSON.stringify(Object.fromEntries(updated.map(alert => [alert.id, alert]))));
  };

  const markRead = id => saveAlerts(alerts.map(alert => alert.id === id ? { ...alert, isRead: true } : alert));
  const unreadCount = alerts.filter(alert => !alert.isRead).length;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div><h2>Notifications & Reminders</h2><p style={{ color: 'var(--text-secondary)' }}>Persistent crop-care reminders connected to your farming calendar.</p></div>
        {unreadCount > 0 && <button type="button" className="btn btn-secondary" onClick={() => saveAlerts(alerts.map(alert => ({ ...alert, isRead: true })))}><CheckCircle size={16} /> Mark all read</button>}
      </div>
      {alerts.length === 0 ? <div className="card" style={{ color: 'var(--text-secondary)' }}>Add a crop with a sowing date to receive persistent farming reminders.</div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {alerts.map(alert => <button key={alert.id} type="button" onClick={() => markRead(alert.id)} className="card" style={{ textAlign: 'left', border: 'none', borderLeft: alert.isRead ? '4px solid var(--border)' : '4px solid var(--primary)', background: alert.isRead ? 'var(--card-bg)' : 'var(--light-green)', cursor: alert.isRead ? 'default' : 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}><div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>{alert.title.includes('Irrigation') ? <Bell size={20} color="var(--primary)" /> : <CalendarDays size={20} color="var(--primary)" />}<h3 style={{ fontSize: '1rem', margin: 0 }}>{alert.title}</h3></div><span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{alert.date}</span></div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.6rem 0 0' }}>{alert.message}</p>
          </button>)}
        </div>
      )}
    </div>
  );
};
