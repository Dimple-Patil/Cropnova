import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Phone, Mail, Lock, User, KeyRound, ArrowRight } from 'lucide-react';

export const AuthPages = () => {
  const { login, registerUser, verifyOtp, pendingOtpUser } = useAuth();
  const navigate = useNavigate();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [step, setStep] = useState('auth'); // 'auth' or 'otp'

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('farmer');
  const [otpInput, setOtpInput] = useState('');
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
      // Validate phone number for non-admin roles
      if (role !== 'admin' && (!phone || phone.length < 10)) {
        setErrorMsg('Please provide a valid 10-digit mobile number for OTP verification.');
        return;
      }

      const res = await registerUser({ name, email, password, phone, role });
      if (res && res.success) {
        if (res.requiresOtp) {
          setStep('otp');
        } else {
          navigate('/');
        }
      } else {
        setErrorMsg(res?.error || 'Registration failed. Check if user already exists or server is running.');
      }
    }
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    const verified = verifyOtp(otpInput);
    if (verified) {
      navigate('/');
    } else {
      setErrorMsg('Invalid OTP code. Try entering default OTP: 123456');
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '1rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: '480px', padding: '2.5rem' }}>
        {step === 'auth' ? (
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
                      <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Mobile Number (For Mobile OTP Verification)</label>
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
                {isLoginMode ? 'Sign In to Account' : role === 'admin' ? 'Create Admin Account' : 'Send Mobile OTP Verification'} <ArrowRight size={18} />
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
        ) : (
          /* OTP Verification Step */
          <div className="animate-fade-in" style={{ textAlign: 'center' }}>
            <KeyRound size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
            <h2 style={{ color: 'var(--primary)' }}>Mobile OTP Verification 📱</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.5rem 0 1.5rem' }}>
              Enter the 6-digit OTP code sent to your mobile number <strong>{pendingOtpUser?.phone}</strong>.
            </p>

            <div style={{ background: 'var(--light-green)', padding: '0.6rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--primary)', marginBottom: '1rem', fontWeight: '600' }}>
              💡 Demo OTP: Enter <strong>123456</strong>
            </div>

            {errorMsg && (
              <div style={{ background: '#FFEBEE', color: 'var(--error)', padding: '0.6rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleOtpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input
                type="text"
                maxLength="6"
                className="input-field"
                style={{ textAlign: 'center', fontSize: '1.6rem', letterSpacing: '8px', fontWeight: '800' }}
                placeholder="123456"
                value={otpInput}
                onChange={e => setOtpInput(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem' }}>
                Verify OTP & Access Account
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
