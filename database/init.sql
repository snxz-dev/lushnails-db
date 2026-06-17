-- ============================================================================
-- LUSH NAILS SPA - Script de Inicialización de Base de Datos
-- Motor: PostgreSQL 16
-- Proyecto: Portal Empresarial Lush Nails Spa
-- Descripción: Crea la estructura completa de la base de datos con sus
--              relaciones, restricciones, índices y datos semilla.
-- ============================================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- 1. TABLAS DEL SISTEMA (CATÁLOGOS BASE)
-- ============================================================================

-- 1.1. Categorías de Servicio
-- Agrupa los servicios en categorías (Uñas, Pestañas y Cejas, Cabello, Otros)
CREATE TABLE IF NOT EXISTS categoria_servicio (
    id              SERIAL PRIMARY KEY,
    nombre          VARCHAR(50)  NOT NULL UNIQUE,
    label           VARCHAR(100),
    imagen_url      VARCHAR(255),
    descripcion     TEXT,
    orden           INTEGER      NOT NULL DEFAULT 0,
    activo          BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- 1.2. Sucursales
-- Ubicaciones físicas del spa (San Antonio, Pusuqui, Calderón)
CREATE TABLE IF NOT EXISTS sucursal (
    id              SERIAL PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL,
    direccion       VARCHAR(255) NOT NULL,
    telefono        VARCHAR(20),
    latitud         DECIMAL(10,7),
    longitud        DECIMAL(10,7),
    link_whatsapp   VARCHAR(255),
    embed_maps      TEXT,
    horario         VARCHAR(255),
    imagen_url      VARCHAR(255),
    orden           INTEGER      NOT NULL DEFAULT 0,
    activo          BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- 1.3. Redes Sociales
-- Configuración de enlaces a redes sociales
CREATE TABLE IF NOT EXISTS configuracion (
    id              SERIAL PRIMARY KEY,
    clave           VARCHAR(100) NOT NULL UNIQUE,
    valor           TEXT         NOT NULL,
    descripcion     VARCHAR(255),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 2. TABLAS DE NEGOCIO
-- ============================================================================

-- 2.1. Servicios
-- Servicios específicos que ofrece cada categoría
CREATE TABLE IF NOT EXISTS servicio (
    id              SERIAL PRIMARY KEY,
    id_categoria    INTEGER      NOT NULL REFERENCES categoria_servicio(id)
                                  ON DELETE RESTRICT ON UPDATE CASCADE,
    nombre          VARCHAR(200) NOT NULL,
    descripcion     TEXT,
    precio          DECIMAL(10,2),
    duracion_minutos INTEGER,
    activo          BOOLEAN      NOT NULL DEFAULT TRUE,
    orden           INTEGER      NOT NULL DEFAULT 0,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- 2.2. Empleados
-- Personal que trabaja en las sucursales (estilistas, manicuristas)
CREATE TABLE IF NOT EXISTS empleado (
    id              SERIAL PRIMARY KEY,
    id_sucursal     INTEGER      REFERENCES sucursal(id)
                                  ON DELETE SET NULL ON UPDATE CASCADE,
    nombre          VARCHAR(150) NOT NULL,
    especialidad    VARCHAR(255),
    telefono        VARCHAR(20),
    horario         VARCHAR(255),
    activo          BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- 2.3. Clientes
-- Información de los clientes del spa
CREATE TABLE IF NOT EXISTS cliente (
    id              SERIAL PRIMARY KEY,
    nombre          VARCHAR(150) NOT NULL,
    telefono        VARCHAR(20)  NOT NULL,
    correo          VARCHAR(255),
    direccion       VARCHAR(255),
    alergias        TEXT,
    notas           TEXT,
    fecha_registro  TIMESTAMP    NOT NULL DEFAULT NOW(),
    ultima_visita   DATE,
    activo          BOOLEAN      NOT NULL DEFAULT TRUE,
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- 2.4. Citas
-- Agendamiento de citas de los clientes
CREATE TABLE IF NOT EXISTS cita (
    id              SERIAL PRIMARY KEY,
    id_cliente      INTEGER      NOT NULL REFERENCES cliente(id)
                                  ON DELETE RESTRICT ON UPDATE CASCADE,
    id_sucursal     INTEGER      NOT NULL REFERENCES sucursal(id)
                                  ON DELETE RESTRICT ON UPDATE CASCADE,
    id_empleado     INTEGER      REFERENCES empleado(id)
                                  ON DELETE SET NULL ON UPDATE CASCADE,
    fecha           DATE         NOT NULL,
    hora            TIME         NOT NULL,
    servicio        VARCHAR(255) NOT NULL,
    estado          VARCHAR(20)  NOT NULL DEFAULT 'pendiente'
                                  CHECK (estado IN ('pendiente', 'confirmada', 'completada', 'cancelada')),
    notas           TEXT,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- 2.5. Postulaciones Laborales
-- Formulario "Trabaja con Nosotros"
CREATE TABLE IF NOT EXISTS postulacion (
    id              SERIAL PRIMARY KEY,
    nombre          VARCHAR(150) NOT NULL,
    correo          VARCHAR(255) NOT NULL,
    telefono        VARCHAR(20)  NOT NULL,
    archivo_cv      VARCHAR(255),
    mensaje         TEXT,
    leida           BOOLEAN      NOT NULL DEFAULT FALSE,
    fecha           TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- 2.6. Galería
-- Imágenes de trabajos realizados (uñas, peinados, etc.)
CREATE TABLE IF NOT EXISTS galeria (
    id              SERIAL PRIMARY KEY,
    titulo          VARCHAR(200),
    url_imagen      VARCHAR(255) NOT NULL,
    categoria       VARCHAR(50),
    orden           INTEGER      NOT NULL DEFAULT 0,
    activo          BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 3. TABLAS DE SEGURIDAD
-- ============================================================================

-- 3.1. Usuarios Administradores
-- Acceso al panel de administración del portal
CREATE TABLE IF NOT EXISTS usuario_admin (
    id              SERIAL PRIMARY KEY,
    nombre          VARCHAR(150) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    rol             VARCHAR(20)  NOT NULL DEFAULT 'admin'
                                  CHECK (rol IN ('admin', 'superadmin')),
    activo          BOOLEAN      NOT NULL DEFAULT TRUE,
    ultimo_acceso   TIMESTAMP,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 4. ÍNDICES
-- ============================================================================

-- Índices para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_servicio_categoria ON servicio(id_categoria);
CREATE INDEX IF NOT EXISTS idx_servicio_activo ON servicio(activo);
CREATE INDEX IF NOT EXISTS idx_empleado_sucursal ON empleado(id_sucursal);
CREATE INDEX IF NOT EXISTS idx_empleado_activo ON empleado(activo);
CREATE INDEX IF NOT EXISTS idx_cliente_telefono ON cliente(telefono);
CREATE INDEX IF NOT EXISTS idx_cliente_correo ON cliente(correo);
CREATE INDEX IF NOT EXISTS idx_cita_fecha ON cita(fecha);
CREATE INDEX IF NOT EXISTS idx_cita_cliente ON cita(id_cliente);
CREATE INDEX IF NOT EXISTS idx_cita_sucursal ON cita(id_sucursal);
CREATE INDEX IF NOT EXISTS idx_cita_estado ON cita(estado);
CREATE INDEX IF NOT EXISTS idx_postulacion_fecha ON postulacion(fecha);
CREATE INDEX IF NOT EXISTS idx_galeria_categoria ON galeria(categoria);
CREATE INDEX IF NOT EXISTS idx_galeria_activo ON galeria(activo);
CREATE INDEX IF NOT EXISTS idx_usuario_admin_email ON usuario_admin(email);

-- ============================================================================
-- 5. FUNCIONES Y TRIGGERS
-- ============================================================================

-- Función para actualizar automáticamente updated_at
CREATE OR REPLACE FUNCTION actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para tablas con updated_at
CREATE TRIGGER trg_categoria_updated
    BEFORE UPDATE ON categoria_servicio
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER trg_sucursal_updated
    BEFORE UPDATE ON sucursal
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER trg_servicio_updated
    BEFORE UPDATE ON servicio
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER trg_empleado_updated
    BEFORE UPDATE ON empleado
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER trg_cliente_updated
    BEFORE UPDATE ON cliente
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER trg_cita_updated
    BEFORE UPDATE ON cita
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER trg_configuracion_updated
    BEFORE UPDATE ON configuracion
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER trg_usuario_admin_updated
    BEFORE UPDATE ON usuario_admin
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

-- ============================================================================
-- 6. DATOS SEMILLA (SEED DATA)
-- ============================================================================

-- 6.1. Categorías de Servicio
INSERT INTO categoria_servicio (nombre, label, imagen_url, descripcion, orden) VALUES
    ('uñas', NULL, NULL, 'Servicios de manicure, pedicure y decoración de uñas', 1),
    ('pestañas', 'PESTAÑAS Y CEJAS', NULL, 'Servicios de pestañas y cejas', 2),
    ('cabello', NULL, NULL, 'Cortes, tintes, alisados y tratamientos capilares', 3),
    ('otros', 'OTROS', NULL, 'Depilaciones y limpieza facial', 4)
ON CONFLICT (nombre) DO NOTHING;

-- 6.2. Servicios por Categoría
-- Categoría: Uñas (id=1)
INSERT INTO servicio (id_categoria, nombre, orden) VALUES
    (1, 'ACRILICAS', 1),
    (1, 'POLIGEL', 2),
    (1, 'SOFT GEL', 3),
    (1, 'BAÑO ACRILICO', 4),
    (1, 'BARRIDO ACRILICO', 5),
    (1, 'BARRIDO POLIGEL', 6),
    (1, 'MANICURE SEMIPERMANENTE', 7),
    (1, 'MANICURE NIVELACION RUBBER', 8),
    (1, 'MANICURE TRADICIONAL', 9),
    (1, 'PEDICURE SEMIP. LIMPIEZA PROFUNDA', 10),
    (1, 'PEDICURE TRADICIONAL', 11),
    (1, 'EXTRACCION UÑEROS', 12),
    (1, 'LIMPIEZA MANOS O PIES', 13);

-- Categoría: Pestañas y Cejas (id=2)
INSERT INTO servicio (id_categoria, nombre, orden) VALUES
    (2, 'PELO A PELO CLASICAS', 1),
    (2, 'PELO A PELO EFECTO RIMEL', 2),
    (2, 'PELO A PELO HIBRIDAS', 3),
    (2, 'PELO A PELO TECNOLOGICA', 4),
    (2, 'PUNTO X PUNTO CLASICAS', 5),
    (2, 'LIFTING', 6),
    (2, 'SEMIPERMANENTE HENNA', 7),
    (2, 'LAMINADO', 8),
    (2, 'BORRAR PIGMENTACION', 9),
    (2, 'AUMENTAR CEJAS', 10),
    (2, 'MICROBLADING', 11),
    (2, 'MICROSHADING', 12),
    (2, 'EFECTO POLVO', 13);

-- Categoría: Cabello (id=3)
INSERT INTO servicio (id_categoria, nombre, orden) VALUES
    (3, 'Cortes', 1),
    (3, 'Botox capilar', 2),
    (3, 'Repolarización', 3),
    (3, 'Tintes', 4),
    (3, 'Alisados', 5);

-- Categoría: Otros (id=4)
INSERT INTO servicio (id_categoria, nombre, orden) VALUES
    (4, 'Depilaciones completas', 1),
    (4, 'Depilaciones con cera o hilo', 2),
    (4, 'Limpieza facial', 3);

-- 6.3. Sucursales
INSERT INTO sucursal (nombre, direccion, link_whatsapp, embed_maps, latitud, longitud, orden) VALUES
    (
        'San Antonio de Pichincha',
        'Calles 13 de Junio y Santa Ana',
        'https://wa.me/message/C756ADRGK277F1',
        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.0436544892345!2d-78.45093467129654!3d-0.011645414317095574!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91d47efc3d3f0b7d%3A0x0!2sSan+Antonio+de+Pichincha!5e0!3m2!1ses!2sec!4v1700000000000',
        -0.0116454,
        -78.4484869,
        1
    ),
    (
        'Pusuqui',
        'Calle Rafael Cuervo',
        'https://wa.me/message/C756ADRGK277F1',
        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.4567890123456!2d-78.45678901234567!3d-0.008!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91d47ef123456789%3A0x0!2sCalle+Rafael+Cuervo%2C+Pusuqui!5e0!3m2!1ses!2sec!4v1700000000000',
        -0.008,
        -78.456789,
        2
    ),
    (
        'Calderón',
        'Capitán Génovanny calles y Derby',
        'https://wa.me/593964268572',
        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.289376953546!2d-78.43545201888296!3d-0.09247969680315883!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91d5ab7e9c559f49%3A0x0!2sCalder%C3%B3n%2C+Quito!5e0!3m2!1ses!2sec!4v1700000000000',
        -0.0924797,
        -78.435452,
        3
    )
ON CONFLICT (id) DO NOTHING;

-- 6.4. Configuración General y Redes Sociales
INSERT INTO configuracion (clave, valor, descripcion) VALUES
    ('correo_contacto', 'ibethcabrera1@gmail.com', 'Correo para recepción de postulaciones laborales'),
    ('facebook_url', 'https://www.facebook.com/share/18bj2qd5A2/?mibextid=wwXIfr', 'URL de Facebook'),
    ('instagram_url', 'https://www.instagram.com/lushnailsspauio?igsh=ZG16ZGVodnpua2F3&utm_source=qr', 'URL de Instagram'),
    ('tiktok_url', 'https://www.tiktok.com/@lushnails7?_r=1&_t=ZS-94vnJqBMOCD', 'URL de TikTok'),
    ('whatsapp_general', 'https://wa.me/message/C756ADRGK277F1', 'WhatsApp general para reservas'),
    ('slogan', 'Elegancia en cada detalle', 'Eslogan del spa'),
    ('horario_general', 'Lunes a Sábado 9:00 - 19:00', 'Horario general de atención')
ON CONFLICT (clave) DO NOTHING;

-- 6.5. Usuario Administrador por DefectO
-- Password por defecto: LushNails2024 (cambiarlo en producción)
INSERT INTO usuario_admin (nombre, email, password_hash, rol) VALUES
    (
        'Administrador',
        'admin@lushnails.com',
        crypt('LushNails2024', gen_salt('bf')),
        'superadmin'
    )
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- 7. VISTAS ÚTILES
-- ============================================================================

-- Vista: Servicios completos con su categoría
CREATE OR REPLACE VIEW v_servicios_completos AS
SELECT
    s.id,
    s.nombre AS servicio,
    cs.nombre AS categoria,
    cs.label AS categoria_label,
    s.precio,
    s.duracion_minutos,
    s.orden
FROM servicio s
JOIN categoria_servicio cs ON s.id_categoria = cs.id
WHERE s.activo = TRUE AND cs.activo = TRUE
ORDER BY cs.orden, s.orden;

-- Vista: Citas con información del cliente y sucursal
CREATE OR REPLACE VIEW v_citas_completas AS
SELECT
    c.id AS cita_id,
    cl.nombre AS cliente,
    cl.telefono AS cliente_telefono,
    s.nombre AS sucursal,
    e.nombre AS empleado,
    c.fecha,
    c.hora,
    c.servicio,
    c.estado,
    c.notas
FROM cita c
JOIN cliente cl ON c.id_cliente = cl.id
JOIN sucursal s ON c.id_sucursal = s.id
LEFT JOIN empleado e ON c.id_empleado = e.id
ORDER BY c.fecha DESC, c.hora DESC;

-- Vista: Próximas citas (pendientes y confirmadas)
CREATE OR REPLACE VIEW v_proximas_citas AS
SELECT * FROM v_citas_completas
WHERE estado IN ('pendiente', 'confirmada')
  AND (fecha > CURRENT_DATE OR (fecha = CURRENT_DATE AND hora >= CURRENT_TIME))
ORDER BY fecha, hora;

-- ============================================================================
-- 8. FUNCIONES DE NEGOCIO
-- ============================================================================

-- Función: Registrar una nueva cita con validación de horario
CREATE OR REPLACE FUNCTION registrar_cita(
    p_cliente_nombre VARCHAR,
    p_cliente_telefono VARCHAR,
    p_id_sucursal INTEGER,
    p_fecha DATE,
    p_hora TIME,
    p_servicio VARCHAR,
    p_notas TEXT DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
    v_id_cliente INTEGER;
    v_id_cita INTEGER;
BEGIN
    -- Buscar o crear el cliente
    SELECT id INTO v_id_cliente
    FROM cliente
    WHERE telefono = p_cliente_telefono;

    IF v_id_cliente IS NULL THEN
        INSERT INTO cliente (nombre, telefono)
        VALUES (p_cliente_nombre, p_cliente_telefono)
        RETURNING id INTO v_id_cliente;
    ELSE
        UPDATE cliente SET nombre = p_cliente_nombre, updated_at = NOW()
        WHERE id = v_id_cliente;
    END IF;

    -- Validar que no haya cita duplicada en el mismo horario
    IF EXISTS (
        SELECT 1 FROM cita
        WHERE id_sucursal = p_id_sucursal
          AND fecha = p_fecha
          AND hora = p_hora
          AND estado != 'cancelada'
    ) THEN
        RAISE EXCEPTION 'Ya existe una cita en ese horario para esta sucursal';
    END IF;

    -- Crear la cita
    INSERT INTO cita (id_cliente, id_sucursal, fecha, hora, servicio, notas)
    VALUES (v_id_cliente, p_id_sucursal, p_fecha, p_hora, p_servicio, p_notas)
    RETURNING id INTO v_id_cita;

    -- Actualizar última visita del cliente
    UPDATE cliente SET ultima_visita = p_fecha WHERE id = v_id_cliente;

    RETURN v_id_cita;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 9. POLÍTICAS DE SEGURIDAD (RLS)
-- ============================================================================

-- Habilitar Row Level Security para tablas sensibles
ALTER TABLE cliente ENABLE ROW LEVEL SECURITY;
ALTER TABLE cita ENABLE ROW LEVEL SECURITY;
ALTER TABLE postulacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuario_admin ENABLE ROW LEVEL SECURITY;

-- Nota: Las políticas específicas de RLS se definirán según el middleware
-- de autenticación que se implemente en el backend (Node.js, Python, etc.)

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
