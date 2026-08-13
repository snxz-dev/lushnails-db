import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './styles/App.css';
import './styles/menu.css';
import './styles/accessibility.css';
import AccessibilityWidget from './AccessibilityWidget';
import SlotsMatrix from './components/SlotsMatrix';
import logoImage from './assets/logo.svg';
import unas18 from './assets/uñas18.jpeg';
import unas1000 from './assets/uñas1000.jpeg';
import unas12 from './assets/uñas12.jpeg';
import unas13 from './assets/uñas13.jpeg';
import unas14 from './assets/uñas14.jpeg';
import unas15 from './assets/uñas15.jpeg';
import unas16 from './assets/uñas16.jpeg';
import unas17 from './assets/uñas17.jpeg';
import unas19 from './assets/uñas19.jpeg';
import unas101 from './assets/uñas101.jpeg';
import unas202 from './assets/uñas202.jpeg';
import unas303 from './assets/uñas303.jpeg';
import unas404 from './assets/uñas404.jpeg';
import unas505 from './assets/uñas505.jpeg';
import unas606 from './assets/uñas606.jpeg';
import unas707 from './assets/uñas707.jpeg';
import imgCabello from './assets/Cabello.jpeg';
import imgManicure from './assets/Unas.jpeg';
import imgPestanas from './assets/PestanasCejas.jpeg';


const fotosUñas = [
  unas13, unas14, unas15, unas16, unas17, unas19,
  unas1000, unas101, unas202, unas303, unas404, unas505, unas606, unas707
];

const CORREO_TRABAJO = 'ibethcabrera1@gmail.com';
const API_URL = 'http://localhost:4000/api';

const WHATSAPP_LINKS = {
  general: 'https://wa.me/message/C756ADRGK277F1',
  sanAntonio: 'https://wa.me/message/C756ADRGK277F1',
  pusuqui: 'https://wa.me/message/C756ADRGK277F1',
  calderon: 'https://wa.me/593964268572'
};

const REDES_SOCIALES = {
  facebook: 'https://www.facebook.com/share/18bj2qd5A2/?mibextid=wwXIfr',
  instagram: 'https://www.instagram.com/lushnailsspauio?igsh=ZG16ZGVodnpua2F3&utm_source=qr',
  tiktok: 'https://www.tiktok.com/@lushnails7?_r=1&_t=ZS-94vnJqBMOCD'
};

