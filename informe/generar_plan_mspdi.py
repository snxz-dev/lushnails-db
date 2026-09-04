#!/usr/bin/env python3
"""Genera un archivo MSPDI (XML de Microsoft Project 2007) con el plan del
proyecto Lush Nails, que ProjectLibre puede abrir directamente.

Uso:
    python3 generar_plan_mspdi.py

El archivo resultante (plan_lushnails.xml) se abre en ProjectLibre con:
    Archivo -> Abrir -> seleccionar 'Microsoft Project 2007 XML' (*.xml)
"""

import xml.etree.ElementTree as ET
from datetime import date, timedelta
from pathlib import Path

NS = "http://schemas.microsoft.com/project"
ET.register_namespace("", NS)

FECHA_INICIO = date(2026, 8, 17)  # lunes

# (id, nombre, duración_días, dependencias, id_recurso)
TAREAS = [
    # Fase 1: Base de datos
    ("1", "Base de datos", None, "", None),
    ("1.1", "Levantar base de datos PostgreSQL (Docker)", 1, "", 1),
    ("1.2", "Diseño del modelo entidad-relación (19 tablas)", 3, "", 1),
    ("1.3", "Definición de vistas financieras (v_financiero, v_citas_completas)", 2, "1.2", 1),
    ("1.4", "Hito 1: Base de datos completada", 0, "1.3", None),
    # Fase 2: Panel administrativo
    ("2", "Panel administrativo", None, "", None),
    ("2.1", "Panel admin: autenticación y roles (Express + EJS)", 4, "1.1", 2),
    ("2.2", "Módulo de citas y clientes", 3, "2.1", 2),
    ("2.3", "Módulo de historial de atenciones", 2, "2.2", 2),
    ("2.4", "Balanced Scorecard y tablero de comando", 3, "2.3", 2),
    # Fase 3: Sitio web
    ("3", "Sitio web corporativo", None, "", None),
    ("3.1", "Sitio web corporativo (React 19)", 5, "2.1", 3),
    ("3.2", "Integración web con API del panel", 3, "3.1", 3),
    # Fase 4: Documentación y pruebas
    ("4", "Documentación y pruebas", None, "", None),
    ("4.1", "Diagramas BPMN de procesos", 2, "1.2", 4),
    ("4.2", "Pruebas integrales y revisión de entregables", 3, "2.4;3.2;4.1", 4),
    # Fase 5: Accesibilidad y usabilidad
    ("5", "Accesibilidad y usabilidad", None, "", None),
    ("5.1", "Evaluación heurística del portal", 2, "3.2", 5),
    ("5.2", "Corrección de navegación por teclado y foco visible", 2, "5.1", 3),
    ("5.3", "Mejora de etiquetas, textos alternativos y formularios", 2, "5.2", 3),
    ("5.4", "Pruebas responsive en escritorio, tablet y móvil", 2, "5.3", 5),
    ("5.5", "Encuesta de usabilidad y código QR", 1, "5.4", 5),
    # Fase 6: Despliegue
    ("6", "Despliegue y validación en la nube", None, "", None),
    ("6.1", "Preparación de variables de entorno para producción", 1, "4.2;5.4", 2),
    ("6.2", "Configuración de base de datos PostgreSQL en Neon", 1, "6.1", 1),
    ("6.3", "Despliegue de backend API y panel administrativo", 2, "6.2", 2),
    ("6.4", "Despliegue del portal React en Vercel", 1, "6.3", 3),
    ("6.5", "Validación final de accesibilidad, responsive y conexión API", 2, "6.4;5.5", 5),
    ("6.6", "Hito 2: Portal desplegado y validado", 0, "6.5", None),
    ("4.3", "Presentación final del proyecto", 1, "6.6", 4),
]

RECURSOS = [
    (1, "Desarrollador BD", "10.00"),
    (2, "Desarrollador Backend", "12.00"),
    (3, "Desarrollador Frontend", "10.00"),
    (4, "Analista", "8.00"),
    (5, "Analista UX Accesibilidad", "9.00"),
]


