# Despliegue Cloudflare — PEI Compromiso 360°

## Arquitectura

El proyecto es un repositorio único con separación de responsabilidades:

- **Frontend:** React + Vite, servido como assets estáticos desde el mismo Worker (SPA).
- **Backend:** Cloudflare Worker (`worker/index.ts`) que expone endpoints `/api` y accede a D1 mediante el binding `DB`.
- **Base de datos:** D1 (`pei-compromiso-db`), misma cuenta que el Worker.

### Flujo de datos

```
Trabajador (celular) ──► QR ──► /compromiso ──► POST /api/commitments ──► Worker ──► D1
Administrador          ──► /admin           ──► GET /api/admin/*      ──► Worker ──► D1
Mural                  ──► /mural           ──► GET /api/public/stats ──► Worker ──► D1
```

El frontend y la API comparten el mismo origen, evitando problemas de CORS.

## Estructura de carpetas

```
peí-compromiso/
├── worker/                  # Código del Cloudflare Worker
│   ├── index.ts             # Entry point y routing
│   ├── routes/
│   │   ├── commitments.ts   # POST /api/commitments
│   │   ├── public.ts        # GET /api/public/stats
│   │   ├── admin.ts         # GET /api/admin/* (requiere sesión)
│   │   └── auth.ts          # POST /api/auth/login, logout, session
│   ├── services/
│   │   └── commitment-service.ts
│   ├── repositories/
│   │   └── d1-commitment-repository.ts
│   ├── middleware/
│   │   ├── auth.ts          # Verificación de sesión HttpOnly
│   │   └── validation.ts    # Validación de entradas
│   └── types/
│       └── env.ts           # Tipos de bindings (DB, secretos)
├── migrations/
│   └── 0001_initial.sql     # Esquema D1 (commitments, admin_sessions)
├── src/
│   ├── infrastructure/
│   │   ├── demo/
│   │   │   └── demo-service.ts      # Proxy híbrido local/remoto
│   │   ├── remote/
│   │   │   └── remote-commitment.repository.ts  # Fetch al Worker
│   │   └── repository-factory.ts    # Selección de modo
│   │   └── storage/
│   │       └── local-commitment.repository.ts  # LocalStorage (demo)
├── .env.example             # Ejemplo de variables (no commitear .env.local)
├── .env.local               # Variables locales (no subir a git)
├── wrangler.jsonc           # Configuración de wrangler
└── dist/                    # Build del frontend (servido por el Worker)
```

## Esquema de base de datos

### Tabla `commitments`

| Columna | Tipo | Restricción |
|---|---|---|
| id | TEXT | PRIMARY KEY |
| first_name | TEXT | NOT NULL |
| last_name | TEXT | NOT NULL |
| campus | TEXT | NOT NULL, CHECK (LIM, JUL, TPP) |
| area | TEXT | NOT NULL |
| area_name | TEXT | NOT NULL |
| texto_version | TEXT | NOT NULL |
| accepted | INTEGER | NOT NULL DEFAULT 0 |
| publish_permission | INTEGER | NOT NULL DEFAULT 0 |
| created_at | TEXT | NOT NULL (UTC ISO 8601) |
| idempotency_key | TEXT | UNIQUE NOT NULL |

Índices: `campus`, `area`, `created_at`.

### Tabla `admin_sessions`

| Columna | Tipo | Restricción |
|---|---|---|
| id | TEXT | PRIMARY KEY |
| token_hash | TEXT | NOT NULL |
| expires_at | TEXT | NOT NULL |
| created_at | TEXT | NOT NULL |

## Variables de entorno

### Frontend (Vite)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_REPOSITORY_MODE` | `local` o `remote` | `remote` |
| `VITE_API_BASE_URL` | Base URL de la API (vacío = mismo origen) | `` |
| `VITE_PUBLIC_COMMITMENT_URL` | URL pública para QR (`/compromiso`) | `https://ejemplo.com/compromiso` |

