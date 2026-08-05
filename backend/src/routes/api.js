const { Router } = require('express');
const bcrypt = require('bcrypt');
const pool = require('../config/db');

const router = Router();

router.post('/postular', async (req, res) => {
  const { nombre, correo, telefono } = req.body;
  if (!nombre || !correo || !telefono) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }
  try {
    await pool.query(
      'INSERT INTO postulacion (nombre, correo, telefono) VALUES ($1, $2, $3)',
      [nombre, correo, telefono]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error al guardar postulación:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.get('/servicios', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.id, s.nombre, s.precio, s.duracion_minutos, cs.nombre categoria
       FROM servicio s
       JOIN categoria_servicio cs ON s.id_categoria = cs.id
       WHERE s.activo = true
       ORDER BY cs.orden, s.orden`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error al listar servicios:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.get('/sucursales', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nombre, direccion FROM sucursal WHERE activo = true ORDER BY id'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error al listar sucursales:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/citas', async (req, res) => {
  const { nombre, telefono, correo, id_sucursal, servicio, fecha, hora, notas } = req.body;
  if (!nombre || !telefono || !id_sucursal || !servicio || !fecha || !hora) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    let cliente = await client.query(
      'SELECT id FROM cliente WHERE telefono = $1 LIMIT 1',
      [telefono]
    );
    let idCliente;
    if (cliente.rows.length > 0) {
      idCliente = cliente.rows[0].id;
      await client.query(
        'UPDATE cliente SET correo = COALESCE($1, correo), ultima_visita = $2 WHERE id = $3',
        [correo || null, fecha, idCliente]
      );
    } else {
      const nuevoCliente = await client.query(
        'INSERT INTO cliente (nombre, telefono, correo) VALUES ($1, $2, $3) RETURNING id',
        [nombre, telefono, correo || null]
      );
      idCliente = nuevoCliente.rows[0].id;
    }
    await client.query(
      `INSERT INTO cita (id_cliente, id_sucursal, fecha, hora, servicio, estado, notas)
       VALUES ($1, $2, $3, $4, $5, 'pendiente', $6)`,
      [idCliente, id_sucursal, fecha, hora, servicio, notas || null]
    );
    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error al crear cita:', err);
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    client.release();
  }
});

router.post('/clientes/registro', async (req, res) => {
  const { nombre, telefono, correo, password } = req.body;
  if (!nombre || !telefono || !correo || !password) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }
  try {
    const existe = await pool.query('SELECT id FROM cliente WHERE LOWER(correo) = LOWER($1)', [correo]);
    if (existe.rows.length > 0) {
      return res.status(409).json({ error: 'Ya existe una cuenta con ese correo' });
    }
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO cliente (nombre, telefono, correo, password_hash) VALUES ($1, $2, $3, $4) RETURNING id, nombre, correo, telefono',
      [nombre, telefono, correo, hash]
    );
    res.json({ success: true, cliente: result.rows[0] });
  } catch (err) {
    console.error('Error al registrar cliente:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/clientes/login', async (req, res) => {
  const { correo, password } = req.body;
  if (!correo || !password) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }
  try {
    const result = await pool.query(
      'SELECT id, nombre, correo, telefono, password_hash, activo FROM cliente WHERE LOWER(correo) = LOWER($1)',
      [correo]
    );
    const cliente = result.rows[0];
    if (!cliente) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }
    if (!cliente.activo) {
      return res.status(401).json({ error: 'Cuenta desactivada' });
    }
    if (!cliente.password_hash) {
      return res.status(401).json({ error: 'Este correo no tiene contraseña. Regístrate' });
    }
    const valido = await bcrypt.compare(password, cliente.password_hash);
    if (!valido) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }
    res.json({ success: true, cliente: { id: cliente.id, nombre: cliente.nombre, correo: cliente.correo, telefono: cliente.telefono } });
  } catch (err) {
    console.error('Error al iniciar sesión:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.get('/clientes/:id/citas', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ci.id, ci.fecha, ci.hora, ci.servicio, ci.estado, ci.notas, s.nombre sucursal
       FROM cita ci
       JOIN sucursal s ON s.id = ci.id_sucursal
       WHERE ci.id_cliente = $1
       ORDER BY ci.fecha DESC, ci.hora DESC`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error al listar citas del cliente:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/clientes/:id/citas/:citaId/cancelar', async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE cita SET estado = 'cancelada'
       WHERE id = $1 AND id_cliente = $2 AND estado = 'pendiente'`,
      [req.params.citaId, req.params.id]
    );
    if (result.rowCount === 0) {
      return res.status(400).json({ error: 'No se puede cancelar esta cita' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Error al cancelar cita:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/clientes/:id/citas/:citaId/eliminar', async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM cita WHERE id = $1 AND id_cliente = $2`,
      [req.params.citaId, req.params.id]
    );
    if (result.rowCount === 0) {
      return res.status(400).json({ error: 'No se pudo eliminar esta cita' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Error al eliminar cita:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;
