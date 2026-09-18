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
  const tourRef = useRef({ active: false });
  const [open, setOpen] = useState(false);
  const [features, setFeatures] = useState(loadFeatures);
  const [isTourRunning, setIsTourRunning] = useState(false);
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

  /** Recorrido Automático: lee secuencialmente todos los elementos legibles de la página */
  const runAutoTour = useCallback(() => {
    if (!('speechSynthesis' in window)) return;

    // Si ya está corriendo, detenerlo
    if (tourRef.current.active) {
      tourRef.current.active = false;
      window.speechSynthesis.cancel();
      document.querySelectorAll('.acc-reading').forEach(el => el.classList.remove('acc-reading'));
      setIsTourRunning(false);
      return;
    }

    // Recoger elementos legibles en orden DOM (toda la pagina)
    const selector = [
      'h1','h2','h3','h4','h5','h6',
      'p',
      'img[alt]:not([alt=""])',
      'button:not(.acc-option):not(.acc-fab):not(.acc-rate-btn):not(.acc-font-btn)',
      'a[href]',
      'li',
      'label',
      'figcaption',
      'input[placeholder]','input[aria-label]',
    ].join(',');

    const root = document.getElementById('root');
    if (!root) return;

    const nodes = Array.from(root.querySelectorAll(selector)).filter(el => {
      // Excluir elementos dentro del widget de accesibilidad
      if (el.closest('#acc-menu') || el.closest('.acc-fab') || el.closest('.acc-tts-panel')) return false;

      // Para imágenes: usar alt text
      if (el.tagName === 'IMG') {
        const alt = el.getAttribute('alt') || '';
        return alt.trim().length > 0;
      }

      // Para inputs
      if (el.tagName === 'INPUT') {
        const txt = (el.placeholder || el.getAttribute('aria-label') || '').trim();
        return txt.length > 0;
      }

      // Para el resto: filtrar texto vacío, muy largo o que sea solo hijo redundante
      const text = el.textContent.trim().replace(/\s+/g, ' ');
      if (text.length === 0 || text.length > 500) return false;

      // Evitar duplicados: si el padre directo también está en el selector, saltar este
      const parent = el.parentElement;
      if (parent && parent.matches('li,p,button,a,label')) return false;

      return true;
    });

    if (nodes.length === 0) return;

    tourRef.current.active = true;
    setIsTourRunning(true);
    window.speechSynthesis.cancel();

    const getBestVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const lang = document.documentElement.lang || 'es';
      const prefix = lang.split('-')[0].toLowerCase();
      return voices.find(v => v.lang.toLowerCase().startsWith(prefix)) || voices[0] || null;
    };

    const savedRate = parseFloat(localStorage.getItem('acc-tts-rate')) || 1.0;

    const speakNode = (index) => {
      if (!tourRef.current.active || index >= nodes.length) {
        // Tour terminado
        tourRef.current.active = false;
        setIsTourRunning(false);
        document.querySelectorAll('.acc-reading').forEach(el => el.classList.remove('acc-reading'));
        return;
      }

      const el = nodes[index];
      let text = '';
      if (el.tagName === 'IMG') {
        const alt = el.getAttribute('alt') || '';
        text = alt ? `Imagen: ${alt}` : '';
      } else if (el.tagName === 'INPUT') {
        text = el.placeholder || el.getAttribute('aria-label') || 'Campo de entrada';
      } else {
        text = el.textContent.trim().replace(/\s+/g, ' ');
      }

      if (!text) {
        speakNode(index + 1);
        return;
      }

      // Scroll suave al elemento
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Destacar visualmente
      document.querySelectorAll('.acc-reading').forEach(e => e.classList.remove('acc-reading'));
      el.classList.add('acc-reading');

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = document.documentElement.lang || 'es';
      utterance.rate = savedRate;
      const voice = getBestVoice();
      if (voice) utterance.voice = voice;

      utterance.onend = () => {
        el.classList.remove('acc-reading');
        // Pequeña pausa entre elementos
        setTimeout(() => speakNode(index + 1), 350);
      };
      utterance.onerror = () => {
        el.classList.remove('acc-reading');
        speakNode(index + 1);
      };

      window.speechSynthesis.speak(utterance);
    };

    speakNode(0);
  }, []);

  // Detener tour si se desactiva el lector de voz
  useEffect(() => {
    if (!features.screenReader && tourRef.current.active) {
      tourRef.current.active = false;
      window.speechSynthesis.cancel();
      document.querySelectorAll('.acc-reading').forEach(el => el.classList.remove('acc-reading'));
      setIsTourRunning(false);
    }
  }, [features.screenReader]);

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
      if (next[key]) {
        delete next[key];
        // Al apagar el lector de voz, detener todo
        if (key === 'screenReader') {
          stopSpeaking();
          tourRef.current.active = false;
          setIsTourRunning(false);
        }
      } else {
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

  // ── SVG icons por función ──────────────────────────────────────────────
  const ICONS = {
    bigger: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <text x="2" y="17" fontSize="13" fontWeight="700" stroke="none" fill="currentColor">A</text>
        <text x="13" y="13" fontSize="9" fontWeight="700" stroke="none" fill="currentColor">+</text>
      </svg>
    ),
    smaller: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <text x="2" y="17" fontSize="13" fontWeight="700" stroke="none" fill="currentColor">A</text>
        <text x="13" y="13" fontSize="9" fontWeight="700" stroke="none" fill="currentColor">−</text>
      </svg>
    ),
    grayscale: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="12" cy="12" r="9"/>
        <path d="M12 3a9 9 0 0 1 0 18" fill="currentColor" stroke="none"/>
      </svg>
    ),
    highContrast: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="12" cy="12" r="4"/>
        <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
      </svg>
    ),
    negative: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/>
        <circle cx="12" cy="12" r="3"/>
        <line x1="2" y1="2" x2="22" y2="22"/>
      </svg>
    ),
    lightBg: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none"/>
        <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/>
      </svg>
    ),
    underline: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M6 4v6a6 6 0 0 0 12 0V4"/>
        <line x1="4" y1="20" x2="20" y2="20"/>
      </svg>
    ),
    readableFont: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <polyline points="4 7 4 4 20 4 20 7"/>
        <line x1="9" y1="20" x2="15" y2="20"/>
        <line x1="12" y1="4" x2="12" y2="20"/>
      </svg>
    ),
    screenReader: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
      </svg>
    ),
    tour: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" stroke="none">
        <polygon points="5,3 19,12 5,21"/>
      </svg>
    ),
    tourPause: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" stroke="none">
        <rect x="6" y="4" width="4" height="16" rx="1"/>
        <rect x="14" y="4" width="4" height="16" rx="1"/>
      </svg>
    ),
    stop: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" stroke="none">
        <rect x="4" y="4" width="16" height="16" rx="2"/>
      </svg>
    ),
    reset: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
        <path d="M3 3v5h5"/>
      </svg>
    ),
  };

  const FONT_LABELS = { '-2': '80%', '-1': '90%', '0': '100%', '1': '110%', '2': '125%', '3': '140%', '4': '160%' };

  const featuresList = [
    { key: 'grayscale',    icon: ICONS.grayscale,    label: t('acc.grayscale') },
    { key: 'highContrast', icon: ICONS.highContrast, label: t('acc.contrast') },
    { key: 'negative',     icon: ICONS.negative,     label: t('acc.negative') },
    { key: 'lightBg',      icon: ICONS.lightBg,      label: t('acc.lightbg', 'Fondo Claro') },
    { key: 'underline',    icon: ICONS.underline,    label: t('acc.underline', 'Subrayar') },
    { key: 'readableFont', icon: ICONS.readableFont, label: t('acc.readable', 'Fuente Legible') },
    { key: 'screenReader', icon: ICONS.screenReader, label: t('acc.screenReader', 'Lector de Voz') },
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
            {/* Control de tamaño tipo navegador: − 100% + */}
            <div className="acc-font-control" role="group" aria-label="Tamaño de texto" onMouseDown={(e) => e.preventDefault()}>
              <button
                className="acc-font-btn"
                onClick={() => changeFont(-1)}
                disabled={fontLevel <= -2}
                aria-label={t('acc.smaller')}>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </button>
              <span className="acc-font-display" aria-live="polite" aria-atomic="true">
                {FONT_LABELS[String(fontLevel)]}
              </span>
              <button
                className="acc-font-btn"
                onClick={() => changeFont(1)}
                disabled={fontLevel >= 4}
                aria-label={t('acc.bigger')}>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </button>
            </div>
            {featuresList.map(f => (
              <button key={f.key}
                className={`acc-option ${features[f.key] ? 'active' : ''}`}
                onClick={() => toggle(f.key)}
                aria-label={f.label}
                aria-pressed={!!features[f.key]}>
                <span className="acc-icon">{f.icon}</span>
                <span className="acc-label">{f.label}</span>
              </button>
            ))}
            {features.screenReader && (
              <div className="acc-tts-panel" role="region" aria-label="Controles del lector de voz">
                <div className="acc-tts-controls">
                  <span className="acc-tts-title">Velocidad:</span>
                  {[0.8, 1.0, 1.2].map(rate => (
                    <button key={rate} type="button"
                      className={`acc-rate-btn ${ttsRate === rate ? 'active' : ''}`}
                      onClick={() => changeTtsRate(rate)}
                      aria-label={`Velocidad ${rate}x`}
                      aria-pressed={ttsRate === rate}>
                      {rate}x
                    </button>
                  ))}
                </div>
                <button type="button"
                  className={`acc-option acc-tts-tour ${isTourRunning ? 'active' : ''}`}
                  onClick={runAutoTour}
                  aria-label={isTourRunning ? 'Detener recorrido automático' : 'Iniciar recorrido automático'}
                  aria-pressed={isTourRunning}>
                  <span className="acc-icon">{isTourRunning ? ICONS.tourPause : ICONS.tour}</span>
                  <span className="acc-label">{isTourRunning ? 'Pausar Recorrido' : 'Recorrido Auto'}</span>
                </button>
              </div>
            )}
          </div>
          <div className="acc-divider"></div>
          <div className="acc-menu-section acc-lang-section">
            <span className="acc-section-title">{t('acc.language')}</span>
            {languages.map(l => (
              <button key={l.code}
                className={`acc-option ${i18n.language === l.code ? 'active' : ''}`}
                onClick={() => changeLanguage(l.code)}
                aria-label={l.label}
                aria-pressed={i18n.language === l.code}>
                <span className={`acc-icon acc-flag-icon ${l.flag}`}></span>
                <span className="acc-label">{l.label}</span>
              </button>
            ))}
          </div>
          <div className="acc-divider"></div>
          <button className="acc-option acc-reset" onClick={resetAll} aria-label={t('acc.reset')}>
            <span className="acc-icon">{ICONS.reset}</span>
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
