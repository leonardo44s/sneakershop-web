# SneakerShop Web

Plataforma web de comercio electrónico de zapatillas. Proyecto de aula de Ingeniería de Software III (UNIAJC).

**Equipo:** Justo Leonardo Segura Torres (Product Owner) y Richard Esteban Sevillano Cuaran (Scrum Master).

## Tecnologías

- Frontend: React + Vite (`/client`)
- Backend: Node.js + Express (`/server`)
- Base de datos: PostgreSQL en Supabase con Prisma
- Gestión: Jira (Scrum)

## Requisitos

- Node.js LTS
- Git

## Instalación

```powershell
git clone https://github.com/USUARIO/sneakershop-web.git
cd sneakershop-web
```

Frontend:

```powershell
cd client
npm install
npm run dev
```

Backend (en otra terminal):

```powershell
cd server
npm install
Copy-Item .env.example .env
npm run dev
```

## Flujo de ramas

- `main`: versión estable.
- `develop`: integración.
- `feature/US-XX-descripcion`: una rama por historia o tarea.

Todo cambio entra a `develop` mediante Pull Request revisado y aprobado por el otro integrante.

## Convención de commits

`CLAVE-JIRA US-XX: descripción`. Ejemplo: `SCRUM-25 US-01: crear estructura base del cliente`.