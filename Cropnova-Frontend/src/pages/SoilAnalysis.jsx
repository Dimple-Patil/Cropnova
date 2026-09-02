import React, { useState } from 'react';
import { Upload, TestTube2, Sparkles, FileText, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { usePersistedState } from '../hooks/usePersistedState';

export const SoilAnalysis = () => {
  const [reportFile, setReportFile]       = useState(null);
  const [analyzing, setAnalyzing]         = useState(false);
  const [soilHealthReport, setSoilHealthReport] = usePersistedState('soil_report', null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReportFile(file);
      setSoilHealthReport(null);
    }
  };

  const handleRunAnalysis = () => {
    if (!reportFile) return;
    setAnalyzing(true);

    // Simulate AI document OCR & Lab report parser
    setTimeout(() => {
      setSoilHealthReport({
        fileName: reportFile.name,
        labName: 'Govt District Soil Testing Lab',
        phLevel: 6.8,
        phStatus: 'Optimal (Slightly Acidic)',
        organicMatterPct: 0.65,
        nitrogenPpm: 230,
        nitrogenStatus: 'Medium Deficient',
        phosphorusPpm: 38,
        phosphorusStatus: 'Adequate',
        potassiumPpm: 190,
        potassiumStatus: 'Optimal',
        overallFertilityIndex: '84/100 (Good Quality)',
        aiAdvice: [
          'Apply 25 kg Neem-coated Urea per acre in 2 split doses to boost Nitrogen levels.',
          'Phosphorus and Potassium reserves are well balanced; DAP dosage can be reduced by 15%.',
          'Add 2 tons of decomposed Farmyard Manure (FYM) to enhance Organic Carbon %.'
        ]
      });
      setAnalyzing(false);
    }, 1200);
  };

  const chartData = soilHealthReport ? [
    { nutrient: 'Nitrogen (N)', level: soilHealthReport.nitrogenPpm, target: 280 },
    { nutrient: 'Phosphorus (P)', level: soilHealthReport.phosphorusPpm, target: 40 },
    { nutrient: 'Potassium (K)', level: soilHealthReport.potassiumPpm, target: 200 }
  ] : [];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2>Soil Report Scanner & Health Analyzer 🧪</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Upload your lab soil testing report (PDF or Image) to automatically generate NPK charts, pH health scores, and fertilizer advice.</p>
      </div>

      <div className="grid-2">
        {/* Document Upload Card */}
        <div className="card" style={{ border: '2px dashed var(--glass-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '320px', textAlign: 'center' }}>
          {reportFile ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem' }}>
              <FileText size={54} color="var(--primary)" />
              <div style={{ fontWeight: '700', fontSize: '1.05rem' }}>{reportFile.name}</div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {(reportFile.size / 1024).toFixed(1)} KB • Ready for Analysis
              </span>
              <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.8rem' }}>
                <label className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                  Change File
                  <input type="file" accept=".pdf,image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                </label>
                <button onClick={handleRunAnalysis} className="btn btn-primary" disabled={analyzing} style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem' }}>
                  <Sparkles size={16} /> {analyzing ? 'Scanning Lab Metrics...' : 'Generate Soil Health Report'}
                </button>
              </div>
            </div>
          ) : (
            <label style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Upload size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
              <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>Upload Soil Lab Testing Report</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
                Drop PDF report or photo of Soil Health Card (Max 15MB)
              </span>
              <input type="file" accept=".pdf,image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
            </label>
          )}
        </div>

        {/* Informational Guidance or Quick Info */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Why Upload Your Soil Test Report?</h3>
            <ul style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.6rem', paddingLeft: '1.2rem' }}>
              <li>Extracts exact Nitrogen (N), Phosphorus (P), and Potassium (K) PPM values.</li>
              <li>Calculates Soil Organic Carbon % and pH alkalinity/acidity index.</li>
              <li>Prevents over-fertilization and saves input costs on unnecessary DAP/Urea bags.</li>
              <li>Provides tailored bio-fertilizer and compost dosage schedules.</li>
            </ul>
          </div>
          <div style={{ background: 'var(--light-green)', padding: '0.8rem', borderRadius: 'var(--radius-md)', marginTop: '1rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--primary)' }}>💡 Don't have a soil lab report yet?</span>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
              Check your dashboard to view nearby certified District & KVK Soil Testing Laboratories!
            </p>
          </div>
        </div>
      </div>

      {/* Generated Soil Health Analytics Results */}
      {soilHealthReport && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="badge badge-success">Lab Report Processed Successfully</span>
                <h3 style={{ marginTop: '0.4rem', color: 'var(--primary)' }}>Parsed Report: {soilHealthReport.fileName}</h3>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>SOIL FERTILITY SCORE</span>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)' }}>{soilHealthReport.overallFertilityIndex}</div>
              </div>
            </div>

            <div className="grid-3" style={{ marginTop: '1.2rem' }}>
              <div style={{ background: 'var(--light-green)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)' }}>SOIL pH LEVEL</span>
                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--primary)' }}>{soilHealthReport.phLevel}</div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{soilHealthReport.phStatus}</span>
              </div>

              <div style={{ background: '#FFF8E1', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--warning)' }}>ORGANIC CARBON</span>
                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--warning)' }}>{soilHealthReport.organicMatterPct}%</div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Needs FYM Addition</span>
              </div>

              <div style={{ background: 'var(--bg)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700' }}>NITROGEN (N) STATUS</span>
                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--error)' }}>{soilHealthReport.nitrogenPpm} <span style={{ fontSize: '0.8rem' }}>PPM</span></div>
                <span style={{ fontSize: '0.75rem', color: 'var(--error)' }}>{soilHealthReport.nitrogenStatus}</span>
              </div>
            </div>
          </div>

          <div className="grid-2">
            {/* Parsed NPK Bar Chart */}
            <div className="card">
              <h3>Parsed NPK Nutrient Levels vs Optimal Target (PPM)</h3>
              <div style={{ width: '100%', height: 250, marginTop: '1rem' }}>
                <ResponsiveContainer>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="nutrient" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="level" fill="var(--primary)" name="Extracted Level" />
                    <Bar dataKey="target" fill="var(--accent)" name="Ideal Target" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Generated AI Agronomist Action Items */}
            <div className="card" style={{ borderLeft: '4px solid var(--accent)' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', marginBottom: '1rem' }}>
                <Sparkles size={20} color="var(--accent)" /> AI Soil Improvement Recommendations
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {soilHealthReport.aiAdvice.map((advice, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', background: 'var(--bg)', padding: '0.8rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <CheckCircle2 size={18} color="var(--primary)" style={{ shrink: 0, marginTop: '2px' }} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: '1.4' }}>{advice}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
