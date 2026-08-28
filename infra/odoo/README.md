# Odoo Community — Lush Nails

Entorno local de desarrollo para explorar Odoo Community como ERP/CRM del
portal Lush Nails.

## Servicios

| Servicio | Imagen | Puerto |
| --- | --- | --- |
| Odoo | `odoo:18` | `http://localhost:8069` |
| PostgreSQL | `postgres:16-alpine` | interno |

## Uso local

```bash
docker compose up -d
docker compose stop
docker compose logs -f odoo
```

`docker compose down -v` elimina los volúmenes y los datos locales.

## Primer arranque

1. Abrir `http://localhost:8069`.
2. Crear una contraseña maestra propia y guardarla fuera del repositorio.
3. Crear la base `lushnails` y un usuario administrador.

> Las credenciales de `docker-compose.yml` son valores de desarrollo local. No
> se usan para producción ni deben reutilizarse en servicios reales.

`addons/lush_nails/` contiene el esqueleto inicial del módulo de citas.
