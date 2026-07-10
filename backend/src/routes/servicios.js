const { Router } = require('express');
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const categorias = await pool.query(
      'SELECT * FROM categoria_servicio ORDER BY orden'
    );
    const servicios = await pool.query(
      'SELECT s.*, cs.nombre categoria_nombre FROM servicio s JOIN categoria_servicio cs ON s.id_categoria = cs.id ORDER BY cs.orden, s.orden'
    );
    res.render('servicios', { categorias: categorias.rows, servicios: servicios.rows });
  } catch (err) {
    console.error(err);
    res.send('Error');
  }
});

router.post('/categoria', requireAuth, async (req, res) => {
  const { nombre, label, orden } = req.body;
  try {
    await pool.query(
      'INSERT INTO categoria_servicio (nombre, label, orden) VALUES ($1, $2, $3) ON CONFLICT (nombre) DO UPDATE SET label = EXCLUDED.label, orden = EXCLUDED.orden',
      [nombre, label || null, parseInt(orden) || 0]
    );
    res.redirect('/servicios');
  } catch (err) {
    console.error(err);
    res.redirect('/servicios');
  }
});

router.post('/categoria/:id/delete', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM categoria_servicio WHERE id = $1', [req.params.id]);
    res.redirect('/servicios');
  } catch (err) {
    res.redirect('/servicios');
  }
});

router.post('/', requireAuth, async (req, res) => {
  const { id_categoria, nombre, precio, duracion_minutos, orden } = req.body;
  try {
    await pool.query(
      'INSERT INTO servicio (id_categoria, nombre, precio, duracion_minutos, orden) VALUES ($1, $2, $3, $4, $5)',
      [id_categoria, nombre, precio || null, duracion_minutos || null, parseInt(orden) || 0]
    );
    res.redirect('/servicios');
  } catch (err) {
    console.error(err);
    res.redirect('/servicios');
  }
});

router.post('/:id/delete', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM servicio WHERE id = $1', [req.params.id]);
    res.redirect('/servicios');
  } catch (err) {
    res.redirect('/servicios');
  }
});

router.post('/:id/toggle', requireAuth, async (req, res) => {
  try {
    await pool.query(
      'UPDATE servicio SET activo = NOT activo WHERE id = $1',
      [req.params.id]
    );
    res.redirect('/servicios');
  } catch (err) {
    res.redirect('/servicios');
  }
});

module.exports = router;
