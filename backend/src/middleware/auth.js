function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  res.redirect('/login');
}

const ROLE_PATHS = {
  superadmin: null,
  ventas: ['/', '/servicios', '/sucursales', '/citas', '/clientes', '/galeria', '/proveedores', '/aliados'],
  reportes: ['/', '/tablero', '/bsc']
};

function requireRole(req, res, next) {
  if (!req.session || !req.session.user) {
    return next();
  }
  const publicPaths = ['/login', '/logout'];
  if (publicPaths.includes(req.baseUrl || req.path)) {
    return next();
  }
  const { rol } = req.session.user;
  if (ROLE_PATHS[rol] === null) {
    return next();
  }
  const path = req.baseUrl || req.path;
  const allowed = ROLE_PATHS[rol] || [];
  if (allowed.includes(path)) {
    return next();
  }
  res.status(403).render('login', { error: 'No tienes permisos para acceder a este módulo' });
}

module.exports = { requireAuth, requireRole, ROLE_PATHS };
