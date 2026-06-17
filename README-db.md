# Lush Nails Spa - Base de Datos

## Requisitos

- Docker y Docker Compose instalados
- Opcional: DBeaver, LazyDocker

## Inicio Rápido

```bash
# 1. Clonar .env (opcional, usa valores por defecto)
cp .env.example .env

# 2. Levantar PostgreSQL
docker compose up -d

# 3. Verificar que esté corriendo
docker compose ps

# 4. Conectarse a la base de datos
docker compose exec postgres psql -U lushnails_admin -d lushnails_spa
```

## Credenciales por Defecto

| Variable | Valor |
|---|---|
| Host | localhost |
| Puerto | 5432 |
| Base de Datos | lushnails_spa |
| Usuario | lushnails_admin |
| Password | LushNails2024 |

**Admin del sistema** (panel de administración):
- Email: admin@lushnails.com
- Password: LushNails2024

## Diagrama de Tablas

```
categoria_servicio ──1:N──> servicio
sucursal ──1:N──> empleado
sucursal ──1:N──> cita
cliente ──1:N──> cita
empleado ──1:N──> cita
```

## Comandos Útiles

```bash
# Ver logs de PostgreSQL
docker compose logs -f postgres

# Detener contenedor (sin borrar datos)
docker compose stop

# Detener y borrar contenedor (los datos persisten)
docker compose down

# Borrar TODO (incluyendo datos)
docker compose down -v

# Backup de la base de datos
docker compose exec postgres pg_dump -U lushnails_admin lushnails_spa > backup.sql

# Restaurar backup
cat backup.sql | docker compose exec -T postgres psql -U lushnails_admin -d lushnails_spa
```

## DBeaver (Arch Linux)

```bash
# Desde los repos oficiales
sudo pacman -S dbeaver

# O desde AUR (versión más reciente)
yay -S dbeaver
```

## LazyDocker (TUI para Docker)

```bash
# Desde AUR
yay -S lazydocker

# O instalación manual
curl https://raw.githubusercontent.com/jesseduffield/lazydocker/master/scripts/install_update.sh | bash

# Usar LazyDocker dentro del proyecto
lazydocker
```

## Conexión desde DBeaver

1. Abrir DBeaver
2. Click en "New Database Connection"
3. Seleccionar PostgreSQL
4. Configurar:
   - Host: localhost
   - Port: 5432
   - Database: lushnails_spa
   - Username: lushnails_admin
   - Password: LushNails2024
5. Test Connection y Finish

## Estructura de Archivos

```
spa/
├── docker-compose.yml      # Configuración de servicios Docker
├── .env.example            # Variables de entorno de ejemplo
├── database/
│   └── init.sql            # Script de inicialización de la BD
└── README-db.md            # Este archivo
```
