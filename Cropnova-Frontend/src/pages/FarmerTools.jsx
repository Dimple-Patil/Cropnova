import React from 'react';
import { Link } from 'react-router-dom';
import { Calculator, CalendarDays, CloudSun, Droplet, IndianRupee, Sprout, TestTube2 } from 'lucide-react';

const tools = [
  ['Crop profit calculator', 'Estimate revenue, costs, and expected profit.', '/profitability', IndianRupee],
  ['Fertilizer calculator', 'Calculate fertilizer quantities for your crop area.', '/fertilizers', Calculator],
  ['Land area converter', 'Convert acres, hectares, bigha, guntha, and gaj.', '/profile', TestTube2],
  ['Crop calendar', 'Plan sowing and harvesting activities by season.', '/calendar', CalendarDays],
  ['Weather advisory', 'Review forecast information for farm decisions.', '/weather', CloudSun],
  ['Irrigation planner', 'Monitor irrigation needs and smart watering actions.', '/irrigation', Droplet],
  ['Crop recommendations', 'Get crop suggestions based on farm conditions.', '/recommendations', Sprout]
];

export const FarmerTools = () => <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
  <div><h2>Farmer Tools</h2><p style={{ color: 'var(--text-secondary)' }}>Practical planning tools connected to your CropNova farm data.</p></div>
  <div className="grid-3">{tools.map(([title, description, path, Icon]) => <Link key={title} to={path} className="card" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}><div style={{ width: 42, height: 42, borderRadius: '12px', background: 'var(--light-green)', color: 'var(--secondary)', display: 'grid', placeItems: 'center' }}><Icon size={21} /></div><h3 style={{ margin: 0 }}>{title}</h3><p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', margin: 0, flex: 1 }}>{description}</p><span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.82rem' }}>Open tool →</span></Link>)}</div>
</div>;

export default FarmerTools;
