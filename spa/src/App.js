import React, { useState, useEffect } from 'react';
import './styles/App.css';
import './styles/menu.css';
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

  const toggleServicios = () => {
    setServicioActivo(servicioActivo === 'all' ? null : 'all');
  };

  const services = {
    uñas: { image: imgManicure, items: ["ACRILICAS", "POLIGEL", "SOFT GEL", "BAÑO ACRILICO", "BARRIDO ACRILICO", "BARRIDO POLIGEL", "MANICURE SEMIPERMANENTE", "MANICURE NIVELACION RUBBER", "MANICURE TRADICIONAL", "PEDICURE SEMIP. LIMPIEZA PROFUNDA", "PEDICURE TRADICIONAL", "EXTRACCION UÑEROS", "LIMPIEZA MANOS O PIES"] },
    pestañas: { image: imgPestanas, items: ["PELO A PELO CLASICAS", "PELO A PELO EFECTO RIMEL", "PELO A PELO HIBRIDAS", "PELO A PELO TECNOLOGICA", "PUNTO X PUNTO CLASICAS", "LIFTING", "SEMIPERMANENTE HENNA", "LAMINADO", "BORRAR PIGMENTACION", "AUMENTAR CEJAS", "MICROBLADING", "MICROSHADING", "EFECTO POLVO"], label: "PESTAÑAS Y CEJAS" },
    cabello: { image: imgCabello, items: ["Cortes", "Botox capilar", "Repolarización", "Tintes", "Alisados"] },
    otros: { image: logoImage, items: ["Depilaciones completas", "Depilaciones con cera o hilo", "Limpieza facial"], label: "OTROS" }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, archivo: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.correo || !formData.telefono) {
      alert('Por favor completa todos los campos');
      return;
    }

    try {
      const res = await fetch('http://localhost:4000/api/postular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formData.nombre,
          correo: formData.correo,
          telefono: formData.telefono
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error('Error al enviar');
      setFormEnviado(true);
      setFormData({ nombre: '', correo: '', telefono: '', archivo: null });
      alert('¡Postulación enviada con éxito! Nos pondremos en contacto contigo.');
    } catch (err) {
      alert('Error al enviar la postulación. Intenta de nuevo.');
    }
  };

  const handleNavClick = (targetId) => {
    setMenuOpen(false);
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
        <div className="navbar-logo">
          <img src={logoImage} alt="Lush Nails Spa" />
          <span>LUSH NAILS SPA</span>
        </div>
        <div className="navbar-links">
          <button onClick={() => handleNavClick('about')}>Nosotros</button>
          <button onClick={() => handleNavClick('services')}>Servicios</button>
          <button onClick={() => handleNavClick('gallery')}>Galería</button>
          <button onClick={() => handleNavClick('branches')}>Sucursales</button>
          <button onClick={() => handleNavClick('contact')}>Contacto</button>
          <button onClick={() => handleNavClick('work')}>Trabaja</button>
          <button onClick={() => window.history.back()} className="directorio-btn">Directorio</button>
        </div>
      </nav>

      <div className={`fab-menu mobile-menu ${menuOpen ? 'active' : ''}`}>
        <button onClick={() => { window.history.back(); setMenuOpen(false); }} className="directorio-btn">Directorio</button>
        <button onClick={() => handleNavClick('about')}>Nosotros</button>
        <button onClick={() => handleNavClick('services')}>Servicios</button>
        <button onClick={() => handleNavClick('gallery')}>Galería</button>
        <button onClick={() => handleNavClick('branches')}>Sucursales</button>
        <button onClick={() => handleNavClick('contact')}>Contacto</button>
        <button onClick={() => handleNavClick('work')}>Trabaja</button>
      </div>
      {menuOpen && <div className="menu-overlay" onClick={() => setMenuOpen(false)}></div>}

      <section className="hero">
        <div className="hero-logo mobile-only">
          <img src={logoImage} alt="Lush Nails Spa" />
          <span>LUSH NAILS SPA</span>
          <button className="fab-button mobile-only" onClick={() => setMenuOpen(!menuOpen)}>
            <span>{menuOpen ? '✕' : '☰'}</span>
          </button>
        </div>
        <div className="hero-content animate-fade" style={{ textAlign: 'center' }}>
          <h1 style={{color: '#000000'}}>Elegancia en cada detalle</h1>
          <p style={{color: '#000000'}}>En Lush Nails Spa transformamos tu belleza con servicios profesionales de uñas, pestañas, cabello y más. Disfruta de un espacio diseñado para consentirte y hacerte sentir única.</p>
          <div className="hero-cta" style={{ justifyContent: 'center', display: 'flex', gap: '15px' }}>
            <a href="https://wa.me/message/C756ADRGK277F1" target="_blank" rel="noopener noreferrer" className="premium-button">Reservar Cita</a>
            <a href="#services" className="outline-button">Ver Servicios</a>
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
            <span className="section-subtitle">¿Quiénes Somos?</span>
            <h2 style={{color: '#000000'}}>Dedicados a tu Bienestar</h2>
            <p>
              En Lush Nails somos un salón de belleza dedicado a resaltar la belleza y el estilo de cada persona a través de servicios profesionales y personalizados.
            </p>
            <p>
              Nuestro compromiso es crear un ambiente cómodo y relajante donde cada cliente pueda disfrutar de una experiencia de belleza completa. Creemos que cada visita debe ser un momento para consentirte y salir sintiéndote renovada y feliz con tu imagen.
            </p>
            <div className="about-features">
              <span>Calidad Premium</span>
              <span>Atención Detallada</span>
              <span>Ambiente Relajante</span>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="services">
        <div className="section-title">
          <span className="section-subtitle" style={{color: '#000000', fontSize: '2rem', fontWeight: '600'}}>Nuestros Servicios</span>
          <div className="divider"></div>
        </div>
        
        <div className="services-container">
          {Object.entries(services).map(([category, data]) => {
            return (
              <div key={category} className={`service-category-block ${servicioActivo === 'all' || servicioActivo === category ? 'expanded' : ''}`}>
              <img 
                src={data.image} 
                alt={category}
                onClick={() => setServicioActivo(servicioActivo === 'all' ? null : 'all')}
                style={{
                  width: category === 'otros' ? '50%' : '100%',
                  height: 'auto',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'block',
                  margin: category === 'otros' ? '75px auto' : 'unset'
                }} 
              />
                <h3 className="category-title" style={category === 'otros' ? { marginTop: '125px' } : category === 'cabello' ? { marginTop: '25px' } : {}}>{data.label || category.toUpperCase()}</h3>
                <span style={{ cursor: 'pointer', fontSize: '20px', display: 'flex', justifyContent: 'center', color: '#2F4A34' }} onClick={toggleServicios}>
                  {servicioActivo === 'all' ? '▲' : '▼'}
                </span>
                {(servicioActivo === 'all') && (
                <ul className="service-list" style={{marginTop: '20px', paddingLeft: '20px'}}>
                  {data.items.map((item, index) => (
                    <li key={index} style={{marginBottom: '10px', listStyle: 'none'}}>🌿 {item}</li>
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
          <h2 style={{color: '#000000', fontSize: '2rem', fontWeight: '600'}}>Galería</h2>
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
          <span className="section-subtitle">Dónde encontrarnos</span>
          <h2>Nuestras Sucursales</h2>
          <div className="divider"></div>
        </div>
        <div className="branches-grid">
          <div className="branch-card glass-card">
            <h3>San Antonio de Pichincha</h3>
            <p>Calles: 13 de Junio y Santa Ana</p>
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
              Contactar
            </a>
          </div>
          <div className="branch-card glass-card">
            <h3>Pusuqui</h3>
            <p>Calle Rafael Cuervo</p>
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
              Contactar
            </a>
          </div>
          <div className="branch-card glass-card">
            <h3>Calderon</h3>
            <p>Capitán Génovanny calles y Derby</p>
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
              Contactar
            </a>
          </div>
        </div>
      </section>

      <section id="contact" className="contact" style={{ backgroundColor: '#2F4A34' }}>
        <div className="contact-wrapper glass-card" style={{ backgroundColor: '#F5F5DC' }}>
          <div className="contact-info">
            <h2 style={{ color: 'black' }}>Agenda tu cita</h2>
            <a href="https://wa.me/message/C756ADRGK277F1" target="_blank" rel="noopener noreferrer" className="whatsapp-button">
              WhatsApp Directo
            </a>
          </div>
          <div className="contact-footer-info">
            <p style={{ color: 'black' }}>Cada visita es un momento para consentirte.</p>
            <span className="slogan" style={{ color: 'black' }}>"Elegancia en cada detalle"</span>
          </div>
        </div>
      </section>

      <section id="work" className="work-with-us">
        <div className="section-title">
          <span className="section-subtitle">Únete a Nuestro Equipo</span>
          <h2>Trabaja con Nosotros</h2>
          <div className="divider"></div>
        </div>
        
        <div className="work-form">
          {formEnviado ? (
            <div className="success-message">
              <h3>¡Gracias por tu interés!</h3>
              <p>Hemos recibido tu información. Te contactaremos pronto.</p>
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
                  placeholder="Nombre Completo *"
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
                  placeholder="Correo Electrónico *"
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
                  placeholder="Teléfono *"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="archivo">Hoja de Vida / Portafolio (Opcional)</label>
                <input
                  type="file"
                  id="archivo"
                  name="archivo"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <p className="file-hint">Formatos aceptados: PDF, DOC, JPG, PNG (máx. 5MB)</p>
              </div>
              
              <button type="submit" className="submit-btn">
                Enviar Postulación
              </button>
            </form>
          )}
        </div>
      </section>

      <footer className="footer">
        <p>© {new Date().getFullYear()} LUSH NAILS SPA. Todos los derechos reservados.</p>
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
          aria-label="Abrir menú de ubicaciones"
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
    </div>
  );
}

export default App;
