#!/usr/bin/env python3
"""Genera la tabla de costos para la fase de planificacion y diseno."""

import csv
import xml.etree.ElementTree as ET
from datetime import datetime
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent
XML_PATH = BASE_DIR / "planificacion_lushnails.xml"
CSV_PATH = BASE_DIR / "tabla_costos_planificacion_lushnails.csv"
NS = {"msp": "http://schemas.microsoft.com/project"}


TARIFAS_PERSONAL = {
    "Analista de proyectos junior": 8.00,
    "Analista de proyectos senior": 14.00,
    "Gestor de proyecto senior": 16.00,
    "Arquitecto de software senior": 18.00,
    "Disenador de base de datos junior": 10.00,
    "Disenador UX/UI junior": 9.00,
    "Disenador UX/UI senior": 15.00,
    "Desarrollador frontend junior": 8.00,
    "Desarrollador backend junior": 9.00,
    "QA tester junior": 7.00,
}

RECURSO_POR_EDT = {
    "1.1": ("Analista de proyectos junior", 64),
    "1.2": ("Analista de proyectos junior", 40),
    "1.3": ("Gestor de proyecto senior", 24),
    "1.4.1": ("Analista de proyectos senior", 40),
    "1.4.2": ("Analista de proyectos senior", 32),
    "1.5.1": ("Arquitecto de software senior", 24),
    "1.5.2": ("Disenador de base de datos junior", 24),
    "1.5.3": ("Disenador UX/UI junior", 32),
    "1.5.4": ("Disenador UX/UI senior", 16),
    "1.5.5": ("QA tester junior", 16),
    "2.1": ("Arquitecto de software senior", 24),
    "2.2": ("Disenador de base de datos junior", 24),
    "2.3": ("Disenador UX/UI junior", 32),
    "2.4": ("Disenador UX/UI senior", 16),
    "2.5": ("QA tester junior", 16),
}


def texto(nodo, nombre, defecto=""):
    hijo = nodo.find(f"msp:{nombre}", NS)
    return hijo.text if hijo is not None and hijo.text is not None else defecto


def fecha_corta(valor):
    return datetime.fromisoformat(valor.replace("Z", "")).strftime("%Y-%m-%d")


def horas_duracion(valor):
    if not valor.startswith("PT") or "H" not in valor:
        return 0
    return int(valor[2:].split("H")[0])


def tareas_operativas():
    arbol = ET.parse(XML_PATH)
    tareas = []
    for tarea in arbol.findall(".//msp:Task", NS):
        edt = texto(tarea, "OutlineNumber")
        nombre = texto(tarea, "Name")
        resumen = texto(tarea, "Summary") == "1"
        hito = texto(tarea, "Milestone") == "1"
        if resumen or hito or edt not in RECURSO_POR_EDT:
            continue
        recurso, horas = RECURSO_POR_EDT[edt]
        tarifa = TARIFAS_PERSONAL[recurso]
        tareas.append(
            {
                "categoria": "Personal",
                "subcategoria": "Recurso humano por actividad",
                "edt": edt,
                "concepto": nombre,
                "detalle": recurso,
                "cantidad": horas,
                "unidad": "hora",
                "costo_unitario": tarifa,
                "subtotal": horas * tarifa,
                "tipo": "Directo",
                "observacion": "Estimado segun actividad del XML de planificacion",
                "inicio": fecha_corta(texto(tarea, "Start")),
                "fin": fecha_corta(texto(tarea, "Finish")),
            }
        )
    return tareas


def fila(categoria, subcategoria, concepto, detalle, cantidad, unidad, costo_unitario, tipo, observacion):
    return {
        "categoria": categoria,
        "subcategoria": subcategoria,
        "edt": "",
        "concepto": concepto,
        "detalle": detalle,
        "cantidad": cantidad,
        "unidad": unidad,
        "costo_unitario": costo_unitario,
        "subtotal": cantidad * costo_unitario,
        "tipo": tipo,
        "observacion": observacion,
        "inicio": "",
        "fin": "",
    }


