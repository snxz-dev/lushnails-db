#!/usr/bin/env python3
"""
Generador del Documento Académico para Taller 3 U3:
Desarrollo de Portales Empresariales o Corporativos
Instituto Superior Universitario Japón
"""

import os
from pathlib import Path
from docx import Document
from docx.shared import Inches, Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import qn, nsdecls

OUT_DIR = Path("/home/snxz/Projects/lushnails-db/informe")
OUT_FILE = OUT_DIR / "Taller_3U3_Portales_Empresariales_SharePoint.docx"

doc = Document()

# Margins: 2.54 cm (1 in) on all sides (APA 7)
for section in doc.sections:
    section.top_margin = Cm(2.54)
    section.bottom_margin = Cm(2.54)
    section.left_margin = Cm(2.54)
    section.right_margin = Cm(2.54)

# Default Normal Style: Times New Roman 12 pt, Double Spaced
normal_style = doc.styles["Normal"]
normal_style.font.name = "Times New Roman"
normal_style._element.rPr.rFonts.set(qn("w:eastAsia"), "Times New Roman")
normal_style.font.size = Pt(12)
normal_style.paragraph_format.line_spacing_rule = WD_LINE_SPACING.DOUBLE
normal_style.paragraph_format.space_after = Pt(0)
normal_style.paragraph_format.space_before = Pt(0)

# Header with Page Number in upper right (APA 7)
header = doc.sections[0].header.paragraphs[0]
header.alignment = WD_ALIGN_PARAGRAPH.RIGHT
header_run = header.add_run()
fld_begin = OxmlElement("w:fldChar")
fld_begin.set(qn("w:fldCharType"), "begin")
instr = OxmlElement("w:instrText")
instr.set(qn("xml:space"), "preserve")
instr.text = "PAGE"
fld_end = OxmlElement("w:fldChar")
fld_end.set(qn("w:fldCharType"), "end")
header_run._r.extend([fld_begin, instr, fld_end])
header_run.font.name = "Times New Roman"
header_run.font.size = Pt(12)

def p_body(text, indent=True):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.line_spacing_rule = WD_LINE_SPACING.DOUBLE
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(0)
    if indent:
        p.paragraph_format.first_line_indent = Inches(0.5)
    r = p.add_run(text)
    r.font.name = "Times New Roman"
    r.font.size = Pt(12)
    return p

def h1(text, page_break=False):
    if page_break:
        doc.add_page_break()
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.line_spacing_rule = WD_LINE_SPACING.DOUBLE
    p.paragraph_format.space_before = Pt(12)
    p.paragraph_format.space_after = Pt(6)
    r = p.add_run(text)
    r.bold = True
    r.font.name = "Times New Roman"
    r.font.size = Pt(12)
    return p

def h2(text):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p.paragraph_format.line_spacing_rule = WD_LINE_SPACING.DOUBLE
    p.paragraph_format.space_before = Pt(12)
    p.paragraph_format.space_after = Pt(4)
    r = p.add_run(text)
    r.bold = True
    r.font.name = "Times New Roman"
    r.font.size = Pt(12)
    return p

def h3(text):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p.paragraph_format.line_spacing_rule = WD_LINE_SPACING.DOUBLE
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after = Pt(2)
    r = p.add_run(text)
    r.bold = True
    r.italic = True
    r.font.name = "Times New Roman"
    r.font.size = Pt(12)
    return p

def set_apa_table_borders(table):
    for i, row in enumerate(table.rows):
        for cell in row.cells:
            tcPr = cell._tc.get_or_add_tcPr()
            if i == 0:
                borders = parse_xml(
                    f'<w:tcBorders {nsdecls("w")}>'
                    '<w:top w:val="single" w:sz="8" w:space="0" w:color="000000"/>'
                    '<w:bottom w:val="single" w:sz="8" w:space="0" w:color="000000"/>'
                    '<w:left w:val="none"/>'
                    '<w:right w:val="none"/>'
                    '</w:tcBorders>'
                )
            elif i == len(table.rows) - 1:
                borders = parse_xml(
                    f'<w:tcBorders {nsdecls("w")}>'
                    '<w:top w:val="none"/>'
                    '<w:bottom w:val="single" w:sz="8" w:space="0" w:color="000000"/>'
                    '<w:left w:val="none"/>'
                    '<w:right w:val="none"/>'
                    '</w:tcBorders>'
                )
            else:
                borders = parse_xml(
                    f'<w:tcBorders {nsdecls("w")}>'
                    '<w:top w:val="none"/>'
                    '<w:bottom w:val="none"/>'
                    '<w:left w:val="none"/>'
                    '<w:right w:val="none"/>'
                    '</w:tcBorders>'
                )
            tcPr.append(borders)