function App() {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [whatsappMenuOpen, setWhatsappMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    telefono: '',
    archivo: null
  });
  const [formEnviado, setFormEnviado] = useState(false);
  const [imagenAmpliada, setImagenAmpliada] = useState(null);
  const [servicioActivo, setServicioActivo] = useState(null);
  const [vista, setVista] = useState('home');
  const [serviciosDb, setServiciosDb] = useState([]);
  const [sucursalesDb, setSucursalesDb] = useState([]);
  const [citaForm, setCitaForm] = useState({
    nombre: '', telefono: '', correo: '', id_sucursal: '', fecha: '', hora: '', notas: ''
  });
  const [serviciosSel, setServiciosSel] = useState([]);
  const [citaEnviada, setCitaEnviada] = useState(false);
  const [citaError, setCitaError] = useState('');
  // Client slots state (for matrix view)
  const [slotsDb, setSlotsDb] = useState([]);
  const [, setSlotsCargando] = useState(false);
  const [showMatrix, setShowMatrix] = useState(false);
  // Admin / horarios panel state
  const [adminFecha, setAdminFecha] = useState(new Date().toISOString().slice(0,10));
  const [adminSucursal, setAdminSucursal] = useState('');
  const [adminServicios, setAdminServicios] = useState([]);
  const [adminSlotsMatrix, setAdminSlotsMatrix] = useState({ times: [], empleados: [] });
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminCitas, setAdminCitas] = useState([]);
  const [cliente, setCliente] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('lushnails_cliente')) || null;
    } catch {
      return null;
    }
  });
  const [misCitas, setMisCitas] = useState([]);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ nombre: '', telefono: '', correo: '', password: '' });
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (cliente && cliente.id) {
      fetch(`${API_URL}/clientes/${cliente.id}/citas`)
        .then(r => r.json())
        .then(setMisCitas)
        .catch(() => {});
    }
  }, [cliente]);

  const handleAuthChange = (e) => {
    const { name, value } = e.target;
    setAuthForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    const url = authMode === 'login' ? `${API_URL}/clientes/login` : `${API_URL}/clientes/registro`;
    const body = authMode === 'login'
      ? { correo: authForm.correo, password: authForm.password }
      : { nombre: authForm.nombre, telefono: authForm.telefono, correo: authForm.correo, password: authForm.password };
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('lushnails_cliente', JSON.stringify(data.cliente));
        setCliente(data.cliente);
        setCitaForm(prev => ({ ...prev, nombre: data.cliente.nombre, telefono: data.cliente.telefono, correo: data.cliente.correo }));
        setAuthForm({ nombre: '', telefono: '', correo: '', password: '' });
      } else {
        setAuthError(data.error || t('cita.error'));
      }
    } catch (err) {
      setAuthError(t('cita.error'));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('lushnails_cliente');
    setCliente(null);
    setMisCitas([]);
  };

  const handleCancelarCita = async (citaId) => {
    if (!window.confirm(t('cuenta.confirmCancel'))) return;
    try {
      const res = await fetch(`${API_URL}/clientes/${cliente.id}/citas/${citaId}/cancelar`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        setMisCitas(prev => prev.map(c => c.id === citaId ? { ...c, estado: 'cancelada' } : c));
      } else {
        alert(data.error || t('cuenta.cancelError'));
      }
    } catch (err) {
      alert(t('cuenta.cancelError'));
    }
  };

  const handleEliminarCita = async (citaId) => {
    if (!window.confirm(t('cuenta.confirmDelete'))) return;
    try {
      const res = await fetch(`${API_URL}/clientes/${cliente.id}/citas/${citaId}/eliminar`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        setMisCitas(prev => prev.filter(c => c.id !== citaId));
      } else {
        alert(data.error || t('cuenta.deleteError'));
      }
    } catch (err) {
      alert(t('cuenta.deleteError'));
    }
  };

  useEffect(() => {
    fetch(`${API_URL}/servicios`)
      .then(r => r.json())
      .then(setServiciosDb)
      .catch(() => {});
    fetch(`${API_URL}/sucursales`)
      .then(r => r.json())
      .then(setSucursalesDb)
      .catch(() => {});
  }, []);

  // Cargar valores derivados de citaForm
  const citaFecha = citaForm.fecha;
  const citaSucursal = citaForm.id_sucursal;

  // Admin panel: fetch slots for selected fecha/sucursal/servicios
  useEffect(() => {
    if (!adminFecha || !adminSucursal) {
      setAdminSlotsMatrix({ times: [], empleados: [] });
      setAdminLoading(false);
      return;
    }
    setAdminLoading(true);
    const serviciosParam = adminServicios && adminServicios.length ? `&servicios=${adminServicios.join(',')}` : '';
    fetch(`${API_URL}/disponibilidad/empleados?fecha=${adminFecha}&id_sucursal=${adminSucursal}${serviciosParam}`)
      .then(r => r.json())
      .then(data => {
        setAdminSlotsMatrix({ times: data.times || [], empleados: data.empleados || [] });
        setAdminLoading(false);
      })
      .catch(() => {
        setAdminSlotsMatrix({ times: [], empleados: [] });
        setAdminLoading(false);
      });
  }, [adminFecha, adminSucursal, adminServicios]);

  // Admin: also fetch raw citas for this fecha/sucursal to show client table
  useEffect(() => {
    if (!adminFecha || !adminSucursal) {
      setAdminCitas([]);
      return;
    }
    fetch(`${API_URL}/disponibilidad?fecha=${adminFecha}&id_sucursal=${adminSucursal}`)
      .then(r => r.json())
      .then(data => setAdminCitas(data.citas || []))
      .catch(() => setAdminCitas([]));
  }, [adminFecha, adminSucursal]);

  // Client: fetch slots for selected fecha/sucursal/servicios (used by matrix view)
  useEffect(() => {
    if (!citaFecha || !citaSucursal || serviciosSel.length === 0) {
      setSlotsDb([]);
      setSlotsCargando(false);
      return;
    }
    setSlotsCargando(true);
    fetch(`${API_URL}/disponibilidad?fecha=${citaFecha}&id_sucursal=${citaSucursal}&servicios=${serviciosSel.join(',')}`)
      .then(r => r.json())
      .then(data => {
        setSlotsDb(data.slots || []);
        setSlotsCargando(false);
      })
      .catch(() => {
        setSlotsDb([]);
        setSlotsCargando(false);
      });
  }, [citaFecha, citaSucursal, serviciosSel]);

  // Al cambiar fecha/sucursal/servicios se descarta la hora previamente elegida
  useEffect(() => {
    // reset hora only when date/sucursal/servicios change; avoid depending on current hora to prevent clearing on selection
    setCitaForm(prev => (prev.hora ? { ...prev, hora: '' } : prev));
  }, [citaFecha, citaSucursal, serviciosSel]);

  const handleCitaChange = (e) => {
    const { name, value } = e.target;
    setCitaForm(prev => ({ ...prev, [name]: value }));
  };

  const toggleServicio = (id) => {
    setServiciosSel(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleCitaSubmit = async (e) => {
    e.preventDefault();
    if (!citaForm.nombre || !citaForm.telefono || !citaForm.id_sucursal || serviciosSel.length === 0 || !citaForm.fecha || !citaForm.hora) {
      setCitaError(t('cita.alertRequired'));
      return;
    }
    try {
      const res = await fetch(`${API_URL}/citas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...citaForm, servicios: serviciosSel })
      });
      const data = await res.json();
      if (data.success) {
        setCitaEnviada(true);
        setCitaError('');
        setCitaForm({ nombre: '', telefono: '', correo: '', id_sucursal: '', fecha: '', hora: '', notas: '' });
        setServiciosSel([]);
      } else {
        setCitaError(data.error || t('cita.error'));
      }
    } catch (err) {
      setCitaError(t('cita.error'));
    }
  };

  const toggleServicios = () => {
    setServicioActivo(servicioActivo === 'all' ? null : 'all');
  };

  const services = {
    unas: { image: imgManicure, items: ["acrilicas", "poligel", "softgel", "banoacrilico", "barridoacrilico", "barridopoligel", "manicuresemi", "manicurerubber", "manicuretra", "pedicuresemi", "pedicuretra", "extraccion", "limpieza"] },
    pestanas: { image: imgPestanas, items: ["pelopelo", "efectorimel", "hibridas", "tecnologica", "puntopunto", "lifting", "henna", "laminado", "borrarpig", "aumentar", "microblading", "microshading", "efectopolvo"], label: "pestanas" },
    cabello: { image: imgCabello, items: ["cortes", "botox", "repolarizacion", "tintes", "alisados"] },
    otros: { image: logoImage, items: ["depicompletas", "depicera", "limpiezafacial"], label: "otros" }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, archivo: e.target.files[0] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.correo || !formData.telefono) {
      alert(t('work.alertRequired'));
      return;
    }

    const mailtoLink = `mailto:${CORREO_TRABAJO}?subject=Postulación de Trabajo - ${encodeURIComponent(formData.nombre)}&body=${encodeURIComponent(
      `Nombre: ${formData.nombre}\nCorreo: ${formData.correo}\nTeléfono: ${formData.telefono}`
    )}`;
    window.location.href = mailtoLink;
    
    setFormEnviado(true);
    setFormData({ nombre: '', correo: '', telefono: '', archivo: null });
    alert(t('work.alertSuccess'));
  };

  const handleNavClick = (targetId) => {
    setMenuOpen(false);
    if (targetId === 'cuenta' || targetId === 'cita') {
      setVista('cuenta');
      window.scrollTo(0, 0);
      return;
    }
    setVista('home');
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="spa-container">
      <nav className="navbar">
        <button className="navbar-logo" onClick={() => { setVista('home'); window.scrollTo(0, 0); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }} aria-label="Ir al inicio">
          <img src={logoImage} alt="Lush Nails Spa" />
          <span>{t('brand')}</span>
        </button>
        <div className="navbar-links">
          <button onClick={() => handleNavClick('about')}>{t('nav.about')}</button>
          <button onClick={() => handleNavClick('services')}>{t('nav.services')}</button>
          <button onClick={() => handleNavClick('cita')}>{t('nav.cita')}</button>
          <button onClick={() => handleNavClick('horarios')}>Horarios</button>
          <button onClick={() => handleNavClick('gallery')}>{t('nav.gallery')}</button>
          <button onClick={() => handleNavClick('branches')}>{t('nav.branches')}</button>
          <button onClick={() => handleNavClick('contact')}>{t('nav.contact')}</button>
          <button onClick={() => handleNavClick('work')}>{t('nav.work')}</button>
          <button onClick={() => handleNavClick('cuenta')} className="cuenta-btn">{cliente ? t('nav.miCuenta') : t('nav.ingresar')}</button>
        </div>
      </nav>

      <div className={`fab-menu mobile-menu ${menuOpen ? 'active' : ''}`}>
        <button onClick={() => { handleNavClick('cuenta'); setMenuOpen(false); }} className="cuenta-btn">{cliente ? t('nav.miCuenta') : t('nav.ingresar')}</button>
        <button onClick={() => handleNavClick('about')}>{t('nav.about')}</button>
        <button onClick={() => handleNavClick('services')}>{t('nav.services')}</button>
        <button onClick={() => handleNavClick('gallery')}>{t('nav.gallery')}</button>
        <button onClick={() => handleNavClick('branches')}>{t('nav.branches')}</button>
        <button onClick={() => handleNavClick('contact')}>{t('nav.contact')}</button>
        <button onClick={() => handleNavClick('work')}>{t('nav.work')}</button>
      </div>
      {menuOpen && <div className="menu-overlay" onClick={() => setMenuOpen(false)}></div>}

      {vista === 'home' && (<>
      <section className="hero">
        <div className="hero-logo mobile-only">
          <img src={logoImage} alt="Lush Nails Spa" />
          <span>LUSH NAILS SPA</span>
          <button className="fab-button mobile-only" onClick={() => setMenuOpen(!menuOpen)}>
            <span>{menuOpen ? '✕' : '☰'}</span>
          </button>
        </div>
        <div className="hero-content animate-fade" style={{ textAlign: 'center' }}>
          <h1 style={{color: '#000000'}}>{t('hero.title')}</h1>
          <p style={{color: '#000000'}}>{t('hero.description')}</p>
          <div className="hero-cta" style={{ justifyContent: 'center', display: 'flex', gap: '15px' }}>
            <a href="https://wa.me/message/C756ADRGK277F1" target="_blank" rel="noopener noreferrer" className="premium-button">{t('hero.bookBtn')}</a>
            <a href="#services" className="outline-button">{t('hero.viewServices')}</a>
          </div>
        </div>
        <div className="hero-image-container">
          <img 
            src={unas12} 
            alt="Lush Nails Premium" 
            className="hero-image"
          />
        </div>
      </section>

      <section id="about" className="about">
        <div className="about-grid">
          <div className="about-image">
            <img src={unas18} alt="Spa Experience" />
          </div>
          <div className="about-text">
            <span className="section-subtitle">{t('about.subtitle')}</span>
            <h2 style={{color: '#000000'}}>{t('about.title')}</h2>
            <p>{t('about.p1')}</p>
            <p>{t('about.p2')}</p>
            <div className="about-features">
              <span>{t('about.feature1')}</span>
              <span>{t('about.feature2')}</span>
              <span>{t('about.feature3')}</span>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="services">
        <div className="section-title">
          <span className="section-subtitle" style={{color: '#000000', fontSize: '2rem', fontWeight: '600'}}>{t('services.title')}</span>
          <div className="divider"></div>
        </div>
        
        <div className="services-container">
          {Object.entries(services).map(([category, data]) => {
            return (
              <div key={category} className={`service-category-block ${category === 'otros' ? 'service-category-otros' : ''} ${servicioActivo === 'all' || servicioActivo === category ? 'expanded' : ''}`}>
              <img 
                src={data.image} 
                alt={category}
                onClick={() => setServicioActivo(servicioActivo === 'all' ? null : 'all')}
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'block'
                }} 
              />
                <h3 className="category-title" style={category === 'cabello' ? { marginTop: '25px' } : {}}>{t('services.' + category)}</h3>
                <span style={{ cursor: 'pointer', fontSize: '20px', display: 'flex', justifyContent: 'center', color: '#2F4A34' }} onClick={toggleServicios}>
                  {servicioActivo === 'all' ? '▲' : '▼'}
                </span>
                {(servicioActivo === 'all') && (
                <ul className="service-list" style={{marginTop: '20px', paddingLeft: '20px'}}>
                  {data.items.map((item, index) => (
                    <li key={index} style={{marginBottom: '10px', listStyle: 'none'}}>🌿 {t('services.items.' + item)}</li>
                  ))}
                </ul>
                )}
            </div>
            );
          })}
        </div>
      </section>

      <section id="gallery" className="gallery">
        <div className="section-title">
          <h2 style={{color: '#000000', fontSize: '2rem', fontWeight: '600'}}>{t('gallery.title')}</h2>
          <div className="divider"></div>
        </div>
        <div className="gallery-grid">
          {fotosUñas.map((foto, index) => (
            <div key={index} className="gallery-item">
              <img 
                src={foto} 
                alt={`Trabajo de uñas ${index + 1}`} 
                onClick={() => setImagenAmpliada(foto)}
              />
            </div>
          ))}
        </div>
        {imagenAmpliada && (
          <div className="lightbox" onClick={() => setImagenAmpliada(null)}>
            <span className="lightbox-close">&times;</span>
            <img src={imagenAmpliada} alt="Imagen ampliada" />
          </div>
        )}
      </section>

      <section id="branches" className="branches">
        <div className="section-title">
          <span className="section-subtitle">{t('branches.subtitle')}</span>
          <h2>{t('branches.title')}</h2>
          <div className="divider"></div>
        </div>
        <div className="branches-grid">
          <div className="branch-card glass-card">
            <h3>{t('branches.sanantonio')}</h3>
            <p>{t('branches.sanantonioDir')}</p>
            <div className="map-container">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.0436544892345!2d-78.45093467129654!3d-0.011645414317095574!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91d47efc3d3f0b7d%3A0x0!2sSan+Antonio+de+Pichincha!5e0!3m2!1ses!2sec!4v1700000000000" 
                width="100%" 
                height="200" 
                style={{border:0}} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="San Antonio de Pichincha"
              ></iframe>
              <a href="https://www.google.com/maps/search/?api=1&query=-0.011645414317095574,-78.44848686349431" target="_blank" rel="noopener noreferrer" className="map-overlay" aria-label="Abrir ubicación San Antonio de Pichincha en Google Maps"></a>
            </div>
            <a href={WHATSAPP_LINKS.sanAntonio} target="_blank" rel="noopener noreferrer" className="whatsapp-branch-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              {t('branches.contactar')}
            </a>
          </div>
          <div className="branch-card glass-card">
            <h3>{t('branches.pusuqui')}</h3>
            <p>{t('branches.pusuquiDir')}</p>
            <div className="map-container">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.4567890123456!2d-78.45678901234567!3d-0.008!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91d47ef123456789%3A0x0!2sCalle+Rafael+Cuervo%2C+Pusuqui!5e0!3m2!1ses!2sec!4v1700000000000" 
                width="100%" 
                height="200" 
                style={{border:0}} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Pusuqui"
              ></iframe>
              <a href="https://www.google.com/maps/search/?api=1&query=Calle+Rafael+Cuervo+Pusuqui+Quito" target="_blank" rel="noopener noreferrer" className="map-overlay" aria-label="Abrir ubicación Pusuqui en Google Maps"></a>
            </div>
            <a href={WHATSAPP_LINKS.pusuqui} target="_blank" rel="noopener noreferrer" className="whatsapp-branch-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              {t('branches.contactar')}
            </a>
          </div>
          <div className="branch-card glass-card">
            <h3>{t('branches.calderon')}</h3>
            <p>{t('branches.calderonDir')}</p>
            <div className="map-container">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.289376953546!2d-78.43545201888296!3d-0.09247969680315883!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91d5ab7e9c559f49%3A0x0!2sCalder%C3%B3n%2C+Quito!5e0!3m2!1ses!2sec!4v1700000000000" 
                width="100%" 
                height="200" 
                style={{border:0}} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Calderon"
              ></iframe>
              <a href="https://www.google.com/maps/search/?api=1&query=-0.09247969680315883,-78.43545201888296" target="_blank" rel="noopener noreferrer" className="map-overlay" aria-label="Abrir ubicación Calderon en Google Maps"></a>
            </div>
            <a href={WHATSAPP_LINKS.calderon} target="_blank" rel="noopener noreferrer" className="whatsapp-branch-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              {t('branches.contactar')}
            </a>
          </div>
        </div>
      </section>

      <section id="contact" className="contact" style={{ backgroundColor: '#2F4A34' }}>
        <div className="contact-wrapper glass-card" style={{ backgroundColor: '#F5F5DC' }}>
          <div className="contact-info">
            <h2 style={{ color: 'black' }}>{t('contact.title')}</h2>
            <a href="https://wa.me/message/C756ADRGK277F1" target="_blank" rel="noopener noreferrer" className="whatsapp-button">
              {t('contact.whatsapp')}
            </a>
          </div>
          <div className="contact-footer-info">
            <p style={{ color: 'black' }}>{t('contact.description')}</p>
            <span className="slogan" style={{ color: 'black' }}>{t('contact.slogan')}</span>
          </div>
        </div>
      </section>

      <section id="work" className="work-with-us">
        <div className="section-title">
          <span className="section-subtitle">{t('work.subtitle')}</span>
          <h2>{t('work.title')}</h2>
          <div className="divider"></div>
        </div>
        
        <div className="work-form">
          {formEnviado ? (
            <div className="success-message">
              <h3>{t('work.successTitle')}</h3>
              <p>{t('work.successMsg')}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                  placeholder={t('work.namePlaceholder')}
                />
              </div>
              
              <div className="form-group">
                <input
                  type="email"
                  id="correo"
                  name="correo"
                  value={formData.correo}
                  onChange={handleInputChange}
                  required
                  placeholder={t('work.emailPlaceholder')}
                />
              </div>
              
              <div className="form-group">
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  required
                  placeholder={t('work.phonePlaceholder')}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="archivo">{t('work.fileLabel')}</label>
                <input
                  type="file"
                  id="archivo"
                  name="archivo"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <p className="file-hint">{t('work.fileHint')}</p>
              </div>
              
              <button type="submit" className="submit-btn">
                {t('work.submit')}
              </button>
            </form>
          )}
        </div>
      </section>
      </>)}

      {vista === 'cuenta' && (<>
      <div className="cuenta-nav">
        <button className="btn-volver" onClick={() => setVista('home')}>← {t('cuenta.volver')}</button>
      </div>
      <section id="cuenta" className="cuenta">
        <div className="section-title">
          <span className="section-subtitle">{t('cuenta.subtitle')}</span>
          <h2>{t('cuenta.title')}</h2>
          <div className="divider"></div>
        </div>

        <div className="cuenta-wrapper">
          {!cliente ? (
            <div className="auth-box">
              <div className="auth-tabs">
                <button className={authMode === 'login' ? 'active' : ''} onClick={() => { setAuthMode('login'); setAuthError(''); }}>{t('cuenta.loginTab')}</button>
                <button className={authMode === 'register' ? 'active' : ''} onClick={() => { setAuthMode('register'); setAuthError(''); }}>{t('cuenta.registerTab')}</button>
              </div>
              <form onSubmit={handleAuthSubmit} className="auth-form">
                {authMode === 'register' && (
                  <>
                    <div className="form-group">
                      <input type="text" name="nombre" value={authForm.nombre} onChange={handleAuthChange} required placeholder={t('cuenta.namePlaceholder')} />
                    </div>
                    <div className="form-group">
                      <input type="tel" name="telefono" value={authForm.telefono} onChange={handleAuthChange} required placeholder={t('cuenta.phonePlaceholder')} />
                    </div>
                  </>
                )}
                <div className="form-group">
                  <input type="email" name="correo" value={authForm.correo} onChange={handleAuthChange} required placeholder={t('cuenta.emailPlaceholder')} />
                </div>
                <div className="form-group">
                  <input type="password" name="password" value={authForm.password} onChange={handleAuthChange} required placeholder={t('cuenta.passwordPlaceholder')} />
                </div>
                {authError && <p className="error-msg">{authError}</p>}
                <button type="submit" className="submit-btn">{authMode === 'login' ? t('cuenta.loginBtn') : t('cuenta.registerBtn')}</button>
              </form>
            </div>
          ) : (
            <div className="panel-cliente">
              <div className="panel-cliente-header">
                <h3>{t('cuenta.welcome')}, {cliente.nombre}!</h3>
                <button className="btn-logout" onClick={handleLogout}>{t('cuenta.logout')}</button>
              </div>
              <p className="panel-cliente-desc">{t('cuenta.panelDesc')}</p>

              <h4>{t('cuenta.misCitas')}</h4>
              {misCitas.length === 0 ? (
                <p className="empty-citas">{t('cuenta.noCitas')}</p>
              ) : (
                <div className="mis-citas-list">
                  {misCitas.map(c => (
                    <div key={c.id} className="cita-card">
                      <span className={`cita-estado badge-${c.estado}`}>{c.estado}</span>
                      <strong>{c.servicios || c.servicio || '—'}</strong>
                      <span>{new Date(c.fecha).toLocaleDateString()} · {c.hora} · {c.sucursal}</span>
                      {c.notas && <em>{c.notas}</em>}
                      <div className="cita-acciones">
                        {c.estado === 'pendiente' && (
                          <button className="btn-cancelar-cita" onClick={() => handleCancelarCita(c.id)}>{t('cuenta.cancelCita')}</button>
                        )}
                        {(c.estado === 'cancelada' || c.estado === 'completada') && (
                          <button className="btn-eliminar-cita" onClick={() => handleEliminarCita(c.id)}>{t('cuenta.deleteCita')}</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="panel-cliente-books">
                <h4>{t('cuenta.verServicios')}</h4>
                <p>{t('cuenta.verServiciosDesc')}</p>
                <button className="submit-btn" onClick={() => handleNavClick('services')}>{t('nav.services')}</button>
                <button className="submit-btn" onClick={() => handleNavClick('cita')}>{t('nav.cita')}</button>
              </div>
            </div>
          )}
        </div>
      </section>

      {cliente && (
      <section id="cita" className="cita">
        <div className="section-title">
          <span className="section-subtitle">{t('cita.subtitle')}</span>
          <h2>{t('cita.title')}</h2>
          <div className="divider"></div>
        </div>

        <div className="cita-wrapper">
          {citaEnviada ? (
            <div className="success-message">
              <h3>{t('cita.successTitle')}</h3>
              <p>{t('cita.successMsg')}</p>
              <button className="submit-btn" onClick={() => setCitaEnviada(false)}>{t('cita.newCita')}</button>
            </div>
          ) : (
            <form onSubmit={handleCitaSubmit} className="cita-form">
              <div className="form-group">
                <input type="text" name="nombre" value={citaForm.nombre} onChange={handleCitaChange} required placeholder={t('cita.namePlaceholder')} />
              </div>
              <div className="form-group">
                <input type="tel" name="telefono" value={citaForm.telefono} onChange={handleCitaChange} required placeholder={t('cita.phonePlaceholder')} />
              </div>
              <div className="form-group">
                <input type="email" name="correo" value={citaForm.correo} onChange={handleCitaChange} placeholder={t('cita.emailPlaceholder')} />
              </div>
              <div className="form-group">
                <select name="id_sucursal" value={citaForm.id_sucursal} onChange={handleCitaChange} required>
                  <option value="">{t('cita.sucursalPlaceholder')}</option>
                  {sucursalesDb.map(s => (
                    <option key={s.id} value={s.id}>{s.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">{t('cita.servicioPlaceholder')}</label>
                <div className="chips-list">
                  {serviciosDb.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      className={`chip ${serviciosSel.includes(s.id) ? 'chip-selected' : ''}`}
                      onClick={() => toggleServicio(s.id)}
                    >
                      {s.nombre}{serviciosSel.includes(s.id) ? ' ✓' : ''}
                    </button>
                  ))}
                </div>
                {serviciosSel.length > 0 && (
                  <div className="chips-selected">
                    {serviciosSel.map(id => {
                      const svc = serviciosDb.find(s => s.id === id);
                      return (
                        <span key={id} className="chip-tag">
                          {svc ? svc.nombre : id}
                          <button type="button" className="chip-remove" aria-label={`Quitar ${svc ? svc.nombre : id}`} onClick={() => toggleServicio(id)}>×</button>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="form-group form-row">
                <input type="date" name="fecha" value={citaForm.fecha} onChange={handleCitaChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">{t('cita.horaPlaceholder')}</label>
                  <div className="time-input-row">
                    <div style={{display:'flex',gap:12,alignItems:'center'}}>
                      <input
                        type="time"
                        name="hora_input"
                        value={citaForm.hora}
                        onChange={e => setCitaForm(prev => ({ ...prev, hora: e.target.value }))}
                        min="09:00"
                        max="19:00"
                        step="900"
                        required
                      />
                      <label style={{fontSize: '0.9rem'}}>
                        <input type="checkbox" checked={showMatrix} onChange={e => setShowMatrix(e.target.checked)} /> Mostrar tabla (estilo cine)
                      </label>
                    </div>
                    <div className="slots-msg">Elige una hora entre 09:00 y 19:00. El sistema validará disponibilidad al enviar.</div>
                    {showMatrix && (
                      <div style={{marginTop:12}}>
                        {slotsDb.length === 0 ? (
                          <div className="slots-grid"><span className="slots-msg">No hay franjas precomputadas para la fecha/sucursal/servicios seleccionados.</span></div>
                        ) : (
                          <SlotsMatrix slots={slotsDb} selected={citaForm.hora} onSelect={(hora) => setCitaForm(prev => ({...prev, hora}))} cols={6} />
                        )}
                      </div>
                    )}
                  </div>
                <input type="hidden" name="hora" value={citaForm.hora} />
              </div>
              <div className="form-group">
                <textarea name="notas" value={citaForm.notas} onChange={handleCitaChange} placeholder={t('cita.notasPlaceholder')} rows="2" />
              </div>
              {citaError && <p className="error-msg">{citaError}</p>}
              <button type="submit" className="submit-btn">{t('cita.submit')}</button>
            </form>
          )}
        </div>
      </section>
      )}
      </>)}

      {vista === 'horarios' && (
        <section id="horarios" className="cita">
          <div className="section-title">
            <span className="section-subtitle">Horarios</span>
            <h2>Visualizador de franjas</h2>
            <div className="divider"></div>
          </div>
          <div className="cita-wrapper">
            <div className="form-group form-row">
              <input type="date" value={adminFecha} onChange={e => setAdminFecha(e.target.value)} />
              <select value={adminSucursal} onChange={e => setAdminSucursal(e.target.value)}>
                <option value="">Seleccionar sucursal</option>
                {sucursalesDb.map(s => (
                  <option key={s.id} value={s.id}>{s.nombre}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Servicios (opcional)</label>
              <div className="chips-list">
                {serviciosDb.map(s => (
                  <button key={s.id} type="button" className={`chip ${adminServicios.includes(s.id) ? 'chip-selected' : ''}`} onClick={() => setAdminServicios(prev => prev.includes(s.id) ? prev.filter(x => x !== s.id) : [...prev, s.id])}>
                    {s.nombre}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              {adminLoading ? (
                <div className="slots-grid"><span className="slots-msg">Cargando horarios…</span></div>
              ) : adminSlotsMatrix.empleados.length === 0 ? (
                <div className="slots-grid"><span className="slots-msg">Seleccione fecha y sucursal para ver franjas.</span></div>
              ) : (
              <div className="admin-matrix">
                <table className="admin-matrix-table">
                  <thead>
                    <tr>
                      <th>Empleado</th>
                      {adminSlotsMatrix.times.map((t, i) => <th key={i}>{t}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {adminSlotsMatrix.empleados.map(emp => (
                      <tr key={emp.id}>
                        <td className="emp-name">{emp.nombre}</td>
                        {emp.slots.map((s, si) => (
                          <td key={si} className={`emp-cell ${s.trabaja ? '' : 'emp-off'}`}>
                            <button className={`seat-btn ${s.ocupado ? 'seat-busy' : s.trabaja ? 'seat-free' : 'seat-off'}`} disabled={!s.trabaja || s.ocupado} title={s.ocupado && s.detalle ? `${s.detalle.cliente}` : ''}>
                              {s.hora}
                            </button>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              )}
            </div>
          </div>
        </section>
      )}

      <footer className="footer">
        <p>© {new Date().getFullYear()} LUSH NAILS SPA. {t('footer.rights')}</p>
      </footer>

      <div className="social-float">
        <a href={REDES_SOCIALES.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" data-tooltip="Facebook">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </a>
        <a href={REDES_SOCIALES.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" data-tooltip="Instagram">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        </a>
        <a href={REDES_SOCIALES.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok" data-tooltip="TikTok">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
          </svg>
        </a>
      </div>

      <div className="whatsapp-float-container">
        <button 
          className="whatsapp-btn"
          onClick={() => setWhatsappMenuOpen(!whatsappMenuOpen)}
          aria-label={t('whatsapp.aria')}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </button>
        {whatsappMenuOpen && (
          <div className="whatsapp-menu">
            <a href={WHATSAPP_LINKS.sanAntonio} target="_blank" rel="noopener noreferrer" className="whatsapp-option">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
              <span>San Antonio</span>
            </a>
            <a href={WHATSAPP_LINKS.pusuqui} target="_blank" rel="noopener noreferrer" className="whatsapp-option">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
              <span>Pusuqui</span>
            </a>
            <a href={WHATSAPP_LINKS.calderon} target="_blank" rel="noopener noreferrer" className="whatsapp-option">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
              <span>Calderon</span>
            </a>
          </div>
        )}
      </div>
      <AccessibilityWidget />
    </div>
  );
}

export default App;