def costos_complementarios():
    return [
        fila("Personal", "Apoyo profesional", "Revision tecnica senior", "Revision de arquitectura, despliegue y riesgos", 8, "hora", 18.00, "Directo", "Apoyo puntual para mejorar calidad tecnica"),
        fila("Personal", "Apoyo profesional", "Revision de accesibilidad", "Evaluacion heuristica y navegacion por teclado", 8, "hora", 15.00, "Directo", "Incluye criterios WCAG y usabilidad"),
        fila("Personal", "Apoyo profesional", "Soporte de documentacion", "Informe, anexos, capturas y evidencias", 10, "hora", 7.00, "Directo", "Preparacion academica del informe"),
        fila("Software", "Sistema operativo", "Linux para desarrollo", "Distribucion Linux instalada en equipo del proyecto", 1, "licencia", 0.00, "Indirecto", "Software libre sin costo de licencia"),
        fila("Software", "Sistema operativo", "Windows de referencia", "Equipo alterno o laboratorio para pruebas de compatibilidad", 1, "licencia", 0.00, "Indirecto", "Uso academico o licencia existente"),
        fila("Software", "Lenguaje de programacion", "JavaScript", "Lenguaje principal del portal web", 1, "recurso", 0.00, "Directo", "Sin costo de licencia"),
        fila("Software", "Lenguaje de consulta", "SQL", "Consultas y estructura de base de datos", 1, "recurso", 0.00, "Directo", "Sin costo de licencia"),
        fila("Software", "Frameworks y librerias", "React", "Interfaz del portal empresarial", 1, "recurso", 0.00, "Directo", "Open source"),
        fila("Software", "Frameworks y librerias", "Node.js y Express", "Servidor y API del portal", 1, "recurso", 0.00, "Directo", "Open source"),
        fila("Software", "Base de datos", "PostgreSQL", "Motor de base de datos", 1, "recurso", 0.00, "Directo", "Open source"),
        fila("Software", "Gestion del proyecto", "ProjectLibre", "Planificacion y archivo XML del cronograma", 1, "recurso", 0.00, "Directo", "Open source"),
        fila("Software", "Ofimatica", "LibreOffice o OnlyOffice", "Edicion de documentos, tablas y presentaciones", 1, "recurso", 0.00, "Indirecto", "Alternativa gratuita/open source"),
        fila("Software", "Diseno", "Figma o Canva plan gratuito", "Bocetos, prototipos y material visual", 1, "recurso", 0.00, "Directo", "Plan gratuito suficiente para demo"),
        fila("Software", "Encuestas", "Tally plan gratuito", "Cuestionario y recoleccion de respuestas", 1, "recurso", 0.00, "Directo", "Plan gratuito para cuestionario demo"),
        fila("Software", "Control de versiones", "Git y GitHub", "Repositorio, historial y colaboracion", 1, "recurso", 0.00, "Directo", "Uso gratuito para proyecto academico"),
        fila("Infraestructura", "Equipo de trabajo", "Computador del desarrollador", "Uso proporcional del equipo personal", 1, "mes", 80.00, "Indirecto", "Depreciacion estimada del equipo"),
        fila("Infraestructura", "Equipo de trabajo", "Perifericos de diseno y pruebas", "Mouse, teclado, monitor o accesorios", 1, "paquete", 25.00, "Indirecto", "Uso proporcional"),
        fila("Infraestructura", "Conectividad", "Internet", "Conexion para investigacion, pruebas y despliegue", 1, "mes", 25.00, "Indirecto", "Costo proporcional del proyecto"),
        fila("Infraestructura", "Energia", "Electricidad", "Uso de equipo durante desarrollo y pruebas", 1, "mes", 12.00, "Indirecto", "Estimacion academica"),
        fila("Infraestructura", "Servidor demo", "Vercel Hobby", "Alojamiento del frontend para demostracion", 1, "mes", 0.00, "Directo", "Plan gratuito para demo"),
        fila("Infraestructura", "Base de datos demo", "Neon Free", "Base PostgreSQL administrada", 1, "mes", 0.00, "Directo", "Plan gratuito para demo"),
        fila("Infraestructura", "Backend demo", "Servicio de backend", "Render, Railway o servidor equivalente", 1, "mes", 7.00, "Directo", "Estimado si se requiere API activa 24/7"),
        fila("Infraestructura", "Respaldo", "Almacenamiento en nube", "Copia de seguridad de documentos y evidencias", 1, "mes", 5.00, "Indirecto", "Estimado basico"),
        fila("Materiales de oficina", "Papeleria", "Hojas e impresiones", "Rubricas, encuestas, borradores y anexos", 1, "paquete", 10.00, "Indirecto", "Material para entregables"),
        fila("Materiales de oficina", "Papeleria", "Carpeta y separadores", "Organizacion fisica del informe si se solicita", 1, "paquete", 6.00, "Indirecto", "Costo academico"),
        fila("Materiales de oficina", "Utiles", "Lapiceros y marcadores", "Trabajo de levantamiento y revision", 1, "paquete", 5.00, "Indirecto", "Costo academico"),
        fila("Materiales de oficina", "Comunicacion", "Movilizacion o reuniones", "Traslado o apoyo para socializar informacion", 1, "estimado", 15.00, "Indirecto", "Costo proporcional"),
        fila("Contingencia", "Reserva", "Contingencia del proyecto", "Margen para ajustes de diseno, pruebas o despliegue", 1, "estimado", 120.00, "Indirecto", "Reserva prudente para imprevistos"),
    ]


