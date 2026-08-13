-- ============================================================================
-- LUSH NAILS SPA - Script de Inicialización de Base de Datos
-- Motor: PostgreSQL 16
-- Proyecto: Portal Empresarial Lush Nails Spa
-- Descripción: Crea la estructura completa de la base de datos con sus
--              relaciones, restricciones, índices y datos semilla.
-- ============================================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Tabla de sesiones para el panel admin
CREATE TABLE IF NOT EXISTS "session" (
    sid         VARCHAR NOT NULL COLLATE "default",
    sess        JSON NOT NULL,
    expire      TIMESTAMP(6) NOT NULL,
    id_usuario  INTEGER,
    PRIMARY KEY (sid)
) WITH (OIDS=FALSE);

CREATE INDEX IF NOT EXISTS idx_session_expire ON "session" (expire);

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
    id_sucursal     INTEGER      REFERENCES sucursal(id)
                                  ON DELETE CASCADE ON UPDATE CASCADE,
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

-- 2.3. Horario de Empleados (disponibilidad semanal)
-- Permite conocer la disponibilidad de cada empleado por día de la semana
CREATE TABLE IF NOT EXISTS horario_empleado (
    id           SERIAL PRIMARY KEY,
    id_empleado  INTEGER NOT NULL REFERENCES empleado(id)
                            ON DELETE CASCADE ON UPDATE CASCADE,
    dia_semana   INTEGER NOT NULL CHECK (dia_semana BETWEEN 1 AND 7), -- 1=Lunes ... 7=Domingo
    hora_inicio  TIME    NOT NULL,
    hora_fin     TIME    NOT NULL,
    activo       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (id_empleado, dia_semana)
);

-- 2.4. Clientes
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
    estado          VARCHAR(20)  NOT NULL DEFAULT 'pendiente'
                                  CHECK (estado IN ('pendiente', 'confirmada', 'completada', 'cancelada')),
    notas           TEXT,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- 2.5. Cita-Servicio (tabla puente N:M)
-- Una cita puede incluir varios servicios y un servicio puede estar en varias citas
CREATE TABLE IF NOT EXISTS cita_servicio (
    id_cita         INTEGER      NOT NULL REFERENCES cita(id)
                                  ON DELETE CASCADE ON UPDATE CASCADE,
    id_servicio     INTEGER      NOT NULL REFERENCES servicio(id)
                                  ON DELETE RESTRICT ON UPDATE CASCADE,
    PRIMARY KEY (id_cita, id_servicio)
);

-- 2.6. Servicio Realizado (historial de atención)
-- Detalle de cada servicio ejecutado en una cita completada; alimenta el BSC
-- y los indicadores financieros (ingresos mensuales, ticket promedio, etc.)
CREATE TABLE IF NOT EXISTS servicio_realizado (
    id           SERIAL PRIMARY KEY,
    id_cita      INTEGER NOT NULL REFERENCES cita(id)
                            ON DELETE CASCADE ON UPDATE CASCADE,
    id_servicio  INTEGER NOT NULL REFERENCES servicio(id)
                            ON DELETE RESTRICT ON UPDATE CASCADE,
    id_empleado  INTEGER REFERENCES empleado(id)
                            ON DELETE SET NULL ON UPDATE CASCADE,
    id_sucursal  INTEGER NOT NULL REFERENCES sucursal(id)
                            ON DELETE RESTRICT ON UPDATE CASCADE,
    monto        NUMERIC(10,2) NOT NULL DEFAULT 0,
    fecha        DATE    NOT NULL,
    notas        TEXT,
    created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (id_cita, id_servicio)
);

