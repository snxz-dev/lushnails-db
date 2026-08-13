const { Router } = require('express');
const bcrypt = require('bcrypt');
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = Router();

// Listar usuarios + roles + permisos
router.get('/', requireAuth, async (req, res) => {
  try {
    const usuarios = await pool.query(
      `SELECT u.id, u.nombre, u.email, u.rol, u.activo, u.created_at, u.id_rol,
              r.nombre AS rol_nombre
       FROM usuario_admin u
       LEFT JOIN rol r ON r.id = u.id_rol
       ORDER BY u.rol, u.nombre`
    );
    const roles = await pool.query(
      'SELECT id, codigo, nombre, descripcion FROM rol ORDER BY id'
    );
    const permisosPorRol = await pool.query(
      `SELECT rp.id_rol, p.codigo
       FROM rol_permiso rp
       JOIN permiso p ON p.id = rp.id_permiso
       ORDER BY rp.id_rol, p.codigo`
    );
    const agrupado = {};
    permisosPorRol.rows.forEach(r => {
      if (!agrupado[r.id_rol]) agrupado[r.id_rol] = [];
      agrupado[r.id_rol].push(r.codigo);
    });
    res.render('roles', {
      usuarios: usuarios.rows,
      roles: roles.rows,
      permisosPorRol: agrupado
    });
  } catch (err) {
    console.error(err);
    res.send('Error');
  }
});

// Crear usuario
router.post('/', requireAuth, async (req, res) => {
  const { nombre, email, password, rol } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO usuario_admin (nombre, email, password_hash, rol, id_rol) VALUES ($1, $2, $3, $4, (SELECT id FROM rol WHERE codigo = $4))',
      [nombre, email, hash, rol]
    );
    res.redirect('/roles');
  } catch (err) {
    console.error(err);
    res.redirect('/roles');
  }
});

// Cambiar rol de un usuario
router.post('/:id/rol', requireAuth, async (req, res) => {
  const { rol } = req.body;
  try {
    await pool.query(
      'UPDATE usuario_admin SET rol = $1, id_rol = (SELECT id FROM rol WHERE codigo = $1) WHERE id = $2',
      [rol, req.params.id]
    );
    res.redirect('/roles');
  } catch (err) {
    console.error(err);
    res.redirect('/roles');
  }
});

// Activar / desactivar usuario
router.post('/:id/toggle', requireAuth, async (req, res) => {
  try {
    await pool.query('UPDATE usuario_admin SET activo = NOT activo WHERE id = $1', [req.params.id]);
    res.redirect('/roles');
  } catch (err) {
    console.error(err);
    res.redirect('/roles');
  }
});

// Eliminar usuario
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