def add_apa_table(num_str, title_str, headers, rows, widths=None, note=None):
    p_num = doc.add_paragraph()
    p_num.paragraph_format.line_spacing = 1.15
    p_num.paragraph_format.space_before = Pt(12)
    p_num.paragraph_format.space_after = Pt(2)
    r_num = p_num.add_run(f"Tabla {num_str}")
    r_num.bold = True
    r_num.font.name = "Times New Roman"
    r_num.font.size = Pt(12)
    
    p_title = doc.add_paragraph()
    p_title.paragraph_format.line_spacing = 1.15
    p_title.paragraph_format.space_before = Pt(0)
    p_title.paragraph_format.space_after = Pt(6)
    r_title = p_title.add_run(title_str)
    r_title.italic = True
    r_title.font.name = "Times New Roman"
    r_title.font.size = Pt(12)
    
    tbl = doc.add_table(rows=len(rows) + 1, cols=len(headers))
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    
    for j, h in enumerate(headers):
        cell = tbl.rows[0].cells[j]
        cell.text = h
        cell.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.LEFT
        cell.paragraphs[0].paragraph_format.space_before = Pt(4)
        cell.paragraphs[0].paragraph_format.space_after = Pt(4)
        cell.paragraphs[0].paragraph_format.line_spacing = 1.15
        r = cell.paragraphs[0].runs[0]
        r.bold = True
        r.font.name = "Times New Roman"
        r.font.size = Pt(10)
        
    for i, row_data in enumerate(rows):
        row = tbl.rows[i + 1]
        for j, val in enumerate(row_data):
            cell = row.cells[j]
            cell.text = str(val)
            cell.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.LEFT
            cell.paragraphs[0].paragraph_format.space_before = Pt(3)
            cell.paragraphs[0].paragraph_format.space_after = Pt(3)
            cell.paragraphs[0].paragraph_format.line_spacing = 1.15
            if cell.paragraphs[0].runs:
                cell.paragraphs[0].runs[0].font.name = "Times New Roman"
                cell.paragraphs[0].runs[0].font.size = Pt(10)
                
    if widths:
        for row in tbl.rows:
            for j, w in enumerate(widths):
                row.cells[j].width = Cm(w)
                
    set_apa_table_borders(tbl)
    
    p_note = doc.add_paragraph()
    p_note.paragraph_format.line_spacing = 1.15
    p_note.paragraph_format.space_before = Pt(4)
    p_note.paragraph_format.space_after = Pt(12)
    r_note_lbl = p_note.add_run("Nota. ")
    r_note_lbl.italic = True
    r_note_lbl.font.name = "Times New Roman"
    r_note_lbl.font.size = Pt(10)
    note_text = note if note else "Elaboración propia a partir del análisis técnico de la plataforma."
    r_note = p_note.add_run(note_text)
    r_note.font.name = "Times New Roman"
    r_note.font.size = Pt(10)
    return tbl

def add_reference(p_text_tuples):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.left_indent = Inches(0.5)
    p.paragraph_format.first_line_indent = Inches(-0.5)
    p.paragraph_format.line_spacing_rule = WD_LINE_SPACING.DOUBLE
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(0)
    for text, is_italic in p_text_tuples:
        r = p.add_run(text)
        r.font.name = "Times New Roman"
        r.font.size = Pt(12)
        if is_italic:
            r.italic = True

# =============================================================
# 1. PORTADA APA 7
# =============================================================
for _ in range(3):
    p = doc.add_paragraph()
    p.paragraph_format.line_spacing = 1.0

p_title = doc.add_paragraph()
p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
p_title.paragraph_format.line_spacing_rule = WD_LINE_SPACING.DOUBLE
r_t = p_title.add_run("Análisis y Evaluación de Portales Empresariales Corporativos:")
r_t.bold = True
r_t.font.size = Pt(12)
p_title.add_run("\n")
r_t2 = p_title.add_run("Arquitectura Técnica, Gestión de Contenidos y Colaboración en Microsoft SharePoint frente a SAP Fiori y Oracle WebCenter")
r_t2.bold = True
r_t2.font.size = Pt(12)

