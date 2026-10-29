# Guía de contribución — PEI Compromiso 360°

Gracias por interesarte en contribuir al proyecto PEI Compromiso 360°. Este documento describe el flujo de trabajo, estándares y procesos para colaborar de manera segura y ordenada.

## 1. Rama principal

- La rama predeterminada es `main`.
- Trabaja siempre en ramas derivadas de `main`.
- No pushes directamente a `main` sin revisión de pull request.

## 2. Flujo de trabajo recomendado

```bash
# 1. Clonar y crear rama
git clone https://github.com/Mesias-Caleb/Compromiso360.git
cd Compromiso360
git checkout -b feature/nombre-de-la-rama

# 2. Instalar dependencias
npm ci

# 3. Configurar entorno local
cp .env.example .env.local
cp .dev.vars.example .dev.vars

# 4. Desarrollar y probar
npm run dev:all
npm run test
npm run typecheck
npm run build
npm run wrangler deploy --dry-run
```

## 3. Estructura de mensajes de commit

Usar formato convencional:

```
tipo(alcance): descripción breve
```

Ejemplos:

- `feat(mural): agregar animación de hitos en cierre final`
- `fix(qr): rechazar URLs localhost en desarrollo`
- `docs(readme): agregar sección de solución de problemas`
- `chore(deps): actualizar dependencias de wrangler`

Tipos permitidos: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `style`, `perf`, `security`, `ci`.

## 4. Antes de enviar un pull request

1. Verificar que no hay secretos en los cambios:

```bash
git diff --cached --name-only
```

2. Ejecutar verificaciones de calidad:

```bash
npm run typecheck
npm run test
npm run build
```

3. Confirmar que `.env.local`, `.dev.vars`, `node_modules/`, `dist/` y `.wrangler/` no estén incluidos:

```bash
git status
```

4. No incluir archivos de credenciales, claves privadas, certificados ni bases de datos locales.

## 5. Pull requests

- Abrir el PR contra la rama `main`.
- Incluir descripción clara del cambio y motivo.
- Vincular el issue correspondiente, si aplica.
- Esperar revisión y aprobación antes de hacer merge.
- No hacer force push en ramas compartidas sin avisar al equipo.

## 6. Seguridad

- Nunca commitear contraseñas, tokens, hashes, salts ni secretos de Cloudflare.
- Los archivos `.env.local` y `.dev.vars` están en `.gitignore` y no deben subirse.
- Si se detecta un secreto expuesto en un commit previo, notificar inmediatamente al propietario del repositorio. `.gitignore` no elimina el historial de Git.

## 7. Reportar problemas

Si encuentras una vulnerabilidad de seguridad, no abras un issue público. Contacta directamente al mantenedor del repositorio.
