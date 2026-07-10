const { Router } = require('express');
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const indicators = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM servicio WHERE activo = true) total_servicios,
        (SELECT COUNT(*) FROM cliente) total_clientes,
        (SELECT COUNT(*) FROM cita WHERE estado = 'completada') citas_completadas,
        (SELECT COUNT(*) FROM cita WHERE estado = 'pendiente') citas_pendientes,
        (SELECT COUNT(*) FROM cita WHERE estado = 'cancelada') citas_canceladas,
        (SELECT COUNT(*) FROM cita WHERE fecha >= CURRENT_DATE - INTERVAL '30 days') citas_30dias,
        (SELECT COUNT(*) FROM postulacion) total_postulaciones,
        (SELECT COUNT(*) FROM sucursal WHERE activo = true) sucursales_activas,
        (SELECT COUNT(*) FROM galeria WHERE activo = true) total_galeria
    `);
    const serviciosXcategoria = await pool.query(`
      SELECT cs.nombre, cs.label, COUNT(s.id) total
      FROM categoria_servicio cs
      LEFT JOIN servicio s ON s.id_categoria = cs.id AND s.activo = true
      WHERE cs.activo = true
      GROUP BY cs.id, cs.nombre, cs.label ORDER BY cs.orden
    `);
    const citasXestado = await pool.query(`
      SELECT estado, COUNT(*) total FROM cita GROUP BY estado ORDER BY estado
    `);
    const citasXmes = await pool.query(`
      SELECT TO_CHAR(fecha, 'YYYY-MM') mes, COUNT(*) total
      FROM cita WHERE fecha >= CURRENT_DATE - INTERVAL '6 months'
      GROUP BY mes ORDER BY mes
    `);
    const misvision = await pool.query(
      "SELECT clave, valor FROM configuracion WHERE clave IN ('mision','vision','objetivo_general')"
    );

    res.render('bsc', {
      kpi: indicators.rows[0],
      serviciosXcategoria: serviciosXcategoria.rows,
      citasXestado: citasXestado.rows,
      citasXmes: citasXmes.rows,
      config: Object.fromEntries(misvision.rows.map(r => [r.clave, r.valor]))
    });
  } catch (err) {
    console.error(err);
    res.send('Error');
  }
});

module.exports = router;
