const { Router } = require('express');
const bcrypt = require('bcrypt');
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = Router();

router.get('/login', (req, res) => {
  if (req.session.userId) return res.redirect('/');
  res.render('login', { error: null });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT id, nombre, email, password_hash, rol FROM usuario_admin WHERE email = $1 AND activo = true',
      [email]
    );
    const user = result.rows[0];
    if (!user) {
      return res.render('login', { error: 'Credenciales inválidas' });
    }
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.render('login', { error: 'Credenciales inválidas' });
    }
    req.session.userId = user.id;
    req.session.user = { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol };
    res.redirect('/');
  } catch (err) {
    console.error('Login error:', err);
    res.render('login', { error: 'Error del servidor' });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

module.exports = router;
