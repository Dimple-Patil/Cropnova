import React, { useState } from 'react';
import { Upload, Bug, AlertTriangle, ShieldCheck } from 'lucide-react';
import { api } from '../utils/api';

export const DiseaseDetection = () => {
  const [image, setImage] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [imageData, setImageData] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      const reader = new FileReader();
      reader.onload = () => {
        const source = new Image();
        source.onload = () => {
          const maxSize = 1200;
          const scale = Math.min(1, maxSize / Math.max(source.width, source.height));
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(source.width * scale));
          canvas.height = Math.max(1, Math.round(source.height * scale));
          canvas.getContext('2d').drawImage(source, 0, 0, canvas.width, canvas.height);
          setImageData(canvas.toDataURL('image/jpeg', 0.76));
        };
        source.src = reader.result;
      };
      reader.readAsDataURL(file);
      setResult(null);
    }
  };

  const handleScan = () => {
    setScanning(true);
    api.post('/disease/detect', { imageData }).then(res => setResult(res)).catch(error => setResult({ status: 'needs_review', name: 'Analysis unavailable', confidence: null, symptoms: error.message, organic: 'Consult an agriculture expert before treating the crop.', chemical: 'No chemical recommendation is available.' })).finally(() => setScanning(false));
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
              <button onClick={handleScan} className="btn btn-primary" style={{ marginTop: '1rem' }} disabled={scanning || !imageData}>
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
                <span className="badge badge-warning">{result.status === 'needs_review' ? 'Needs expert review' : 'Detected symptom'}</span>
                {result.confidence && <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary)' }}>{result.confidence}% Confidence</span>}
              </div>
              <h3 style={{ fontSize: '1.3rem', color: 'var(--error)', margin: '0.6rem 0' }}>{result.name}</h3>
              {result.symptoms && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{result.symptoms}</p>}

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