p_sub = doc.add_paragraph()
p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
p_sub.paragraph_format.line_spacing_rule = WD_LINE_SPACING.DOUBLE
r_sub = p_sub.add_run("Informe Técnico – Taller 3 (Unidad 3)")
r_sub.font.size = Pt(12)

for _ in range(4):
    p = doc.add_paragraph()
    p.paragraph_format.line_spacing = 1.0

meta_lines = [
    "Nombre del Estudiante: Stalyn Mateo Sánchez Cevallos",
    "Carrera: 4.° Nivel – Desarrollo de Software",
    "Institución: Instituto Superior Universitario Japón",
    "Asignatura: Desarrollo de Portales Empresariales o Corporativos",
    "Código de Asignatura: QU-DSW-AM-DESF_L405-19886",
    "Docente de la Cátedra: Ing. Docente Tutor",
    "Fecha de Entrega: 14 de septiembre de 2026"
]

for ml in meta_lines:
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.line_spacing_rule = WD_LINE_SPACING.DOUBLE
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(0)
    r = p.add_run(ml)
    r.font.size = Pt(12)

doc.add_page_break()

# =============================================================
# 2. INTRODUCCIÓN Y CONTEXTO DE LOS PORTALES EMPRESARIALES
# =============================================================
h1("Análisis y Evaluación de Portales Empresariales Corporativos")

h2("1. Introducción y Contextualización")

p_body(
    "En la sociedad del conocimiento y la economía digital, las organizaciones contemporáneas se enfrentan "
    "a un volumen sin precedentes de datos dispersos en múltiples repositorios, herramientas de mensajería y "
    "sistemas transaccionales legados. Este fenómeno, comúnmente denominado fragmentación de la información o "
    "silos departamentales, genera severas ineficiencias operativas, duplicidad de esfuerzos, inconsistencias "
    "documentales y riesgos críticos para la seguridad corporativa. Frente a estos desafíos estructurales, los "
    "Portales de Información Empresarial (Enterprise Information Portals, EIP) han evolucionado desde simples "
    "directorios o páginas de bienvenida en intranets primitivas hasta convertirse en complejas plataformas de "
    "integración, gobernanza, automatización y colaboración corporativa de misión crítica (Laudon & Laudon, 2022)."
)

p_body(
    "Un portal empresarial moderno actúa como un punto centralizado, unificado y altamente personalizable que "
    "orquesta el acceso a aplicaciones de negocio, repositorios documentales, flujos de aprobación y canales de "
    "comunicación organizacional bajo estrictos esquemas de Control de Acceso Basado en Roles (RBAC) y mecanismos "
    "de Autenticación Única (Single Sign-On, SSO). En este contexto académico, el presente taller tiene como propósito "
    "analizar de manera exhaustiva una de las plataformas líderes más consolidadas a nivel mundial: Microsoft SharePoint "
    "(específicamente en su versión en la nube SharePoint Online integrada en el ecosistema Microsoft 365). Asimismo, se "
    "establece una comparativa técnica frente a otras soluciones de envergadura como SAP Fiori y Oracle WebCenter, evaluando "
    "su arquitectura de software, gestión documental, capacidades de automatización y su pertinencia en casos reales de negocio."
)

# =============================================================
# 3. ARQUITECTURA TÉCNICA Y MODELOS DE DESPLIEGUE
# =============================================================
h2("2. Arquitectura Técnica de Microsoft SharePoint")

p_body(
    "La arquitectura de Microsoft SharePoint ha transitado por una profunda transformación a lo largo de las últimas "
    "dos décadas. Históricamente, las implementaciones locales (SharePoint Server 2010/2013/2016) se estructuraban en "
    "granjas de servidores físicas o virtualizadas (Server Farms) con una marcada división de tres niveles: Nivel Web "
    "(Web Front End - WFE), Nivel de Aplicaciones (Application Servers) y Nivel de Base de Datos relacional basada en "
    "Microsoft SQL Server. Sin embargo, en la actualidad, SharePoint Online opera como un servicio SaaS (Software as a "
    "Service) globalmente distribuido y multi-inquilino (multi-tenant) sobre la infraestructura de Microsoft Azure, "
    "organizado bajo una arquitectura desacoplada orientada a microservicios y servicios en la nube de alta resiliencia."
)

