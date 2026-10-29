# PROJECT_MEMORY.md — PEI Compromiso 360°

## Estado Actual
Ajustes puntuales completados y verificados:
1. **Unificación de pantalla final:** Flujo del trabajador optimizado a exactamente tres etapas (1. Código de campus, 2. Formulario de compromiso, 3. Agradecimiento unificado con tarjeta personalizada y aviso destacado del regalo). Se implementó persistencia de sesión local con vigencia de 1 día (24h) para prevenir duplicados y permitir reapertura directa. Se eliminaron botones posteriores y la etapa 5 separada.
2. **Identidad del PEI:** Lema oficial establecido como **`IDENTIDAD · EXCELENCIA · MISIÓN`** y periodo oficial como **`PEI 2027–2031`**, centralizados en `src/config/event.ts` y aplicados transversalmente a toda la plataforma.
3. **QR funcional y selección por tarjetas:** QR real con `qrcode.react` usando `VITE_PUBLIC_COMMITMENT_URL` (configurado en `.env.local`, ejemplo en `.env.example`). En `/compromiso` se reemplazó el ingreso de código por tarjetas interactivas (Lima/Juliaca/Tarapoto), se oculta/elimna selector de campus del formulario, y se conserva sesión de 24h para mostrar agradecimiento directamente.
4. **Identidad UPeU:** Integrados logotipos oficiales desde `src/images/` en `InstitutionalLogo` (horizontal/color/negativo). Favicon actualizado con `ico.ico`. Uso con `object-fit: contain`, tamaños responsivos y sin deformación.
5. **Fase 2.1:** Combobox con búsqueda para áreas (sin tildes/mayúsculas, teclado, móvil), nombres/apellidos en mayúsculas con normalización al guardar, repositorio reactivo vía suscripción (BroadcastChannel/storage) preparado para integración con backend remoto sin conexión externa aún.
6. **Fase 4:** Panel administrativo avanzado con KPIs reales, filtros combinados (campus/área/búsqueda), tabla con ordenamiento/paginación, analítica (evolución temporal, por campus, ranking de áreas), exportación CSV con BOM y filtros activos, actualización reactiva vía suscripción. Preparado para migración a repositorio remoto.
7. **Fase de Integración Backend (Cloudflare Workers + D1):** Backend completo implementado en `worker/` con endpoints `/api/commitments` (POST), `/api/public/stats` (GET), `/api/admin/*` (GET, requiere sesión), `/api/auth/*` (login/logout/session). Repositorio D1 con tabla `commitments` y `admin_sessions`. `RemoteCommitmentRepository` para modo remoto, `LocalCommitmentRepository` para desarrollo. Selección de modo vía `VITE_REPOSITORY_URL_MODE`. Migración SQL en `migrations/0001_initial.sql`. Documentación en `docs/CLOUDFLARE_DEPLOYMENT.md`.

## Tokens e Identidad Oficial (DESIGN_GUIDELINES.md / event.ts)
- **Lema Institucional Oficial:** `IDENTIDAD · EXCELENCIA · MISIÓN`
- **Periodo Institucional Oficial:** `PEI 2027–2031`
- **Versión de Declaración:** `v1.0-2027-2031`
- **Azul profundo ceremonial:** `#09264A`
- **Azul institucional:** `#124B87`
- **Azul de interacción:** `#1769B3`
- **Dorado ceremonial:** `#D6AD60`
- **Fondo claro:** `#F6F8FC`
- **Blanco puro:** `#FFFFFF`
- **Texto:** Principal `#172B45`, secundario `#66768A`, bordes `#E2E8F0`, éxito `#15803D`.
- **Iconografía:** Exclusivamente `Lucide React` (sin emojis).

