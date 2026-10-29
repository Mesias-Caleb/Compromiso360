# Sistema de Diseño — PEI Compromiso 360°

## 1. Principios Visuales
- **Institucionalidad y Solemnidad:** Paleta sobria basada en azul marino de alto contraste, acentos en oro institucional y blanco puro.
- **Sin Emojis:** Prohibición estricta de emojis en toda la interfaz. Reemplazados exclusivamente por iconografía vectorial técnica de `Lucide React`.
- **Claridad Ceremonial:** Tipografía legible desde dispositivos móviles en el auditorio hasta pantallas gigantes de proyección.
- **Feedback Inmediato:** Transiciones sutiles en botones y validaciones en línea para orientar al trabajador.

## 2. Paleta de Colores
- **Fondo Primario:** Slate 950 (`#030712` / `hsl(222, 47%, 5%)`)
- **Superficie de Tarjetas:** Slate 900 con 80% opacidad y backdrop-blur (`#0f172a`)
- **Bordes:** Slate 800 (`#1e293b`)
- **Acento Dorado Institucional:**
  - Gold 400: `#d2ab35`
  - Gold 500: `#c59b27`
  - Gradiente Ceremonial: `from-amber-400 to-amber-600`
- **Distintivos de Campus:**
  - **Campus Lima (LIM):** Azul cielo institucional (`#0284c7`, `bg-sky-500/10 text-sky-300`)
  - **Campus Juliaca (JUL):** Verde andino institucional (`#059669`, `bg-emerald-500/10 text-emerald-300`)
  - **Campus Tarapoto (TPP):** Ámbar cálido institucional (`#d97706`, `bg-amber-500/10 text-amber-300`)

## 3. Tipografía
- **Cuerpo y Formularios:** *Plus Jakarta Sans* / Sans-serif moderno institucional.
- **Títulos Ceremoniales:** Peso 700 / 800 con tracking ajustado.
- **Métricas y Códigos:** Monoespaciado técnico (`font-mono`) para códigos de campus y contadores de participación.

## 4. Componentes Base
- `Button`: Variantes `gold`, `default`, `outline`, `secondary`, `ghost`, `destructive`.
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`.
- `Badge`: Variantes por campus (`lim`, `jul`, `tpp`), `gold`, `outline`.
- `Input` y `Select`: Estilos oscuros con foco en anillo dorado y estados de error en carmesí.
- `CampusBadge`: Indicador con pin de ubicación y colores normalizados.
- `DemoBanner`: Notificación explícita de entorno local con accesos a siembra y limpieza de datos.
