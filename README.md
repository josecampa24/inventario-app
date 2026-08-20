# Inventario y Punto de Venta App 📦🛍️

Este es un sistema completo de gestión de inventario y punto de venta diseñado para funcionar como una aplicación de escritorio rápida, moderna y fácil de usar. Está construido con tecnologías web modernas pero empaquetado para correr nativamente en tu computadora.

## 🚀 Tecnologías Principales

*   **Frontend:** [React](https://react.dev/) y [Vite](https://vitejs.dev/) para una interfaz de usuario extremadamente rápida y reactiva.
*   **Backend (Escritorio):** [Electron](https://www.electronjs.org/) permite que la aplicación web funcione como un programa de computadora independiente, comunicando el frontend con el sistema operativo de forma segura.
*   **Base de Datos:** [SQLite](https://www.sqlite.org/index.html) (a través de `better-sqlite3`). Toda tu información se guarda de forma local en tu computadora, sin necesidad de servidores en la nube o conexión a internet para funcionar.

## ✨ Características del Sistema

1.  **Dashboard / Resumen (En desarrollo):** Pantalla principal para visualizar métricas, ventas totales y el comportamiento del negocio.
2.  **Inventario de Productos:**
    *   Listado completo de productos en stock.
    *   Edición rápida en línea (nombre, cantidades, precios y fotografías).
    *   Cálculo automático de márgenes de ganancia por unidad.
    *   Buscador integrado para ubicar productos instantáneamente.
3.  **Nuevo Producto:**
    *   Agrega productos con validaciones de datos exactas (evitando inventarios negativos y errores).
    *   Soporte para **fotografías** (hasta 2MB por producto) almacenadas de forma segura directamente en la base de datos local.
4.  **Punto de Venta (POS):**
    *   Cuadrícula interactiva de productos disponibles en el inventario con sus respectivas fotografías.
    *   Filtrado instantáneo en tiempo real por nombre de producto.
    *   Carrito de compras lateral para ajustes rápidos de unidades y subtotales.
    *   Finalización de venta (descuenta automáticamente del inventario y registra transacciones internamente).

## 🗄️ ¿Cómo funciona la Base de Datos?

La aplicación usa **SQLite**, lo que significa que **toda la información vive y existe exclusivamente en tu computadora**. 
Al abrir la aplicación por primera vez, el sistema crea automáticamente un archivo llamado `inventario.db`. Este archivo se encuentra de manera predeterminada en tu carpeta de configuraciones de usuario del sistema operativo (en Linux/Mac usualmente `~/.config/inventario-app/` y en Windows dentro de `AppData`).

Las tablas principales que maneja el sistema son:
*   `productos`: Guarda todo tu catálogo, las cantidades en stock, precios y las fotografías (convertidas en formato de texto Base64).
*   `ventas`: El detalle de cada artículo individual que has vendido.
*   `transacciones`: El resumen y total cobrado global en cada transacción de tu carrito de compras.

*Nota de seguridad:* Si algún día necesitas hacer un respaldo total de tu negocio (productos, fotos y ventas), simplemente haz una copia del archivo `inventario.db`.

## 💻 Comandos para Desarrollo

Si necesitas ejecutar el sistema para hacerle pruebas, modificaciones o compilarlo en un ejecutable final, debes abrir tu terminal apuntando a la carpeta de este proyecto y utilizar los siguientes comandos:

**1. Instalar dependencias**
(Solo se requiere la primera vez que clonas o abres el proyecto en una PC nueva)
```bash
npm install
```

**2. Iniciar el modo de desarrollo (Modo Pruebas)**
Este comando levantará el servidor web de React e iniciará una ventana de Electron de manera simultánea para que veas tus cambios en tiempo real.
```bash
npm run dev
```

**3. Compilar para producción (Crear el instalador final)**
Para crear el programa ejecutable (.exe para Windows, .AppImage para Linux, etc.) y distribuirlo, ejecuta:
```bash
npm run build
```
Una vez que el comando termine, los archivos y el instalador se generarán en la carpeta `dist`.

---
*Diseñado para una gestión eficiente, segura y atractiva de tu negocio.*
