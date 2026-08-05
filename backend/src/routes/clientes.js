const { Router } = require('express');
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const clientes = await pool.query(
      `SELECT c.id, c.nombre, c.telefono, c.correo, c.direccion, c.alergias, c.notas,
              c.fecha_registro, c.ultima_visita, c.activo,
              COUNT(ci.id) total_citas
       FROM cliente c
       LEFT JOIN cita ci ON ci.id_cliente = c.id
       GROUP BY c.id
       ORDER BY c.nombre`
    );
    const servicios = await pool.query(
      'SELECT s.id, s.nombre, cs.nombre categoria FROM servicio s JOIN categoria_servicio cs ON s.id_categoria = cs.id WHERE s.activo = true ORDER BY cs.orden, s.orden'
    );
    const sucursales = await pool.query(
      'SELECT id, nombre FROM sucursal WHERE activo = true ORDER BY id'
    );
    res.render('clientes', {
      clientes: clientes.rows,
      servicios: servicios.rows,
      sucursales: sucursales.rows
    });
  } catch (err) {
    console.error(err);
    res.send('Error');
  }
});

router.post('/', requireAuth, async (req, res) => {
  const { nombre, telefono, correo, direccion, alergias, notas } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    let idCliente;
    const existente = await client.query(
      'SELECT id FROM cliente WHERE telefono = $1 LIMIT 1',
      [telefono]
    );
    if (existente.rows.length > 0) {
      idCliente = existente.rows[0].id;
      await client.query(
        'UPDATE cliente SET nombre = $1, correo = COALESCE($2, correo), direccion = COALESCE($3, direccion), alergias = COALESCE($4, alergias), notas = COALESCE($5, notas) WHERE id = $6',
        [nombre, correo || null, direccion || null, alergias || null, notas || null, idCliente]
      );
    } else {
      const insert = await client.query(
        'INSERT INTO cliente (nombre, telefono, correo, direccion, alergias, notas) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [nombre, telefono, correo || null, direccion || null, alergias || null, notas || null]
      );
      idCliente = insert.rows[0].id;
    }
    const { id_sucursal, servicio, fecha, hora } = req.body;
    if (id_sucursal && servicio && fecha && hora) {
      await client.query(
        `INSERT INTO cita (id_cliente, id_sucursal, fecha, hora, servicio, estado)
         VALUES ($1, $2, $3, $4, $5, 'pendiente')`,
        [idCliente, id_sucursal, fecha, hora, servicio]
      );
    }
    await client.query('COMMIT');
    res.redirect('/clientes');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.redirect('/clientes');
  } finally {
    client.release();
  }
});

router.post('/:id/toggle', requireAuth, async (req, res) => {
  try {
    await pool.query('UPDATE cliente SET activo = NOT activo WHERE id = $1', [req.params.id]);
    res.redirect('/clientes');
  } catch (err) {
    res.redirect('/clientes');
  }
});

router.post('/:id/delete', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM cliente WHERE id = $1', [req.params.id]);
    res.redirect('/clientes');
  } catch (err) {
    res.redirect('/clientes');
  }
});

module.exports = router;
