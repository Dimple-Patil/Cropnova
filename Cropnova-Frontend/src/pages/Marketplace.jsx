import React, { useEffect, useState } from 'react';
import { ShoppingBag, Tag, Star, ShoppingCart, Filter, Search } from 'lucide-react';

export const Marketplace = () => {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('All');
  const [cart, setCart] = useState([]);

  useEffect(() => {
    fetch('/api/marketplace/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(() => {
        setProducts([
          { id: 501, title: 'Bio-Organic NPK Fertilizer (50kg)', category: 'Fertilizers', price: 850, unit: 'bag', rating: 4.8, description: '100% natural organic compost enriched with nitrogen fixing bacteria.' },
          { id: 502, title: 'Hybrid HD-2967 Certified Wheat Seeds (20kg)', category: 'Seeds', price: 1200, unit: 'bag', rating: 4.9, description: 'High disease resistance, high grain yield seed variety.' },
          { id: 503, title: 'Solar Powered Drip Controller & Sensor Kit', category: 'Equipment', price: 4500, unit: 'set', rating: 4.7, description: 'Automatic smart moisture-triggered water valve with mobile app alert.' },
          { id: 504, title: 'Organic Neem Oil Pesticide Concentrate (1L)', category: 'Pesticides', price: 420, unit: 'bottle', rating: 4.6, description: 'Cold-pressed pure neem oil extract for caterpillar & aphid protection.' }
        ]);
      });
  }, []);

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  const filtered = category === 'All' ? products : products.filter(p => p.category === category);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header & Cart Summary */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Agricultural Marketplace & Equipment Store 🛒</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Buy verified seeds, bio-fertilizers, solar irrigation controllers & sell farm produce directly.</p>
        </div>

        <div className="card" style={{ padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <ShoppingCart size={20} color="var(--primary)" />
          <span style={{ fontWeight: '700' }}>Cart: {cart.length} Items</span>
          <span style={{ color: 'var(--primary)', fontWeight: '800' }}>₹{cart.reduce((a, c) => a + c.price, 0)}</span>
        </div>
      </div>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: '0.8rem', overflowX: 'auto', paddingBottom: '0.4rem' }}>
        {['All', 'Seeds', 'Fertilizers', 'Equipment', 'Pesticides'].map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`btn ${category === cat ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '30px', padding: '0.4rem 1.2rem' }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Cards Grid */}
      <div className="grid-3">
        {filtered.map(product => (
          <div key={product.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className="badge badge-primary">{product.category}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.85rem', fontWeight: '700', color: 'var(--accent)' }}>
                  <Star size={14} fill="var(--accent)" /> {product.rating || '4.8'}
                </div>
              </div>

              <h3 style={{ fontSize: '1.1rem', margin: '0.6rem 0 0.3rem' }}>{product.title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{product.description}</p>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0.8rem 0' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--primary)' }}>
                  ₹{product.price} <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>/ {product.unit}</span>
                </div>
              </div>

              <button onClick={() => addToCart(product)} className="btn btn-primary" style={{ width: '100%' }}>
                <ShoppingCart size={16} /> Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
