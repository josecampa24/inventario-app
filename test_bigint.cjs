const { app } = require('electron');
const Database = require('better-sqlite3');
const path = require('path');
const os = require('os');

app.whenReady().then(() => {
  const dbPath = path.join(os.homedir(), '.config/inventario-app/inventario.db');
  const db = new Database(dbPath);
  
  const stmt = db.prepare(`
    INSERT INTO productos (nombre, cantidad, precio_compra, precio_venta)
    VALUES (?, ?, ?, ?)
  `);
  const result = stmt.run("Test BigInt", 10, 10.5, 20.5);
  console.log("typeof lastInsertRowid:", typeof result.lastInsertRowid);
  app.quit();
});
