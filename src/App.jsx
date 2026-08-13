cat > (src / App.jsx) << "EOF";
import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import Inventario from "./pages/Inventario";
import NuevoProducto from "./pages/NuevoProducto";
import PuntoDeVenta from "./pages/PuntoDeVenta";
import "./App.css";

function App() {
  const [pagina, setPagina] = useState("dashboard");

  return (
    <div className="app">
      <nav className="navbar">
        <div className="navbar-content">
          <h1 className="logo">📦 Inventario App</h1>
          <div className="nav-buttons">
            <button
              className={`nav-btn ${pagina === "dashboard" ? "active" : ""}`}
              onClick={() => setPagina("dashboard")}
            >
              Dashboard
            </button>
            <button
              className={`nav-btn ${pagina === "inventario" ? "active" : ""}`}
              onClick={() => setPagina("inventario")}
            >
              Inventario
            </button>
            <button
              className={`nav-btn ${pagina === "nuevo" ? "active" : ""}`}
              onClick={() => setPagina("nuevo")}
            >
              Nuevo Producto
            </button>
            <button
              className={`nav-btn punto-venta ${pagina === "venta" ? "active" : ""}`}
              onClick={() => setPagina("venta")}
            >
              🛍️ Punto de Venta
            </button>
          </div>
        </div>
      </nav>

      <main className="main-content">
        {pagina === "dashboard" && <Dashboard />}
        {pagina === "inventario" && <Inventario />}
        {pagina === "nuevo" && (
          <NuevoProducto onProductoAgregado={() => setPagina("inventario")} />
        )}
        {pagina === "venta" && <PuntoDeVenta />}
      </main>
    </div>
  );
}

export default App;
EOF;
