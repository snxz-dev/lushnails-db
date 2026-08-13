const pool = require('../config/db');

function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  res.redirect('/login');
}

// Mapa de ruta de módulo -> permiso requerido
const MODULE_PERMISSIONS = {
  '/': 'dashboard.ver',
  '/servicios': 'servicios.gestionar',
  '/sucursales': 'sucursales.gestionar',
  '/citas': 'citas.gestionar',
  '/clientes': 'clientes.gestionar',
  '/galeria': 'galeria.gestionar',
  '/postulaciones': 'postulaciones.gestionar',
  '/proveedores': 'proveedores.gestionar',
  '/aliados': 'aliados.gestionar',
  '/configuracion': 'configuracion.gestionar',
  '/roles': 'roles.gestionar',
  '/bsc': 'bsc.ver',
  '/tablero': 'tablero.ver',
  '/empleados': 'empleados.gestionar',
  '/horarios': 'empleados.gestionar',
  '/historial': 'historial.ver'
};

// Carga los permisos del rol del usuario y los deja en req.session.user.permisos
async function cargarPermisos(req, res, next) {
  if (!req.session || !req.session.userId) return next();
  try {
    const result = await pool.query(
      `SELECT p.codigo
       FROM usuario_admin u
       JOIN rol_permiso rp ON rp.id_rol = u.id_rol
       JOIN permiso p ON p.id = rp.id_permiso
       WHERE u.id = $1`,
      [req.session.userId]
    );
    req.session.user = {
      ...req.session.user,
      permisos: result.rows.map(r => r.codigo)
    };
  } catch (err) {
    console.error('Error cargando permisos:', err);
    req.session.user = { ...req.session.user, permisos: [] };
  }
  next();
}

function requireRole(req, res, next) {
  if (!req.session || !req.session.user) return next();
  const publicPaths = ['/login', '/logout'];
  if (publicPaths.includes(req.path) || publicPaths.includes(req.baseUrl)) {
    return next();
  }
  const permisos = req.session.user.permisos || [];
  // superadmin siempre pasa (tiene todos los permisos por seed)
  if (req.session.user.rol === 'superadmin') return next();

  const modulePath = Object.keys(MODULE_PERMISSIONS)
    .sort((a, b) => b.length - a.length)
    .find(p => req.path === p || req.path.startsWith(p + '/') || req.baseUrl === p);

  // Rutas no mapeadas (ej. /api) no se restringen aquí
  const requerido = modulePath ? MODULE_PERMISSIONS[modulePath] : null;
  if (!requerido) return next();
  if (permisos.includes(requerido)) return next();

  res.status(403).render('login', { error: 'No tienes permisos para acceder a este módulo' });
}

module.exports = { requireAuth, requireRole, cargarPermisos };
