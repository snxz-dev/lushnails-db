const { Router } = require('express');
const bcrypt = require('bcrypt');
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const usuarios = await pool.query(
      'SELECT id, nombre, email, rol, activo, created_at FROM usuario_admin ORDER BY rol, nombre'
    );
    res.render('roles', { usuarios: usuarios.rows });
  } catch (err) {
    console.error(err);
    res.send('Error');
  }
});

router.post('/', requireAuth, async (req, res) => {
  const { nombre, email, password, rol } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO usuario_admin (nombre, email, password_hash, rol) VALUES ($1, $2, $3, $4)',
      [nombre, email, hash, rol]
    );
    res.redirect('/roles');
  } catch (err) {
    console.error(err);
    res.redirect('/roles');
  }
});

router.post('/:id/rol', requireAuth, async (req, res) => {
  const { rol } = req.body;
  try {
    await pool.query('UPDATE usuario_admin SET rol = $1 WHERE id = $2', [rol, req.params.id]);
    res.redirect('/roles');
  } catch (err) {
    console.error(err);
    res.redirect('/roles');
  }
});

router.post('/:id/toggle', requireAuth, async (req, res) => {
  try {
    await pool.query('UPDATE usuario_admin SET activo = NOT activo WHERE id = $1', [req.params.id]);
    res.redirect('/roles');
  } catch (err) {
    console.error(err);
    res.redirect('/roles');
  }
});

router.post('/:id/delete', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM usuario_admin WHERE id = $1', [req.params.id]);
    res.redirect('/roles');
  } catch (err) {
    console.error(err);
    res.redirect('/roles');
  }
});

module.exports = router;
