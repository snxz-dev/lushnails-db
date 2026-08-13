# ENTREGABLES — Revisión Técnica SPA Nails Lush

Documento de trabajo para alinear el proyecto con el checklist del revisor.

---

## 1. Modelo Entidad-Relación Actualizado

**Archivo**: `diagramas/Diagrama_Relacional_BD.png` (19 tablas) · fuente `diagramas/lushnails_er.mmd`

Tablas nuevas incorporadas respecto a la versión anterior del documento:

| Tabla | Propósito | Relaciones |
|---|---|---|
| `rol` | Roles del sistema (superadmin, admin, recepcionista, rrhh, gerencia, contabilidad) | 1—N con `usuario_admin`; N—M con `permiso` vía `rol_permiso` |
| `permiso` | Permisos/capacidades por módulo (`dashboard.ver`, `citas.gestionar`, `bsc.ver`, etc.) | N—M con `rol` vía `rol_permiso` |
| `rol_permiso` | Tabla intermedia N:M rol—permiso | FK `id_rol`, FK `id_permiso` |
| `horario_empleado` | Disponibilidad semanal de cada empleado (día, inicio, fin) | FK `id_empleado` → `empleado` |
| `servicio_realizado` | Historial de atención: detalle de cada servicio ejecutado en citas completadas | FK `id_cita` → `cita`, FK `id_servicio` → `servicio`, FK `id_empleado`, FK `id_sucursal` |

Además:
- `usuario_admin` ahora tiene FK `id_rol` → `rol` (conserva la columna `rol` VARCHAR con el código).
- Vista `v_financiero`: ingresos por servicio realizado (alimenta el BSC): `fecha, monto, servicio, sucursal, empleado, precio_lista, diferencia`.
- Vista `v_citas_completas`: agrega servicios de cada cita con `string_agg`.

---

## 2. Casos de Uso Faltantes

El documento tiene 8 CU (CU-01 a CU-08). Para quedar coherente con el alcance (roles/permisos, horarios, historial, reportes, BSC/tablero) se requieren:

| Código | Caso de Uso | Actor principal | Permiso asociado |
|---|---|---|---|
| **CU-09** | GESTIONAR USUARIOS Y ROLES | Super Administrador | `roles.gestionar` |
| **CU-10** | GESTIONAR PERMISOS POR ROL | Super Administrador | `roles.gestionar` |
| **CU-11** | GESTIONAR HORARIOS DE EMPLEADOS | RRHH / Administrador | `empleados.gestionar` |
| **CU-12** | REGISTRAR SERVICIO REALIZADO (historial de atención) | Recepcionista | `historial.gestionar` |
| **CU-13** | CONSULTAR HISTORIAL DE ATENCIONES | Recepcionista / Gerencia / Contabilidad | `historial.ver` |
| **CU-14** | VER BALANCED SCORECARD | Gerencia / Contabilidad | `bsc.ver` |
| **CU-15** | VER TABLERO DE COMANDO | Gerencia | `tablero.ver` |
| **CU-16** | GENERAR REPORTES FINANCIEROS (ingresos, ticket promedio, rentabilidad) | Contabilidad / Gerencia | `bsc.ver` |
| **CU-17** | GESTIONAR PROVEEDORES | Administrador | `proveedores.gestionar` |
| **CU-18** | GESTIONAR ALIADOS ESTRATÉGICOS | Administrador | `aliados.gestionar` |

> CU-17 y CU-18 ya están implementados (tablas `proveedor` y `aliado` + pantallas) pero faltan en el documento. Se añaden para cerrar la brecha Alcance→Implementación (punto 1 del checklist).

---

## 3. Balanced Scorecard — Texto Corregido (Perspectiva Financiera)

Texto corregido para la **Tabla 16 / Figura 15** del documento:

> **Perspectiva Financiera** — Mide la salud económica del negocio a partir de los ingresos generados por servicios realizados.
>
> - **Ingresos mensuales**: suma de montos de servicios realizados en el mes. Fuente: `servicio_realizado.fecha` + `monto`.
> - **Ticket promedio**: ingreso promedio por atención. Fórmula: `AVG(monto)` sobre `servicio_realizado`.
> - **Rentabilidad por servicio**: margen por servicio = `SUM(monto) - (precio_lista × nº atenciones)`, desglosado por servicio en la vista de rentabilidad.
>
> A diferencia de la versión anterior (que medía solo "servicios activos"), la perspectiva financiera ahora se basa en indicadores monetarios reales obtenidos del módulo Historial de Atenciones.

Tabla actualizada de indicadores financieros del BSC en el sistema:

