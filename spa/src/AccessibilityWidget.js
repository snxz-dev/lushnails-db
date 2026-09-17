import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import './styles/accessibility.css';

const STORAGE_KEY = 'acc-features';

function loadFeatures() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {};
  } catch { return {}; }
}

function saveFeatures(features) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(features)); } catch { /* Storage may be unavailable. */ }
}

export default function AccessibilityWidget() {
  const { t, i18n } = useTranslation();
  const widgetRef = useRef(null);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [features, setFeatures] = useState(loadFeatures);
  const [fontLevel, setFontLevel] = useState(() => {
    try {
      const saved = Number(localStorage.getItem('acc-font-level'));
      return Number.isInteger(saved) ? Math.min(4, Math.max(-2, saved)) : 0;
    } catch { return 0; }
  });
  const [ttsRate, setTtsRate] = useState(() => {
    try {
      const saved = parseFloat(localStorage.getItem('acc-tts-rate'));
      return saved && !isNaN(saved) ? saved : 1.0;
    } catch { return 1.0; }
  });

  const changeTtsRate = (newRate) => {
    setTtsRate(newRate);
    try { localStorage.setItem('acc-tts-rate', String(newRate)); } catch { /* Storage may be unavailable. */ }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      document.querySelectorAll('.acc-reading').forEach(el => el.classList.remove('acc-reading'));
    }
  };

  const applyFeatures = useCallback((feats, level) => {
    var root = document.getElementById('root');
    if (!root) return;
    root.classList.toggle('acc-grayscale', !!feats.grayscale);
    root.classList.toggle('acc-negative', !!feats.negative);
    root.classList.toggle('acc-high-contrast', !!feats.highContrast);
    root.classList.toggle('acc-light-bg', !!feats.lightBg);
    root.classList.toggle('acc-underline', !!feats.underline);
    root.classList.toggle('acc-readable-font', !!feats.readableFont);

    document.body.classList.toggle('acc-grayscale', !!feats.grayscale);
    document.body.classList.toggle('acc-negative', !!feats.negative);
    document.body.classList.toggle('acc-high-contrast', !!feats.highContrast);
    document.body.classList.toggle('acc-light-bg', !!feats.lightBg);
    document.body.classList.toggle('acc-underline', !!feats.underline);
    document.body.classList.toggle('acc-readable-font', !!feats.readableFont);

    const sizes = { '-2': '80%', '-1': '90%', '0': '', '1': '110%', '2': '125%', '3': '140%', '4': '160%' };
    document.documentElement.style.fontSize = sizes[level] || '';
    document.body.style.fontSize = '';
  }, []);

  useEffect(() => {
    applyFeatures(features, fontLevel);
    saveFeatures(features);
    try { localStorage.setItem('acc-font-level', String(fontLevel)); } catch { /* Optional persistence. */ }
  }, [features, fontLevel, applyFeatures]);

  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (widgetRef.current && !widgetRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    menuRef.current?.querySelector('button')?.focus();
  }, [open]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && open) {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  const toggle = (key) => {
    setFeatures(prev => {
      const next = { ...prev };
      if (next[key]) delete next[key];
      else {
        next[key] = true;
        if (key === 'highContrast') delete next.lightBg;
        if (key === 'lightBg') delete next.highContrast;
      }
      return next;
    });
  };

  const changeFont = (dir) => {
    setFontLevel(prev => {
      const next = Math.min(4, Math.max(-2, prev + dir));
      return next;
    });
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    try { localStorage.setItem('i18nextLng', lng); } catch { /* Optional persistence. */ }
    document.documentElement.lang = lng;
    setOpen(false);
    triggerRef.current?.focus();
  };

  const resetAll = () => {
    setFeatures({});
    setFontLevel(0);

  };

  const featuresList = [
    { key: 'bigger', icon: 'A+', label: t('acc.bigger'), fn: () => changeFont(1), standalone: true },
    { key: 'smaller', icon: 'A−', label: t('acc.smaller'), fn: () => changeFont(-1), standalone: true },
    { key: 'grayscale', icon: '◐', label: t('acc.grayscale') },
    { key: 'highContrast', icon: '☯', label: t('acc.contrast') },
    { key: 'negative', icon: '👁', label: t('acc.negative') },
    { key: 'lightBg', icon: '☀', label: t('acc.lightbg', 'Fondo Claro') },
    { key: 'underline', icon: 'U', label: t('acc.underline', 'Subrayar Enlaces') },
    { key: 'readableFont', icon: 'Aa', label: t('acc.readable', 'Fuente Legible') },
    { key: 'screenReader', icon: '🗣️', label: t('acc.screenReader', 'Lector de Voz') },
  ];

  const languages = [
    { code: 'es', label: 'Español', flag: 'lang-es' },
    { code: 'ca', label: 'Català', flag: 'lang-ca' },
    { code: 'en', label: 'English', flag: 'lang-en' },
  ];

  useEffect(() => {
    document.documentElement.lang = i18n.resolvedLanguage || 'es';
  }, [i18n.resolvedLanguage]);

  const widget = (
    <div ref={widgetRef} onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
    }}>
      {open && (
        <div id="acc-menu" ref={menuRef} className="acc-menu" role="region" aria-label={t('acc.aria')}>
          <div className="acc-menu-section">
            {featuresList.map(f => (
              f.standalone ? (
                <button key={f.icon + f.label} className="acc-option acc-standalone" onClick={f.fn} disabled={f.key === 'bigger' ? fontLevel >= 4 : fontLevel <= -2} aria-label={f.label}>
                  <span className="acc-icon">{f.icon}</span>
                  <span className="acc-label">{f.label}</span>
                </button>
              ) : (
                <button key={f.key} className={`acc-option ${features[f.key] ? 'active' : ''}`} onClick={() => toggle(f.key)} aria-label={f.label} aria-pressed={!!features[f.key]}>
                  <span className="acc-icon">{f.icon}</span>
                  <span className="acc-label">{f.label}</span>
                </button>
              )
            ))}
            {features.screenReader && (
              <div className="acc-tts-panel" role="region" aria-label="Controles del lector de voz">
                <div className="acc-tts-controls">
                  <span className="acc-tts-title">Velocidad:</span>
                  {[0.8, 1.0, 1.2].map(rate => (
                    <button
                      key={rate}
                      type="button"
                      className={`acc-rate-btn ${ttsRate === rate ? 'active' : ''}`}
                      onClick={() => changeTtsRate(rate)}
                      aria-label={`Velocidad ${rate}x`}
                      aria-pressed={ttsRate === rate}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="acc-option acc-tts-stop"
                  onClick={stopSpeaking}
                  aria-label="Detener lectura de voz"
                >
                  <span className="acc-icon">⏹</span>
                  <span className="acc-label">Detener voz (Esc)</span>
                </button>
              </div>
            )}
          </div>
          <div className="acc-divider"></div>
          <div className="acc-menu-section acc-lang-section">
            <span className="acc-section-title">{t('acc.language')}</span>
            {languages.map(l => (
              <button key={l.code} className={`acc-option ${i18n.language === l.code ? 'active' : ''}`} onClick={() => changeLanguage(l.code)} aria-label={l.label} aria-pressed={i18n.language === l.code}>
                <span className={`acc-icon acc-flag-icon ${l.flag}`}></span>
                <span className="acc-label">{l.label}</span>
              </button>
            ))}
          </div>
          <div className="acc-divider"></div>
          <button className="acc-option acc-reset" onClick={resetAll} aria-label={t('acc.reset')}>
            <span className="acc-icon">↺</span>
            <span className="acc-label">{t('acc.reset')}</span>
          </button>
        </div>
      )}
      <button id="accessibility-trigger" ref={triggerRef} className="acc-fab" onClick={() => setOpen(!open)} aria-label={t('acc.aria')} aria-expanded={open} aria-controls="acc-menu">
        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="7" r="1.5" fill="currentColor" stroke="none" />
          <path d="M6.5 10 12 11l5.5-1M12 11v3m0 0-3 4m3-4 3 4" />
        </svg>
      </button>
    </div>
  );

  return createPortal(widget, document.body);
}
