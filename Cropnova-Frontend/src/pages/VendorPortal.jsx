import React, { useEffect, useState } from 'react';
import { ShoppingBag, Package, Truck, CheckCircle2, Plus } from 'lucide-react';

export const VendorPortal = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch('/api/vendor/inventory')
      .then(res => res.json())
      .then(d => setProducts(d))
      .catch(() => {
        setProducts([
          { id: 501, title: 'Bio-Organic NPK Fertilizer (50kg)', category: 'Fertilizers', price: 850, stockQuantity: 140 },
          { id: 502, title: 'Hybrid HD-2967 Certified Wheat Seeds (20kg)', category: 'Seeds', price: 1200, stockQuantity: 95 }
        ]);
      });

    setOrders([
      { id: 601, buyerName: 'Rajesh Farmer', productTitle: 'Bio-Organic NPK Fertilizer (50kg)', quantity: 4, totalPrice: 3400, status: 'Shipped', date: '2026-08-20' }
    ]);
  }, []);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Vendor Inventory & Order Management Portal 📦</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Manage agricultural seed & fertilizer inventory, update product listings, and fulfill customer orders.</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={18} /> Add New Product Listing
        </button>
      </div>

      <div className="grid-2">
        {/* Inventory Management Table */}
        <div className="card">
          <h3>Current Product Stock</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'var(--light-green)', textTransform: 'uppercase', fontSize: '0.75rem', color: 'var(--primary)' }}>
                <th style={{ padding: '0.8rem', textAlign: 'left' }}>Item Title</th>
                <th style={{ padding: '0.8rem', textAlign: 'left' }}>Category</th>
                <th style={{ padding: '0.8rem', textAlign: 'left' }}>Price</th>
                <th style={{ padding: '0.8rem', textAlign: 'right' }}>Stock Left</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.8rem', fontWeight: '600' }}>{p.title}</td>
                  <td style={{ padding: '0.8rem' }}><span className="badge badge-primary">{p.category}</span></td>
                  <td style={{ padding: '0.8rem', fontWeight: '700' }}>₹{p.price}</td>
                  <td style={{ padding: '0.8rem', textAlign: 'right', fontWeight: '800', color: p.stockQuantity < 50 ? 'var(--warning)' : 'var(--primary)' }}>
                    {p.stockQuantity || 100} units
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Incoming Customer Orders */}
        <div className="card">
          <h3>Customer Orders & Fulfillment</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1rem' }}>
            {orders.map(ord => (
              <div key={ord.id} style={{ padding: '0.8rem', background: 'var(--bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '700' }}>Order #{ord.id} • {ord.buyerName}</span>
                  <span className="badge badge-success">{ord.status}</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.4rem 0' }}>
                  Item: {ord.productTitle} (Qty: {ord.quantity})
                </div>
                <div style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '0.95rem' }}>
                  Total: ₹{ord.totalPrice}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
