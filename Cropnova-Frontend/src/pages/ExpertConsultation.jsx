import React, { useEffect, useState } from 'react';
import { MessageSquare, UserCheck, Send, CheckCircle2 } from 'lucide-react';

export const ExpertConsultation = () => {
  const [queries, setQueries] = useState([]);
  const [newQuestion, setNewQuestion] = useState({ title: '', details: '' });

  useEffect(() => {
    fetch('/api/expert/consultations')
      .then(res => res.json())
      .then(d => setQueries(d))
      .catch(() => {
        setQueries([
          { id: 701, farmerName: 'Rajesh Farmer', expertName: 'Dr. Ananya Sharma (IARI Scientist)', title: 'Yellowing of lower leaves in Basmati Rice', details: 'Noticed pale yellow tips on young tillers despite regular irrigation.', response: 'Check for nitrogen deficiency or root nematode damage. Apply 20kg Urea split dosage and inspect root tips.', status: 'Answered', date: '2026-08-31' }
        ]);
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const created = { id: Date.now(), farmerName: 'Rajesh Farmer', expertName: 'Dr. Ananya Sharma', ...newQuestion, status: 'Open', date: '2026-09-02' };
    setQueries([created, ...queries]);
    setNewQuestion({ title: '', details: '' });
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2>Agronomist & Expert Consultation Forum 🩺</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Connect directly with certified ICAR / IARI agricultural scientists for advisory and disease remedies.</p>
      </div>

      <div className="grid-2">
        {/* Ask Question Form */}
        <div className="card">
          <h3>Ask a Farming Question</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <input
              type="text"
              className="input-field"
              placeholder="Question Title (e.g. Yellowing of Rice leaves)"
              value={newQuestion.title}
              onChange={e => setNewQuestion({ ...newQuestion, title: e.target.value })}
              required
            />
            <textarea
              className="input-field"
              rows="4"
              placeholder="Describe symptoms, soil condition, fertilizer used, and upload crop details..."
              value={newQuestion.details}
              onChange={e => setNewQuestion({ ...newQuestion, details: e.target.value })}
              required
            ></textarea>
            <button type="submit" className="btn btn-primary">
              <Send size={18} /> Post Query to Expert Board
            </button>
          </form>
        </div>

        {/* Existing Q&A Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {queries.map(q => (
            <div key={q.id} className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={`badge ${q.status === 'Answered' ? 'badge-success' : 'badge-warning'}`}>{q.status}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{q.date}</span>
              </div>
              <h3 style={{ fontSize: '1.1rem', margin: '0.5rem 0' }}>{q.title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.8rem' }}>{q.details}</p>

              {q.response && (
                <div style={{ background: 'var(--light-green)', padding: '0.8rem', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--primary)' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--primary)' }}>Response from {q.expertName}:</div>
                  <p style={{ fontSize: '0.85rem', marginTop: '0.2rem' }}>{q.response}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
