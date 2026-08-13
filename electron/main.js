const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const Database = require("better-sqlite3");
const isDev = require("electron-is-dev");

let mainWindow;
let db;

// Inicializar base de datos
function initializeDatabase() {
  const dbPath = path.join(app.getPath("userData"), "inventario.db");
  db = new Database(dbPath);

  // Crear tablas si no existen
  db.exec(`
    CREATE TABLE IF NOT EXISTS productos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      cantidad INTEGER NOT NULL DEFAULT 0,
      precio_compra REAL NOT NULL,
      precio_venta REAL NOT NULL,
      fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
      fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ventas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      producto_id INTEGER NOT NULL,
      cantidad INTEGER NOT NULL,
      precio_unitario REAL NOT NULL,
      subtotal REAL NOT NULL,
      fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(producto_id) REFERENCES productos(id)
    );

    CREATE TABLE IF NOT EXISTS transacciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero_transaccion TEXT UNIQUE,
      total REAL NOT NULL,
      cantidad_items INTEGER NOT NULL,
      fecha DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log("Base de datos inicializada en:", dbPath);
}

// Crear ventana principal
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
    },
  });

  const startUrl = isDev
    ? "http://localhost:5173"
    : `file://${path.join(__dirname, "../dist/index.html")}`;

  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// IPC Handlers
ipcMain.handle("db:agregarProducto", (event, producto) => {
  try {
    const stmt = db.prepare(`
      INSERT INTO productos (nombre, cantidad, precio_compra, precio_venta)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(
      producto.nombre,
      producto.cantidad,
      producto.precio_compra,
      producto.precio_venta,
    );
    return { success: true, id: result.lastInsertRowid };
  } catch (error) {
    console.error("Error al agregar producto:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("db:obtenerProductos", () => {
  try {
    const stmt = db.prepare(
      "SELECT * FROM productos ORDER BY fecha_creacion DESC",
    );
    const productos = stmt.all();
    return { success: true, data: productos };
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("db:actualizarProducto", (event, id, producto) => {
  try {
    const stmt = db.prepare(`
      UPDATE productos 
      SET nombre = ?, cantidad = ?, precio_compra = ?, precio_venta = ?, fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(
      producto.nombre,
      producto.cantidad,
      producto.precio_compra,
      producto.precio_venta,
      id,
    );
    return { success: true };
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("db:eliminarProducto", (event, id) => {
  try {
    const stmt = db.prepare("DELETE FROM productos WHERE id = ?");
    stmt.run(id);
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("db:buscarProducto", (event, nombre) => {
  try {
    const stmt = db.prepare(`
      SELECT * FROM productos 
      WHERE nombre LIKE ? 
      ORDER BY nombre ASC
    `);
    const productos = stmt.all(`%${nombre}%`);
    return { success: true, data: productos };
  } catch (error) {
    console.error("Error al buscar producto:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("db:registrarVenta", (event, venta) => {
  try {
    // Registrar cada producto vendido
    const stmtVenta = db.prepare(`
      INSERT INTO ventas (producto_id, cantidad, precio_unitario, subtotal)
      VALUES (?, ?, ?, ?)
    `);

    // Actualizar cantidad de productos
    const stmtUpdate = db.prepare(`
      UPDATE productos 
      SET cantidad = cantidad - ?
      WHERE id = ?
    `);

    venta.items.forEach((item) => {
      stmtVenta.run(item.id, item.cantidad, item.precio_venta, item.subtotal);
      stmtUpdate.run(item.cantidad, item.id);
    });

    return { success: true };
  } catch (error) {
    console.error("Error al registrar venta:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("db:registrarTransaccion", (event, transaccion) => {
  try {
    const numeroTransaccion = "TRX-" + Date.now();
    const stmt = db.prepare(`
      INSERT INTO transacciones (numero_transaccion, total, cantidad_items)
      VALUES (?, ?, ?)
    `);
    stmt.run(numeroTransaccion, transaccion.total, transaccion.cantidad_items);
    return { success: true, numeroTransaccion };
  } catch (error) {
    console.error("Error al registrar transacción:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("db:obtenerEstadisticas", () => {
  try {
    const totalProductos = db
      .prepare("SELECT COUNT(*) as total FROM productos")
      .get().total;
    const valorTotal =
      db
        .prepare("SELECT SUM(cantidad * precio_venta) as total FROM productos")
        .get().total || 0;
    const ventasHoy =
      db
        .prepare(
          `
      SELECT SUM(subtotal) as total FROM ventas 
      WHERE DATE(fecha) = DATE('now')
    `,
        )
        .get().total || 0;
    const totalVendidoHoy =
      db
        .prepare(
          `
      SELECT SUM(total) as total FROM transacciones 
      WHERE DATE(fecha) = DATE('now')
    `,
        )
        .get().total || 0;

    return {
      success: true,
      data: {
        totalProductos,
        valorTotal: Math.round(valorTotal * 100) / 100,
        ventasHoy: Math.round(ventasHoy * 100) / 100,
        totalVendidoHoy: Math.round(totalVendidoHoy * 100) / 100,
      },
    };
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    return { success: false, error: error.message };
  }
});

// App events
app.on("ready", () => {
  initializeDatabase();
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
  if (db) {
    db.close();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