def es_laborable(d):
    return d.weekday() < 5


def sumar_dias_laborables(inicio, dias):
    """Suma 'dias' laborables contando 'inicio' como día 1."""
    n = 0
    cur = inicio
    while n < dias:
        if es_laborable(cur):
            n += 1
        if n < dias:
            cur += timedelta(days=1)
    return cur


def siguiente_laborable(d):
    d = d + timedelta(days=1)
    while not es_laborable(d):
        d += timedelta(days=1)
    return d


def iso(d):
    return f"{d.isoformat()}T09:00:00"


def planificar():
    fechas = {}
    for tid, _, dur, preds, _r in TAREAS:
        if dur is None:
            fechas[tid] = None
            continue
        if preds and dur == 0:
            inicio = max(fechas[p][1] for p in preds.split(";"))
        elif preds:
            inicio = max(siguiente_laborable(fechas[p][1]) for p in preds.split(";"))
        else:
            inicio = FECHA_INICIO
        fin = sumar_dias_laborables(inicio, dur)
        fechas[tid] = (inicio, fin)
    for tid, _, dur, _, _r in TAREAS:
        if dur is not None:
            continue
        hijos = [t for t in TAREAS if t[0].startswith(tid + ".")]
        fs = [fechas[h[0]] for h in hijos]
        fechas[tid] = (min(f[0] for f in fs), max(f[1] for f in fs))
    return fechas


def iso_dur(dias):
    return f"PT{dias * 8}H0M0S"