def escribir_csv(filas):
    campos = [
        "Categoria",
        "Subcategoria",
        "EDT",
        "Concepto",
        "Detalle",
        "Inicio",
        "Fin",
        "Cantidad",
        "Unidad",
        "Costo unitario USD",
        "Subtotal USD",
        "Tipo de costo",
        "Observacion",
    ]
    resumen = {}
    for item in filas:
        resumen[item["categoria"]] = resumen.get(item["categoria"], 0) + item["subtotal"]

    with CSV_PATH.open("w", newline="", encoding="utf-8-sig") as archivo:
        escritor = csv.DictWriter(archivo, fieldnames=campos)
        escritor.writeheader()
        for item in filas:
            escritor.writerow(
                {
                    "Categoria": item["categoria"],
                    "Subcategoria": item["subcategoria"],
                    "EDT": item["edt"],
                    "Concepto": item["concepto"],
                    "Detalle": item["detalle"],
                    "Inicio": item["inicio"],
                    "Fin": item["fin"],
                    "Cantidad": item["cantidad"],
                    "Unidad": item["unidad"],
                    "Costo unitario USD": f"{item['costo_unitario']:.2f}",
                    "Subtotal USD": f"{item['subtotal']:.2f}",
                    "Tipo de costo": item["tipo"],
                    "Observacion": item["observacion"],
                }
            )

        escritor.writerow({})
        escritor.writerow({"Categoria": "Resumen por categoria"})
        for categoria, subtotal in resumen.items():
            escritor.writerow({"Categoria": categoria, "Subtotal USD": f"{subtotal:.2f}"})
        escritor.writerow({"Categoria": "Total general", "Subtotal USD": f"{sum(resumen.values()):.2f}"})


def main():
    filas = tareas_operativas() + costos_complementarios()
    escribir_csv(filas)
    print(f"Tabla generada: {CSV_PATH}")
    print(f"Filas de costo: {len(filas)}")
    print(f"Total general: {sum(item['subtotal'] for item in filas):.2f}")


if __name__ == "__main__":
    main()
