import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, X, Upload, Sprout, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export const AgriChatbot = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Namaste! I am Krishimitra, your Cropnova AI agent. I can help with crops, soil, fertilizer, pest and disease scan, weather, marketplace, vendor tools, expert consultation, schemes, expenses, harvest planning, alerts, reports, and profile guidance.'
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
    'Show all Cropnova features',
    'Recommend crop and fertilizer plan',
    'Diagnose pest or disease',
    'Summarize my farm status'
  ];

  const askAgent = async (userText) => {
    try {
      const response = await api.post('/agent/chat', {
        message: userText,
        userProfile: user
      });
      return response;
    } catch (err) {
      console.error('AI Agent Error:', err);
      return { 
        reply: "I am having trouble connecting to the OpenAI servers right now. Please ensure your backend server is running and the API key is valid.", 
        feature: null 
      };
    }
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setInput('');
    setIsTyping(true);

    const response = await askAgent(userText);
    setTimeout(() => {
      setMessages(prev => [...prev, { sender: 'bot', text: response.reply, feature: response.feature }]);
      setIsTyping(false);
    }, 350);
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
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: 'I have received your photo. Since visual analysis via the OpenAI Vision API is still being integrated, please describe the symptoms you see in the photo (e.g., "yellow spots on leaves") and I will diagnose it for you based on the description!' 
      }]);
      setIsTyping(false);
    }, 1000);
  };

  const handlePromptClick = async (promptText) => {
    setMessages(prev => [...prev, { sender: 'user', text: promptText }]);
    setIsTyping(true);

    const response = await askAgent(promptText);
    setTimeout(() => {
      setMessages(prev => [...prev, { sender: 'bot', text: response.reply, feature: response.feature }]);
      setIsTyping(false);
    }, 350);
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
        <span>Ask Krishimitra AI</span>
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
                <h4 style={{ color: '#FFF', margin: 0, fontSize: '1rem', fontWeight: '800' }}>Krishimitra AI Agent</h4>
                <span style={{ fontSize: '0.7rem', opacity: 0.85 }}>Cropnova features, planning, diagnostics</span>
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
                  {msg.feature?.route && (
                    <button
                      type="button"
                      onClick={() => {
                        navigate(msg.feature.route);
                        setIsOpen(false);
                      }}
                      style={{
                        marginTop: '0.7rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        border: '1px solid var(--primary)',
                        background: 'var(--light-green)',
                        color: 'var(--primary)',
                        borderRadius: '8px',
                        padding: '0.45rem 0.6rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '0.78rem'
                      }}
                    >
                      <ExternalLink size={13} />
                      Open {msg.feature.label}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Sparkles size={14} color="var(--primary)" /> Krishimitra is checking Cropnova context...
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
              placeholder="Ask about any Cropnova feature..."
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
