const { Router } = require('express');
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sucursal ORDER BY orden');
    res.render('sucursales', { sucursales: result.rows });
  } catch (err) {
    console.error(err);
    res.send('Error');
  }
});

router.post('/', requireAuth, async (req, res) => {
  const { nombre, direccion, telefono, link_whatsapp, horario, latitud, longitud, orden } = req.body;
  try {
    await pool.query(
      `INSERT INTO sucursal (nombre, direccion, telefono, link_whatsapp, horario, latitud, longitud, orden)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [nombre, direccion, telefono || null, link_whatsapp || null, horario || null,
       latitud || null, longitud || null, parseInt(orden) || 0]
    );
    res.redirect('/sucursales');
  } catch (err) {
    console.error(err);
    res.redirect('/sucursales');
  }
});

router.post('/:id/delete', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM sucursal WHERE id = $1', [req.params.id]);
    res.redirect('/sucursales');
  } catch (err) {
    res.redirect('/sucursales');
  }
});

router.post('/:id/toggle', requireAuth, async (req, res) => {
  try {
    await pool.query('UPDATE sucursal SET activo = NOT activo WHERE id = $1', [req.params.id]);
    res.redirect('/sucursales');
  } catch (err) {
    res.redirect('/sucursales');
  }
});

module.exports = router;
