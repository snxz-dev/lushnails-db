const { Router } = require('express');
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = Router();

// Listado del historial de atenciones (servicios realizados)
router.get('/', requireAuth, async (req, res) => {
  try {
    const historial = await pool.query(
      `SELECT sr.*, s.nombre AS servicio, ss.nombre AS sucursal, e.nombre AS empleado,
              cl.nombre AS cliente, c.fecha AS cita_fecha, c.hora AS cita_hora
       FROM servicio_realizado sr
       JOIN servicio s ON s.id = sr.id_servicio
       JOIN sucursal ss ON ss.id = sr.id_sucursal
       LEFT JOIN empleado e ON e.id = sr.id_empleado
       LEFT JOIN cita c ON c.id = sr.id_cita
       LEFT JOIN cliente cl ON cl.id = c.id_cliente
       ORDER BY sr.fecha DESC, sr.id DESC`
    );
    // Citas completadas que aún no tienen servicio_realizado (para registrar)
    const pendientes = await pool.query(
      `SELECT c.id, c.fecha, c.hora, cl.nombre AS cliente, s.nombre AS sucursal,
              string_agg(se.nombre, ', ' ORDER BY se.nombre) AS servicios
       FROM cita c
       JOIN cliente cl ON cl.id = c.id_cliente
       JOIN sucursal s ON s.id = c.id_sucursal
       LEFT JOIN cita_servicio cs ON cs.id_cita = c.id
       LEFT JOIN servicio se ON se.id = cs.id_servicio
       WHERE c.estado = 'completada'
         AND NOT EXISTS (SELECT 1 FROM servicio_realizado sr WHERE sr.id_cita = c.id)
       GROUP BY c.id, cl.nombre, s.nombre
       ORDER BY c.fecha DESC`
    );
    const empleados = await pool.query(
      'SELECT id, nombre FROM empleado WHERE activo = true ORDER BY nombre'
    );
    res.render('historial', { historial: historial.rows, pendientes: pendientes.rows, empleados: empleados.rows });
  } catch (err) {
    console.error(err);
    res.send('Error');
  }
});

// Registrar un servicio realizado a partir de una cita completada
router.post('/', requireAuth, async (req, res) => {
  const { id_cita, id_sucursal, monto, id_empleado, notas } = req.body;
  try {
    const servicios = await pool.query(
      `SELECT cs.id_servicio, s.precio
       FROM cita_servicio cs JOIN servicio s ON s.id = cs.id_servicio
       WHERE cs.id_cita = $1`,
      [id_cita]
    );
    // Usar monto indicado (o el precio del servicio si es único)
    const montoFinal = monto && Number(monto) > 0 ? Number(monto) : (Number(servicios.rows[0]?.precio) || 0);
    const { rows } = await pool.query(
      `SELECT fecha FROM cita WHERE id = $1`,
      [id_cita]
    );
    for (const sv of servicios.rows) {
      await pool.query(
        `INSERT INTO servicio_realizado (id_cita, id_servicio, id_empleado, id_sucursal, monto, fecha, notas)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id_cita, id_servicio) DO NOTHING`,
        [id_cita, sv.id_servicio, id_empleado || null, id_sucursal, montoFinal, rows[0]?.fecha || new Date(), notas || null]
      );
    }
    res.redirect('/historial');
  } catch (err) {
    console.error(err);
    res.redirect('/historial');
  }
});

// Eliminar un registro del historial
router.post('/:id/delete', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM servicio_realizado WHERE id = $1', [req.params.id]);
    res.redirect('/historial');
  } catch (err) {
    res.redirect('/historial');
  }
});

module.exports = router;