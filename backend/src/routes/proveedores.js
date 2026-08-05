const { Router } = require('express');
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM proveedor ORDER BY nombre');
    res.render('proveedores', { proveedores: result.rows });
  } catch (err) {
    console.error(err);
    res.send('Error');
  }
});

router.post('/', requireAuth, async (req, res) => {
  const { nombre, contacto, telefono, correo, tipo_insumo, direccion, notas } = req.body;
  try {
    await pool.query(
      `INSERT INTO proveedor (nombre, contacto, telefono, correo, tipo_insumo, direccion, notas)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [nombre, contacto || null, telefono || null, correo || null,
       tipo_insumo || null, direccion || null, notas || null]
    );
    res.redirect('/proveedores');
  } catch (err) {
    console.error(err);
    res.redirect('/proveedores');
  }
});

router.post('/:id/delete', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM proveedor WHERE id = $1', [req.params.id]);
    res.redirect('/proveedores');
  } catch (err) {
    res.redirect('/proveedores');
  }
});

router.post('/:id/toggle', requireAuth, async (req, res) => {
  try {
    await pool.query('UPDATE proveedor SET activo = NOT activo WHERE id = $1', [req.params.id]);
    res.redirect('/proveedores');
  } catch (err) {
    res.redirect('/proveedores');
  }
});

module.exports = router;
