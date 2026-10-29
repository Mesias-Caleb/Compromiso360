# Arquitectura — PEI Compromiso 360°

## 1. Visión General
Plataforma web para el acto simbólico de compromiso con el Plan Estratégico Institucional (PEI 2026-2030) en tres sedes universitarias: Lima (LIM), Juliaca (JUL) y Tarapoto (TPP).

Diseñada bajo arquitectura desacoplada por capas:
- **Presentación (UI / Features):** Componentes React modulares por funcionalidad.
- **Dominio (Domain):** Modelos, contratos de repositorios y reglas de negocio/validación puras en TypeScript.
- **Infraestructura (Infrastructure):** Adaptadores de persistencia (LocalStorage con sincronización de pestañas vía BroadcastChannel / eventos de almacenamiento).
- **Configuración (Config):** Catálogos institucionales editables (campus, códigos de acceso, áreas organizacionales y texto oficial inmutable).

## 2. Diagrama de Capas
```
src/
├── app/                  # Router, proveedores globales y estilos base
│   ├── providers/
│   ├── router/
│   └── styles/
├── domain/               # Lógica de negocio y modelos independientes del framework
│   ├── models/           # Campus, Área, Compromiso, Evento, Estadísticas
│   ├── repositories/     # Interfaz CommitmentRepository
│   └── services/         # Validación de códigos/formularios y cálculo de métricas
├── infrastructure/       # Adaptadores de infraestructura
│   ├── storage/          # LocalCommitmentRepository (LocalStorage + BroadcastChannel)
│   └── demo/             # Semillas mock y utilidades de demostración
├── config/               # Catálogos institucionales editables
│   ├── campuses.ts       # Sedes y códigos QR/visuales (LIM-4827, JUL-7391, TPP-6154)
│   ├── areas.ts          # Direcciones y facultades universitarias
│   └── event.ts          # Metas, texto del compromiso institucional y versión
├── features/             # Pantallas y estados organizados por dominio funcional
│   ├── access/           # Validación de código de campus / QR
│   ├── commitment/       # Formulario y constancia de compromiso
│   ├── mural/            # Proyección ceremonial en vivo
│   └── dashboard/        # Panel administrativo y exportación CSV
└── components/           # Componentes atómicos y diseño
    ├── ui/               # Botones, tarjetas, badges, inputs accesibles
    ├── shared/           # Header, Footer, Banner Demo, CampusBadge
    └── layout/           # RootLayout institucional
```

## 3. Contrato de Persistencia Intercambiable
El contrato `CommitmentRepository` define los métodos esenciales:
- `register(input: CreateCommitmentInput): Promise<Commitment>`
- `getAll(filters?: CommitmentFilters): Promise<Commitment[]>`
- `getById(id: string): Promise<Commitment | null>`
- `getStats(): Promise<EventStats>`
- `getRecent(limit?: number): Promise<Commitment[]>`
- `exportToCSV(filters?: CommitmentFilters): Promise<string>`
- `clearAll(): Promise<void>`
- `seedDemo(records?: Commitment[]): Promise<number>`
- `subscribe(listener: () => void): () => void`

### Migración a Cloudflare Workers + D1
Para sustituir el almacenamiento local por Cloudflare D1 en el futuro:
1. Crear `src/infrastructure/api/d1-commitment.repository.ts` implementando `CommitmentRepository`.
2. Consumir los endpoints REST / RPC de Workers mediante `fetch`.
3. Reemplazar la instancia singleton en `src/infrastructure/demo/demo-service.ts` o inyectarla vía React Context. Ningún componente visual ni regla de dominio requerirá cambios.

## 4. Estrategia de Validación y Seguridad Local
- Códigos de acceso institucionales normalizados (insensibles a mayúsculas/minúsculas y espacios).
- Prevención de doble clic y envíos duplicados inmediatos mediante `clientSubmissionToken`.
- Datos personales aislados en el entorno de demostración, señalizados con avisos institucionales.
