#!/usr/bin/env python3
"""
Generador del Documento Académico para Taller 4 U3:
Desarrollo de Portales Empresariales o Corporativos
Instituto Superior Universitario Japón
Tema: Portal Empresarial para una Empresa Ficticia (Lush Nails Spa S.A.)
"""

import os
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from docx import Document
from docx.shared import Inches, Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import qn, nsdecls

OUT_DIR = Path("/home/snxz/Projects/lushnails-db/informe")
OUT_FILE = OUT_DIR / "Taller_4U3_Portal_Empresarial_LushNails.docx"
CAPTURAS_DIR = OUT_DIR / "capturas"
DIAGRAMS_DIR = OUT_DIR / "diagramas_generados"
DIAGRAMS_DIR.mkdir(parents=True, exist_ok=True)

# -------------------------------------------------------------
# GENERACIÓN DE DIAGRAMAS TÉCNICOS CON PILLOW
# -------------------------------------------------------------
def create_architecture_diagram():
    img_path = DIAGRAMS_DIR / "figura1_arquitectura.png"
    w, h = 1200, 700
    img = Image.new("RGB", (w, h), "#F8FAFC")
    draw = ImageDraw.Draw(img)
    
    # Header banner
    draw.rectangle([(0, 0), (w, 70)], fill="#2F4A34")
    draw.text((w // 2 - 280, 22), "ARQUITECTURA MULTICAPA DEL PORTAL EMPRESARIAL", fill="#FFFFFF")
    
    # Layer 1: Presentation (React 19)
    draw.rounded_rectangle([(60, 110), (1140, 230)], radius=12, fill="#FFFFFF", outline="#0EA5E9", width=3)
    draw.rectangle([(60, 110), (1140, 145)], fill="#0EA5E9")
    draw.text((80, 118), "1. CAPA DE PRESENTACIÓN / EXPERIENCIA DE USUARIO (FRONTEND)", fill="#FFFFFF")
    draw.rounded_rectangle([(90, 160), (410, 210)], radius=8, fill="#F0F9FF", outline="#0284C7", width=2)
    draw.text((110, 175), "Portal B2C Clientes (React 19)", fill="#0369A1")
    draw.rounded_rectangle([(440, 160), (760, 210)], radius=8, fill="#F0F9FF", outline="#0284C7", width=2)
    draw.text((460, 175), "Intranet B2E (EJS / Vite SPA)", fill="#0369A1")
    draw.rounded_rectangle([(790, 160), (1110, 210)], radius=8, fill="#F0F9FF", outline="#0284C7", width=2)
    draw.text((810, 175), "Hosting Global Edge (Vercel)", fill="#0369A1")

    # Connector 1
    draw.line([(w // 2, 230), (w // 2, 270)], fill="#64748B", width=4)
    draw.polygon([(w // 2 - 8, 260), (w // 2 + 8, 260), (w // 2, 275)], fill="#64748B")
    draw.text((w // 2 + 15, 240), "HTTPS / REST API JSON / Sesiones", fill="#475569")

    # Layer 2: Services & Logic (Node.js Express)
    draw.rounded_rectangle([(60, 280), (1140, 420)], radius=12, fill="#FFFFFF", outline="#10B981", width=3)
    draw.rectangle([(60, 280), (1140, 315)], fill="#10B981")
    draw.text((80, 288), "2. CAPA DE SERVICIOS, LÓGICA DE NEGOCIO Y AUTORIZACIÓN (BACKEND)", fill="#FFFFFF")
    draw.rounded_rectangle([(90, 335), (320, 400)], radius=8, fill="#ECFDF5", outline="#059669", width=2)
    draw.text((110, 348), "Módulo Citas & Agenda", fill="#047857")
    draw.text((110, 370), "Validación Disponibilidad", fill="#065F46")
    draw.rounded_rectangle([(340, 335), (570, 400)], radius=8, fill="#ECFDF5", outline="#059669", width=2)
    draw.text((360, 348), "Seguridad & RBAC", fill="#047857")
    draw.text((360, 370), "Bcrypt / Session Auth", fill="#065F46")
    draw.rounded_rectangle([(590, 335), (830, 400)], radius=8, fill="#ECFDF5", outline="#059669", width=2)
    draw.text((610, 348), "Gestión Operativa & RRHH", fill="#047857")
    draw.text((610, 370), "Empleados / Sucursales", fill="#065F46")
    draw.rounded_rectangle([(850, 335), (1110, 400)], radius=8, fill="#ECFDF5", outline="#059669", width=2)
    draw.text((870, 348), "Balanced Scorecard (BSC)", fill="#047857")
    draw.text((870, 370), "Tablero de Indicadores", fill="#065F46")

    # Connector 2
    draw.line([(w // 2, 420), (w // 2, 460)], fill="#64748B", width=4)
    draw.polygon([(w // 2 - 8, 450), (w // 2 + 8, 450), (w // 2, 465)], fill="#64748B")
    draw.text((w // 2 + 15, 430), "Conexión Segura SSL (Pool PG)", fill="#475569")

    # Layer 3: Persistence (PostgreSQL 16 Neon Cloud)
    draw.rounded_rectangle([(60, 470), (1140, 640)], radius=12, fill="#FFFFFF", outline="#8B5CF6", width=3)
    draw.rectangle([(60, 470), (1140, 505)], fill="#8B5CF6")
    draw.text((80, 478), "3. CAPA DE PERSISTENCIA Y MOTOR DE BASE DE DATOS (NEON POSTGRESQL 16)", fill="#FFFFFF")
    draw.rounded_rectangle([(90, 525), (410, 620)], radius=8, fill="#F5F3FF", outline="#7C3AED", width=2)
    draw.text((110, 545), "Esquema Relacional (19 Tablas)", fill="#5B21B6")
    draw.text((110, 575), "usuario_admin, rol, cita, cliente...", fill="#4C1D95")
    draw.rounded_rectangle([(440, 525), (760, 620)], radius=8, fill="#F5F3FF", outline="#7C3AED", width=2)
    draw.text((460, 545), "Vistas & Triggers de Negocio", fill="#5B21B6")
    draw.text((460, 575), "v_citas_completas, v_financiero", fill="#4C1D95")
    draw.rounded_rectangle([(790, 525), (1110, 620)], radius=8, fill="#F5F3FF", outline="#7C3AED", width=2)
    draw.text((810, 545), "Escalabilidad Serverless", fill="#5B21B6")
    draw.text((810, 575), "Scale-to-Zero / Pooling / SSL", fill="#4C1D95")

    img.save(str(img_path))
    return img_path

def create_flowchart_diagram():
    img_path = DIAGRAMS_DIR / "figura2_flujo_citas.png"
    w, h = 1200, 360
    img = Image.new("RGB", (w, h), "#FFFFFF")
    draw = ImageDraw.Draw(img)
    
    # Title
    draw.rectangle([(0, 0), (w, 50)], fill="#1E293B")
    draw.text((w // 2 - 250, 15), "FLUJO DE RESERVA Y GESTIÓN EN EL PORTAL EMPRESARIAL", fill="#FFFFFF")
    
    steps = [
        ("1. Cliente en Portal B2C", "Selecciona sucursal, servicio y fecha.", "#0284C7"),
        ("2. Consulta API Backend", "Verifica disponibilidad en tiempo real.", "#0D9488"),
        ("3. Confirmación & Pago", "Registra cita con estado pendiente.", "#D97706"),
        ("4. Asignación Especialista", "Recepción asigna cabina y manicurista.", "#7C3AED"),
        ("5. Atención & Cierre", "Se emite comprobante y alimenta BSC.", "#059669")
    ]
    
    box_w = 200
    gap = 25
    start_x = 40
    y = 110
    
    for i, (title, desc, color) in enumerate(steps):
        x = start_x + i * (box_w + gap)
        draw.rounded_rectangle([(x, y), (x + box_w, y + 170)], radius=10, fill="#F8FAFC", outline=color, width=3)
        draw.rectangle([(x, y), (x + box_w, y + 45)], fill=color)
        draw.text((x + 10, y + 14), title, fill="#FFFFFF")
        
        # Text wrapping
        draw.text((x + 15, y + 70), desc[:24], fill="#1E293B")
        if len(desc) > 24:
            draw.text((x + 15, y + 100), desc[24:], fill="#1E293B")
            
        if i < len(steps) - 1:
            arr_x = x + box_w
            draw.line([(arr_x, y + 85), (arr_x + gap, y + 85)], fill="#64748B", width=3)
            draw.polygon([(arr_x + gap, y + 85), (arr_x + gap - 8, y + 79), (arr_x + gap - 8, y + 91)], fill="#64748B")

    img.save(str(img_path))
    return img_path

def create_bsc_diagram():
    img_path = DIAGRAMS_DIR / "figura3_bsc.png"
    w, h = 1100, 600
    img = Image.new("RGB", (w, h), "#F8FAFC")
    draw = ImageDraw.Draw(img)
    
    draw.rectangle([(0, 0), (w, 60)], fill="#312E81")
    draw.text((w // 2 - 280, 18), "BALANCED SCORECARD (BSC) - LUSH NAILS SPA S.A.", fill="#FFFFFF")
    
    # 4 Quadrants
    # 1. Financiera
    draw.rounded_rectangle([(60, 90), (520, 310)], radius=12, fill="#FFFFFF", outline="#3B82F6", width=3)
    draw.rectangle([(60, 90), (520, 130)], fill="#3B82F6")
    draw.text((80, 102), "PERSPECTIVA FINANCIERA", fill="#FFFFFF")
    draw.text((80, 150), "• Ingresos mensuales totales (Meta: > $500/mes)", fill="#1E293B")
    draw.text((80, 185), "• Ticket promedio por servicio (Meta: >= $40)", fill="#1E293B")
    draw.text((80, 220), "• Sucursales activas generando ingresos (>= 3)", fill="#1E293B")
    draw.text((80, 255), "• Control de costos y rentabilidad por sede", fill="#1E293B")

    # 2. Clientes
    draw.rounded_rectangle([(580, 90), (1040, 310)], radius=12, fill="#FFFFFF", outline="#10B981", width=3)
    draw.rectangle([(580, 90), (1040, 130)], fill="#10B981")
    draw.text((600, 102), "PERSPECTIVA DEL CLIENTE", fill="#FFFFFF")
    draw.text((600, 150), "• Tasa de citas completadas vs canceladas", fill="#1E293B")
    draw.text((600, 185), "• Clientes nuevos registrados en el portal", fill="#1E293B")
    draw.text((600, 220), "• Tasa de retención y fidelización de clientes", fill="#1E293B")
    draw.text((600, 255), "• Satisfacción en reservas web sin fricción", fill="#1E293B")

    # 3. Procesos Internos
    draw.rounded_rectangle([(60, 340), (520, 560)], radius=12, fill="#FFFFFF", outline="#F59E0B", width=3)
    draw.rectangle([(60, 340), (520, 380)], fill="#F59E0B")
    draw.text((80, 352), "PERSPECTIVA DE PROCESOS INTERNOS", fill="#FFFFFF")
    draw.text((80, 400), "• Tiempo promedio de atención y asignación", fill="#1E293B")
    draw.text((80, 435), "• Índice de cancelación de citas (Meta: <= 2)", fill="#1E293B")
    draw.text((80, 470), "• Catálogo activo de servicios y galería visual", fill="#1E293B")
    draw.text((80, 505), "• Eficiencia en compras con aliados estratégicos", fill="#1E293B")

    # 4. Aprendizaje y Crecimiento
    draw.rounded_rectangle([(580, 340), (1040, 560)], radius=12, fill="#FFFFFF", outline="#8B5CF6", width=3)
    draw.rectangle([(580, 340), (1040, 380)], fill="#8B5CF6")
    draw.text((600, 352), "APRENDIZAJE Y CRECIMIENTO (TALENTO)", fill="#FFFFFF")
    draw.text((600, 400), "• Postulaciones laborales procesadas por RRHH", fill="#1E293B")
    draw.text((600, 435), "• Capacitación continua en técnicas de manicura", fill="#1E293B")
    draw.text((600, 470), "• Adopción de herramientas digitales y accesibilidad", fill="#1E293B")
    draw.text((600, 505), "• Clima laboral y estabilidad de especialistas", fill="#1E293B")

    img.save(str(img_path))
    return img_path

fig1_path = create_architecture_diagram()
fig2_path = create_flowchart_diagram()
fig3_path = create_bsc_diagram()

# -------------------------------------------------------------
# CONSTRUCCIÓN DEL DOCUMENTO WORD EN FORMATO APA 7
# -------------------------------------------------------------
doc = Document()

# Configurar Márgenes (2.54 cm / 1 pulgada en todos los lados - APA 7)
for section in doc.sections:
    section.top_margin = Cm(2.54)
    section.bottom_margin = Cm(2.54)
    section.left_margin = Cm(2.54)
    section.right_margin = Cm(2.54)

# Estilo Normal: Times New Roman 12 pt, Interlineado Doble
normal_style = doc.styles["Normal"]
normal_style.font.name = "Times New Roman"
normal_style._element.rPr.rFonts.set(qn("w:eastAsia"), "Times New Roman")
normal_style.font.size = Pt(12)
normal_style.paragraph_format.line_spacing_rule = WD_LINE_SPACING.DOUBLE
normal_style.paragraph_format.space_after = Pt(0)
normal_style.paragraph_format.space_before = Pt(0)

# Encabezado APA 7 con número de página a la derecha
header = doc.sections[0].header.paragraphs[0]
header.alignment = WD_ALIGN_PARAGRAPH.RIGHT
header_run = header.add_run()
fld_begin = OxmlElement("w:fldChar"); fld_begin.set(qn("w:fldCharType"), "begin")
instr = OxmlElement("w:instrText"); instr.set(qn("xml:space"), "preserve"); instr.text = "PAGE"
fld_end = OxmlElement("w:fldChar"); fld_end.set(qn("w:fldCharType"), "end")
header_run._r.extend([fld_begin, instr, fld_end])
header_run.font.name = "Times New Roman"; header_run.font.size = Pt(12)

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
                    '<w:left w:val="none"/><w:right w:val="none"/>'
                    '</w:tcBorders>'
                )
            elif i == len(table.rows) - 1:
                borders = parse_xml(
                    f'<w:tcBorders {nsdecls("w")}>'
                    '<w:top w:val="none"/>'
                    '<w:bottom w:val="single" w:sz="8" w:space="0" w:color="000000"/>'
                    '<w:left w:val="none"/><w:right w:val="none"/>'
                    '</w:tcBorders>'
                )
            else:
                borders = parse_xml(
                    f'<w:tcBorders {nsdecls("w")}>'
                    '<w:top w:val="none"/><w:bottom w:val="none"/>'
                    '<w:left w:val="none"/><w:right w:val="none"/>'
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
    r_num.font.name = "Times New Roman"; r_num.font.size = Pt(12)
    
    p_title = doc.add_paragraph()
    p_title.paragraph_format.line_spacing = 1.15
    p_title.paragraph_format.space_before = Pt(0)
    p_title.paragraph_format.space_after = Pt(6)
    r_title = p_title.add_run(title_str)
    r_title.italic = True
    r_title.font.name = "Times New Roman"; r_title.font.size = Pt(12)
    
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
        r.font.name = "Times New Roman"; r.font.size = Pt(10)
        
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
    r_note_lbl.font.name = "Times New Roman"; r_note_lbl.font.size = Pt(10)
    note_text = note if note else "Elaboración propia a partir del diseño del portal empresarial."
    r_note = p_note.add_run(note_text)
    r_note.font.name = "Times New Roman"; r_note.font.size = Pt(10)
    return tbl

def add_apa_figure(num_str, title_str, image_path, width_inches=6.0, note=None):
    p_num = doc.add_paragraph()
    p_num.paragraph_format.line_spacing = 1.15
    p_num.paragraph_format.space_before = Pt(12)
    p_num.paragraph_format.space_after = Pt(2)
    r_num = p_num.add_run(f"Figura {num_str}")
    r_num.bold = True
    r_num.font.name = "Times New Roman"; r_num.font.size = Pt(12)
    
    p_title = doc.add_paragraph()
    p_title.paragraph_format.line_spacing = 1.15
    p_title.paragraph_format.space_before = Pt(0)
    p_title.paragraph_format.space_after = Pt(6)
    r_title = p_title.add_run(title_str)
    r_title.italic = True
    r_title.font.name = "Times New Roman"; r_title.font.size = Pt(12)
    
    p_img = doc.add_paragraph()
    p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_img.paragraph_format.space_before = Pt(4)
    p_img.paragraph_format.space_after = Pt(4)
    run_img = p_img.add_run()
    run_img.add_picture(str(image_path), width=Inches(width_inches))
    
    p_note = doc.add_paragraph()
    p_note.paragraph_format.line_spacing = 1.15
    p_note.paragraph_format.space_before = Pt(4)
    p_note.paragraph_format.space_after = Pt(12)
    r_note_lbl = p_note.add_run("Nota. ")
    r_note_lbl.italic = True
    r_note_lbl.font.name = "Times New Roman"; r_note_lbl.font.size = Pt(10)
    note_text = note if note else "Captura y modelado técnico del portal empresarial desarrollado."
    r_note = p_note.add_run(note_text)
    r_note.font.name = "Times New Roman"; r_note.font.size = Pt(10)

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
        r.font.name = "Times New Roman"; r.font.size = Pt(12)
        if is_italic:
            r.italic = True

# =============================================================
# 1. PORTADA INSTITUCIONAL APA 7
# =============================================================
for _ in range(3):
    p = doc.add_paragraph()
    p.paragraph_format.line_spacing = 1.0

p_title = doc.add_paragraph()
p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
p_title.paragraph_format.line_spacing_rule = WD_LINE_SPACING.DOUBLE
r_t = p_title.add_run("Diseño, Arquitectura e Implementación de un Portal Empresarial Corporativo:")
r_t.bold = True; r_t.font.size = Pt(12)
p_title.add_run("\n")
r_t2 = p_title.add_run("Estudio de Caso Integral para la Empresa Ficticia Lush Nails Spa S.A.")
r_t2.bold = True; r_t2.font.size = Pt(12)

p_sub = doc.add_paragraph()
p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
p_sub.paragraph_format.line_spacing_rule = WD_LINE_SPACING.DOUBLE
r_sub = p_sub.add_run("Informe Técnico de Diseño y Desarrollo – Taller 4 (Unidad 3)")
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
# 2. INTRODUCCIÓN Y CONTEXTO DE LA EMPRESA FICTICIA
# =============================================================
h1("Portal Empresarial Corporativo: Lush Nails Spa S.A.")

h2("1. Perfil Corporativo de la Empresa Ficticia")

p_body(
    "En el entorno de negocios actual, las empresas dedicadas al sector de servicios estéticos, cuidado personal y "
    "bienestar operan en un mercado altamente competitivo, donde la experiencia del cliente y la agilidad administrativa "
    "son factores decisivos para la sostenibilidad y el crecimiento. Para el desarrollo del presente taller práctico de la "
    "Unidad 3, se concibe la empresa ficticia Lush Nails Spa S.A., una cadena corporativa en expansión especializada en servicios "
    "profesionales de manicura, pedicura estética, tratamientos de spa y diseño de uñas con tres sucursales operativas en áreas urbanas clave."
)

p_body(
    "Razón Social: Lush Nails Spa S.A. Giro del Negocio: Servicios de belleza, spa de uñas y venta de insumos profesionales. "
    "Misión Corporativa: Ofrecer una experiencia de bienestar y belleza personalizada, garantizando los más rigurosos estándares "
    "de higiene, profesionalismo y vanguardia estética, respaldados por plataformas tecnológicas accesibles e intuitivas. "
    "Visión Estratégica: Consolidarse como la franquicia de spas de uñas líder a nivel nacional, destacándose por su excelencia "
    "operativa, digitalización total de procesos y fidelización transparente de clientes (Laudon & Laudon, 2022)."
)

p_body(
    "Antes de la concepción del portal empresarial, la organización presentaba importantes ineficiencias operativas: gestión "
    "manual de agendas de citas por aplicaciones de mensajería instantánea propensa a duplicidades y olvidos, falta de consolidación "
    "financiera entre sucursales, pedidos informales de esmaltes y químicos a proveedores, y ausencia de un canal corporativo que "
    "evaluara el rendimiento del personal y el cumplimiento de objetivos estratégicos mediante indicadores unificados."
)

# =============================================================
# 3. PROPÓSITO, ALCANCE Y MÓDULOS DEL PORTAL
# =============================================================
h2("2. Alcance Funcional y Arquitectura de Módulos")

p_body(
    "El portal empresarial corporativo de Lush Nails Spa se diseña bajo un paradigma dual: combina un Portal Público B2C "
    "(Business-to-Consumer) orientado a la captación, reserva y autoservicio del cliente final, con una Intranet Corporativa B2E "
    "(Business-to-Employee) protegida para la administración integral del negocio, asignación de citas, control de talento humano "
    "y seguimiento del Cuadro de Mando Integral (Balanced Scorecard)."
)

headers_m = ["Capa Funcional", "Módulos Integrados", "Responsabilidad Principal", "Usuarios Destinatarios"]
rows_m = [
    ["Portal Público (B2C)", "Inicio, Catálogo de Servicios, Sedes, Agenda en Línea, Galería y Postulación Laboral.", "Atención omnicanal al cliente, reserva de turnos en tiempo real, difusión de marca y captación de talento.", "Clientes finales, visitantes web y aspirantes laborales."],
    ["Intranet Operativa (B2E)", "Dashboard de Turnos, Gestión de Citas, Asignación de Cabinas, Fichas de Clientes y Horarios.", "Orquestación de la operación diaria en cada sucursal, confirmación de citas y control de presencia de manicuristas.", "Recepcionistas, especialistas y supervisores de sede."],
    ["Gestión Corporativa (B2B)", "Módulo de Proveedores, Alianzas Comerciales y Gestión de Talento Humano (RRHH).", "Registro de compras de insumos, convenios corporativos y evaluación de expedientes de postulantes.", "Departamento de Compras y Jefatura de Recursos Humanos."],
    ["Dirección Estratégica (BI)", "Balanced Scorecard (BSC), Tablero de Comando Ejecutivo, Historial Financiero y Roles.", "Monitoreo de KPIs en 4 perspectivas, auditoría de transacciones y gobernanza de accesos.", "Gerencia General, Socios y Dirección Contable."]
]
add_apa_table(
    "1",
    "Matriz de Módulos, Alcance y Responsabilidad del Portal Empresarial",
    headers_m,
    rows_m,
    [3.2, 5.0, 5.0, 3.8],
    "Elaboración propia a partir del análisis funcional del portal corporativo."
)

# =============================================================
# 4. ARQUITECTURA TECNOLÓGICA Y MODELO DE PERSISTENCIA
# =============================================================
h2("3. Arquitectura Tecnológica y Modelo de Persistencia")

p_body(
    "El portal se implementa bajo una arquitectura desacoplada de tres capas (Three-Tier Architecture), asegurando alta disponibilidad, "
    "mantenibilidad, escalabilidad independiente y rigurosa separación de responsabilidades (Sommerville, 2021):"
)

p_body(
    "1. Capa de Presentación (Frontend): Construida con React 19 y TypeScript en el portal de clientes, complementada con vistas "
    "dinámicas en Express/EJS para la intranet administrativa. Se encuentra alojada y distribuida globalmente en la plataforma serverless "
    "Vercel Edge Network (`https://lushnails-db.vercel.app`), garantizando tiempos de respuesta ultrarrápidos y optimización SEO."
)

p_body(
    "2. Capa de Lógica de Negocio y APIs (Backend): Desarrollada en Node.js con el framework Express. Expone una API REST modular "
    "con controladores específicos para autenticación, disponibilidad de empleados, citas, clientes y analítica. Gestiona sesiones "
    "persistentes y seguras a través de express-session respaldadas en la base de datos relacional."
)

p_body(
    "3. Capa de Datos y Persistencia (Database): Utiliza PostgreSQL 16 alojado en la nube elástica de Neon (`aws-us-east-2`). El modelo "
    "está compuesto por 19 tablas relacionales normalizadas en Tercera Forma Normal (3NF), complementado con vistas financieras compiladas "
    "(`v_citas_completas`, `v_financiero`), procedimientos almacenados y triggers de actualización automática de auditoría (updated_at)."
)

add_apa_figure(
    "1",
    "Arquitectura Multicapa del Portal Empresarial Lush Nails Spa S.A.",
    fig1_path,
    6.0,
    "Elaboración propia mediante modelado de capas de software (Frontend, Backend y Cloud Database)."
)

# =============================================================
# 5. SEGURIDAD, RBAC Y FLUJO DE OPERACIÓN
# =============================================================
h2("4. Seguridad y Control de Acceso Basado en Roles (RBAC)")

p_body(
    "La seguridad del portal corporativo se estructura sobre un riguroso esquema de Control de Acceso Basado en Roles (RBAC). "
    "La tabla `usuario_admin` se vincula con la entidad `rol`, y esta a su vez se asocia de forma muchos a muchos con el catálogo de `permiso` "
    "a través de `rol_permiso`. Las contraseñas se almacenan mediante hashes criptográficos salados con el algoritmo unidireccional bcrypt "
    "(cost factor 10), impidiendo su recuperación en texto claro incluso en caso de exfiltración de la base de datos (Stallings, 2023)."
)

headers_r = ["Código de Rol", "Nombre del Rol", "Alcance de Permisos Autorizados", "Perfil Operativo"]
rows_r = [
    ["superadmin", "Super Administrador", "Acceso irrestricto a los 16 permisos del sistema y gestión total de roles.", "Administrador General del Sistema / TI."],
    ["admin", "Administrador de Sede", "Gestión operativa completa de citas, clientes, catálogo y personal de sede.", "Gerente de Sucursal."],
    ["recepcionista", "Recepción y Agenda", "dashboard.ver, citas.gestionar, clientes.gestionar, historial.gestionar.", "Personal de Counter y Atención Telefónica."],
    ["rrhh", "Recursos Humanos", "dashboard.ver, empleados.gestionar y postulaciones.gestionar.", "Coordinador de Personal y Selección."],
    ["gerencia", "Gerencia y Dirección", "dashboard.ver, tablero.ver, bsc.ver e historial.ver (solo lectura analítica).", "Dirección General y Junta Directiva."],
    ["contabilidad", "Contabilidad y Finanzas", "dashboard.ver, bsc.ver, tablero.ver e historial.ver de ingresos económicos.", "Auditoría Interna y Contabilidad."]
]
add_apa_table(
    "2",
    "Matriz de Roles y Niveles de Autorización en el Portal",
    headers_r,
    rows_r,
    [3.0, 3.8, 6.2, 4.0],
    "Elaboración propia a partir del esquema de seguridad implementado en el backend del portal."
)

p_body(
    "El flujo operativo de reserva y confirmación de citas en el portal se ilustra en la Figura 2. El cliente selecciona su servicio "
    "y sede en la interfaz web; el backend consulta dinámicamente la disponibilidad cruzando los turnos del personal en PostgreSQL; tras la "
    "confirmación, la recepcionista asigna especialista y cabina en la intranet, actualizando el tablero y generando métricas inmediatas en el sistema."
)

add_apa_figure(
    "2",
    "Diagrama de Flujo del Proceso de Reserva y Asignación de Citas en el Portal",
    fig2_path,
    6.0,
    "Elaboración propia basada en el proceso de negocio y reservas del portal web."
)

# =============================================================
# 6. BALANCED SCORECARD E INDICADORES DE GESTIÓN
# =============================================================
h2("5. Cuadro de Mando Integral (Balanced Scorecard - BSC)")

p_body(
    "Un portal empresarial trasciende la mera gestión transaccional cuando proporciona inteligencia de negocios para la toma de decisiones. "
    "El portal de Lush Nails Spa incorpora un módulo nativo de Balanced Scorecard (Kaplan & Norton, 1996) que evalúa el desempeño del negocio "
    "a través de 4 perspectivas interdependientes:"
)

add_apa_figure(
    "3",
    "Cuadro de Mando Integral (BSC) Implementado en el Portal Empresarial",
    fig3_path,
    5.8,
    "Elaboración propia con base en las cuatro perspectivas estratégicas de Kaplan y Norton (1996)."
)

headers_kpi = ["Perspectiva", "Indicador Estratégico", "Fórmula de Cálculo", "Meta Definida", "Fuente de Datos"]
rows_kpi = [
    ["Financiera", "Ingresos Mensuales Netos", "SUM(monto) en servicios completados en el mes", "> $500 / mes", "Tabla servicio_realizado"],
    ["Financiera", "Ticket Promedio por Servicio", "AVG(monto) por servicio realizado", ">= $40 / ticket", "Tabla servicio_realizado"],
    ["Financiera", "Sucursales Operativas Activas", "COUNT(sucursal) con estado activo = true", ">= 3 sedes", "Tabla sucursal"],
    ["Clientes", "Citas Completadas con Éxito", "COUNT(cita) con estado = completada", ">= 10 citas/mes", "Tabla cita"],
    ["Clientes", "Crecimiento de Nuevos Clientes", "COUNT(cliente) registrados en los últimos 30 días", ">= 10 clientes", "Tabla cliente"],
    ["Procesos Internos", "Tasa de Cancelación de Citas", "COUNT(cita cancelada) / Total citas agendadas", "<= 2 cancelaciones", "Tabla cita"],
    ["Procesos Internos", "Tiempo Promedio de Atención", "AVG(updated_at - created_at) en servicios cerrados", "<= 60 minutos", "Tabla cita"],
    ["Talento / Aprendizaje", "Postulaciones Evaluadas", "COUNT(postulacion) revisadas por RRHH", ">= 1 postulante", "Tabla postulacion"]
]
add_apa_table(
    "3",
    "Indicadores Clave de Desempeño (KPIs) del Balanced Scorecard",
    headers_kpi,
    rows_kpi,
    [3.2, 4.0, 4.8, 2.5, 3.5],
    "Elaboración propia a partir de las métricas configuradas en el tablero de control del portal."
)

# =============================================================
# 7. ESTIMACIÓN DE PUNTOS DE FUNCIÓN Y PLANIFICACIÓN
# =============================================================
h2("6. Estimación Funcional y Planificación en ProjectLibre")

p_body(
    "Para cuantificar el esfuerzo y dimensionamiento del software de forma independiente del lenguaje de programación, se aplicó el método "
    "de Puntos de Función No Ajustados (PFNA) del International Function Point Users Group (IFPUG, 2022). La medición arrojó un total de "
    "426 PFNA distribuidos en 29 Entradas Externas (EI), 12 Salidas Externas (EO), 15 Consultas Externas (EQ) y 19 Archivos Lógicos Internos (ILF)."
)

headers_pf = ["Tipo de Componente Funcional", "Cantidad", "Peso Promedio", "Puntos de Función (PFNA)", "Descripción Funcional"]
rows_pf = [
    ["Entradas Externas (EI)", 29, 4, 116, "Formularios de autenticación, alta de citas, clientes, servicios y sedes."],
    ["Salidas Externas (EO)", 12, 5, 60, "Tableros analíticos, vistas de BSC, reportes financieros y alertas de cupos."],
    ["Consultas Externas (EQ)", 15, 4, 60, "Búsquedas de catálogo, verificación de horarios y filtrado de citas."],
    ["Archivos Lógicos Internos (ILF)", 19, 10, 190, "Entidades de base de datos relacional mantenidas por la aplicación."],
    ["Archivos de Interfaz Externa (EIF)", 0, 7, 0, "No consume bases de datos transaccionales externas directas."],
    ["Total Funcional", "-", "-", 426, "Total Puntos de Función No Ajustados (IFPUG)."]
]
add_apa_table(
    "4",
    "Estimación de Puntos de Función No Ajustados del Portal Empresarial",
    headers_pf,
    rows_pf,
    [3.8, 1.8, 1.8, 2.2, 6.4],
    "Elaboración propia bajo metodología estándar IFPUG (2022)."
)

p_body(
    "La gestión y planificación del desarrollo del portal se modeló formalmente en ProjectLibre, estructurando el proyecto en 4 paquetes "
    "de trabajo con dependencias Fin-Comienzo (FS): Base de Datos relacional, Panel Administrativo (Backend/RBAC), Sitio Corporativo (Frontend) "
    "y Aseguramiento de la Calidad y Pruebas Integrales. A continuación, se presentan las evidencias de planificación obtenidas del software:"
)

# Inserting ProjectLibre figures
add_apa_figure(
    "4",
    "Estructura de Descomposición del Trabajo (EDT/WBS) del Portal en ProjectLibre",
    CAPTURAS_DIR / "03_estructura_tareas.png",
    5.8,
    "Captura directa de la jerarquía de tareas del portal en ProjectLibre."
)

add_apa_figure(
    "5",
    "Diagrama de Gantt del Cronograma de Implementación del Portal Empresarial",
    CAPTURAS_DIR / "07_gantt.png",
    5.8,
    "Cronograma temporal de 17 días hábiles de desarrollo modelado en ProjectLibre."
)

add_apa_figure(
    "6",
    "Red de Actividades, Holguras y Ruta Crítica del Proyecto",
    CAPTURAS_DIR / "08_ruta_critica.png",
    5.8,
    "Identificación de tareas críticas en rojo que determinan la fecha de entrega del software."
)

add_apa_figure(
    "7",
    "Distribución Presupuestaria y Asignación de Costos por Recurso",
    CAPTURAS_DIR / "09_costos.png",
    5.8,
    "Cálculo de costos directos de personal técnico (desarrolladores y analistas) en ProjectLibre."
)

# =============================================================
# 8. CONCLUSIONES Y RECOMENDACIONES
# =============================================================
h2("7. Conclusiones y Recomendaciones")

p_body(
    "1. El diseño del portal empresarial corporativo para la empresa ficticia Lush Nails Spa S.A. demuestra cómo la integración "
    "de tecnologías web modernas (React 19, Express y PostgreSQL en la nube) resuelve integralmente la problemática de desorganización, "
    "duplicidad de agendas y descontrol operativo en una empresa de servicios con múltiples locales."
)

p_body(
    "2. La implementación de un esquema de seguridad RBAC granular y persistente garantiza que cada colaborador (desde recepcionistas "
    "hasta gerentes y auditores contables) acceda exclusivamente a los módulos requeridos para su labor, salvaguardando la confidencialidad "
    "de la información financiera y de los clientes bajo estándares profesionales."
)

p_body(
    "3. La inclusión de un Balanced Scorecard nativo con cuatro perspectivas enriquece el portal al convertirlo en un centro neurálgico "
    "de toma de decisiones estratégicas, permitiendo a la directiva medir la salud del negocio a través de KPIs cuantitativos actualizados en tiempo real."
)

p_body(
    "4. Como recomendación futura, se sugiere incorporar pasarelas de pago electrónico en línea (e.g. Stripe o PayPhone) para anticipos "
    "de reservas, así como la habilitación de notificaciones automáticas vía WhatsApp Business API para reducir aún más la tasa de inasistencia a citas."
)

# =============================================================
# 9. REFERENCIAS BIBLIOGRÁFICAS EN APA 7
# =============================================================
doc.add_page_break()
h1("Referencias")

refs = [
    [("International Function Point Users Group. (2022). ", False), ("Counting practices manual (Release 4.3.1). ", True), ("IFPUG Publications.", False)],
    [("Kaplan, R. S., & Norton, D. P. (1996). ", False), ("The balanced scorecard: Translating strategy into action. ", True), ("Harvard Business Review Press.", False)],
    [("Laudon, K. C., & Laudon, J. P. (2022). ", False), ("Sistemas de información gerencial ", True), ("(17.ª ed.). Pearson Educación.", False)],
    [("Lush Nails Spa S.A. (2026). ", False), ("Repositorio y arquitectura del portal web corporativo ", True), ("[Código fuente y prototipo desplegado en Vercel y Neon].", False)],
    [("OWASP Foundation. (2021). ", False), ("OWASP Top 10 web application security risks. ", True), ("https://owasp.org/Top10/", False)],
    [("Project Management Institute. (2021). ", False), ("A guide to the project management body of knowledge (PMBOK guide) ", True), ("(7.ª ed.). PMI Publications.", False)],
    [("Sommerville, I. (2021). ", False), ("Ingeniería de software ", True), ("(10.ª ed.). Pearson Educación.", False)],
    [("Stallings, W. (2023). ", False), ("Cryptography and network security: Principles and practice ", True), ("(8.ª ed.). Pearson Education.", False)],
    [("World Wide Web Consortium. (2018). ", False), ("Web Content Accessibility Guidelines (WCAG) 2.1. ", True), ("W3C Recommendation. https://www.w3.org/TR/WCAG21/", False)]
]

for r in refs:
    add_reference(r)

# Guardar documento
doc.save(str(OUT_FILE))
print(f"Documento generado exitosamente en: {OUT_FILE}")
