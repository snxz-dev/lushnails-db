const { Router } = require('express');
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const indicadores = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM cliente WHERE fecha_registro >= CURRENT_DATE - INTERVAL '30 days') nuevos_clientes,
        (SELECT COUNT(*) FROM cita WHERE fecha >= CURRENT_DATE - INTERVAL '30 days') atenciones_mes,
        (SELECT ROUND(AVG(EXTRACT(EPOCH FROM (c.updated_at - c.created_at))/60)::numeric, 1) FROM cita c WHERE c.estado = 'completada' AND c.updated_at > c.created_at) tiempo_promedio_min,
        (SELECT COUNT(*) FROM postulacion WHERE leida = false) postulaciones_pendientes,
        (SELECT ROUND(
          (SELECT COUNT(*) FROM cita WHERE estado = 'completada') * 100.0 /
          NULLIF((SELECT COUNT(*) FROM cita WHERE estado IN ('completada','cancelada')), 0)
        , 1) ) tasa_exito,
        (SELECT COUNT(*) FROM cita WHERE fecha = CURRENT_DATE) citas_hoy
    `);

    const comandos = [
      { comando: 'dashboard', descripcion: 'Ver resumen general del portal', frecuencia: 'Diario', responsable: 'Admin' },
      { comando: 'servicios/listar', descripcion: 'Gestionar catálogo de servicios', frecuencia: 'Semanal', responsable: 'Admin' },
      { comando: 'sucursales/listar', descripcion: 'Administrar sucursales activas', frecuencia: 'Mensual', responsable: 'Admin' },
      { comando: 'citas/pendientes', descripcion: 'Revisar y confirmar citas agendadas', frecuencia: 'Diario', responsable: 'Recepcionista' },
      { comando: 'postulaciones/nuevas', descripcion: 'Revisar postulaciones laborales', frecuencia: 'Semanal', responsable: 'RRHH' },
      { comando: 'galeria/agregar', descripcion: 'Actualizar galería de trabajos', frecuencia: 'Semanal', responsable: 'Admin' },
      { comando: 'configuracion/editar', descripcion: 'Actualizar redes sociales y datos', frecuencia: 'Mensual', responsable: 'Admin' },
      { comando: 'bsc/indicadores', descripcion: 'Revisar Balanced Scorecard', frecuencia: 'Mensual', responsable: 'Gerencia' },
      { comando: 'tablero/comandos', descripcion: 'Monitorear tabla de comandos', frecuencia: 'Mensual', responsable: 'Gerencia' },
      { comando: 'reporte/financiero', descripcion: 'Generar reporte de ingresos y costos', frecuencia: 'Mensual', responsable: 'Contabilidad' },
    ];

    res.render('tablero', {
      indicadores: indicadores.rows[0],
      comandos
    });
  } catch (err) {
    console.error(err);
    res.send('Error');
  }
});

module.exports = router;
