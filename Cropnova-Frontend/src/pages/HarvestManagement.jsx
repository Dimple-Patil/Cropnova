import React, { useState, useEffect } from 'react';
import { Wheat, Warehouse, Calendar, CheckCircle2, TrendingUp, Plus, Trash2 } from 'lucide-react';
import { api } from '../utils/api';

export const HarvestManagement = () => {
  const [harvests, setHarvests] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newHarvest, setNewHarvest] = useState({
    crop: '', yieldQuintals: '', acreArea: '', storageLocation: '', status: 'Stored', date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    // For now we don't have a specific harvests table in PG, we just use crops status='Harvested'.
    // Or we could mock it using API. Since we don't have the table, we'll keep it simple:
    api.get('/crops').then(data => {
      const harvested = data.filter(c => c.status === 'Harvested').map(c => ({
        id: c.id, crop: c.crop_name, yieldQuintals: 15, acreArea: 1, storageLocation: 'Warehouse', status: 'Stored', date: c.expected_harvest_date ? c.expected_harvest_date.split('T')[0] : '2026-08-20'
      }));
      setHarvests(harvested);
    }).catch(e => console.error(e));
  }, []);

  const handleAdd = (e) => {
    e.preventDefault();
    // Since we don't have a dedicated harvest table in schema, we mock add in UI for demo
    setHarvests(prev => [{ id: Date.now(), ...newHarvest }, ...prev]);
    setShowModal(false);
    setNewHarvest({ crop: '', yieldQuintals: '', acreArea: '', storageLocation: '', status: 'Stored', date: new Date().toISOString().split('T')[0] });
  };

  const handleDelete = (id) => setHarvests(prev => prev.filter(h => h.id !== id));

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Harvest Records & Yield Analytics 🌾</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Log harvest yields, quintal-per-acre performance, and storage locations.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={18} /> Log Harvest
        </button>
      </div>

      {harvests.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Wheat size={52} color="var(--primary)" style={{ marginBottom: '1rem' }} />
          <h3>No Harvest Records Yet</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.2rem' }}>Click "Log Harvest" to record your crop yield and storage details.</p>
          <button onClick={() => setShowModal(true)} className="btn btn-primary"><Plus size={16} /> Log First Harvest</button>
        </div>
      ) : (
        <div className="grid-2">
          {harvests.map(item => (
            <div key={item.id} className="card" style={{ borderLeft: '4px solid var(--primary)', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ color: 'var(--primary)' }}>{item.crop}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className={`badge ${item.status === 'Stored' ? 'badge-warning' : 'badge-success'}`}>{item.status}</span>
                  <button onClick={() => handleDelete(item.id)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}><Trash2 size={15} /></button>
                </div>
              </div>

              <div className="grid-2" style={{ background: 'var(--light-green)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--primary)' }}>TOTAL YIELD</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--primary)' }}>{item.yieldQuintals} <span style={{ fontSize: '0.8rem' }}>Quintals</span></div>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--primary)' }}>PRODUCTIVITY</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--primary)' }}>{(Number(item.yieldQuintals) / Number(item.acreArea)).toFixed(1)} <span style={{ fontSize: '0.8rem' }}>Q/Acre</span></div>
                </div>
              </div>

              <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)' }}>
                <strong>Storage:</strong> {item.storageLocation} &nbsp;|&nbsp; <strong>Date:</strong> {item.date}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Harvest Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div className="card" style={{ width: '460px', background: 'var(--bg)' }}>
            <h3>Log Harvest Record</h3>
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Crop Name *</label>
                <input type="text" className="input-field" placeholder="e.g. Wheat, Mustard" value={newHarvest.crop} onChange={e => setNewHarvest({ ...newHarvest, crop: e.target.value })} required />
              </div>
              <div className="grid-2">
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Yield (Quintals) *</label>
                  <input type="number" className="input-field" placeholder="e.g. 55" step="0.1" min="0" value={newHarvest.yieldQuintals} onChange={e => setNewHarvest({ ...newHarvest, yieldQuintals: e.target.value })} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Area (Acres) *</label>
                  <input type="number" className="input-field" placeholder="e.g. 2.5" step="0.1" min="0" value={newHarvest.acreArea} onChange={e => setNewHarvest({ ...newHarvest, acreArea: e.target.value })} required />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Storage Location</label>
                <input type="text" className="input-field" placeholder="e.g. Home Storage, Mandi Warehouse" value={newHarvest.storageLocation} onChange={e => setNewHarvest({ ...newHarvest, storageLocation: e.target.value })} />
              </div>
              <div className="grid-2">
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Status</label>
                  <select className="input-field" value={newHarvest.status} onChange={e => setNewHarvest({ ...newHarvest, status: e.target.value })}>
                    <option>Stored</option>
                    <option>Sold</option>
                    <option>Processing</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Harvest Date *</label>
                  <input type="date" className="input-field" value={newHarvest.date} onChange={e => setNewHarvest({ ...newHarvest, date: e.target.value })} required />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Harvest</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
