-- ============================================================================
-- MIGRACIÓN: Roles, Permisos, Horarios de Empleados, Historial de Atención
-- Se ejecuta contra la BD viva. Compatible con idempotencia (IF NOT EXISTS).
-- ============================================================================

-- 1. TABLA DE ROLES ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS rol (
    id          SERIAL PRIMARY KEY,
    codigo      VARCHAR(30)  NOT NULL UNIQUE,
    nombre      VARCHAR(60)  NOT NULL,
    descripcion TEXT,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- 2. TABLA DE PERMISOS ------------------------------------------------------
CREATE TABLE IF NOT EXISTS permiso (
    id          SERIAL PRIMARY KEY,
    codigo      VARCHAR(50)  NOT NULL UNIQUE,
    nombre      VARCHAR(100) NOT NULL,
    modulo      VARCHAR(50)  NOT NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- 3. TABLA INTERMEDIA ROL - PERMISO (N:M) -----------------------------------
CREATE TABLE IF NOT EXISTS rol_permiso (
    id_rol     INTEGER NOT NULL REFERENCES rol(id) ON DELETE CASCADE ON UPDATE CASCADE,
    id_permiso INTEGER NOT NULL REFERENCES permiso(id) ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY (id_rol, id_permiso)
);

-- 4. HORARIO DE EMPLEADOS (disponibilidad semanal) --------------------------
CREATE TABLE IF NOT EXISTS horario_empleado (
    id           SERIAL PRIMARY KEY,
    id_empleado  INTEGER NOT NULL REFERENCES empleado(id) ON DELETE CASCADE ON UPDATE CASCADE,
    dia_semana   INTEGER NOT NULL CHECK (dia_semana BETWEEN 1 AND 7), -- 1=Lunes ... 7=Domingo
    hora_inicio  TIME    NOT NULL,
    hora_fin     TIME    NOT NULL,
    activo       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (id_empleado, dia_semana)
);

-- 5. SERVICIO REALIZADO / HISTORIAL DE ATENCIÓN ----------------------------
-- Detalle de cada servicio ejecutado en una cita completada (alimenta BSC)
CREATE TABLE IF NOT EXISTS servicio_realizado (
    id           SERIAL PRIMARY KEY,
    id_cita      INTEGER NOT NULL REFERENCES cita(id) ON DELETE CASCADE ON UPDATE CASCADE,
    id_servicio  INTEGER NOT NULL REFERENCES servicio(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    id_empleado  INTEGER REFERENCES empleado(id) ON DELETE SET NULL ON UPDATE CASCADE,
    id_sucursal  INTEGER NOT NULL REFERENCES sucursal(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    monto        NUMERIC(10,2) NOT NULL DEFAULT 0,
    fecha        DATE    NOT NULL,
    notas        TEXT,
    created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (id_cita, id_servicio)
);

-- 6. VINCULAR USUARIO_ADMIN CON ROL (FK) -----------------------------------
ALTER TABLE usuario_admin
    ADD COLUMN IF NOT EXISTS id_rol INTEGER REFERENCES rol(id) ON DELETE SET NULL ON UPDATE CASCADE;

-- 7. ÍNDICES ----------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_rol_permiso_rol     ON rol_permiso(id_rol);
CREATE INDEX IF NOT EXISTS idx_rol_permiso_permiso ON rol_permiso(id_permiso);
CREATE INDEX IF NOT EXISTS idx_horario_empleado    ON horario_empleado(id_empleado);
CREATE INDEX IF NOT EXISTS idx_srv_realizado_fecha ON servicio_realizado(fecha);
CREATE INDEX IF NOT EXISTS idx_srv_realizado_cita  ON servicio_realizado(id_cita);
CREATE INDEX IF NOT EXISTS idx_srv_realizado_serv  ON servicio_realizado(id_servicio);
CREATE INDEX IF NOT EXISTS idx_usuario_admin_rol   ON usuario_admin(id_rol);

-- 8. SEED DE ROLES ----------------------------------------------------------
INSERT INTO rol (codigo, nombre, descripcion) VALUES
    ('superadmin',    'Super Administrador', 'Acceso total a todos los módulos y permisos'),
    ('admin',         'Administrador',       'Gestión operativa completa del portal'),
    ('recepcionista', 'Recepcionista',       'Gestión de citas y clientes'),
    ('rrhh',          'Recursos Humanos',    'Postulaciones, empleados y horarios'),
    ('gerencia',      'Gerencia',            'Tablero de comando y Balanced Scorecard'),
    ('contabilidad',  'Contabilidad',        'Reportes financieros y BSC')
ON CONFLICT (codigo) DO NOTHING;

-- 9. SEED DE PERMISOS (por módulo) ------------------------------------------
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

-- 10. ASIGNACIÓN DE PERMISOS POR ROL ---------------------------------------
-- Superadmin: todos los permisos
INSERT INTO rol_permiso (id_rol, id_permiso)
SELECT r.id, p.id FROM rol r CROSS JOIN permiso p
WHERE r.codigo = 'superadmin'
ON CONFLICT (id_rol, id_permiso) DO NOTHING;

-- Administrador: operativo completo (todo excepto gestión de roles/permisos)
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

-- Gerencia: dashboard, tablero, bsc, reportes (servicios/sucursales consulta)
INSERT INTO rol_permiso (id_rol, id_permiso)
SELECT r.id, p.id FROM rol r JOIN permiso p ON p.codigo IN
    ('dashboard.ver','tablero.ver','bsc.ver','historial.ver')
WHERE r.codigo = 'gerencia'
ON CONFLICT (id_rol, id_permiso) DO NOTHING;

-- Contabilidad: tablero, bsc, historial (reportes financieros)
INSERT INTO rol_permiso (id_rol, id_permiso)
SELECT r.id, p.id FROM rol r JOIN permiso p ON p.codigo IN
    ('tablero.ver','bsc.ver','historial.ver')
WHERE r.codigo = 'contabilidad'
ON CONFLICT (id_rol, id_permiso) DO NOTHING;

-- 11. ASOCIAR USUARIOS EXISTENTES CON SU ROL ---------------------------------
UPDATE usuario_admin u SET id_rol = r.id
FROM rol r WHERE r.codigo = u.rol AND u.id_rol IS NULL;

-- ============================================================================
-- FIN DE LA MIGRACIÓN
-- ============================================================================