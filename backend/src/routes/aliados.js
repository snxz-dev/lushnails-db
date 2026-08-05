const { Router } = require('express');
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM aliado ORDER BY nombre');
    res.render('aliados', { aliados: result.rows });
  } catch (err) {
    console.error(err);
    res.send('Error');
  }
});

router.post('/', requireAuth, async (req, res) => {
  const { nombre, descripcion, telefono, correo, link_whatsapp, direccion, sitio_web } = req.body;
  try {
    await pool.query(
      `INSERT INTO aliado (nombre, descripcion, telefono, correo, link_whatsapp, direccion, sitio_web)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [nombre, descripcion || null, telefono || null, correo || null,
       link_whatsapp || null, direccion || null, sitio_web || null]
    );
    res.redirect('/aliados');
  } catch (err) {
    console.error(err);
    res.redirect('/aliados');
  }
});

router.post('/:id/delete', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM aliado WHERE id = $1', [req.params.id]);
    res.redirect('/aliados');
  } catch (err) {
    res.redirect('/aliados');
  }
});

router.post('/:id/toggle', requireAuth, async (req, res) => {
  try {
    await pool.query('UPDATE aliado SET activo = NOT activo WHERE id = $1', [req.params.id]);
    res.redirect('/aliados');
  } catch (err) {
    res.redirect('/aliados');
  }
});

module.exports = router;
