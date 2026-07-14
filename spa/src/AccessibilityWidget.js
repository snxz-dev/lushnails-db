import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import './styles/accessibility.css';

const STORAGE_KEY = 'acc-features';

function loadFeatures() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved && typeof saved === 'object' ? saved : {};
  } catch { return {}; }
}

function saveFeatures(features) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(features));
}

export default function AccessibilityWidget() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [features, setFeatures] = useState(loadFeatures);
  const [fontLevel, setFontLevel] = useState(() => {
    const saved = localStorage.getItem('acc-font-level');
    return saved ? parseInt(saved, 10) : 0;
  });

  const applyFeatures = useCallback((feats, level) => {
    document.body.classList.toggle('acc-grayscale', !!feats.grayscale);
    document.body.classList.toggle('acc-high-contrast', !!feats.highContrast);
    document.body.classList.toggle('acc-negative', !!feats.negative);
    document.body.classList.toggle('acc-light-bg', !!feats.lightBg);
    document.body.classList.toggle('acc-underline', !!feats.underline);
    document.body.classList.toggle('acc-readable-font', !!feats.readableFont);

    const sizes = { '-2': '80%', '-1': '90%', '0': '', '1': '110%', '2': '125%', '3': '140%', '4': '160%' };
    document.body.style.fontSize = sizes[level] || '';
  }, []);

  useEffect(() => {
    applyFeatures(features, fontLevel);
    saveFeatures(features);
  }, [features, fontLevel, applyFeatures]);

  const toggle = (key) => {
    setFeatures(prev => {
      const next = { ...prev };
      if (next[key]) delete next[key];
      else next[key] = true;
      return next;
    });
  };

  const changeFont = (dir) => {
    setFontLevel(prev => {
      const next = Math.min(4, Math.max(-2, prev + dir));
      localStorage.setItem('acc-font-level', next);
      return next;
    });
  };

  const resetAll = () => {
    setFeatures({});
    setFontLevel(0);
    localStorage.setItem('acc-font-level', '0');
  };

  const featuresList = [
    { key: 'bigger', icon: 'A+', label: t('acc.bigger'), fn: () => changeFont(1), standalone: true },
    { key: 'smaller', icon: 'A-', label: t('acc.smaller'), fn: () => changeFont(-1), standalone: true },
    { key: 'grayscale', icon: '◐', label: t('acc.grayscale') },
    { key: 'highContrast', icon: '☯', label: t('acc.contrast') },
    { key: 'negative', icon: '👁', label: t('acc.negative') },
    { key: 'lightBg', icon: '☀', label: t('acc.lightbg') },
    { key: 'underline', icon: 'U', label: t('acc.underline') },
    { key: 'readableFont', icon: 'Aa', label: t('acc.readable') },
  ];

  return (
    <div className="acc-widget-container">
      {open && (
        <div className="acc-menu" role="menu" aria-label={t('acc.aria')}>
          {featuresList.map(f => (
            f.standalone ? (
              <button
                key={f.icon + f.label}
                className="acc-option acc-standalone"
                onClick={f.fn}
                role="menuitem"
                aria-label={f.label}
              >
                <span className="acc-icon">{f.icon}</span>
                <span className="acc-label">{f.label}</span>
              </button>
            ) : (
              <button
                key={f.key}
                className={`acc-option ${features[f.key] ? 'active' : ''}`}
                onClick={() => toggle(f.key)}
                role="menuitem"
                aria-label={f.label + (features[f.key] ? ' (activado)' : ' (desactivado)')}
              >
                <span className="acc-icon">{f.icon}</span>
                <span className="acc-label">{f.label}</span>
              </button>
            )
          ))}
          <div className="acc-divider"></div>
          <button className="acc-option acc-reset" onClick={resetAll} role="menuitem" aria-label={t('acc.reset')}>
            <span className="acc-icon">↺</span>
            <span className="acc-label">{t('acc.reset')}</span>
          </button>
        </div>
      )}
      <button
        className="acc-fab"
        onClick={() => setOpen(!open)}
        aria-label={t('acc.aria')}
        aria-expanded={open}
      >
        ♿
      </button>
    </div>
  );
}
