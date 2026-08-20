const { app } = require('electron');
const Database = require('better-sqlite3');
const path = require('path');
const os = require('os');

app.whenReady().then(() => {
  const dbPath = path.join(os.homedir(), '.config/inventario-app/inventario.db');
  const db = new Database(dbPath);
  
  const stmt = db.prepare("SELECT * FROM productos");
  console.log(stmt.all());
  app.quit();
});