def construir_xml(fechas):
    root = ET.Element(f"{{{NS}}}Project")

    def add(tag, text):
        el = ET.SubElement(root, f"{{{NS}}}{tag}")
        el.text = str(text)
        return el

    add("SaveVersion", 14)
    add("Name", "Lush Nails SPA - Portal Empresarial")
    add("Title", "Portal Empresarial Lush Nails SPA")
    add("StartDate", iso(FECHA_INICIO))
    add("EndDate", iso(fechas["4.3"][1]))
    add("ScheduleFromStart", 1)
    add("CurrencySymbol", "$")
    add("CurrencyCode", "USD")
    add("CurrencySymbolPosition", 0)
    add("CurrencyDigits", 2)
    add("MinutesPerDay", 480)
    add("MinutesPerWeek", 2400)
    add("DaysPerMonth", 20)
    add("DefaultStartTime", "09:00:00")
    add("DefaultFinishTime", "17:00:00")
    add("DefaultTaskType", 0)
    add("DefaultFixedCostAccrual", 3)
    add("DefaultStandardRate", 0)
    add("DefaultOvertimeRate", 0)
    add("DurationFormat", 7)
    add("WorkFormat", 1)
    add("EditableActualCosts", 0)
    add("HonorConstraints", 0)

    # ---- Tareas ----
    tareas_el = ET.SubElement(root, f"{{{NS}}}Tasks")
    uid = 0
    uid_map = {}
    for tid, nombre, dur, preds, recurso in TAREAS:
        uid += 1
        uid_map[tid] = uid
        t = ET.SubElement(tareas_el, f"{{{NS}}}Task")
        ET.SubElement(t, f"{{{NS}}}UID").text = str(uid)
        ET.SubElement(t, f"{{{NS}}}ID").text = str(uid)
        ET.SubElement(t, f"{{{NS}}}Name").text = nombre
        ET.SubElement(t, f"{{{NS}}}Type").text = "0"
        ET.SubElement(t, f"{{{NS}}}IsNull").text = "0"
        ET.SubElement(t, f"{{{NS}}}OutlineLevel").text = str(tid.count(".") + 1)
        ET.SubElement(t, f"{{{NS}}}OutlineNumber").text = tid
        es_resumen = dur is None
        es_hito = dur == 0
        ET.SubElement(t, f"{{{NS}}}Summary").text = "1" if es_resumen else "0"
        ET.SubElement(t, f"{{{NS}}}Milestone").text = "1" if es_hito else "0"
        if es_resumen:
            ET.SubElement(t, f"{{{NS}}}Duration").text = iso_dur((fechas[tid][1] - fechas[tid][0]).days + 1)
        else:
            ET.SubElement(t, f"{{{NS}}}Duration").text = iso_dur(dur)
        ET.SubElement(t, f"{{{NS}}}DurationFormat").text = "7"
        ET.SubElement(t, f"{{{NS}}}Start").text = iso(fechas[tid][0])
        ET.SubElement(t, f"{{{NS}}}Finish").text = iso(fechas[tid][1])
        ET.SubElement(t, f"{{{NS}}}EarlyStart").text = iso(fechas[tid][0])
        ET.SubElement(t, f"{{{NS}}}EarlyFinish").text = iso(fechas[tid][1])
        ET.SubElement(t, f"{{{NS}}}LateStart").text = iso(fechas[tid][0])
        ET.SubElement(t, f"{{{NS}}}LateFinish").text = iso(fechas[tid][1])
        ET.SubElement(t, f"{{{NS}}}PercentComplete").text = "0"
        if preds:
            for p in preds.split(";"):
                pl = ET.SubElement(t, f"{{{NS}}}PredecessorLink")
                ET.SubElement(pl, f"{{{NS}}}PredecessorUID").text = str(uid_map[p])
                ET.SubElement(pl, f"{{{NS}}}Type").text = "1"  # Fin-Comienzo
                ET.SubElement(pl, f"{{{NS}}}LinkLag").text = "0"
        if not es_resumen and recurso is not None:
            ET.SubElement(t, f"{{{NS}}}ResourceNames").text = dict((r[0], r[1]) for r in RECURSOS)[recurso]

    # ---- Recursos ----
    recursos_el = ET.SubElement(root, f"{{{NS}}}Resources")
    for rid, nombre, tarifa in RECURSOS:
        r = ET.SubElement(recursos_el, f"{{{NS}}}Resource")
        ET.SubElement(r, f"{{{NS}}}UID").text = str(rid)
        ET.SubElement(r, f"{{{NS}}}ID").text = str(rid)
        ET.SubElement(r, f"{{{NS}}}Name").text = nombre
        ET.SubElement(r, f"{{{NS}}}Type").text = "1"
        ET.SubElement(r, f"{{{NS}}}IsNull").text = "0"
        ET.SubElement(r, f"{{{NS}}}StandardRate").text = tarifa
        ET.SubElement(r, f"{{{NS}}}RateScale").text = "1"  # por hora

    # ---- Asignaciones ----
    asg_el = ET.SubElement(root, f"{{{NS}}}Assignments")
    asg_id = 0
    for tid, nombre, dur, preds, recurso in TAREAS:
        if dur is None or recurso is None:
            continue
        asg_id += 1
        a = ET.SubElement(asg_el, f"{{{NS}}}Assignment")
        ET.SubElement(a, f"{{{NS}}}UID").text = str(asg_id)
        ET.SubElement(a, f"{{{NS}}}TaskUID").text = str(uid_map[tid])
        ET.SubElement(a, f"{{{NS}}}ResourceUID").text = str(recurso)
        ET.SubElement(a, f"{{{NS}}}Units").text = "100"
        ET.SubElement(a, f"{{{NS}}}Work").text = iso_dur(dur)

    return root


def main():
    fechas = planificar()
    root = construir_xml(fechas)
    ET.indent(root, space="  ")
    ruta = Path(__file__).with_name("plan_lushnails.xml")
    ET.ElementTree(root).write(ruta, encoding="utf-8", xml_declaration=True)
    print(f"Plan generado: {ruta}")
    print("\nCronograma calculado:")
    for tid, nombre, dur, preds, _r in TAREAS:
        if dur is None:
            ini, fin = fechas[tid]
            print(f"  [FASE] {nombre}: {ini} -> {fin}")
        else:
            ini, fin = fechas[tid]
            print(f"  {tid} {nombre} ({dur}d, pred={preds or '-'}): {ini} -> {fin}")


if __name__ == "__main__":
    main()
