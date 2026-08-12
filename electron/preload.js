cat > (electron / preload.js) << "EOF";
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // Productos
  agregarProducto: (producto) =>
    ipcRenderer.invoke("db:agregarProducto", producto),
  obtenerProductos: () => ipcRenderer.invoke("db:obtenerProductos"),
  actualizarProducto: (id, producto) =>
    ipcRenderer.invoke("db:actualizarProducto", id, producto),
  eliminarProducto: (id) => ipcRenderer.invoke("db:eliminarProducto", id),
  buscarProducto: (nombre) => ipcRenderer.invoke("db:buscarProducto", nombre),

  // Ventas
  registrarVenta: (venta) => ipcRenderer.invoke("db:registrarVenta", venta),
  registrarTransaccion: (transaccion) =>
    ipcRenderer.invoke("db:registrarTransaccion", transaccion),

  // Estadísticas
  obtenerEstadisticas: () => ipcRenderer.invoke("db:obtenerEstadisticas"),
});
EOF;
