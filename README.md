# LUSH NAILS SPA — Portal Empresarial

Repositorio del **Portal Empresarial Lush Nails Spa**: sistema de gestión de citas, servicios, clientes y panel administrativo para un spa de belleza.

> **Enfoque principal: Base de Datos PostgreSQL** (`database/init.sql`) con panel admin (Express + EJS) y sitio web corporativo (React).

---

## Arquitectura

```
lushnails-db/
├── database/
│   └── init.sql            # Script completo de la BD (PostgreSQL 16)
├── docker-compose.yml      # Levanta PostgreSQL con el script y datos semilla
├── backend/                # Panel de administración (Express + EJS)
│   └── src/
│       ├── server.js       # Servidor (puerto 4000)
│       ├── routes/         # API y rutas (citas, clientes, servicios, roles...)
│       └── views/          # Vistas EJS del panel admin
├── spa/                    # Sitio web corporativo (React 19)
│   └── src/                # Componentes, estilos y traducciones
└── diagramas/              # Diagramas BPMN del proceso
```

### Componentes

| Componente | Tecnología | Puerto |
|---|---|---|
| **Base de Datos** | PostgreSQL 16 (Docker) | 5432 |
| **Panel Admin** | Node + Express + EJS | 4000 |
| **Sitio Web (SPA)** | React 19 (Create React App) | 3000 |

---

## 1. Base de Datos (PostgreSQL)

### Requisitos
- Docker + Docker Compose

### Inicio rápido

```bash
# 1. Clonar variables de entorno (opcional; hay valores por defecto)
cp .env.example .env

# 2. Levantar PostgreSQL (crea BD, tablas y datos semilla automáticamente)
docker compose up -d

# 3. Verificar
docker compose ps

# 4. Entrar a la consola de PostgreSQL
docker compose exec postgres psql -U lushnails_admin -d lushnails_spa
```

### Credenciales por defecto

| Variable | Valor |
|---|---|
| Host | localhost |
| Puerto | 5432 |
| Base de Datos | lushnails_spa |
| Usuario | lushnails_admin |
| Contraseña | LushNails2024 |

### Estructura de la base de datos

El script `database/init.sql` crea **13 tablas** con relaciones, restricciones, índices y datos semilla:

- **Catálogos**: `categoria_servicio`, `sucursal`, `configuracion`, `servicio`
- **Negocio**: `empleado`, `cliente`, `cita`, `postulacion`, `galeria`
- **Sistema**: `usuario_admin`, `proveedor`, `aliado`, `session`

Relaciones principales:

```
categoria_servicio ──1:N──> servicio
sucursal ──1:N──> empleado
sucursal ──1:N──> cita
cliente ──1:N──> cita
empleado ──1:N──> cita
```

> Ver `README-db.md` para comandos de backup/restore, DBeaver y LazyDocker.

---

## 2. Panel de Administración (Backend)

### Requisitos
- Node.js 18+ y pnpm

### Inicio rápido

```bash
cd backend

# 1. Instalar dependencias
pnpm install

# 2. Configurar conexión a BD (crear desde plantilla)
cp .env.example .env  # o usa backend/.env existente

# 3. Levantar el panel admin
pnpm start            # http://localhost:4000
```

### Credenciales del administrador

- **Email**: `admin@lushnails.com`
- **Contraseña**: `LushNails2024`

### Módulos del panel

Dashboard (BSC), Citas, Clientes, Servicios, Sucursales, Empleados, Proveedores, Aliados, Postulaciones, Roles y Configuración.

---

## 3. Sitio Web Corporativo (React)

### Requisitos
- Node.js 16+ y npm

### Inicio rápido

```bash
cd spa
npm install
npm start               # http://localhost:3000
```

Para producción:

```bash
npm run build           # genera build/
```

---

## Guía de presentación (orden de demo)

1. `docker compose up -d` → levanta y verifica la BD (la pieza principal).
2. `cd backend && pnpm start` → abre el panel admin en `http://localhost:4000`.
3. `cd spa && npm start` → abre el sitio corporativo en `http://localhost:3000`.
4. Login admin con `admin@lushnails.com` / `LushNails2024`.

---

## Tecnologías

PostgreSQL 16 · Node.js · Express · EJS · React 19 · Docker · BPMN