# PROJECT_MEMORY.md — PEI Compromiso 360°

## Estado Actual
Ajuste de arquitectura completado: separación de layouts, login administrativo demo, QR configurable y rutas protegidas.

## Arquitectura de Layouts (activa)

| Layout | Ruta | Componente | Descripción |
|---|---|---|---|
| `WorkerLayout` | `/compromiso` | `src/components/layout/WorkerLayout.tsx` | Sin header, footer ni menú. Viewport completo. |
| `CeremonyLayout` | `/mural` | `src/components/layout/CeremonyLayout.tsx` | Fondo oscuro, pantalla gigante, sin navegación. |
| `AdminLayout` | `/`, `/admin` | `src/components/layout/AdminLayout.tsx` | Header + DemoBanner + Footer + nav admin completa. |
| Sin layout | `/login` | `src/features/login/LoginPage.tsx` | Standalone, independiente. |

## Autenticación Demo
- **Store:** `src/auth/auth.store.ts` (Zustand + persist en `sessionStorage`).
- **Mecanismo:** Check local de usuario/contraseña demo. NO es seguridad real.
- **Aviso:** El LoginPage muestra explícitamente que es modo demostración.
- **Credenciales demo:** `admin` / `pei2027` (visible en código cliente deliberadamente).
- **Sesión:** Expira al cerrar la pestaña del navegador (`sessionStorage`).
- **Guard:** `src/guards/AdminRouteGuard.tsx` — redirige a `/login` conservando la URL de destino.

## Protección de Rutas
- `/` y `/admin` → requieren `AdminRouteGuard` → redirigen a `/login` si no hay sesión.
- `/compromiso` → público. Los trabajadores acceden sin login.
- `/mural` → público. El operador puede abrirlo desde la consola o desde un enlace directo.
- `/login` → público. Sin guard.

## QR Configurable
- **Config:** `src/config/qr.ts`
- **Variable de entorno:** `VITE_PUBLIC_COMMITMENT_URL` (opcional).
- **Desarrollo:** Auto-deriva `http://localhost:PORT/compromiso`.
- **Producción sin config:** Muestra estado "QR en espera de configuración".
- El QR siempre apunta a `/compromiso`. Nunca a `/` ni `/admin`.

## Logotipos
No existe carpeta `images/` en el proyecto. El logo institucional es el componente SVG `InstitutionalLogo` con variantes:
- `dark`: texto `#09264A` + icono `#124B87` (fondos claros).
- `light`: texto `#FFFFFF` + icono `#D6AD60` (fondos oscuros/mural/login).
- `gold`: dorado completo (uso decorativo).
- Tamaños: `sm`, `md`, `lg`.

## Tokens e Identidad Oficial
- **Lema:** `IDENTIDAD · EXCELENCIA · MISIÓN`
- **Periodo:** `PEI 2027–2031`
- **Versión de declaración:** `v1.0-2027-2031`
- **Azul profundo ceremonial:** `#09264A`
- **Azul institucional:** `#124B87`
- **Azul de interacción:** `#1769B3`
- **Dorado ceremonial:** `#D6AD60`
- **Iconografía:** Exclusivamente `Lucide React`.

## Códigos de Campus (definitivos)
| Campus | ID | Código de acceso |
|---|---|---|
| Lima | LIM | `LIM` |
| Juliaca | JUL | `JUL` |
| Tarapoto | TPP | `TPP` |

Normalización: `.trim().toUpperCase()` antes de validar.

## Flujo del Trabajador (Ruta `/compromiso`)
1. Código de campus → Placeholder: "Ej. LIM".
2. Formulario: nombres, apellidos, campus (pre-llenado del código), área.
3. Pantalla final: check animado, tarjeta personalizada, bloque de regalo.
4. Sesión local de 24 horas (`saveActiveWorkerSession` / `getActiveWorkerSession`).

## Layout de `/compromiso`
- `WorkerLayout` → sin header, sin footer, sin menú.
- `min-height: 100dvh` con fallback `100vh`.
- `env(safe-area-inset-*)` en el contenedor raíz.
- `viewport-fit=cover` en `index.html`.
- `font-size: 16px` en inputs/select para prevenir zoom iOS.
- Botones con `min-h-[44px]`.

## Registro de Avances
- [x] Fase 0: Arquitectura modular, persistencia local, contratos y tipos de dominio.
- [x] Fase 1: Identidad visual institucional y componentes aprobados.
- [x] Ajuste 1: Unificación de confirmación y tarjeta final con bloque de regalo (24h).
- [x] Ajuste 2: Lema (`IDENTIDAD · EXCELENCIA · MISIÓN`) y periodo (`PEI 2027–2031`).
- [x] Ajuste 3: Códigos definitivos LIM/JUL/TPP y experiencia móvil real.
- [x] Ajuste 4: Separación de layouts, login demo, guard de rutas admin, QR configurable.
- [ ] Fase 2: Refinamiento ceremonial y validaciones avanzadas.
- [ ] Fase 3: Proyección ceremonial interactiva del mural en vivo.
- [ ] Fase 4: Administración avanzada y filtros analíticos.
- [ ] Fase 5: Pruebas end-to-end y simulacro general.

## Verificaciones de Calidad
- `npm run typecheck`: 0 errores (incluyendo `vite/client` types para `import.meta.env`).
- `npm run test`: 17 de 17 pruebas aprobadas.
- `npm run build`: Exitoso en 6.21s, sin errores.

## Decisiones Técnicas
- `sessionStorage` para la sesión admin (expira al cerrar la pestaña; nunca persiste entre sesiones).
- `localStorage` para la sesión del trabajador (24h; permite reapertura directa del día del evento).
- El `RootLayout` original fue reemplazado por los tres layouts especializados. El archivo existe pero ya no se importa (puede eliminarse).
- El `Header.tsx` y `Footer.tsx` originales siguen siendo usados por `AdminLayout`.
