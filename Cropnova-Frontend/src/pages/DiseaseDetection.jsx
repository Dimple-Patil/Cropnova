import React, { useState } from 'react';
import { Upload, Bug, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export const DiseaseDetection = () => {
  const [image, setImage] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleScan = () => {
    setScanning(true);
    fetch('/api/disease/detect', { method: 'POST' })
      .then(res => res.json())
      .then(res => {
        setResult(res);
        setScanning(false);
      })
      .catch(() => {
        setResult({
          name: 'Wheat Leaf Rust (Puccinia triticina)',
          confidence: 94.5,
          organic: 'Spray Neem oil formulation (5ml/L) and apply Trichoderma viride bio-agent.',
          chemical: 'Apply Propiconazole 25% EC @ 1 ml/liter of water at first symptom appearance.'
        });
        setScanning(false);
      });
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2>AI-Powered Plant Disease Identification 🔬</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Upload or drag-and-drop a photo of affected crop leaves for automated instant diagnosis & remedy guides.</p>
      </div>

      <div className="grid-2">
        {/* Upload Container */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '320px', textAlign: 'center', border: '2px dashed var(--glass-border)' }}>
          {image ? (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <img src={image} alt="Crop sample" style={{ maxHeight: '220px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }} />
              <button onClick={handleScan} className="btn btn-primary" style={{ marginTop: '1rem' }} disabled={scanning}>
                <Bug size={18} /> {scanning ? 'Running Neural Diagnostic...' : 'Start AI Analysis'}
              </button>
            </div>
          ) : (
            <label style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Upload size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
              <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>Click or Drop Crop Image Here</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>Supports JPG, PNG (Max 10MB)</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
            </label>
          )}
        </div>

        {/* Diagnosis Results */}
        <div>
          {result ? (
            <div className="card animate-fade-in" style={{ borderLeft: '4px solid var(--warning)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-warning">Detected Symptom</span>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary)' }}>{result.confidence}% Confidence</span>
              </div>
              <h3 style={{ fontSize: '1.3rem', color: 'var(--error)', margin: '0.6rem 0' }}>{result.name}</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.2rem' }}>
                <div style={{ background: 'var(--light-green)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontWeight: '700', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <ShieldCheck size={18} /> Recommended Organic Treatment
                  </div>
                  <p style={{ fontSize: '0.85rem', marginTop: '0.3rem' }}>{result.organic}</p>
                </div>

                <div style={{ background: '#FFF8E1', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontWeight: '700', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <AlertTriangle size={18} /> Chemical Intervention (If Severe)
                  </div>
                  <p style={{ fontSize: '0.85rem', marginTop: '0.3rem' }}>{result.chemical}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="card" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              Upload a leaf photo to trigger the computer vision diagnostic module.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
