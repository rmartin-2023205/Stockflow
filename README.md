# StockFlow — Frontend Web

Aplicación web Single Page Application (SPA) para **StockFlow**, un sistema moderno de gestión de inventario, existencias y punto de venta para pequeños negocios.

---

## 🛠 Stack Tecnológico

- **Framework**: React 19
- **Bundler & Dev Server**: Vite 6
- **Estilos**: Tailwind CSS v4 (motor CSS moderno de alto rendimiento)
- **Enrutamiento**: React Router 7
- **Iconografía**: Lucide React
- **Habilidades de Diseño Integradas**:
  - `taste-skill` (dirección de arte y estética anti-plantillas)
  - `impeccable` (motor de pulido de interfaces y layouts)
  - `emil-design-eng` (micro-interacciones, animaciones físicas y consistencia visual)

---

## 📂 Estructura del Proyecto

```text
stockflow-frontend/
├── public/                    # Favicon e imágenes estáticas
├── src/
│   ├── api/
│   │   └── client.js          # Cliente fetch centralizado con prefijo /api y manejo de errores
│   ├── components/            # Componentes reutilizables (botones, modales, tablas)
│   ├── layouts/               # Plantillas estructurales (sidebar, navbar, content)
│   ├── features/              # Módulos por dominio de negocio
│   │   ├── auth/              # [Fase 2] Vistas de login, registro y perfil
│   │   ├── dashboard/         # [Fase 6] Métricas y gráficos
│   │   ├── products/          # [Fase 3] Listado, búsqueda y formularios de productos
│   │   ├── categories/        # [Fase 3] Gestión de categorías
│   │   ├── inventory/         # [Fase 4] Ajustes y trazabilidad de existencias
│   │   ├── sales/             # [Fase 5] Punto de venta (POS) y carrito
│   │   └── reports/           # [Fase 6] Reportes por rango de fechas
│   ├── hooks/                 # Custom Hooks de React
│   ├── routes/                # Configuración de rutas públicas y protegidas
│   ├── utils/                 # Utilidades de formato (moneda, fechas)
│   ├── App.jsx                # Vista base con panel de diagnóstico y salud del sistema
│   ├── index.css              # Directivas de Tailwind CSS v4 y tipografía Plus Jakarta Sans
│   └── main.jsx               # Montaje principal de React en el DOM
├── index.html                 # Shell HTML accesible y optimizado para SEO
├── vite.config.js             # Configuración Vite con proxy automático a http://localhost:3000
├── .env.example               # Variables de entorno para el cliente
├── .gitignore                 # Exclusión de node_modules/, dist/ y binarios
└── package.json               # Dependencias y scripts de desarrollo
```

---

## 🚀 Puesta en Marcha Local

### 1. Requisitos Previos

- [Node.js](https://nodejs.org/) v20 o superior instalado.
- Servidor Backend ([Stockflow-Api](https://github.com/rmartin-2023205/Stockflow-Api.git)) en ejecución en el puerto `3000`.

### 2. Instalación de Dependencias

```bash
npm install
```

### 3. Iniciar Servidor de Desarrollo

```bash
npm run dev
```

La aplicación estará disponible de inmediato en:
👉 **`http://localhost:5173`**

*(Todas las solicitudes a `/api/*` se redirigen automáticamente hacia `http://localhost:3000` mediante el proxy configurado en `vite.config.js`).*

---

## 📦 Compilación para Producción

Para compilar y minificar el bundle para despliegue:

```bash
npm run build
```

Los artefactos optimizados se generarán en la carpeta `dist/`.

Para previsualizar localmente el build de producción:

```bash
npm run preview
```

---

## 🎨 Sistema de Diseño y Filosofía UI/UX

El frontend está diseñado bajo estándares modernos de experiencia de usuario:
- **Tipografía**: Plus Jakarta Sans con pesos balanceados y JetBrains Mono para códigos o datos numéricos de alta legibilidad.
- **Paleta de Color**: Modo oscuro profundo con toques índigo/violeta, bordes sutiles y transparencias en cristal (*glassmorphism*).
- **Feedback Activo**: Estados explícitos de carga, error recuperable, estado vacío informativo y confirmaciones en acciones críticas.

---

## 🔗 Repositorios Relacionados

- **Backend API**: [Stockflow-Api](https://github.com/rmartin-2023205/Stockflow-Api.git)
- **Documentación Central & Especificación**: [Stockflow Docs](https://github.com/rmartin-2023205)
