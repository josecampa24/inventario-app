import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

const STORAGE_KEYS = {
  productos: "inventario-app-productos",
  ventas: "inventario-app-ventas",
  transacciones: "inventario-app-transacciones",
};

const leerStorage = (key, fallback = []) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.error(`Error leyendo ${key}:`, error);
    return fallback;
  }
};

const guardarStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const fallbackElectronAPI = {
  agregarProducto: (producto) => {
    const productos = leerStorage(STORAGE_KEYS.productos, []);
    const nombre = String(producto?.nombre ?? "").trim();

    if (!nombre) {
      return { success: false, error: "El nombre del producto es requerido" };
    }

    const nuevoProducto = {
      id: Date.now() + Math.random(),
      nombre,
      cantidad: Number(producto?.cantidad ?? 0),
      precio_compra: Number(producto?.precio_compra ?? 0),
      precio_venta: Number(producto?.precio_venta ?? 0),
      fecha_creacion: new Date().toISOString(),
      fecha_actualizacion: new Date().toISOString(),
    };

    productos.unshift(nuevoProducto);
    guardarStorage(STORAGE_KEYS.productos, productos);
    return { success: true, id: nuevoProducto.id };
  },

  obtenerProductos: () => ({
    success: true,
    data: leerStorage(STORAGE_KEYS.productos, []),
  }),

  actualizarProducto: (id, producto) => {
    const productos = leerStorage(STORAGE_KEYS.productos, []);
    const index = productos.findIndex((item) => item.id === id);

    if (index === -1) {
      return { success: false, error: "Producto no encontrado" };
    }

    productos[index] = {
      ...productos[index],
      nombre: String(producto?.nombre ?? productos[index].nombre).trim(),
      cantidad: Number(producto?.cantidad ?? productos[index].cantidad),
      precio_compra: Number(
        producto?.precio_compra ?? productos[index].precio_compra,
      ),
      precio_venta: Number(
        producto?.precio_venta ?? productos[index].precio_venta,
      ),
      fecha_actualizacion: new Date().toISOString(),
    };

    guardarStorage(STORAGE_KEYS.productos, productos);
    return { success: true };
  },

  eliminarProducto: (id) => {
    const productos = leerStorage(STORAGE_KEYS.productos, []);
    const filtrados = productos.filter((item) => item.id !== id);
    guardarStorage(STORAGE_KEYS.productos, filtrados);
    return { success: true };
  },

  buscarProducto: (nombre) => {
    const productos = leerStorage(STORAGE_KEYS.productos, []);
    const texto = String(nombre ?? "").toLowerCase();
    const filtrados = productos.filter((producto) =>
      producto.nombre.toLowerCase().includes(texto),
    );
    return { success: true, data: filtrados };
  },

  registrarVenta: (venta) => {
    const productos = leerStorage(STORAGE_KEYS.productos, []);
    const ventas = leerStorage(STORAGE_KEYS.ventas, []);

    venta.items.forEach((item) => {
      const producto = productos.find((p) => p.id === item.id);
      if (!producto) {
        throw new Error(`Producto no encontrado: ${item.id}`);
      }
      if (producto.cantidad < item.cantidad) {
        throw new Error(`Stock insuficiente para ${producto.nombre}`);
      }

      producto.cantidad = producto.cantidad - item.cantidad;
      producto.fecha_actualizacion = new Date().toISOString();

      ventas.push({
        id: Date.now() + Math.random(),
        producto_id: item.id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_venta,
        subtotal: item.subtotal,
        fecha: new Date().toISOString(),
      });
    });

    guardarStorage(STORAGE_KEYS.productos, productos);
    guardarStorage(STORAGE_KEYS.ventas, ventas);
    return { success: true };
  },

  registrarTransaccion: (transaccion) => {
    const transacciones = leerStorage(STORAGE_KEYS.transacciones, []);
    const nuevaTransaccion = {
      id: Date.now() + Math.random(),
      numero_transaccion: `TRX-${Date.now()}`,
      total: Number(transaccion?.total ?? 0),
      cantidad_items: Number(transaccion?.cantidad_items ?? 0),
      fecha: new Date().toISOString(),
    };

    transacciones.push(nuevaTransaccion);
    guardarStorage(STORAGE_KEYS.transacciones, transacciones);
    return {
      success: true,
      numeroTransaccion: nuevaTransaccion.numero_transaccion,
    };
  },

  obtenerEstadisticas: () => {
    const productos = leerStorage(STORAGE_KEYS.productos, []);
    const ventas = leerStorage(STORAGE_KEYS.ventas, []);
    const transacciones = leerStorage(STORAGE_KEYS.transacciones, []);
    const hoy = new Date().toISOString().slice(0, 10);

    const ventasHoy = ventas
      .filter((venta) => venta.fecha?.slice(0, 10) === hoy)
      .reduce((sum, venta) => sum + Number(venta.subtotal ?? 0), 0);

    const totalVendidoHoy = transacciones
      .filter((transaccion) => transaccion.fecha?.slice(0, 10) === hoy)
      .reduce((sum, transaccion) => sum + Number(transaccion.total ?? 0), 0);

    const valorTotal = productos.reduce(
      (sum, producto) =>
        sum +
        Number(producto.cantidad ?? 0) * Number(producto.precio_venta ?? 0),
      0,
    );

    return {
      success: true,
      data: {
        totalProductos: productos.length,
        valorTotal: Number(valorTotal.toFixed(2)),
        ventasHoy: Number(ventasHoy.toFixed(2)),
        totalVendidoHoy: Number(totalVendidoHoy.toFixed(2)),
      },
    };
  },
};

if (!window.electronAPI) {
  window.electronAPI = fallbackElectronAPI;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
