# AGENTS.md — PEI Compromiso 360

## Objetivo
Construir un MVP funcional, elegante y responsive del lanzamiento del PEI para tres campus (LIM, JUL, TPP), sin backend remoto. Preservar arquitectura para integrar Cloudflare Workers + D1 posteriormente.

## Reglas obligatorias
- Trabajar exclusivamente en la carpeta del proyecto. No instalar dependencias ni ejecutar comandos destructivos sin necesidad.
- Ante cambios puntuales, inspeccionar solo archivos relacionados; aplicar un diff mínimo. No rediseñar ni reescribir módulos funcionales.
- No navegar ni investigar alternativas si el stack y los requisitos ya están definidos. Preguntar únicamente por bloqueos reales.
- No instalar skills o dependencias adicionales por iniciativa propia; proponerlas con justificación breve si fueran imprescindibles.
- Al finalizar cada fase: ejecutar verificaciones pertinentes, resumir archivos modificados, resultados y próximo paso en máximo 8 líneas.
- Mantener `docs/PROJECT_MEMORY.md` actualizado con decisiones, estado, rutas y pendientes. Consultarlo al comenzar una nueva sesión.
- No simular una integración remota real: LocalStorage es solo demo local. Las pestañas del mismo origen pueden sincronizarse mediante BroadcastChannel y evento storage; los dispositivos diferentes NO se sincronizan.
- Código limpio: TypeScript estricto, módulos pequeños, componentes accesibles, validaciones y pruebas de casos críticos.
- No usar emojis en la interfaz. Utilizar Lucide React.
- Nunca exponer datos personales en logs o datos de prueba compartidos. Incluir aviso de demostración.

## Stack fijo
React, Vite, TypeScript, Tailwind CSS, shadcn/ui, Lucide React, Motion, Zustand, Recharts, Vitest, Testing Library, Playwright. Evitar nuevas dependencias sin necesidad.

## Rutas previstas
- `/` inicio y código de campus
- `/compromiso` formulario y confirmación
- `/mural` proyección ceremonial
- `/admin` tablero y exportación

## Contratos de dominio
Campus: LIM, JUL, TPP. Los códigos de acceso configurables deben ser distintos de los IDs de campus, por ejemplo `LIM-4827`.
Compromiso: id UUID, nombres, apellidos, campus, areaId, areaNombre, textoVersion, aceptacion, permisoPublicacion, fechaISO, origenDemo.
El texto del compromiso es institucional, único y versionado. No hay redacción libre del trabajador.
Evitar duplicados accidentales por token local de envío; sin autenticación NO se garantiza unicidad de personas.
No almacenar imágenes de firma manuscrita en esta fase.

## Criterios de terminado
Flujo QR/código → formulario → consentimiento → confirmación → registro local → mural → panel → CSV, con pruebas y estados de error. Accesibilidad básica, responsive, sin errores de consola ni de compilación.

## Diseño frontend obligatorio

Para crear, rediseñar o modificar interfaces:
1. Activar la skill `frontend-design` ubicada en `.agents/skills/frontend-design/SKILL.md`.
2. Leer `docs/DESIGN_GUIDELINES.md`.
3. Respetar la maqueta aprobada y los componentes existentes.
4. Ejecutar cambios mínimos, sin rediseños no solicitados.
5. Verificar la implementación antes de finalizar.

Para tareas exclusivamente de backend, dominio o pruebas sin cambios visuales, no cargar la skill de diseño.