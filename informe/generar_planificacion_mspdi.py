#!/usr/bin/env python3
"""Genera el plan independiente de la fase de planificación de Lush Nails.

El XML resultante es compatible con ProjectLibre y cubre 20 días
laborables. El periodo oficial inicia el 1 de julio de 2026 y las
actividades de levantamiento y encuestas comienzan el 5 de julio.
"""

import xml.etree.ElementTree as ET
from datetime import date, timedelta
from pathlib import Path


NS = "http://schemas.microsoft.com/project"
ET.register_namespace("", NS)

FECHA_OFICIAL_INICIO = date(2026, 7, 1)
FECHA_INICIO_ACTIVIDADES = date(2026, 7, 5)

# (EDT, tarea, duración en días, predecesora)
TAREAS = [
    ("1", "Planificación del proyecto Portal Empresarial Lush Nails SPA", None, ""),
    ("1.1", "Levantamiento de información", 8, ""),
    ("1.2", "Realización de encuestas", 5, "1.1:SS"),
    ("1.3", "Socializar y recibir la información", 3, "1.1;1.2"),
    ("1.4", "Análisis de la información", None, ""),
    ("1.4.1", "Requerimientos funcionales", 5, "1.3"),
    ("1.4.2", "Requerimientos no funcionales", 4, "1.4.1"),
    ("1.5", "Hito: Planificación aprobada", 0, "1.4.2"),
]


def es_laborable(fecha):
    return fecha.weekday() < 5


def primer_laborable(fecha):
    while not es_laborable(fecha):
        fecha += timedelta(days=1)
    return fecha


def siguiente_laborable(fecha):
    return primer_laborable(fecha + timedelta(days=1))


def sumar_laborables(inicio, dias):
    fecha = primer_laborable(inicio)
    restantes = dias - 1
    while restantes > 0:
        fecha = siguiente_laborable(fecha)
        restantes -= 1
    return fecha


def contar_laborables(inicio, fin):
    total = 0
    fecha = inicio
    while fecha <= fin:
        if es_laborable(fecha):
            total += 1
        fecha += timedelta(days=1)
    return total


def planificar():
    fechas = {}
    for edt, _nombre, duracion, predecesora in TAREAS:
        if duracion is None:
            fechas[edt] = None
            continue
        if predecesora:
            relaciones = [p.split(":") for p in predecesora.split(";")]
            inicios = []
            for pred, *tipo in relaciones:
                if tipo and tipo[0] == "SS":
                    inicios.append(fechas[pred][0])
                else:
                    fin_pred = fechas[pred][1]
                    inicios.append(fin_pred if duracion == 0 else siguiente_laborable(fin_pred))
            inicio = max(inicios)
        else:
            inicio = FECHA_INICIO_ACTIVIDADES
        fin = inicio if duracion == 0 else sumar_laborables(inicio, duracion)
        fechas[edt] = (inicio, fin)

    for edt, _nombre, duracion, _predecesora in reversed(TAREAS):
        if duracion is not None:
            continue
        hijos = [t[0] for t in TAREAS if t[0].startswith(edt + ".") and fechas[t[0]]]
        fechas[edt] = (
            min(fechas[h][0] for h in hijos),
            max(fechas[h][1] for h in hijos),
        )
    # La tarea resumen refleja el inicio oficial del proyecto; las actividades
    # de levantamiento comienzan en la fecha solicitada del 5 de julio.
    fechas["1"] = (FECHA_OFICIAL_INICIO, fechas["1"][1])
    return fechas


def iso(fecha):
    return f"{fecha.isoformat()}T09:00:00"


def duracion_iso(dias):
    return f"PT{dias * 8}H0M0S"


def construir_xml(fechas):
    root = ET.Element(f"{{{NS}}}Project")

    def raiz(tag, valor):
        ET.SubElement(root, f"{{{NS}}}{tag}").text = str(valor)

    raiz("SaveVersion", 14)
    raiz("Name", "Lush Nails SPA - Planificación")
    raiz("Title", "Planificación del Portal Empresarial Lush Nails SPA")
    raiz("StartDate", iso(FECHA_OFICIAL_INICIO))
    raiz("EndDate", iso(fechas["1.5"][1]))
    raiz("ScheduleFromStart", 1)
    raiz("MinutesPerDay", 480)
    raiz("MinutesPerWeek", 2400)
    raiz("DaysPerMonth", 20)
    raiz("DefaultStartTime", "09:00:00")
    raiz("DefaultFinishTime", "17:00:00")
    raiz("DurationFormat", 7)

    tareas_xml = ET.SubElement(root, f"{{{NS}}}Tasks")
    uid_por_edt = {edt: uid for uid, (edt, *_resto) in enumerate(TAREAS, 1)}

    for uid, (edt, nombre, duracion, predecesora) in enumerate(TAREAS, 1):
        tarea = ET.SubElement(tareas_xml, f"{{{NS}}}Task")

        def campo(tag, valor):
            ET.SubElement(tarea, f"{{{NS}}}{tag}").text = str(valor)

        es_resumen = duracion is None
        es_hito = duracion == 0
        inicio, fin = fechas[edt]
        campo("UID", uid)
        campo("ID", uid)
        campo("Name", nombre)
        campo("Type", 0)
        campo("IsNull", 0)
        campo("OutlineLevel", edt.count(".") + 1)
        campo("OutlineNumber", edt)
        campo("Summary", 1 if es_resumen else 0)
        campo("Milestone", 1 if es_hito else 0)
        campo("Duration", duracion_iso(0 if es_hito else (contar_laborables(inicio, fin) if es_resumen else duracion)))
        campo("DurationFormat", 7)
        for tag in ("Start", "EarlyStart"):
            campo(tag, iso(inicio))
        for tag in ("Finish", "EarlyFinish"):
            campo(tag, iso(fin))
        campo("PercentComplete", 0)
        if predecesora:
            for relacion in predecesora.split(";"):
                pred, *tipo = relacion.split(":")
                enlace = ET.SubElement(tarea, f"{{{NS}}}PredecessorLink")
                ET.SubElement(enlace, f"{{{NS}}}PredecessorUID").text = str(uid_por_edt[pred])
                # MSPDI: 1 = fin-comienzo; 3 = comienzo-comienzo.
                ET.SubElement(enlace, f"{{{NS}}}Type").text = "3" if tipo and tipo[0] == "SS" else "1"
                ET.SubElement(enlace, f"{{{NS}}}LinkLag").text = "0"

    return root


def main():
    fechas = planificar()
    root = construir_xml(fechas)
    ET.indent(root, space="  ")
    salida = Path(__file__).with_name("planificacion_lushnails.xml")
    ET.ElementTree(root).write(salida, encoding="utf-8", xml_declaration=True)
    print(f"Plan generado: {salida}")
    print("Duración: 20 días laborables")
    print(f"Periodo oficial: {FECHA_OFICIAL_INICIO} -> {fechas['1.5'][1]}")
    print(f"Inicio de levantamiento y encuestas: {FECHA_INICIO_ACTIVIDADES}")


if __name__ == "__main__":
    main()