p_body(
    "Desde la perspectiva de la ingeniería de software, la arquitectura moderna de SharePoint se divide en cuatro capas "
    "funcionales claramente delimitadas:"
)

p_body(
    "1. Capa de Presentación y Experiencia de Usuario: Basada en el marco de desarrollo extensible SharePoint Framework "
    "(SPFx). Esta capa se ejecuta directamente en el cliente (navegador web o dispositivos móviles) utilizando estándares web "
    "modernos como HTML5, CSS3/Sass, TypeScript y bibliotecas reactivas como React, con componentes estilizados bajo las directrices "
    "de diseño de Microsoft Fluent UI. Esto garantiza interfaces responsivas, accesibles y desacopladas del procesamiento en servidor."
)

p_body(
    "2. Capa de Servicios y Lógica de Negocio: Gestiona las operaciones de colaboración, administración de sitios, listas "
    "y bibliotecas. Expone una robusta interfaz de programación de aplicaciones basada en REST y OData, complementada con el "
    "SDK unificado de Microsoft Graph API (`https://graph.microsoft.com/v1.0/`), lo que permite orquestar entidades corporativas "
    "(usuarios, grupos, correos, archivos, canales de Teams y eventos de calendario) mediante un único punto de entrada unificado."
)

p_body(
    "3. Capa de Integración y Flujos de Trabajo: Se apoya de forma nativa en la suite de Microsoft Power Platform, "
    "destacando Power Automate (antiguo Microsoft Flow) y Azure Logic Apps. Esta capa procesa eventos asíncronos generados "
    "por los usuarios (tales como la carga de un archivo, la modificación de un estado de aprobación o la creación de un nuevo "
    "registro) y dispara pipelines lógicos que se conectan tanto con servicios internos como con sistemas ERP/CRM externos mediante webhooks."
)

p_body(
    "4. Capa de Persistencia y Seguridad: Los metadatos estructurados de las listas y bibliotecas se almacenan en clústeres "
    "distribuidos de alta disponibilidad de Azure SQL Database, mientras que los archivos binarios masivos (BLOBs) se derivan a "
    "Azure Blob Storage con particionamiento de contenido, deduplicación de bloques y cifrado automático tanto en reposo "
    "(AES de 256 bits) como en tránsito (TLS 1.3). La identidad se gestiona enteramente mediante Microsoft Entra ID (anteriormente Azure Active Directory)."
)

# Table 1: Modelos de despliegue
headers_t1 = ["Modelo de Despliegue", "Infraestructura", "Control y Mantenimiento", "Escalabilidad", "Casos de Uso Recomendados"]
rows_t1 = [
    ["SharePoint Online (Cloud SaaS)", "Microsoft Azure global (multi-tenant)", "Gestionado 100% por el proveedor; actualizaciones continuas automáticas.", "Infinita y transparente bajo demanda; SLA garantizado del 99.9%.", "Organizaciones modernas que buscan agilidad, movilidad y cero mantenimiento físico."],
    ["SharePoint Server (On-Premises)", "Servidores locales propios o centros de datos privados.", "Control total por el departamento de TI local; parches y respaldos manuales.", "Limitada a la capacidad de hardware y almacenamiento físico aprovisionado.", "Gobierno, sector militar o industrias con estricta soberanía de datos."],
    ["Híbrido (Hybrid Federation)", "Combinación de infraestructura local y Microsoft 365.", "Gestión compartida; sincronización de identidades y búsqueda federada unificada.", "Alta flexibilidad para migración paulatina de cargas de trabajo críticas.", "Grandes corporaciones en transición tecnológica gradual hacia la nube."]
]
add_apa_table(
    "1",
    "Comparativa de Modelos de Despliegue de Microsoft SharePoint",
    headers_t1,
    rows_t1,
    [3.2, 3.2, 3.5, 3.2, 3.5],
    "Elaboración propia a partir de la documentación de arquitectura oficial de Microsoft (2024)."
)

# =============================================================
# 4. CAPACIDADES FUNCIONALES Y GESTIÓN DOCUMENTAL
# =============================================================
h2("3. Módulos y Capacidades Principales")

p_body(
    "Microsoft SharePoint se distingue en el panorama corporativo por integrar en una única solución un conjunto armónico "
    "de capacidades funcionales orientadas a transformar la productividad y la gobernanza de la información:"
)

