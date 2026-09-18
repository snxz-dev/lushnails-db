const { Router } = require('express');
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const PDFDocument = require('pdfkit');
const SVGtoPDF = require('svg-to-pdfkit');
const fs = require('fs');
const path = require('path');
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

    // Tendencia de Ventas (últimos 30 días)
    const ventasXfecha = await pool.query(`
      SELECT TO_CHAR(fecha, 'YYYY-MM-DD') as fecha, SUM(monto) as total
      FROM servicio_realizado
      WHERE fecha >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY fecha
      ORDER BY fecha ASC
    `);

    // Actividad Diaria para Heatmap (últimos 90 días)
    const actividadDiaria = await pool.query(`
      SELECT TO_CHAR(fecha, 'YYYY-MM-DD') as fecha, COUNT(*) as cantidad
      FROM cita
      WHERE fecha >= CURRENT_DATE - INTERVAL '90 days'
      GROUP BY fecha
      ORDER BY fecha ASC
    `);

    const comandos = [
      { id: 'cmd-metas', icon: 'target', comando: 'Metas Mensuales', descripcion: 'Monitor de progreso de ventas del mes', accion: 'metas' },
      { id: 'cmd-inventario', icon: 'package', comando: 'Alertas de Inventario', descripcion: 'Avisos de insumos con stock crítico', accion: 'inventario' },
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
      ventasXfecha: JSON.stringify(ventasXfecha.rows),
      actividadDiaria: JSON.stringify(actividadDiaria.rows),
      comandos
    });
  } catch (err) {
    console.error(err);
    res.send('Error');
  }
});

router.get('/reportes/csv', requireAuth, async (req, res) => {
  try {
    const kpis = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM cliente) as clientes,
        (SELECT COUNT(*) FROM cita WHERE estado = 'completada') as citas_completadas,
        (SELECT COUNT(*) FROM cita WHERE estado = 'cancelada') as citas_canceladas,
        (SELECT COALESCE(SUM(monto),0) FROM servicio_realizado) as ingresos_totales
    `);
    const data = kpis.rows[0];
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="Reporte_LushNails.csv"');
    
    const csv = `Metrica,Valor\nTotal Clientes,${data.clientes}\nCitas Completadas,${data.citas_completadas}\nCitas Canceladas,${data.citas_canceladas}\nIngresos Totales,$${data.ingresos_totales}`;
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error generando CSV');
  }
});

router.get('/reportes/pdf', requireAuth, async (req, res) => {
  try {
    const kpis = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM cliente) as clientes,
        (SELECT COUNT(*) FROM cita WHERE estado = 'completada') as citas_completadas,
        (SELECT COUNT(*) FROM cita WHERE estado = 'cancelada') as citas_canceladas,
        (SELECT COUNT(*) FROM cita WHERE estado = 'pendiente') as citas_pendientes,
        (SELECT COALESCE(SUM(monto),0) FROM servicio_realizado) as ingresos_totales
    `);
    const data = kpis.rows[0];
    const totalCitas = Number(data.citas_completadas) + Number(data.citas_canceladas) + Number(data.citas_pendientes);

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="Reporte_Premium_LushNails.pdf"');
    doc.pipe(res);

    // Encabezado Premium (Fondo verde oscuro)
    doc.rect(0, 0, doc.page.width, 120).fill('#1e3623');

    const logoPath = path.join(__dirname, '../../public/logo.svg');
    if (fs.existsSync(logoPath)) {
      const svg = fs.readFileSync(logoPath, 'utf8');
      doc.save();
      doc.translate(40, 20);
      doc.scale(0.35); // ~78px
      SVGtoPDF(doc, svg, 0, 0);
      doc.restore();
    }

    doc.fontSize(24).fillColor('#ffffff').text('LUSH NAILS SPA', 130, 40);
    doc.fontSize(12).fillColor('#a7b8a0').text('REPORTE EJECUTIVO Y FINANCIERO', 130, 70);

    // Función helper para dibujar tarjetas (cajas)
    const drawCard = (x, y, w, h, title, value, iconText) => {
      doc.roundedRect(x, y, w, h, 8).fillAndStroke('#ffffff', '#e2e8f0');
      doc.fillColor('#6b7280').fontSize(10).text(title, x + 15, y + 15);
      doc.fillColor('#1e3623').fontSize(22).text(value, x + 15, y + 35);
      if (iconText) {
        doc.fillColor('#10b981').fontSize(10).text(iconText, x + 15, y + 65);
      }
    };

    // Fila 1 de Tarjetas
    drawCard(40, 150, 245, 90, 'INGRESOS TOTALES', `$${Number(data.ingresos_totales).toFixed(2)}`, 'Métrica Financiera');
    drawCard(305, 150, 245, 90, 'CLIENTES REGISTRADOS', `${data.clientes}`, 'Crecimiento de base');
    
    // Fila 2 de Tarjetas
    drawCard(40, 260, 156, 90, 'CITAS COMPLETADAS', `${data.citas_completadas}`, 'Exitosas');
    drawCard(216, 260, 156, 90, 'CITAS PENDIENTES', `${data.citas_pendientes}`, 'En espera');
    drawCard(392, 260, 158, 90, 'CITAS CANCELADAS', `${data.citas_canceladas}`, 'Pérdida');

    // Gráfico de Barras (Manual con PDFKit vectors)
    doc.roundedRect(40, 380, 510, 180, 8).fillAndStroke('#ffffff', '#e2e8f0');
    doc.fillColor('#1e3623').fontSize(14).text('Distribución de Citas (Gráfico)', 60, 400);

    const drawBar = (y, label, value, color) => {
      doc.fillColor('#4b5563').fontSize(11).text(label, 60, y + 5);
      // Barra de fondo gris
      doc.roundedRect(160, y, 310, 20, 10).fill('#f1f5f9');
      // Barra de progreso colorida
      let pct = totalCitas > 0 ? (value / totalCitas) : 0;
      let barWidth = 310 * pct;
      if (barWidth > 10) {
        doc.roundedRect(160, y, barWidth, 20, 10).fill(color);
      }
      doc.fillColor('#1e3623').fontSize(10).text(`${value} (${(pct*100).toFixed(1)}%)`, 480, y + 5);
    };

    drawBar(440, 'Completadas', data.citas_completadas, '#10b981');
    drawBar(480, 'Pendientes', data.citas_pendientes, '#f59e0b');
    drawBar(520, 'Canceladas', data.citas_canceladas, '#ef4444');

    // Footer
    doc.fontSize(10).fillColor('gray').text('Generado automáticamente desde el Portal Empresarial Lush Nails.', 40, 750, { align: 'center', width: 515 });

    doc.end();
  } catch (err) {
    console.error(err);
    if (!res.headersSent) res.status(500).send('Error generando PDF');
  }
});

module.exports = router;