| Indicador | Valor en sistema | Estándar | Estado |
|---|---|---|---|
| Ingresos mensuales | $0.00 (hasta registrar atenciones) | > $500 | Mejorable / Cumple |
| Ticket promedio | $0.00 | ≥ $40 | Mejorable / Cumple |
| Ingresos totales | $0.00 | — | — |
| Servicios activos | 34 | ≥ 30 | Cumple |
| Sucursales operativas | 3 | ≥ 3 | Cumple |
| Citas completadas | 0 | ≥ 10 | Mejorable |

---

## 4. Fichas BPMN (documentación de procesos)

Los procesos BPMN actuales están en `diagramas/bpmn/` (Gestion_Citas.bpmn, Postulacion_Trabajo.bpmn). Documentación por proceso:

### Proceso: Autenticación (CU-01)
- **Objetivo**: Validar credenciales y permitir acceso al panel administrativo según rol y permisos.
- **Actor responsable**: Usuario administrativo (todos los roles).
- **Entradas**: correo, contraseña, registro activo en `usuario_admin`.
- **Salidas**: sesión iniciada con permisos cargados; redirección al Dashboard.
- **Excepción principal**: credenciales inválidas → mensaje de error y fin del proceso. Usuario desactivado → acceso denegado.

### Proceso: Gestión de servicios (CU-02)
- **Objetivo**: Crear, modificar, activar o desactivar servicios y categorías.
- **Actor responsable**: Administrador / Super Administrador.
- **Entradas**: datos del servicio (nombre, categoría, precio, duración).
- **Salidas**: servicio registrado/actualizado en BD; listado actualizado.
- **Excepción principal**: datos inválidos → notificación y corrección antes de guardar.

### Proceso: Gestión de clientes (CU-05)
- **Objetivo**: Registrar y administrar clientes del spa.
- **Actor responsable**: Recepcionista / Administrador.
- **Entradas**: nombre, teléfono, correo, datos complementarios.
- **Salidas**: cliente registrado/actualizado en BD.
- **Excepción principal**: teléfono duplicado → se actualiza el cliente existente.

### Proceso: Agendar cita (CU-06)
- **Objetivo**: Registrar una cita validando disponibilidad de horario (módulo disponibilidad).
- **Actor responsable**: Cliente (portal web) / Recepcionista (panel).
- **Entradas**: fecha, sucursal, servicios, hora.
- **Salidas**: cita creada con sus servicios (`cita_servicio`); franja marcada ocupada.
- **Excepción principal**: horario ocupado → bloqueo de la franja y selección de otra hora.

### Proceso: Postulación laboral (CU-08)
- **Objetivo**: Recibir y gestionar postulaciones de trabajo.
- **Actor responsable**: Visitante (envía), RRHH/Administrador (gestiona).
- **Entradas**: nombre, correo, teléfono, CV, mensaje.
- **Salidas**: postulación guardada y visible en el panel; marcada como leída al revisarla.
- **Excepción principal**: campos requeridos faltantes → error de validación.

---

## 5. Actores y Roles unificados (punto 3 del checklist)

Roles implementados en el sistema (tabla `rol` + `usuario_admin.rol`):

| Rol | Permisos en el sistema | Módulos visibles |
|---|---|---|
| `superadmin` | Todos | Todos los módulos + Roles y Permisos |
| `admin` | Operativo completo (excepto Roles) | Dashboard, Servicios, Sucursales, Citas, Clientes, Empleados, Horarios, Historial, Galería, Proveedores, Aliados, Postulaciones, Configuración, BSC, Tablero |
| `recepcionista` | Dashboard, Citas, Clientes, Historial | Dashboard, Citas, Clientes, Historial |
| `rrhh` | Dashboard, Empleados, Horarios, Postulaciones | Dashboard, Empleados, Horarios, Postulaciones |
| `gerencia` | Dashboard, Tablero, BSC, Historial | Dashboard, Tablero, BSC, Historial |
| `contabilidad` | Tablero, BSC, Historial | Tablero, BSC, Historial |

Estos roles reemplazan a los genéricos `ventas` y `reportes` de la versión anterior y son los que debe reflejar el documento (Tablero de Comando).

---

## 6. Resumen de implementación en código (verificado end-to-end)

- BD: 19 tablas (5 nuevas) + vistas `v_financiero` y `v_citas_completas`.
- Backend: middleware `requireRole`/`cargarPermisos` basado en permisos dinámicos desde BD; rutas nuevas `/empleados`, `/empleados/horarios`, `/historial`; BSC con indicadores financieros.
- Verificado: login por rol (superadmin/recepcionista/gerencia) con menú dinámico y denegación 403 en módulos sin permiso.
- Pantallas nuevas: `roles.ejs` (usuarios, roles y permisos), `empleados.ejs`, `horarios.ejs`, `historial.ejs`.
