const Database = require('better-sqlite3');
const db = new Database(':memory:');
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
`);

const stmt = db.prepare(`
  INSERT INTO productos (nombre, cantidad, precio_compra, precio_venta)
  VALUES (?, ?, ?, ?)
`);

try {
  const result = stmt.run("Test", 10, 10.5, 20.5);
  console.log("Success:", result);
} catch (e) {
  console.error("Error:", e.message);
}