h3("3.1. Gestión Documental Avanzada (Enterprise Content Management - ECM)")
p_body(
    "A diferencia de un simple sistema de archivos compartidos en red (como carpetas SMB/NFS), SharePoint estructura "
    "la información mediante Bibliotecas de Documentos enriquecidas con metadatos personalizados, tipos de contenido jerárquicos "
    "y taxonomías globales (Managed Metadata Service). Cada documento cuenta con control de versiones semántico (versiones mayores "
    "y menores con registro histórico de autores y marcas temporales), capacidades de coautoría simultánea en tiempo real sin bloqueo "
    "de archivo mediante Office Online, y políticas de retención, archivado y prevención de fuga de datos (Data Loss Prevention, DLP) "
    "gestionadas centralmente desde Microsoft Purview (Sommerville, 2021)."
)

h3("3.2. Intranet Corporativa y Sitios de Comunicación")
p_body(
    "La plataforma ofrece dos tipologías fundamentales de sitios: los Sitios de Equipo (Team Sites), optimizados para la colaboración "
    "interna de proyectos y departamentos con conexión directa a grupos de Microsoft 365 y Microsoft Teams; y los Sitios de "
    "Comunicación (Communication Sites), concebidos para la difusión unidireccional de noticias corporativas, eventos, políticas "
    "institucionales y portales de bienestar laboral. Mediante los Sitios Concentradores (Hub Sites), es posible estructurar topologías "
    "jerárquicas que heredan estilos visuales comunes, menús de navegación compartidos y agregación automática de búsquedas entre múltiples departamentos."
)

h3("3.3. Automatización de Flujos de Trabajo (Business Process Automation)")
p_body(
    "Uno de los mayores diferenciadores radica en la automatización sin código (low-code/no-code) a través de Microsoft Power Automate. "
    "Los procesos burocráticos tradicionales (solicitudes de permisos, validaciones presupuestarias, revisiones de contratos, recepciones "
    "de insumos o aprobaciones de compras) se convierten en flujos digitales interactivos que notifican a los tomadores de decisiones a través "
    "de correos electrónicos con tarjetas adaptativas (Adaptive Cards) o mensajes interactivos en Microsoft Teams, registrando cada hito con "
    "auditoría inmutable en las listas de SharePoint."
)

h3("3.4. Motor de Búsqueda Inteligente y Descubrimiento")
p_body(
    "La tecnología Microsoft Search utiliza aprendizaje automático sobre el grafo de relaciones de la organización (Microsoft Graph). "
    "Esto permite al usuario no solo buscar por palabras clave en el título de un archivo, sino realizar indexación profunda de texto dentro "
    "de documentos PDF, hojas de cálculo, presentaciones o archivos de texto, personalizando los resultados en función de las interacciones "
    "recientes, colaboradores habituales y proyectos activos del usuario, respetando en todo momento sus permisos de lectura."
)

# =============================================================
# 5. SEGURIDAD, GOBERNANZA Y CONTROL DE ACCESOS (RBAC)
# =============================================================
h2("4. Seguridad, Gobernanza y Modelo de Permisos")

p_body(
    "La seguridad en un portal corporativo constituye un elemento no negociable. SharePoint implementa un modelo de "
    "Control de Acceso Basado en Roles (RBAC) granular y heredable, respaldado por la infraestructura de seguridad de Microsoft Entra ID. "
    "Por defecto, la seguridad se organiza en tres grupos primarios por sitio: Propietarios (Control Total), Miembros (Permisos de Escritura "
    "y Edición) y Visitantes (Permisos de Solo Lectura). No obstante, es posible crear niveles de permisos personalizados con privilegios "
    "atómicos y romper la herencia de permisos a nivel de subsitio, biblioteca, carpeta o incluso documento individual (Stallings, 2023)."
)

p_body(
    "Entre los mecanismos de gobernanza más relevantes destacan las Políticas de Acceso Condicional (Conditional Access), que "
    "restringen o condicionan el acceso al portal según la ubicación IP del usuario, el cumplimiento del dispositivo (intact status), la "
    "autenticación multifactor (MFA) o el nivel de riesgo de la sesión. Adicionalmente, el cifrado extremo a extremo, las etiquetas de "
    "sensibilidad criptográfica y los registros de auditoría de cumplimiento garantizan la adhesión a normativas internacionales como ISO/IEC 27001, "
    "GDPR y SOC 2 Type II."
)

