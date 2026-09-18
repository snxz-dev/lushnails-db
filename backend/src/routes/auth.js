const { Router } = require('express');
const bcrypt = require('bcrypt');
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = Router();

router.get('/login', (req, res) => {
  if (req.query.logout === '1' || req.query.force === '1') {
    req.session.destroy(() => {
      res.render('login', { error: null });
    });
    return;
  }
  if (req.session.userId) return res.redirect('/');
  res.render('login', { error: null });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    console.log(`[LOGIN INTENTO] Email: ${email}`);
    const result = await pool.query(
      `SELECT id, nombre, email, password_hash, rol, id_rol
       FROM usuario_admin WHERE email = $1 AND activo = true`,
      [email]
    );
    const user = result.rows[0];
    
    if (!user) {
      console.log(`[LOGIN FALLO] Usuario no encontrado o inactivo en DB.`);
      return res.render('login', { error: 'Credenciales inválidas' });
    }
    
    console.log(`[LOGIN OK] Usuario encontrado: ${user.nombre}. Verificando hash...`);
    const valid = await bcrypt.compare(password, user.password_hash);
    
    if (!valid) {
      console.log(`[LOGIN FALLO] Contraseña incorrecta (bcrypt.compare devolvió false).`);
      return res.render('login', { error: 'Credenciales inválidas' });
    }
    
    console.log(`[LOGIN ÉXITO] Autenticado correctamente. Creando sesión...`);
    req.session.userId = user.id;
    req.session.user = { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol, id_rol: user.id_rol };
    res.redirect('/');
  } catch (err) {
    console.error('Login error:', err);
    res.render('login', { error: 'Error del servidor' });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login?logout=1');
  });
});

module.exports = router;
