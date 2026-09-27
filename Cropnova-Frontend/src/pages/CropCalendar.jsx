import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, Clock3, Droplets, FlaskConical, Bug, Wheat } from 'lucide-react';
import { api } from '../utils/api';

const TASK_TYPES = [
  { key: 'irrigation', label: 'Irrigation check', icon: Droplets, offset: 7 },
  { key: 'fertilizer', label: 'Fertilizer application', icon: FlaskConical, offset: 21 },
  { key: 'pest', label: 'Pest inspection', icon: Bug, offset: 28 },
  { key: 'harvest', label: 'Harvest preparation', icon: Wheat, offset: null }
];

const dateOnly = value => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const formatDate = value => value.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const buildTasks = crops => crops.flatMap(crop => {
  const sowing = dateOnly(crop.sowing_date);
  const harvest = dateOnly(crop.expected_harvest_date);
  if (!sowing) return [];

  const cropName = crop.crop_name || crop.cropName || 'Crop';
  return TASK_TYPES.map(type => {
    const dueDate = type.offset === null && harvest
      ? new Date(harvest.getTime() - 14 * 86400000)
      : new Date(sowing.getTime() + (type.offset || 7) * 86400000);
    return {
      id: `${crop.id}-${type.key}`,
      cropId: crop.id,
      cropName,
      field: crop.field_section || crop.farm_name || 'Farm field',
      type: type.key,
      label: type.label,
      icon: type.icon,
      dueDate
    };
  });
});

export const CropCalendar = () => {
  const [crops, setCrops] = useState([]);
  const [taskStates, setTaskStates] = useState({});

  useEffect(() => {
    api.get('/crops').then(data => setCrops(Array.isArray(data) ? data : [])).catch(() => setCrops([]));
  }, []);

  const tasks = useMemo(() => buildTasks(crops), [crops]);
  const today = dateOnly(new Date());

  const updateTask = (taskId, status) => {
    setTaskStates(previous => ({ ...previous, [taskId]: status }));
  };

  const visibleTasks = tasks
    .filter(task => taskStates[task.id] !== 'done' && taskStates[task.id] !== 'skipped')
    .sort((a, b) => a.dueDate - b.dueDate);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2>Smart Farming Calendar</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Crop-specific field tasks based on your saved sowing and harvest dates.</p>
      </div>

      <div className="grid-3">
        <div className="card" style={{ borderLeft: '4px solid var(--warning)' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: '700' }}>UPCOMING TASKS</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', marginTop: '0.4rem' }}>{visibleTasks.length}</div>
        </div>
        <div className="card" style={{ borderLeft: '4px solid var(--success)' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: '700' }}>COMPLETED</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', marginTop: '0.4rem' }}>{Object.values(taskStates).filter(status => status === 'done').length}</div>
        </div>
        <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: '700' }}>ACTIVE CROPS</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', marginTop: '0.4rem' }}>{crops.length}</div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
          <CalendarDays size={22} color="var(--primary)" />
          <h3 style={{ margin: 0 }}>Field Tasks</h3>
        </div>

        {crops.length === 0 && (
          <div style={{ padding: '1.5rem 0', color: 'var(--text-secondary)' }}>
            Add a crop with sowing and harvest dates to generate your farming calendar.
          </div>
        )}

        {crops.length > 0 && visibleTasks.length === 0 && (
          <div style={{ padding: '1.5rem 0', color: 'var(--text-secondary)' }}>
            No open tasks. Your field calendar is up to date.
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {visibleTasks.map(task => {
            const overdue = task.dueDate < today;
            const Icon = task.icon;
            return (
              <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.9rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', flexWrap: 'wrap' }}>
                <Icon size={22} color={overdue ? 'var(--error)' : 'var(--primary)'} />
                <div style={{ flex: 1, minWidth: '190px' }}>
                  <div style={{ fontWeight: '700' }}>{task.label}: {task.cropName}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{task.field} • Due {formatDate(task.dueDate)}</div>
                </div>
                <span className={`badge ${overdue ? 'badge-warning' : 'badge-primary'}`}>
                  {overdue ? 'Overdue' : 'Upcoming'}
                </span>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button type="button" className="btn btn-primary" style={{ padding: '0.4rem 0.65rem', fontSize: '0.78rem' }} onClick={() => updateTask(task.id, 'done')}>
                    <CheckCircle2 size={14} /> Done
                  </button>
                  <button type="button" className="btn btn-secondary" style={{ padding: '0.4rem 0.65rem', fontSize: '0.78rem' }} onClick={() => updateTask(task.id, 'later')}>
                    <Clock3 size={14} /> Remind later
                  </button>
                  <button type="button" className="btn btn-secondary" style={{ padding: '0.4rem 0.65rem', fontSize: '0.78rem' }} onClick={() => updateTask(task.id, 'skipped')}>
                    Skip
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CropCalendar;
