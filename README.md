# PEI Compromiso 360°

Aplicación para el lanzamiento del Plan Estratégico Institucional (PEI) 2027–2031 de la Universidad Peruana Unión (UPeU).

Permite a los trabajadores registrarse en un compromiso institucional a través de un formulario dividido en tres etapas: selección de campus, formulario de compromiso y pantalla de agradecimiento con tarjeta personalizada. Incluye un panel administrativo con estadísticas en tiempo real, un mural ceremonial para proyección en auditorio, exportación CSV y autenticación administrativa segura.

## Lema oficial

**IDENTIDAD · EXCELENCIA · MISIÓN**

**Periodo:** PEI 2027–2031

## Funcionalidades principales

- **Trabajador:** selección de campus (Lima, Juliaca, Tarapoto), formulario de compromiso institucional, pantalla de agradecimiento con tarjeta personalizada y aviso de regalo, sesión local de 24 horas.
- **Mural ceremonial:** proyección en vivo con contadores por campus, últimas adhesiones, nube de áreas y cierre institucional.
- **Administrador:** inicio de sesión seguro, panel con KPIs, tabla de registros con filtros, exportación a CSV.
- **QR funcional:** código QR escaneable que apunta a la ruta pública `/compromiso`.
- **Backend:** Cloudflare Workers + D1 con endpoints REST protegidos, autenticación basada en cookies HttpOnly y PBKDF2-SHA256.

## Arquitectura

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui, Lucide React, framer-motion, recharts, zustand, react-router-dom.
- **Backend:** Cloudflare Workers, Cloudflare D1 (base de datos SQL).
- **Comunicación:** endpoints `/api/*` bajo el mismo dominio (sin CORS).
- **Autenticación:** sesiones servidor con cookie `HttpOnly`, `Secure`, `SameSite=Strict`; contraseña hasheada con PBKDF2-SHA256 (100 000 iteraciones).
- **Pruebas:** Vitest + Testing Library.
- **Despliegue:** wrangler (Cloudflare Workers + D1).

## Estructura de carpetas

```
peí-compromiso/
├── worker/                   # Código del Cloudflare Worker
│   ├── index.ts              # Entry point y routing
│   ├── routes/               # Endpoints /api
│   ├── services/             # Lógica de negocio
│   ├── repositories/         # Repositorio D1
│   ├── middleware/           # Auth y validación
│   └── types/                # Tipos de bindings (DB, secretos)
├── migrations/
│   └── 0001_initial.sql      # Esquema D1 (commitments, admin_sessions)
├── src/
│   ├── components/           # Componentes React compartidos
│   ├── features/             # Páginas por dominio (login, dashboard, mural, compromiso)
│   ├── infrastructure/       # Repositorios (local, remoto, demo)
│   ├── domain/               # Modelos, servicios y contratos de dominio
│   ├── config/               # Configuración (campus, áreas, evento, QR)
│   ├── hooks/                # Hooks personalizados (usePolling)
│   ├── auth/                 # Utilidades de autenticación administrativa
│   ├── guards/               # Protección de rutas admin
│   ├── lib/                  # Utilidades (cn)
│   └── tests/                # Pruebas unitarias e integración
├── docs/
│   └── CLOUDFLARE_DEPLOYMENT.md
├── public/                   # Assets estáticos (favicon, logos)
├── .env.example              # Plantilla de variables de entorno (Vite)
├── .dev.vars.example         # Plantilla de secretos para wrangler (no subir valores reales)
├── wrangler.jsonc            # Configuración de wrangler (sin secretos)
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Requisitos previos

- Node.js 18 o superior
- npm (incluido con Node.js)
- Cuenta de Cloudflare (para despliegue en producción)
- Base de datos D1 creada en Cloudflare (ID y nombre configurados en `wrangler.jsonc`)

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/Mesias-Caleb/Compromiso360.git
cd Compromiso360

# Instalar dependencias
npm ci
```

## Configuración de entorno

### 1. Variables del frontend (`.env.local`)

Copiar la plantilla y completar los valores:

```bash
cp .env.example .env.local
```

Ejemplo de `.env.local`:

```ini
VITE_REPOSITORY_MODE=remote
VITE_API_BASE_URL=
VITE_PUBLIC_COMMITMENT_URL=https://pei-compromiso-worker.tu-cuenta.workers.dev/compromiso
```

### 2. Secretos del Worker (`.dev.vars`)

Copiar la plantilla y completar los valores:

```bash
cp .dev.vars.example .dev.vars
```

Ejemplo de `.dev.vars`:

```ini
ADMIN_PASSWORD_HASH=tu_hash_pbkdf2_aqui_base64
ADMIN_PASSWORD_SALT=tu_salt_pbkdf2_aqui_base64
SESSION_SECRET=tu_secreto_de_sesiones_aqui
```

> **Importante:** `.env.local` y `.dev.vars` contienen secretos y **no se suben a Git**. Están listados en `.gitignore`.