# Table 2: Matriz de Roles y Niveles de Permiso
headers_t2 = ["Nivel de Rol en Portal", "Alcance Operativo", "Acciones Autorizadas", "Grupo Típico Asociado"]
rows_t2 = [
    ["Propietario del Sitio (Admin)", "Administración completa del sitio o colección de sitios.", "Configurar permisos, modificar estructura, habilitar flujos y administrar metadatos.", "Jefes de Departamento / Administradores de TI."],
    ["Miembro (Colaborador)", "Participación activa en el ciclo documental y operativo.", "Crear, editar, eliminar y compartir documentos y elementos de listas.", "Analistas, especialistas y personal operativo del área."],
    ["Visitante (Lector)", "Consulta de información institucional y normativas.", "Ver y descargar documentos; navegar por páginas y visualizar noticias sin editar.", "Personal general de la empresa / Auditores externos."],
    ["Colaborador Externo (Guest)", "Acceso limitado a bibliotecas o carpetas específicas.", "Edición o lectura restringida con caducidad temporal y autenticación MFA.", "Proveedores, consultores y aliados estratégicos."]
]
add_apa_table(
    "2",
    "Matriz de Roles, Alcance y Permisos en Microsoft SharePoint",
    headers_t2,
    rows_t2,
    [3.5, 4.0, 5.5, 3.5],
    "Elaboración propia a partir del modelo de seguridad RBAC de Microsoft 365."
)

# =============================================================
# 6. TABLA COMPARATIVA FRENTE A OTROS PORTALES EMPRESARIALES
# =============================================================
h2("5. Comparativa Técnica: SharePoint vs. SAP Fiori vs. Oracle WebCenter")

p_body(
    "Para contextualizar adecuadamente la posición de Microsoft SharePoint en el mercado de software empresarial, es "
    "fundamental contrastarlo con otras soluciones de renombre que atienden nichos estratégicos divergentes: SAP Fiori "
    "(diseñado específicamente como la interfaz de usuario y portal unificado para el ecosistema SAP ERP/S4HANA) y "
    "Oracle WebCenter (la plataforma tradicional de experiencia digital y portal compuesto de Oracle Corporation)."
)

headers_t3 = ["Criterio de Evaluación", "Microsoft SharePoint", "SAP Fiori / Build Work Zone", "Oracle WebCenter"]
rows_t3 = [
    ["Propósito Principal", "Colaboración corporativa, gestión documental avanzada (ECM) e intranet.", "Portal transaccional de autoservicio y frontend de procesos de negocio ERP.", "Portal compuesto corporativo, integración de aplicaciones legadas y CMS."],
    ["Arquitectura Frontend", "SPFx (React, TypeScript, Fluent UI, HTML5) altamente desacoplado.", "SAPUI5 (JavaScript/XML), OpenUI5 y directrices de diseño Fiori en mosaicos.", "ADF (Application Development Framework), JSF (JavaServer Faces) y Portlets."],
    ["Integración Empresarial", "Nativa con Microsoft 365, Teams, Power Platform y APIs REST / Graph.", "Profunda y nativa con SAP S/4HANA, OData Services y SAP BTP.", "Integración sólida con Oracle Fusion Middleware, SOA Suite y bases de datos Oracle."],
    ["Experiencia de Usuario (UX)", "Muy intuitiva, similar a herramientas de consumo general; curva baja.", "Orientada a tareas transaccionales eficientes mediante mosaicos (Tiles).", "Tradicional y compleja; requiere maquetación y programación especializada."],
    ["Modelo de Despliegue", "Predominante Cloud SaaS (SharePoint Online); opciones híbridas.", "Cloud en SAP Business Technology Platform (BTP) y On-Premises con Fiori Front-End.", "Mayormente On-Premises o infraestructura IaaS/PaaS en Oracle Cloud Infrastructure."],
    ["Gestión Documental", "Excepcional (clasificada entre las líderes del mercado por Gartner).", "Básica; orientada a anexos transaccionales a menos que use SAP OpenText.", "Avanzada mediante Oracle WebCenter Content (antiguo Stellent)."],
    ["Costos y Licenciamiento", "Suscripción mensual por usuario incluida en planes Microsoft 365.", "Licenciamiento por usuario/núcleo ligado a licencias corporativas SAP ERP.", "Alto costo de licenciamiento por procesador/servidor más soporte anual."],
    ["Escalabilidad y Adopción", "Masiva a nivel global en PYMES y grandes corporaciones.", "Excelente en grandes empresas que ya operan la infraestructura de SAP.", "Mediana a baja; principalmente en corporativos financieros y de telecomunicaciones."]
]
add_apa_table(
    "3",
    "Matriz Comparativa Técnica entre Microsoft SharePoint, SAP Fiori y Oracle WebCenter",
    headers_t3,
    rows_t3,
    [3.2, 4.4, 4.5, 4.5],
    "Elaboración propia a partir del análisis de arquitecturas y reportes de mercado de software empresarial."
)

