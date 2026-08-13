const { Router } = require('express');
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = Router();

const HORA_INICIO = 9 * 60;
const HORA_FIN = 19 * 60;

router.get('/', requireAuth, async (req, res) => {
  try {
    // always fetch sucursales for the selector
    const sucRes = await pool.query('SELECT id, nombre FROM sucursal WHERE activo = true ORDER BY id');
    const sucursales = sucRes.rows;

    const { fecha } = req.query;
    let { id_sucursal, servicios } = req.query || {};

    let matrix = null;
    if (fecha && id_sucursal) {
      id_sucursal = parseInt(String(id_sucursal).replace(/[^\d-]/g, ''), 10);
      const ids = servicios ? String(servicios).split(',').map(s => parseInt(String(s).replace(/[^\d-]/g, ''), 10)).filter(Number.isInteger) : [];
      const duracion = ids.length === 0 ? 60 : Number((await pool.query('SELECT COALESCE(SUM(COALESCE(duracion_minutos,60)),60) AS total FROM servicio WHERE id = ANY($1)', [ids])).rows[0].total);

      const empleadosRes = await pool.query('SELECT id, nombre FROM empleado WHERE activo = true AND (id_sucursal = $1 OR id_sucursal IS NULL) ORDER BY nombre', [id_sucursal]);
      const empleados = empleadosRes.rows;

      const diaSemana = (new Date(fecha)).getDay();
      const diaIndex = diaSemana === 0 ? 7 : diaSemana;
      const horariosRes = await pool.query('SELECT id_empleado, hora_inicio, hora_fin FROM horario_empleado WHERE dia_semana = $1 AND activo = true', [diaIndex]);
      const horariosMap = new Map();
      for (const h of horariosRes.rows) horariosMap.set(h.id_empleado, { inicio: h.hora_inicio, fin: h.hora_fin });

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

      matrix = { duracion, times: times.map(t => t.label), empleados: empleadosSlots };
    }

    // base appointments list (existing behavior)
    const result = await pool.query('SELECT * FROM v_citas_completas ORDER BY fecha DESC, hora DESC');
    res.render('citas', { citas: result.rows, matrix, sucursales });
  } catch (err) {
    console.error(err);
    res.send('Error');
  }
});

router.post('/:id/estado', requireAuth, async (req, res) => {
  const { estado } = req.body;
  try {
    await pool.query("UPDATE cita SET estado = $1 WHERE id = $2", [estado, req.params.id]);
    res.redirect('/citas');
  } catch (err) {
    res.redirect('/citas');
  }
});

module.exports = router;
