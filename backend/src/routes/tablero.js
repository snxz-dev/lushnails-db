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

    // Datos para gráfica de servicios más usados
    const topServicios = await pool.query(`
      SELECT s.nombre, COUNT(sr.id) as cantidad
      FROM servicio_realizado sr
      JOIN servicio s ON s.id = sr.id_servicio
      GROUP BY s.id, s.nombre
      ORDER BY cantidad DESC LIMIT 5
    `);

    // Datos por sucursal
    const infoSucursales = await pool.query(`
      SELECT suc.id, suc.nombre, COUNT(c.id) as total_citas, 
             (SELECT COUNT(*) FROM empleado e WHERE e.id_sucursal = suc.id AND e.activo = true) as empleados_activos
      FROM sucursal suc
      LEFT JOIN cita c ON c.id_sucursal = suc.id AND c.estado != 'cancelada'
      GROUP BY suc.id, suc.nombre
      ORDER BY suc.id
    `);

    const comandos = [
      { id: 'cmd-reportes', icon: 'file-spreadsheet', comando: 'Generar Reportes', descripcion: 'Exportar datos financieros y operativos', accion: 'reportes' },
      { id: 'cmd-lector', icon: 'volume-2', comando: 'Accesibilidad', descripcion: 'Configurar TTS y lector de pantalla web', accion: 'lector' },
      { id: 'cmd-sucursales', icon: 'store', comando: 'Info Sucursales', descripcion: 'Ver métricas desglosadas por cada local', accion: 'sucursales' },
      { id: 'cmd-graficas', icon: 'pie-chart', comando: 'Gráficas de Servicios', descripcion: 'Análisis visual de los servicios más usados', accion: 'graficas' },
      { id: 'cmd-comunicacion', icon: 'message-square', comando: 'Comunicación', descripcion: 'Enviar mensajes entre sucursales', accion: 'comunicacion' }
    ];

    res.render('tablero', {
      indicadores: indicadores.rows[0],
      topServicios: JSON.stringify(topServicios.rows),
      infoSucursales: infoSucursales.rows,
      comandos
    });
  } catch (err) {
    console.error(err);
    res.send('Error');
  }
});

module.exports = router;