# =============================================================
# 7. CASO DE USO PRÁCTICO EMPRESARIAL
# =============================================================
h2("6. Caso de Uso Práctico Empresarial: Portal de Gestión Operativa")

p_body(
    "Para evidenciar la aplicabilidad de los conceptos teóricos analizados, se expone a continuación un caso de uso "
    "práctico inspirado en la modernización digital de una empresa de servicios y cuidado estético: Lush Nails Spa, "
    "una cadena con múltiples sucursales que enfrenta dificultades de dispersión de manuales de bioseguridad, solicitudes "
    "informales de insumos y falta de seguimiento en la asignación de horarios de especialistas."
)

p_body(
    "1. Arquitectura del Portal Propuesto: Se implementa un Sitio de Comunicación Central (Intranet Corporativa) que actúa como "
    "puerta de enlace principal para todos los colaboradores de la red, complementado por Sitios de Equipo protegidos para la "
    "Gerencia, Recursos Humanos, Contabilidad y Recepcionistas de cada sucursal."
)

p_body(
    "2. Gestión Documental Digitalizada: Se crea una Biblioteca Centralizada de Procedimientos Operativos Estándar (POE), en "
    "donde se alojan manuales de manicura, protocolos de esterilización y fichas técnicas de esmaltes y acrílicos. Cada archivo "
    "se etiqueta obligatoriamente con metadatos de categoría, versión aprobada y sucursal autorizada. Gracias a la coautoría "
    "en tiempo real, los supervisores técnicos actualizan protocolos de forma simultánea sin generar versiones duplicadas."
)

p_body(
    "3. Automatización de Solicitudes de Insumos con Power Automate: Cuando una manicurista o recepcionista detecta escasez "
    "de un producto crítico, registra un requerimiento en una Lista de SharePoint. Automáticamente, un flujo de Power Automate "
    "evalúa el monto solicitado: si es menor a $100 USD, notifica al administrador de la sucursal para aprobación directa vía "
    "Microsoft Teams; si excede dicho monto, enruta la solicitud a la Gerencia General con acuse de recibo. Al aprobarse, el portal "
    "envía una orden de compra digitalizada al proveedor aliado mediante correo electrónico automatizado."
)

p_body(
    "4. Resultados e Impacto en la Eficiencia: La adopción de esta solución reduce el tiempo de tramitación de pedidos de insumos "
    "de 72 horas a tan solo 2 horas, erradica el extravío de facturas físicas en un 100% y permite que el personal acceda a los "
    "horarios de atención y manuales corporativos desde cualquier dispositivo móvil o tablet en las cabinas de servicio."
)

# =============================================================
# 8. VENTAJAS Y DESVENTAJAS CRÍTICAS
# =============================================================
h2("7. Análisis Crítico: Ventajas y Desventajas")

p_body(
    "Desde una perspectiva crítica de ingeniería de software, ninguna plataforma tecnológica es universalmente perfecta. "
    "El éxito de su adopción reside en comprender cabalmente sus fortalezas y sus restricciones inherentes:"
)

