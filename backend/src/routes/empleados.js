const { Router } = require('express');
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = Router();

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

// Listado de empleados
router.get('/', requireAuth, async (req, res) => {
  try {
    const empleados = await pool.query(
      `SELECT e.*, s.nombre AS sucursal
       FROM empleado e LEFT JOIN sucursal s ON s.id = e.id_sucursal
       ORDER BY e.nombre`
    );
    const sucursales = await pool.query('SELECT id, nombre FROM sucursal WHERE activo = true ORDER BY id');
    res.render('empleados', { empleados: empleados.rows, sucursales: sucursales.rows });
  } catch (err) {
    console.error(err);
    res.send('Error');
  }
});

// Crear empleado
router.post('/', requireAuth, async (req, res) => {
  const { nombre, id_sucursal, especialidad, telefono, horario } = req.body;
  try {
    await pool.query(
      `INSERT INTO empleado (nombre, id_sucursal, especialidad, telefono, horario)
       VALUES ($1, $2, $3, $4, $5)`,
      [nombre, id_sucursal || null, especialidad || null, telefono || null, horario || null]
    );
    res.redirect('/empleados');
  } catch (err) {
    console.error(err);
    res.redirect('/empleados');
  }
});

// Activar / desactivar
router.post('/:id/toggle', requireAuth, async (req, res) => {
  try {
    await pool.query('UPDATE empleado SET activo = NOT activo WHERE id = $1', [req.params.id]);
    res.redirect('/empleados');
  } catch (err) {
    res.redirect('/empleados');
  }
});

// Eliminar
router.post('/:id/delete', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM empleado WHERE id = $1', [req.params.id]);
    res.redirect('/empleados');
  } catch (err) {
    res.redirect('/empleados');
  }
});

// ---- Gestión de horarios de disponibilidad ----

// Ver horarios
router.get('/horarios', requireAuth, async (req, res) => {
  try {
    const horarios = await pool.query(
      `SELECT h.*, e.nombre AS empleado, e.especialidad
       FROM horario_empleado h
       JOIN empleado e ON e.id = h.id_empleado
       WHERE h.activo = true
       ORDER BY e.nombre, h.dia_semana`
    );
    const empleados = await pool.query(
      'SELECT id, nombre, especialidad FROM empleado WHERE activo = true ORDER BY nombre'
    );
    res.render('horarios', { horarios: horarios.rows, empleados: empleados.rows, dias: DIAS });
  } catch (err) {
    console.error(err);
    res.send('Error');
  }
});

// Crear horario
router.post('/horarios', requireAuth, async (req, res) => {
  const { id_empleado, dia_semana, hora_inicio, hora_fin } = req.body;
  try {
    await pool.query(
      `INSERT INTO horario_empleado (id_empleado, dia_semana, hora_inicio, hora_fin)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id_empleado, dia_semana) DO UPDATE
         SET hora_inicio = EXCLUDED.hora_inicio,
             hora_fin = EXCLUDED.hora_fin,
             activo = true`,
      [id_empleado, Number(dia_semana), hora_inicio, hora_fin]
    );
    res.redirect('/empleados/horarios');
  } catch (err) {
    console.error(err);
    res.redirect('/empleados/horarios');
  }
});

// Desactivar horario
router.post('/horarios/:id/toggle', requireAuth, async (req, res) => {
  try {
    await pool.query('UPDATE horario_empleado SET activo = NOT activo WHERE id = $1', [req.params.id]);
    res.redirect('/empleados/horarios');
  } catch (err) {
    res.redirect('/empleados/horarios');
  }
});

// Eliminar horario
router.post('/horarios/:id/delete', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM horario_empleado WHERE id = $1', [req.params.id]);
    res.redirect('/empleados/horarios');
  } catch (err) {
    res.redirect('/empleados/horarios');
  }
});

module.exports = router;