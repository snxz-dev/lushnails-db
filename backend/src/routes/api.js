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

// Horarios disponibles: genera franjas de 09:00-19:00 (lun-sáb) según duración
// de los servicios seleccionados y marca ocupadas las que se solapan con citas
// pendientes/confirmadas de esa fecha+sucursal.
const HORA_INICIO = 9 * 60;    // 09:00
const HORA_FIN = 19 * 60;      // 19:00

router.get('/disponibilidad', async (req, res) => {
  try {
    const { fecha } = req.query;
    let { id_sucursal, servicios } = req.query;
    if (!fecha || !id_sucursal) {
      return res.status(400).json({ error: 'Faltan fecha o id_sucursal' });
    }
    // sanitize id_sucursal (strip non-digit characters like smart quotes) and parse
    id_sucursal = parseInt(String(id_sucursal).replace(/[^\d-]/g, ''), 10);
    if (!Number.isInteger(id_sucursal)) {
      return res.status(400).json({ error: 'id_sucursal inválido' });
    }
    // servicios is optional. If provided, parse ids; otherwise treat as empty and use default duration
    const ids = servicios ? String(servicios).split(',').map(s => parseInt(String(s).replace(/[^\d-]/g, ''), 10)).filter(Number.isInteger) : [];

    // Duración total = suma de las duraciones de los servicios seleccionados
    let duracion;
    if (ids.length === 0) {
      // default slot length when no services provided (admin overview)
      duracion = 60; // 60 minutes default
    } else {
      const durResult = await pool.query(
        'SELECT COALESCE(SUM(COALESCE(duracion_minutos, 60)), 60) AS total FROM servicio WHERE id = ANY($1)',
        [ids]
      );
      duracion = Number(durResult.rows[0].total);
    }

    // Citas existentes de esa fecha+sucursal (no canceladas) with their durations and assigned employee
    const citas = await pool.query(
      `SELECT c.id, c.hora, c.id_empleado,
              COALESCE(SUM(COALESCE(s.duracion_minutos, 60)), 60) AS duracion,
              cl.nombre AS cliente
       FROM cita c
       LEFT JOIN cita_servicio cs ON cs.id_cita = c.id
       LEFT JOIN servicio s ON s.id = cs.id_servicio
       LEFT JOIN cliente cl ON cl.id = c.id_cliente
       WHERE c.id_sucursal = $1 AND c.fecha = $2 AND c.estado IN ('pendiente', 'confirmada')
       GROUP BY c.id, c.hora, c.id_empleado, cl.nombre`,
      [id_sucursal, fecha]
    );

    const aMin = (h) => { const [hh, mm] = h.split(':').map(Number); return hh * 60 + mm; };
    const fHora = (m) => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');

    const slots = [];
    for (let t = HORA_INICIO; t + duracion <= HORA_FIN; t += duracion) {
      const inicio = t;
      const fin = t + duracion;
      let ocupado = false;
      for (const c of citas.rows) {
        const cIni = aMin(c.hora);
        const cFin = cIni + Number(c.duracion);
        if (inicio < cFin && fin > cIni) { ocupado = true; break; }
      }
      slots.push({ hora: fHora(inicio), ocupado });
    }

    res.json({ duracion, slots, citas: citas.rows });
  } catch (err) {
    console.error('Error al calcular disponibilidad:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Disponibilidad por empleado: devuelve matriz de timeslots por empleado con flags de trabajo y ocupación
router.get('/disponibilidad/empleados', async (req, res) => {
  try {
    const { fecha } = req.query;
    let { id_sucursal, servicios } = req.query;
    if (!fecha || !id_sucursal) return res.status(400).json({ error: 'Faltan fecha o id_sucursal' });
    // sanitize id_sucursal and servicios
    id_sucursal = parseInt(String(id_sucursal).replace(/[^\d-]/g, ''), 10);
    if (!Number.isInteger(id_sucursal)) return res.status(400).json({ error: 'id_sucursal inválido' });
    const ids = servicios ? String(servicios).split(',').map(s => parseInt(String(s).replace(/[^\d-]/g, ''), 10)).filter(Number.isInteger) : [];
    const duracion = ids.length === 0 ? 60 : Number((await pool.query('SELECT COALESCE(SUM(COALESCE(duracion_minutos,60)),60) AS total FROM servicio WHERE id = ANY($1)', [ids])).rows[0].total);

    // empleados activos en la sucursal
    const empleadosRes = await pool.query('SELECT id, nombre FROM empleado WHERE activo = true AND (id_sucursal = $1 OR id_sucursal IS NULL) ORDER BY nombre', [id_sucursal]);
    const empleados = empleadosRes.rows;

    // horarios empleados para el dia de semana
    const diaSemana = (new Date(fecha)).getDay(); // 0=Sunday..6=Sat
    const diaIndex = diaSemana === 0 ? 7 : diaSemana; // convert to 1..7
    const horariosRes = await pool.query('SELECT id_empleado, hora_inicio, hora_fin FROM horario_empleado WHERE dia_semana = $1 AND activo = true', [diaIndex]);
    const horariosMap = new Map();
    for (const h of horariosRes.rows) horariosMap.set(h.id_empleado, { inicio: h.hora_inicio, fin: h.hora_fin });

    // citas existentes con cliente and empleado
    const citasRes = await pool.query(`SELECT c.id, c.hora, c.id_empleado, c.id_cliente, cl.nombre as cliente, COALESCE(SUM(COALESCE(s.duracion_minutos,60)),60) AS duracion
      FROM cita c
      LEFT JOIN cita_servicio cs ON cs.id_cita = c.id
      LEFT JOIN servicio s ON s.id = cs.id_servicio
      LEFT JOIN cliente cl ON cl.id = c.id_cliente
      WHERE c.id_sucursal = $1 AND c.fecha = $2 AND c.estado IN ('pendiente','confirmada')
      GROUP BY c.id, c.hora, c.id_empleado, c.id_cliente, cl.nombre`, [id_sucursal, fecha]);

    const citas = citasRes.rows;

    const aMin = (h) => { const [hh, mm] = String(h).split(':').map(Number); return hh * 60 + (mm || 0); };
    const fHora = (m) => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');

    const times = [];
    for (let t = HORA_INICIO; t + duracion <= HORA_FIN; t += duracion) times.push({ inicio: t, label: fHora(t) });

    const empleadosSlots = empleados.map(emp => {
      const horario = horariosMap.get(emp.id);
      const slots = times.map(t => {
        const inicio = t.inicio;
        const fin = inicio + duracion;
        let trabaja = true;
        if (!horario) trabaja = false;
        else {
          const hIni = aMin(horario.inicio);
          const hFin = aMin(horario.fin);
          if (inicio < hIni || fin > hFin) trabaja = false;
        }
        // check citas for this employee (if any assigned)
        let ocupado = false;
        let detalle = null;
        for (const c of citas) {
          if (c.id_empleado && c.id_empleado !== emp.id) continue;
          const cIni = aMin(c.hora);
          const cFin = cIni + Number(c.duracion);
          if (inicio < cFin && fin > cIni) { ocupado = true; detalle = { cliente: c.cliente, citaId: c.id }; break; }
        }
        return { hora: t.label, trabaja, ocupado, detalle };
      });
      return { id: emp.id, nombre: emp.nombre, slots };
    });

    res.json({ duracion, times: times.map(t => t.label), empleados: empleadosSlots });
  } catch (err) {
    console.error('Error disponibilidad por empleados:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/citas', async (req, res) => {
  const { nombre, telefono, correo, id_sucursal, servicios, fecha, hora, notas } = req.body;
  if (!nombre || !telefono || !id_sucursal || !servicios || !servicios.length || !fecha || !hora) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Calcular duración total de los servicios solicitados
    const ids = Array.isArray(servicios) ? servicios.map(Number) : String(servicios).split(',').map(Number).filter(Boolean);
    const durResult = await client.query(
      'SELECT COALESCE(SUM(COALESCE(duracion_minutos, 60)), 60) AS total FROM servicio WHERE id = ANY($1)',
      [ids]
    );
    const duracion = Number(durResult.rows[0].total);

    // Verificar solapamiento con citas existentes (pendiente/confirmada)
    const aMin = (h) => { const [hh, mm] = h.split(':').map(Number); return hh * 60 + mm; };
    const inicioReq = aMin(hora);
    const finReq = inicioReq + duracion;

    const citasExist = await client.query(
      `SELECT c.hora, COALESCE(SUM(COALESCE(s.duracion_minutos, 60)), 60) AS duracion
       FROM cita c
       LEFT JOIN cita_servicio cs ON cs.id_cita = c.id
       LEFT JOIN servicio s ON s.id = cs.id_servicio
       WHERE c.id_sucursal = $1 AND c.fecha = $2 AND c.estado IN ('pendiente', 'confirmada')
       GROUP BY c.id, c.hora`,
      [id_sucursal, fecha]
    );

    for (const c of citasExist.rows) {
      const cIni = aMin(c.hora);
      const cFin = cIni + Number(c.duracion);
      if (inicioReq < cFin && finReq > cIni) {
        await client.query('ROLLBACK');
        return res.status(409).json({ error: 'Horario no disponible' });
      }
    }

    // Crear/actualizar cliente
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

    const nuevaCita = await client.query(
      `INSERT INTO cita (id_cliente, id_sucursal, fecha, hora, estado, notas)
       VALUES ($1, $2, $3, $4, 'pendiente', $5) RETURNING id`,
      [idCliente, id_sucursal, fecha, hora, notas || null]
    );
    const idCita = nuevaCita.rows[0].id;
    for (const idServicio of ids) {
      await client.query(
        'INSERT INTO cita_servicio (id_cita, id_servicio) VALUES ($1, $2)',
        [idCita, idServicio]
      );
    }
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
      `SELECT ci.id, ci.fecha, ci.hora, ci.estado, ci.notas, s.nombre sucursal,
              COALESCE(string_agg(se.nombre, ', ' ORDER BY se.nombre), '') AS servicios
       FROM cita ci
       JOIN sucursal s ON s.id = ci.id_sucursal
       LEFT JOIN cita_servicio cs ON cs.id_cita = ci.id
       LEFT JOIN servicio se ON se.id = cs.id_servicio
       WHERE ci.id_cliente = $1
       GROUP BY ci.id, s.nombre
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