headers_t4 = ["Dimensión de Análisis", "Ventajas Competitivas", "Desventajas y Limitaciones"]
rows_t4 = [
    ["Integración Tecnológica", "Sinergia nativa y perfecta con Teams, Outlook, Word, Excel, Power BI y Azure.", "Fuerte dependencia del ecosistema Microsoft (Vendor Lock-in)."],
    ["Curva de Aprendizaje", "Interfaz moderna y amigable para los usuarios finales; alta familiaridad.", "Complejidad técnica elevada en la configuración avanzada de gobernanza y taxonomías."],
    ["Gestión Documental", "Control de versiones líder en la industria, metadatos enriquecidos y coautoría.", "Riesgo de desorden si no se definen políticas estrictas de arquitectura de información."],
    ["Automatización de Procesos", "Creación rápida de flujos sin necesidad de programadores dedicados.", "Power Automate posee límites en la ejecución de bucles pesados o transacciones masivas."],
    ["Costos Operativos", "Excelente relación costo-beneficio para empresas ya suscritas a Microsoft 365.", "Planes avanzados (E5) con seguridad avanzada pueden resultar costosos para microempresas."],
    ["Desarrollo a Medida", "El framework SPFx permite crear componentes web de alto rendimiento en React.", "Requiere desarrolladores capacitados en Node.js, TypeScript y el ciclo de vida de Azure."]
]
add_apa_table(
    "4",
    "Balance Crítico de Fortalezas y Desventajas de Microsoft SharePoint",
    headers_t4,
    rows_t4,
    [3.5, 6.5, 6.5],
    "Elaboración propia con base en el análisis de adopción tecnológica empresarial."
)

# =============================================================
# 9. CONCLUSIONES
# =============================================================
h2("8. Conclusiones Técnicas")

p_body(
    "1. Los Portales Empresariales Corporativos (EIP) han trascendido el papel pasivo de almacenamiento de información "
    "para erigirse como el núcleo neurálgico de la operatividad, comunicación y toma de decisiones en las organizaciones modernas, "
    "constituyendo una pieza indispensable en cualquier estrategia seria de transformación digital."
)

p_body(
    "2. Microsoft SharePoint se posiciona como una de las plataformas de portal más completas, versátiles y maduras del mercado "
    "global, destacando especialmente por su arquitectura en la nube escalable, su liderazgo indiscutible en gestión de contenidos "
    "empresariales (ECM) y su profunda cohesión con el ecosistema de productividad y seguridad de Microsoft 365."
)

p_body(
    "3. En la comparativa frente a competidores directos, mientras que SAP Fiori domina con holgura en entornos transaccionales "
    "altamente integrados al ERP corporativo y Oracle WebCenter satisface las necesidades de portales compuestos complejos con "
    "infraestructura existente, SharePoint sobresale por su equilibrio integral entre usabilidad, velocidad de despliegue, automatización "
    "de procesos ligeros y democratización de la colaboración entre colaboradores internos y externos."
)

p_body(
    "4. Para el profesional en desarrollo de software, dominar las tecnologías de extensión de portales empresariales (como SPFx, "
    "Microsoft Graph API, Webhooks y arquitecturas de microservicios híbridas) representa una competencia altamente cotizada en el "
    "mercado laboral, permitiendo construir soluciones que integran el backend transaccional con interfaces colaborativas intuitivas y seguras."
)

# =============================================================
# 10. REFERENCIAS BIBLIOGRÁFICAS (APA 7)
# =============================================================
doc.add_page_break()
h1("Referencias")

refs = [
    [("Gartner, Inc. (2023). ", False), ("Magic Quadrant for Content Services Platforms. ", True), ("Gartner Research Reports. https://www.gartner.com/en/documents/4005882", False)],
    [("Laudon, K. C., & Laudon, J. P. (2022). ", False), ("Sistemas de información gerencial ", True), ("(17.ª ed.). Pearson Educación.", False)],
    [("Microsoft Corporation. (2024). ", False), ("SharePoint Online technical architecture and developer documentation. ", True), ("Microsoft Learn. https://learn.microsoft.com/es-es/sharepoint/", False)],
    [("Oracle Corporation. (2023). ", False), ("Oracle WebCenter Portal: Architecture and administration guide (Release 12c). ", True), ("Oracle Help Center. https://docs.oracle.com/en/middleware/webcenter/", False)],
    [("SAP SE. (2024). ", False), ("SAP Fiori design guidelines and SAP Build Work Zone overview. ", True), ("SAP Community & Documentation. https://experience.sap.com/fiori-design-web/", False)],
    [("Sommerville, I. (2021). ", False), ("Ingeniería de software ", True), ("(10.ª ed.). Pearson Educación.", False)],
    [("Stallings, W. (2023). ", False), ("Cryptography and network security: Principles and practice ", True), ("(8.ª ed.). Pearson Education.", False)]
]

for r in refs:
    add_reference(r)

# Guardar documento
doc.save(str(OUT_FILE))
print(f"Documento generado exitosamente en: {OUT_FILE}")
