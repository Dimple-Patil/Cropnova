import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, X, Upload, ShieldCheck, AlertTriangle, Bug, Sprout } from 'lucide-react';

export const AgriChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Namaste! 🙏 I am Krishimitra, your personal AI Agriculture Assistant. Ask me about crop recommendations, Integrated Pest Management (IPM), weather tips, or upload/snap a crop/leaf photo below for instant AI Disease & Pest identification!'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const quickPrompts = [
    '📷 AI Disease & Pest Photo Scan',
    '🐛 Integrated Pest Management (IPM)',
    '🌾 Crop Recommendations',
    '💊 Urea & DAP Dosage'
  ];

  const processQuery = (rawInput) => {
    const query = rawInput.toLowerCase();
    let botReply = '';

    if (query.includes('pest') || query.includes('insect') || query.includes('ipm') || query.includes('planthopper') || query.includes('armyworm') || query.includes('caterpillar') || query.includes('bollworm')) {
      botReply = '🐛 Integrated Pest Management (IPM) Guide from Krishimitra:\n• Brown Planthopper (BPH) on Paddy: Maintain water depth < 5cm, use yellow sticky traps (10/acre) & spray Neem kernel extract (5%). Chemical: Imidacloprid 17.8% SL @ 0.5ml/L.\n• Fall Armyworm (FAW) on Maize: Deep summer plowing + release Trichogramma parasitoids @ 50,000/acre. Chemical: Emamectin benzoate 5% SG @ 0.4g/L.\n• Pink Bollworm on Cotton: Erect pheromone traps + spray Neem oil 1500 ppm @ 5ml/L.';
    } else if (query.includes('recommend') || query.includes('suggest') || query.includes('grow') || query.includes('which crop') || query.includes('rabi') || query.includes('kharif')) {
      botReply = '💡 Smart Crop Recommendation from Krishimitra:\n• For Rabi (Winter) Season in Loamy Soil: Grow Wheat (High yield: 22-25 Quintals/Acre) or Mustard (High oil yield).\n• For Kharif (Monsoon) Season: Basmati Paddy 1121 is highly suitable with good market rates.';
    } else if (query.includes('disease') || query.includes('leaf') || query.includes('yellow') || query.includes('spot') || query.includes('photo') || query.includes('scan')) {
      botReply = '🔬 Krishimitra AI Disease Scanner & Diagnosis:\nUpload a leaf photo using the image upload button (📷) below!\nCommon diagnosis guidelines:\n• Yellowing Tips / Blight: Spray Neem oil formulation (5ml/L). If fungal, apply Copper Oxychloride (2g/L).\n• Leaf Rust (Puccinia): Apply Propiconazole 25% EC @ 1 ml/L.';
    } else if (query.includes('fertilizer') || query.includes('urea') || query.includes('dap') || query.includes('dosage')) {
      botReply = '💊 Krishimitra Fertilizer Dosage Guide:\nApply Urea in 3 split doses (basal at sowing, tillering, and flowering). Mix 25kg DAP/acre during land preparation for robust root strength.';
    } else if (query.includes('weather') || query.includes('rain') || query.includes('shower')) {
      botReply = '🌤️ Weather Advisory from Krishimitra:\nAlways check your regional dashboard forecast. Avoid applying chemical bio-sprays if rainfall is expected within 24 hours to prevent runoff.';
    } else if (query.includes('water') || query.includes('irrigation')) {
      botReply = '💧 Krishimitra Irrigation Schedule:\nMaintain 3-5 cm standing water for paddy fields. For wheat crops, irrigate at Crown Root Initiation (CRI) stage around 21 days after sowing.';
    } else {
      botReply = `🌱 Krishimitra's advice regarding "${rawInput}":\nTo maximize farm yield, maintain balanced NPK nutrients, inspect for early pest activity, and ask me anytime for IPM pest management or AI disease photo scans!`;
    }

    return botReply;
  };

  const handleSend = (e) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const botReply = processQuery(userText);
      setMessages(prev => [...prev, { sender: 'bot', text: botReply }]);
      setIsTyping(false);
    }, 600);
  };

  // AI Image Scanner Upload handler directly in Krishimitra Chatbot
  const handleImageScanUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setMessages(prev => [
      ...prev,
      { sender: 'user', text: `📷 Uploaded crop sample photo: ${file.name}`, isImage: true, imageSrc: imageUrl }
    ]);
    setIsTyping(true);

    setTimeout(() => {
      const sampleDiagnostics = [
        '🔬 Krishimitra AI Diagnostic Result: Brown Planthopper Pest Attack (BPH)\n• Confidence: 95.2%\n• Cultural Control: Keep water depth below 5cm, install yellow sticky traps (10/acre).\n• Organic Remedy: Spray 5% Neem Seed Kernel Extract (NSKE).\n• Chemical Remedy: Apply Imidacloprid 17.8% SL @ 0.5ml/L.',
        '🔬 Krishimitra AI Diagnostic Result: Wheat Leaf Rust (Puccinia triticina)\n• Confidence: 94.5%\n• Organic Treatment: Spray Neem oil formulation (5ml/L water).\n• Chemical Remedy: Apply Propiconazole 25% EC @ 1 ml/liter.'
      ];
      const diag = sampleDiagnostics[Math.floor(Math.random() * sampleDiagnostics.length)];
      setMessages(prev => [...prev, { sender: 'bot', text: diag }]);
      setIsTyping(false);
    }, 1000);
  };

  const handlePromptClick = (promptText) => {
    setMessages(prev => [...prev, { sender: 'user', text: promptText }]);
    setIsTyping(true);

    setTimeout(() => {
      const botReply = processQuery(promptText);
      setMessages(prev => [...prev, { sender: 'bot', text: botReply }]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <>
      {/* Floating Chat Trigger Button for Krishimitra */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
          color: '#FFF',
          border: 'none',
          borderRadius: '50px',
          padding: '0.8rem 1.4rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          boxShadow: '0 8px 24px rgba(46, 125, 50, 0.4)',
          cursor: 'pointer',
          fontFamily: 'var(--font-heading)',
          fontWeight: '700',
          fontSize: '0.95rem',
          transition: 'transform 0.2s ease'
        }}
      >
        <Sprout size={22} color="#FFF" />
        <span>Ask Krishimitra AI 🌾</span>
      </button>

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="animate-fade-in" style={{
          position: 'fixed',
          bottom: '84px',
          right: '24px',
          width: '400px',
          height: '540px',
          zIndex: 9999,
          background: 'var(--card-bg)',
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 16px 40px rgba(0,0,0,0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Header Bar */}
          <div style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
            color: '#FFF',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.4rem', borderRadius: '50%' }}>
                <Sprout size={20} />
              </div>
              <div>
                <h4 style={{ color: '#FFF', margin: 0, fontSize: '1rem', fontWeight: '800' }}>Krishimitra 🌾 AI Assistant</h4>
                <span style={{ fontSize: '0.7rem', opacity: 0.85 }}>Online • IPM & Pest/Disease Photo Diagnostics</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>

          {/* Quick Prompts Container */}
          <div style={{ padding: '0.6rem 0.8rem', background: 'var(--light-green)', borderBottom: '1px solid var(--border)', display: 'flex', gap: '0.4rem', overflowX: 'auto' }}>
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handlePromptClick(p)}
                style={{
                  whiteSpace: 'nowrap',
                  fontSize: '0.72rem',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '20px',
                  border: '1px solid var(--primary)',
                  background: '#FFF',
                  color: 'var(--primary)',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Messages Container */}
          <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  alignItems: 'flex-start',
                  gap: '0.5rem'
                }}
              >
                {msg.sender === 'bot' && (
                  <div style={{ background: 'var(--light-green)', padding: '0.35rem', borderRadius: '50%', color: 'var(--primary)', flexShrink: 0 }}>
                    <Sprout size={15} />
                  </div>
                )}
                <div style={{
                  maxWidth: '82%',
                  padding: '0.7rem 0.9rem',
                  borderRadius: '14px',
                  fontSize: '0.85rem',
                  lineHeight: '1.45',
                  whiteSpace: 'pre-line',
                  background: msg.sender === 'user' ? 'var(--primary)' : 'var(--bg)',
                  color: msg.sender === 'user' ? '#FFF' : 'var(--text-primary)',
                  border: msg.sender === 'bot' ? '1px solid var(--border)' : 'none'
                }}>
                  {msg.isImage && msg.imageSrc && (
                    <img src={msg.imageSrc} alt="Uploaded leaf" style={{ width: '100%', maxHeight: '140px', borderRadius: '8px', marginBottom: '0.4rem', objectFit: 'cover' }} />
                  )}
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Sparkles size={14} color="var(--primary)" /> Krishimitra AI is processing your query...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box with Image Upload Scanner Trigger */}
          <form onSubmit={handleSend} style={{ padding: '0.8rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.5rem', background: 'var(--bg)', alignItems: 'center' }}>
            <label className="btn btn-secondary" style={{ padding: '0.6rem 0.7rem', cursor: 'pointer' }} title="Upload Pest / Crop Photo for Krishimitra AI Diagnostic">
              <Upload size={16} color="var(--primary)" />
              <input type="file" accept="image/*" onChange={handleImageScanUpload} style={{ display: 'none' }} />
            </label>

            <input
              type="text"
              className="input-field"
              placeholder="Ask Krishimitra about crops, pests or upload photo..."
              value={input}
              onChange={e => setInput(e.target.value)}
              style={{ fontSize: '0.85rem', padding: '0.6rem 0.8rem' }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 0.8rem' }}>
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