### Worker (Cloudflare Secrets)

Configurar mediante `wrangler secret put`:

| Secreto | Descripción |
|---|---|
| `ADMIN_PASSWORD_HASH` | Hash PBKDF2-SHA256 (base64) de la contraseña admin |
| `ADMIN_PASSWORD_SALT` | Salt PBKDF2 (base64) |
| `SESSION_SECRET` | Secreto adicional para sesiones |

**No commitear secretos.** No inventar credenciales. El administrador debe proporcionar el hash y salt de forma segura antes de activar el modo remoto.

## Migraciones

### Local

```bash
# Aplicar migración localmente (requiere wrangler instalado)
npx wrangler d1 migrations apply pei-compromiso-db --local
```

### Remoto (NO ejecutar sin autorización)

```bash
# npx wrangler d1 migrations apply pei-compromiso-db
```

## Pruebas de API

| Endpoint | Método | Autenticación | Descripción |
|---|---|---|---|
| `/api/commitments` | POST | No | Registrar un compromiso (público) |
| `/api/public/stats` | GET | No | Estadísticas agregadas públicas |
| `/api/admin/stats` | GET | Sí (cookie) | Estadísticas para el panel admin |
| `/api/admin/commitments` | GET | Sí (cookie) | Listar compromisos con filtros y paginación |
| `/api/admin/export` | GET | Sí (cookie) | Exportar CSV filtrado |
| `/api/auth/login` | POST | No | Iniciar sesión de administrador |
| `/api/auth/logout` | POST | Sí (cookie) | Cerrar sesión |
| `/api/auth/session` | GET | Sí (cookie) | Verificar sesión activa |

## Ejecución local

### Requisitos

- Node.js instalado
- `wrangler` CLI (para pruebas del Worker y D1 local)

### Instalación

```bash
cd C:\Users\Mesias Caleb\Desktop\Compromiso
npm install
```

### Frontend (desarrollo, modo local)

```bash
npm run dev
```

El frontend usa LocalStorage por defecto (`VITE_REPOSITORY_MODE=local`).

### Worker + D1 local

```bash
# Iniciar Worker local con D1 local
npx wrangler dev --local

# Aplicar migración local
npx wrangler d1 migrations apply pei-compromiso-db --local
```

El Worker escucha en `http://localhost:8787` por defecto.

### Modo remoto local

Para probar el frontend conectado al Worker local:

```bash
# En .env.local:
VITE_REPOSITORY_MODE=remote
VITE_API_BASE_URL=http://localhost:8787
```

Luego reiniciar el frontend con `npm run dev`.

## Build de producción

```bash
npm run build
```

Esto genera `dist/` con el frontend estático. El Worker lo sirve automáticamente gracias a la configuración `assets` en `wrangler.jsonc`.

## Despliegue (pendiente de autorización)

```bash
# 1. Configurar secretos (una sola vez)
npx wrangler secret put ADMIN_PASSWORD_HASH
npx wrangler secret put ADMIN_PASSWORD_SALT

# 2. Aplicar migración remota
npx wrangler d1 migrations apply pei-compromiso-db

# 3. Desplegar Worker
npx wrangler deploy
```

**NO ejecutar pasos 2 y 3 sin autorización explícita.**

## Rollback y respaldo

- D1 permite crear respaldos mediante `wrangler d1 backup create` (plan pagado) o exportando datos mediante consultas SQL.
- El frontend es estático; un rollback es simplemente desplegar una versión anterior del Worker.

## Limitaciones del plan gratuito

- D1: límites de lecturas/escrituras diarias y tamaño de base de datos.
- Worker: 100,000 solicitudes por día (plan gratuito).
- No se afirma soporte de 1,300 solicitudes simultáneas sin pruebas de carga.

## Pruebas pendientes

- Pruebas de carga con 1,300 registros simultáneos.
- Pruebas de integración con D1 remoto (requiere wrangler y credenciales).
- Pruebas de autenticación administrativa con credenciales reales.