-- 2.6. Postulaciones Laborales
-- Formulario "Trabaja con Nosotros"
CREATE TABLE IF NOT EXISTS postulacion (
    id              SERIAL PRIMARY KEY,
    id_sucursal     INTEGER      REFERENCES sucursal(id)
                                  ON DELETE SET NULL ON UPDATE CASCADE,
    nombre          VARCHAR(150) NOT NULL,
    correo          VARCHAR(255) NOT NULL,
    telefono        VARCHAR(20)  NOT NULL,
    archivo_cv      VARCHAR(255),
    mensaje         TEXT,
    leida           BOOLEAN      NOT NULL DEFAULT FALSE,
    fecha           TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- 2.7. Galería
-- Imágenes de trabajos realizados (uñas, peinados, etc.)
CREATE TABLE IF NOT EXISTS galeria (
    id              SERIAL PRIMARY KEY,
    id_categoria    INTEGER      REFERENCES categoria_servicio(id)
                                  ON DELETE SET NULL ON UPDATE CASCADE,
    id_sucursal     INTEGER      REFERENCES sucursal(id)
                                  ON DELETE SET NULL ON UPDATE CASCADE,
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

-- 3.1. Roles del sistema
CREATE TABLE IF NOT EXISTS rol (
    id          SERIAL PRIMARY KEY,
    codigo      VARCHAR(30)  NOT NULL UNIQUE,
    nombre      VARCHAR(60)  NOT NULL,
    descripcion TEXT,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- 3.2. Permisos por módulo
CREATE TABLE IF NOT EXISTS permiso (
    id          SERIAL PRIMARY KEY,
    codigo      VARCHAR(50)  NOT NULL UNIQUE,
    nombre      VARCHAR(100) NOT NULL,
    modulo      VARCHAR(50)  NOT NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- 3.3. Rol-Permiso (tabla intermedia N:M)
CREATE TABLE IF NOT EXISTS rol_permiso (
    id_rol     INTEGER NOT NULL REFERENCES rol(id) ON DELETE CASCADE ON UPDATE CASCADE,
    id_permiso INTEGER NOT NULL REFERENCES permiso(id) ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY (id_rol, id_permiso)
);

-- 3.4. Usuarios Administradores
-- Acceso al panel de administración del portal
CREATE TABLE IF NOT EXISTS usuario_admin (
    id              SERIAL PRIMARY KEY,
    id_rol          INTEGER      REFERENCES rol(id)
                                  ON DELETE SET NULL ON UPDATE CASCADE,
    id_sucursal     INTEGER      REFERENCES sucursal(id)
                                  ON DELETE SET NULL ON UPDATE CASCADE,
    nombre          VARCHAR(150) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    rol             VARCHAR(20)  NOT NULL DEFAULT 'admin'
                                  CHECK (rol IN ('superadmin', 'admin', 'recepcionista', 'rrhh', 'gerencia', 'contabilidad')),
    activo          BOOLEAN      NOT NULL DEFAULT TRUE,
    ultimo_acceso   TIMESTAMP,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- 2.8. Proveedores
-- Empresas o personas que proveen insumos al spa
CREATE TABLE IF NOT EXISTS proveedor (
    id              SERIAL PRIMARY KEY,
    id_sucursal     INTEGER      REFERENCES sucursal(id)
                                  ON DELETE SET NULL ON UPDATE CASCADE,
    nombre          VARCHAR(150) NOT NULL,
    contacto        VARCHAR(150),
    telefono        VARCHAR(20),
    correo          VARCHAR(255),
    tipo_insumo     VARCHAR(100),
    direccion       VARCHAR(255),
    notas           TEXT,
    activo          BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- 2.9. Aliados
-- Negocios aliados o partners del spa
CREATE TABLE IF NOT EXISTS aliado (
    id              SERIAL PRIMARY KEY,
    id_sucursal     INTEGER      REFERENCES sucursal(id)
                                  ON DELETE SET NULL ON UPDATE CASCADE,
    nombre          VARCHAR(150) NOT NULL,
    descripcion     TEXT,
    telefono        VARCHAR(20),
    correo          VARCHAR(255),
    link_whatsapp   VARCHAR(255),
    direccion       VARCHAR(255),
    sitio_web       VARCHAR(255),
    activo          BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 4. ÍNDICES
-- ============================================================================

-- FK de sesiones hacia el usuario administrador (tabla definida después)
ALTER TABLE "session"
    ADD CONSTRAINT fk_session_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuario_admin(id)
    ON DELETE SET NULL ON UPDATE CASCADE;

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
CREATE INDEX IF NOT EXISTS idx_usuario_admin_rol ON usuario_admin(id_rol);
CREATE INDEX IF NOT EXISTS idx_rol_permiso_rol     ON rol_permiso(id_rol);
CREATE INDEX IF NOT EXISTS idx_rol_permiso_permiso ON rol_permiso(id_permiso);
CREATE INDEX IF NOT EXISTS idx_horario_empleado    ON horario_empleado(id_empleado);
CREATE INDEX IF NOT EXISTS idx_srv_realizado_fecha ON servicio_realizado(fecha);
CREATE INDEX IF NOT EXISTS idx_srv_realizado_cita  ON servicio_realizado(id_cita);
CREATE INDEX IF NOT EXISTS idx_srv_realizado_serv  ON servicio_realizado(id_servicio);
CREATE INDEX IF NOT EXISTS idx_proveedor_activo ON proveedor(activo);
CREATE INDEX IF NOT EXISTS idx_aliado_activo ON aliado(activo);

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

CREATE TRIGGER trg_proveedor_updated
    BEFORE UPDATE ON proveedor
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER trg_aliado_updated
    BEFORE UPDATE ON aliado
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
-- Categoría: Uñas (id=1) — duración estándar 60 min
INSERT INTO servicio (id_categoria, nombre, orden, duracion_minutos) VALUES
    (1, 'ACRILICAS', 1, 60),
    (1, 'POLIGEL', 2, 60),
    (1, 'SOFT GEL', 3, 60),
    (1, 'BAÑO ACRILICO', 4, 60),
    (1, 'BARRIDO ACRILICO', 5, 60),
    (1, 'BARRIDO POLIGEL', 6, 60),
    (1, 'MANICURE SEMIPERMANENTE', 7, 60),
    (1, 'MANICURE NIVELACION RUBBER', 8, 60),
    (1, 'MANICURE TRADICIONAL', 9, 60),
    (1, 'PEDICURE SEMIP. LIMPIEZA PROFUNDA', 10, 60),
    (1, 'PEDICURE TRADICIONAL', 11, 60),
    (1, 'EXTRACCION UÑEROS', 12, 60),
    (1, 'LIMPIEZA MANOS O PIES', 13, 60);

-- Categoría: Pestañas y Cejas (id=2) — duración estándar 60 min
INSERT INTO servicio (id_categoria, nombre, orden, duracion_minutos) VALUES
    (2, 'PELO A PELO CLASICAS', 1, 60),
    (2, 'PELO A PELO EFECTO RIMEL', 2, 60),
    (2, 'PELO A PELO HIBRIDAS', 3, 60),
    (2, 'PELO A PELO TECNOLOGICA', 4, 60),
    (2, 'PUNTO X PUNTO CLASICAS', 5, 60),
    (2, 'LIFTING', 6, 60),
    (2, 'SEMIPERMANENTE HENNA', 7, 60),
    (2, 'LAMINADO', 8, 60),
    (2, 'BORRAR PIGMENTACION', 9, 60),
    (2, 'AUMENTAR CEJAS', 10, 60),
    (2, 'MICROBLADING', 11, 60),
    (2, 'MICROSHADING', 12, 60),
    (2, 'EFECTO POLVO', 13, 60);

-- Categoría: Cabello (id=3) — duración estándar 90 min
INSERT INTO servicio (id_categoria, nombre, orden, duracion_minutos) VALUES
    (3, 'Cortes', 1, 90),
    (3, 'Botox capilar', 2, 90),
    (3, 'Repolarización', 3, 90),
    (3, 'Tintes', 4, 90),
    (3, 'Alisados', 5, 90);

-- Categoría: Otros (id=4) — duración estándar 30 min
INSERT INTO servicio (id_categoria, nombre, orden, duracion_minutos) VALUES
    (4, 'Depilaciones completas', 1, 30),
    (4, 'Depilaciones con cera o hilo', 2, 30),
    (4, 'Limpieza facial', 3, 30);

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

-- 6.5. Roles del sistema
INSERT INTO rol (codigo, nombre, descripcion) VALUES
    ('superadmin',    'Super Administrador', 'Acceso total a todos los módulos y permisos'),
    ('admin',         'Administrador',       'Gestión operativa completa del portal'),
    ('recepcionista', 'Recepcionista',       'Gestión de citas y clientes'),
    ('rrhh',          'Recursos Humanos',    'Postulaciones, empleados y horarios'),
    ('gerencia',      'Gerencia',            'Tablero de comando y Balanced Scorecard'),
    ('contabilidad',  'Contabilidad',        'Reportes financieros y BSC')
ON CONFLICT (codigo) DO NOTHING;

-- 6.6. Permisos del sistema
INSERT INTO permiso (codigo, nombre, modulo) VALUES
    ('dashboard.ver',            'Ver Dashboard administrativo',        'dashboard'),
    ('servicios.gestionar',      'Gestionar servicios y categorías',   'servicios'),
    ('sucursales.gestionar',     'Gestionar sucursales',               'sucursales'),
    ('citas.gestionar',          'Gestionar citas',                    'citas'),
    ('clientes.gestionar',       'Gestionar clientes',                 'clientes'),
    ('empleados.gestionar',      'Gestionar empleados y horarios',     'empleados'),
    ('galeria.gestionar',        'Gestionar galería',                  'galeria'),
    ('postulaciones.gestionar',  'Gestionar postulaciones',            'postulaciones'),
    ('proveedores.gestionar',    'Gestionar proveedores',              'proveedores'),
    ('aliados.gestionar',        'Gestionar aliados estratégicos',     'aliados'),
    ('configuracion.gestionar',  'Gestionar configuración general',    'configuracion'),
    ('roles.gestionar',          'Gestionar usuarios, roles y permisos','roles'),
    ('bsc.ver',                  'Ver Balanced Scorecard',             'bsc'),
    ('tablero.ver',              'Ver Tablero de Comando',             'tablero'),
    ('historial.ver',            'Ver historial de atenciones',        'historial'),
    ('historial.gestionar',      'Registrar servicios realizados',     'historial')
ON CONFLICT (codigo) DO NOTHING;

-- 6.7. Asignación de permisos por rol
-- Superadmin: todos los permisos
INSERT INTO rol_permiso (id_rol, id_permiso)
SELECT r.id, p.id FROM rol r CROSS JOIN permiso p
WHERE r.codigo = 'superadmin'
ON CONFLICT (id_rol, id_permiso) DO NOTHING;

-- Administrador: operativo completo (excepto gestión de roles/permisos)
INSERT INTO rol_permiso (id_rol, id_permiso)
SELECT r.id, p.id FROM rol r CROSS JOIN permiso p
WHERE r.codigo = 'admin'
  AND p.codigo NOT IN ('roles.gestionar')
ON CONFLICT (id_rol, id_permiso) DO NOTHING;

-- Recepcionista: dashboard, citas, clientes, historial
INSERT INTO rol_permiso (id_rol, id_permiso)
SELECT r.id, p.id FROM rol r JOIN permiso p ON p.codigo IN
    ('dashboard.ver','citas.gestionar','clientes.gestionar','historial.ver','historial.gestionar')
WHERE r.codigo = 'recepcionista'
ON CONFLICT (id_rol, id_permiso) DO NOTHING;

-- RRHH: postulaciones, empleados, dashboard
INSERT INTO rol_permiso (id_rol, id_permiso)
SELECT r.id, p.id FROM rol r JOIN permiso p ON p.codigo IN
    ('dashboard.ver','empleados.gestionar','postulaciones.gestionar')
WHERE r.codigo = 'rrhh'
ON CONFLICT (id_rol, id_permiso) DO NOTHING;

-- Gerencia: dashboard, tablero, bsc, historial
INSERT INTO rol_permiso (id_rol, id_permiso)
SELECT r.id, p.id FROM rol r JOIN permiso p ON p.codigo IN
    ('dashboard.ver','tablero.ver','bsc.ver','historial.ver')
WHERE r.codigo = 'gerencia'
ON CONFLICT (id_rol, id_permiso) DO NOTHING;

-- Contabilidad: tablero, bsc, historial
INSERT INTO rol_permiso (id_rol, id_permiso)
SELECT r.id, p.id FROM rol r JOIN permiso p ON p.codigo IN
    ('tablero.ver','bsc.ver','historial.ver')
WHERE r.codigo = 'contabilidad'
ON CONFLICT (id_rol, id_permiso) DO NOTHING;

-- 6.8. Usuario Administrador por Defecto
-- Password por defecto: LushNails2024 (cambiarlo en producción)
INSERT INTO usuario_admin (nombre, email, password_hash, rol, id_rol) VALUES
    (
        'Administrador',
        'admin@lushnails.com',
        crypt('LushNails2024', gen_salt('bf')),
        'superadmin',
        (SELECT id FROM rol WHERE codigo = 'superadmin')
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

-- Vista: Citas con información del cliente, sucursal y servicios
CREATE OR REPLACE VIEW v_citas_completas AS
SELECT
    c.id AS cita_id,
    cl.nombre AS cliente,
    cl.telefono AS cliente_telefono,
    s.nombre AS sucursal,
    e.nombre AS empleado,
    c.fecha,
    c.hora,
    string_agg(se.nombre, ', ' ORDER BY se.nombre) AS servicios,
    c.estado,
    c.notas
FROM cita c
JOIN cliente cl ON c.id_cliente = cl.id
JOIN sucursal s ON c.id_sucursal = s.id
LEFT JOIN empleado e ON c.id_empleado = e.id
LEFT JOIN cita_servicio cs ON cs.id_cita = c.id
LEFT JOIN servicio se ON se.id = cs.id_servicio
GROUP BY c.id, cl.nombre, cl.telefono, s.nombre, e.nombre, c.fecha, c.hora, c.estado, c.notas
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
    p_servicios INTEGER[],
    p_notas TEXT DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
    v_id_cliente INTEGER;
    v_id_cita INTEGER;
    v_servicio INTEGER;
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
    INSERT INTO cita (id_cliente, id_sucursal, fecha, hora, notas)
    VALUES (v_id_cliente, p_id_sucursal, p_fecha, p_hora, p_notas)
    RETURNING id INTO v_id_cita;

    -- Vincular los servicios mediante la tabla puente
    FOREACH v_servicio IN ARRAY p_servicios LOOP
        INSERT INTO cita_servicio (id_cita, id_servicio)
        VALUES (v_id_cita, v_servicio);
    END LOOP;

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
ALTER TABLE proveedor ENABLE ROW LEVEL SECURITY;
ALTER TABLE aliado ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicio_realizado ENABLE ROW LEVEL SECURITY;
ALTER TABLE horario_empleado ENABLE ROW LEVEL SECURITY;
ALTER TABLE rol ENABLE ROW LEVEL SECURITY;
ALTER TABLE permiso ENABLE ROW LEVEL SECURITY;

-- Vista financiera: ingresos por servicio realizado (alimenta indicadores BSC)
CREATE OR REPLACE VIEW v_financiero AS
SELECT
    sr.fecha,
    sr.monto,
    s.nombre AS servicio,
    ss.nombre AS sucursal,
    e.nombre AS empleado,
    s.precio AS precio_lista,
    ROUND((sr.monto - s.precio)::numeric, 2) AS diferencia
FROM servicio_realizado sr
JOIN servicio s ON s.id = sr.id_servicio
JOIN sucursal ss ON ss.id = sr.id_sucursal
LEFT JOIN empleado e ON e.id = sr.id_empleado;

-- Nota: Las políticas específicas de RLS se definirán según el middleware
-- de autenticación que se implemente en el backend (Node.js, Python, etc.)

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
