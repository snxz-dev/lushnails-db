const { Router } = require('express');
const pool = require('../config/db');
const bcrypt = require('bcrypt');

const router = Router();

// Endpoint principal de Comunicación
router.get('/', async (req, res) => {
  try {
    // 0. Asegurarnos de que la tabla 'mensaje' exista
    await pool.query(`
      CREATE TABLE IF NOT EXISTS mensaje (
        id SERIAL PRIMARY KEY,
        remitente_id INTEGER NOT NULL REFERENCES usuario_admin(id) ON DELETE CASCADE,
        destinatario_id INTEGER NOT NULL REFERENCES usuario_admin(id) ON DELETE CASCADE,
        contenido TEXT NOT NULL,
        leido BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 1. Asegurarnos de que existen los 3 usuarios administradores de sucursal
    const sucursales = ['San Antonio', 'Pusuqui', 'Calderon'];
    
    // Obtener ID del rol 'admin'
    const rolResult = await pool.query(`SELECT id FROM rol WHERE codigo = 'admin'`);
    const idRolAdmin = rolResult.rows[0]?.id;
    
    if (idRolAdmin) {
      for (const sucursal of sucursales) {
        const email = `admin-${sucursal.toLowerCase().replace(' ', '')}@lushnails.example`;
        
        // Verificar si existe
        const userExists = await pool.query(`SELECT id FROM usuario_admin WHERE email = $1`, [email]);
        
        if (userExists.rows.length === 0) {
          // Crear usuario genérico para la sucursal
          const hashedPassword = await bcrypt.hash('Admin_123', 10);
          await pool.query(
            `INSERT INTO usuario_admin (nombre, email, password_hash, rol, id_rol, activo) 
             VALUES ($1, $2, $3, 'admin', $4, true)`,
            [`Admin ${sucursal}`, email, hashedPassword, idRolAdmin]
          );
        }
      }
    }
    
    // 2. Obtener lista de usuarios para mostrar en el sidebar de chats
    const usersResult = await pool.query(
      `SELECT id, nombre, email, rol, activo,
       (CASE WHEN email LIKE 'admin-%' THEN true ELSE false END) as is_branch_admin
       FROM usuario_admin 
       WHERE id != $1 AND activo = true
       ORDER BY is_branch_admin DESC, nombre ASC`,
      [req.session.userId]
    );
    
    // 3. Obtener el último mensaje de cada chat para previsualizar
    const chats = [];
    for (let u of usersResult.rows) {
      const lastMsgResult = await pool.query(
        `SELECT contenido, created_at, leido, remitente_id 
         FROM mensaje 
         WHERE (remitente_id = $1 AND destinatario_id = $2) 
            OR (remitente_id = $2 AND destinatario_id = $1)
         ORDER BY created_at DESC LIMIT 1`,
        [req.session.userId, u.id]
      );
      
      const unreadResult = await pool.query(
        `SELECT count(*) FROM mensaje 
         WHERE remitente_id = $1 AND destinatario_id = $2 AND leido = false`,
        [u.id, req.session.userId]
      );

      let lastMessage = '';
      let time = '';
      if (lastMsgResult.rows.length > 0) {
        lastMessage = lastMsgResult.rows[0].contenido;
        time = new Date(lastMsgResult.rows[0].created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }

      chats.push({
        ...u,
        lastMessage,
        time,
        unread: parseInt(unreadResult.rows[0].count)
      });
    }

    res.render('comunicacion', { chats, currentUser: req.session.user });
  } catch (err) {
    console.error('Error en comunicacion:', err);
    res.status(500).send('Error del servidor');
  }
});

// Endpoint para obtener el historial de mensajes de un chat específico
router.get('/mensajes/:userId', async (req, res) => {
  try {
    const otherUserId = req.params.userId;
    const myUserId = req.session.userId;
    
    // Marcar como leídos
    await pool.query(
      `UPDATE mensaje SET leido = true WHERE remitente_id = $1 AND destinatario_id = $2`,
      [otherUserId, myUserId]
    );

    const messages = await pool.query(
      `SELECT id, remitente_id, contenido, created_at 
       FROM mensaje 
       WHERE (remitente_id = $1 AND destinatario_id = $2) 
          OR (remitente_id = $2 AND destinatario_id = $1)
       ORDER BY created_at ASC`,
      [myUserId, otherUserId]
    );

    res.json(messages.rows);
  } catch (err) {
    console.error('Error al obtener mensajes:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

module.exports = router;
