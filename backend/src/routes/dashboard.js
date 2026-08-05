const { Router } = require('express');
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const [servicios, sucursales, citas, postulaciones, proveedores, aliados] = await Promise.all([
      pool.query('SELECT COUNT(*) count FROM servicio WHERE activo = true'),
      pool.query('SELECT COUNT(*) count FROM sucursal WHERE activo = true'),
      pool.query("SELECT COUNT(*) count FROM cita WHERE estado IN ('pendiente','confirmada')"),
      pool.query('SELECT COUNT(*) count FROM postulacion WHERE leida = false'),
      pool.query('SELECT COUNT(*) count FROM proveedor WHERE activo = true'),
      pool.query('SELECT COUNT(*) count FROM aliado WHERE activo = true'),
    ]);
    res.render('dashboard', {
      stats: {
        servicios: servicios.rows[0].count,
        sucursales: sucursales.rows[0].count,
        citas: citas.rows[0].count,
        postulaciones: postulaciones.rows[0].count,
        proveedores: proveedores.rows[0].count,
        aliados: aliados.rows[0].count,
      }
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.send('Error al cargar dashboard');
  }
});

module.exports = router;