### 3. Generar hash y salt de la contraseña administrativa

Ejecutar localmente (sustituir `TU_CONTRASEÑA` por la contraseña elegida):

```bash
node -e "
const crypto = require('crypto');
const password = 'TU_CONTRASEÑA';
const salt = crypto.randomBytes(32).toString('base64');
const key = crypto.pbkdf2Sync(password, Buffer.from(salt, 'base64'), 100000, 32, 'sha256');
console.log('ADMIN_PASSWORD_SALT=' + salt);
console.log('ADMIN_PASSWORD_HASH=' + key.toString('base64'));
"
```

## Configuración de D1 local y migraciones

```bash
# Aplicar migración inicial a D1 local
npx wrangler d1 migrations apply pei-compromiso-db --local
```

> **No aplicar migraciones remotas sin autorización explícita.**

## Comandos de desarrollo

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el frontend Vite (puerto 3000) |
| `npm run dev:worker` | Inicia el Worker local con D1 local (puerto 8787) |
| `npm run dev:all` | Inicia Worker y frontend simultáneamente (sintaxis Windows CMD) |

Para desarrollo en Windows:

```bash
# Terminal 1
npm run dev:worker

# Terminal 2
npm run dev
```

O, en una sola terminal (Windows):

```bash
npm run dev:all
```

## Rutas de la aplicación

| Ruta | Descripción | Autenticación |
|------|-------------|---------------|
| `/` | Consola del evento administrativo | Requiere sesión admin |
| `/login` | Inicio de sesión administrativo | Pública |
| `/admin` | Panel administrativo | Requiere sesión admin |
| `/compromiso` | Formulario del trabajador | Pública |
| `/mural` | Proyección ceremonial en vivo | Pública |

## Cómo probar

### Registro de trabajador

1. Iniciar el entorno local (`npm run dev:all`).
2. Abrir `http://localhost:3000/compromiso`.
3. Seleccionar un campus (Lima, Juliaca o Tarapoto).
4. Completar nombres, apellidos, área y aceptar el compromiso.
5. Enviar y verificar la pantalla de agradecimiento.

### Login administrativo

1. Abrir `http://localhost:3000/login`.
2. Ingresar usuario y contraseña configurados en `.dev.vars`.
3. Verificar acceso a `/admin`.

### Mural ceremonial

1. Abrir `http://localhost:3000/mural`.
2. Verificar contadores, últimas adhesiones y nube de áreas.
3. Cambiar entre modos de proyección (Mural Principal, Participación Campus, Nube de Áreas, Cierre Final).

## Pruebas

```bash
# Ejecutar todas las pruebas unitarias e integración
npm run test

# Ejecutar en modo watch
npm run test:watch
```

## Build de producción

```bash
npm run build
```

Genera la carpeta `dist/` con el frontend estático listo para ser servido por el Worker.

## Despliegue en Cloudflare

1. Configurar secretos en Cloudflare (una sola vez):

```bash
npx wrangler secret put ADMIN_PASSWORD_HASH
npx wrangler secret put ADMIN_PASSWORD_SALT
```

2. Aplicar migración remota (solo con autorización):

```bash
npx wrangler d1 migrations apply pei-compromiso-db
```

3. Desplegar el Worker:

```bash
npx wrangler deploy
```

> **No desplegar sin autorización explícita.**

## Estructura de pruebas

- `src/tests/validation.test.ts` — validación de códigos de campus y formulario de compromiso
- `src/tests/local-repository.test.ts` — repositorio local, persistencia de sesión y expiración a 24h
- `src/tests/stats.test.ts` — cálculo de estadísticas del evento
- `src/tests/qr-url.test.ts` — configuración y seguridad de la URL del QR
- `src/tests/remote-repository.test.ts` — repositorio remoto con mock de fetch

## Solución de problemas frecuentes

| Problema | Causa posible | Solución |
|----------|---------------|----------|
| `POST /api/auth/login` devuelve 503 | `ADMIN_PASSWORD_HASH` o `ADMIN_PASSWORD_SALT` no configurados en wrangler | Configurar secretos con `wrangler secret put` |
| Sesión no persiste en localhost | Cookie `Secure` rechazada sobre HTTP | Usar `VITE_API_BASE_URL` vacío para que Vite haga proxy al Worker local |
| QR no escaneable desde celular | URL apunta a `localhost` o `127.0.0.1` | Configurar `VITE_PUBLIC_COMMITMENT_URL` con IP LAN o dominio público |
| Datos de demostración aparecen en producción | Auto-seed activado | El auto-seed se eliminó; los datos provienen exclusivamente de D1 |

## Advertencia sobre D1 local vs producción

- **D1 local:** `wrangler dev --local` usa una base de datos efímera separada de producción. Ideal para desarrollo y pruebas.
- **D1 producción:** La base de datos remota `pei-compromiso-db`. No se modifica ni se borra sin autorización explícita.

## Licencia

Privado — Universidad Peruana Unión (UPeU).