## Flujo del Trabajador (Ruta `/compromiso`)
1. **Paso 1 (Código de campus):** Ingreso del código proyectado en el auditorio de su sede.
2. **Paso 2 (Formulario de compromiso):** Nombres, apellidos, campus, área y declaración institucional única.
3. **Paso 3 (Pantalla final de agradecimiento):**
   - Check verde animado (`CheckCircle2`).
   - Título: *"¡Gracias por comprometerte!"*.
   - Mensaje: *"Ya formas parte del futuro de nuestra universidad"*.
   - Tarjeta institucional personalizada con avatar de iniciales, nombres, campus, área y sello PEI 2027–2031.
   - Sección destacada con icono `Gift`, título *"¡Un regalo te espera!"* e instrucción de captura de pantalla para canje al cierre del evento.
   - Persistencia de sesión de 24 horas mediante `getActiveWorkerSession` / `saveActiveWorkerSession` para reaperturas inmediatas sin duplicidad.

## Registro de Avances
- [x] Fase 0: Arquitectura modular, persistencia local intercambiable, contratos y tipos de dominio.
- [x] Fase 1: Identidad visual institucional y componentes aprobados.
- [x] Ajuste puntual 1: Unificación de confirmación y tarjeta final con bloque de regalo y vigencia de 1 día.
- [x] Ajuste puntual 2: Actualización de lema (`IDENTIDAD · EXCELENCIA · MISIÓN`) y periodo (`PEI 2027–2031`) en toda la aplicación.
- [ ] Fase 2: Refinamiento de interacción ceremonial y validaciones avanzadas.
- [ ] Fase 3: Proyección ceremonial interactiva del mural en vivo.
- [x] Fase 4: Administración avanzada y filtros analíticos.
- [x] Fase de Integración Backend: Cloudflare Workers + D1 (endpoints API, autenticación, repositorio remoto).
- [x] Fase de Transición a Producción: Repositorio remoto obligatorio (VITE_REPOSITORY_MODE=remote), QR con URL oficial de Cloudflare, eliminación de auto-seed de datos demo, ocultamiento de DemoBanner y avisos de modo demostración, URL del QR con origen dinámico como fallback.
- [x] Ajuste de cabeceras: eliminado el subtítulo "Plan Estratégico Institucional 2027–2031" del logo UPeU en AdminLayout y DashboardPage; se conserva únicamente el logo institucional.
- [x] Mejoras del Mural en Vivo: polling automático cada 2s en /admin, / y /mural; nube dinámica de áreas basada en D1; eliminación del modo Mosaico PEI; últimos 10 participantes con animación en mural principal; indicador de conexión; animaciones en hitos (100, 500, 1000); endpoint público /api/public/recent; soporte de límite en /api/admin/commitments.
- [x] Corrección Nube de Áreas: se filtran áreas con count=0 (solo áreas con registros reales), estado vacío "Esperando los primeros compromisos", contenedor azul #17436C con borde #37638B, colores de alto contraste (blanco, dorado, celeste, verde menta), tamaño de fuente proporcional suavizado.
- [x] Optimización Polling: eliminado doble uso de usePolling + useEffect en DashboardPage que causaba peticiones duplicadas; usePolling gestiona el montaje inicial y la limpieza automática al desmontar.
- [x] Optimización Frecuencia Polling: Mural cada 3 segundos, Dashboard cada 5 segundos; Mural usa getRecentConsenting(10) en lugar de getAll({ onlyConsenting: true }) para no descargar todos los registros; interfaz CommitmentRepository ampliada con getRecentConsenting.
- [x] Ajustes Finales Antes de Producción: Mural principal con 8 tarjetas compactas (4×2 en desktop, responsive en móvil); Cierre Final ceremonial con totales reales por campus, mensaje "Nuestro compromiso, nuestro futuro", congelamiento de instantánea y detención de polling; ParticipantCard con modo compacto; QR con URL fija de producción (https://pei-compromiso-worker.gpt5plus123.workers.dev/compromiso), soporte para IP LAN en desarrollo, rechazo de localhost/127.0.0.1, y muestra de URL de destino para verificación.
- [ ] Fase 5: Pruebas end-to-end y simulacro general.

## Verificaciones de Calidad
- `npm run typecheck`: 0 errores en TypeScript estricto.
- `npx eslint src`: 0 errores (solo warnings preexistentes).
- `npm run test`: 29 de 29 pruebas aprobadas.
- `npm run build`: Empaquetado de producción con Vite exitoso.
- `npx wrangler deploy --dry-run`: Exitoso — Worker con binding DB (D1) y assets ASSETS.
