import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Phone, Mail, Lock, User, ArrowRight } from 'lucide-react';

export const AuthPages = () => {
  const { login, registerUser } = useAuth();
  const navigate = useNavigate();
  const [isLoginMode, setIsLoginMode] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('farmer');
  const [errorMsg, setErrorMsg] = useState('');

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (isLoginMode) {
      const success = await login(email, password);
      if (success) {
        navigate('/');
      } else {
        setErrorMsg('Invalid login credentials or server connection failed.');
      }
    } else {
      const res = await registerUser({ name, email, password, phone, role });
      if (res && res.success) {
        navigate('/');
      } else {
        setErrorMsg(res?.error || 'Registration failed. Check if user already exists or server is running.');
      }
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '1rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: '480px', padding: '2.5rem' }}>
        <>
          <>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.8rem', color: 'var(--primary)' }}>
                {isLoginMode ? 'Welcome Back to CropNova 🌾' : 'Create Your CropNova Account 🚀'}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.3rem' }}>
                {isLoginMode ? 'Sign in to access your role-based dashboard' : 'Join thousands of farmers, agronomists & vendors'}
              </p>
            </div>

            {errorMsg && (
              <div style={{ background: '#FFEBEE', color: 'var(--error)', padding: '0.8rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center' }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {!isLoginMode && (
                <>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Select Account Role</label>
                    <select className="input-field" value={role} onChange={e => setRole(e.target.value)}>
                      <option value="farmer">Farmer (Farm, Crop, Weather, Irrigation)</option>
                      <option value="expert">Agri Expert (Consultation & Soil Advice)</option>
                      <option value="vendor">Vendor (Marketplace Inventory & Orders)</option>
                      <option value="admin">System Administrator (Full Management)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Full Name</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Ramesh Kumar"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                    />
                  </div>

                  {role !== 'admin' && (
                    <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Mobile Number</label>
                      <input
                        type="tel"
                        className="input-field"
                        placeholder="+91 9876543210"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        required
                      />
                    </div>
                  )}
                </>
              )}

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Email Address</label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="name@cropnova.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Password</label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', padding: '0.8rem' }}>
                {isLoginMode ? 'Sign In to Account' : role === 'admin' ? 'Create Admin Account' : 'Create Account'} <ArrowRight size={18} />
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {isLoginMode ? "Don't have an account? " : "Already registered? "}
              <button
                type="button"
                onClick={() => { setIsLoginMode(!isLoginMode); setErrorMsg(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}
              >
                {isLoginMode ? 'Sign Up Now' : 'Log In Here'}
              </button>
            </div>
        </>
      </div>
    </div>
  );
};
