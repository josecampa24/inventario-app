const { app } = require('electron');
const Database = require('better-sqlite3');
const path = require('path');
const os = require('os');

app.whenReady().then(() => {
  try {
    const dbPath = path.join(os.homedir(), '.config/inventario-app/inventario.db');
    const db = new Database(dbPath);
    
    // Check tables
    const tables = db.prepare("SELECT name, sql FROM sqlite_master WHERE type='table'").all();
    console.log("TABLES:", tables);

    // Try inserting
    const stmt = db.prepare(`
      INSERT INTO productos (nombre, cantidad, precio_compra, precio_venta)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run("Test", 10, 10.5, 20.5);
    console.log("INSERT RESULT:", result);
  } catch (e) {
    console.error("ERROR:", e);
  }
  app.quit();
});
