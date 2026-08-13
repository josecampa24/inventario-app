import { useState, useEffect } from "react";
import "./Dashboard.css";

function Dashboard() {
  const [stats, setStats] = useState({
    totalProductos: 0,
    valorTotal: 0,
    ventasHoy: 0,
    totalVendidoHoy: 0,
  });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarEstadisticas();
    const intervalo = setInterval(cargarEstadisticas, 2000);
    return () => clearInterval(intervalo);
  }, []);

  const cargarEstadisticas = async () => {
    try {
      const resultado = await window.electronAPI.obtenerEstadisticas();
      if (resultado.success) {
        setStats(resultado.data);
      }
    } catch (error) {
      console.error("Error cargando estadísticas:", error);
    } finally {
      setCargando(false);
    }
  };

  if (cargando) {
    return <div className="dashboard">Cargando...</div>;
  }

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Productos</h3>
            <p className="stat-valor">{stats.totalProductos}</p>
            <span className="stat-label">Total en inventario</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Valor Total</h3>
            <p className="stat-valor">${stats.valorTotal.toFixed(2)}</p>
            <span className="stat-label">Valor en inventario</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🛍️</div>
          <div className="stat-content">
            <h3>Ventas Hoy</h3>
            <p className="stat-valor">${stats.totalVendidoHoy.toFixed(2)}</p>
            <span className="stat-label">Total vendido</span>
          </div>
        </div>
      </div>

      <div className="dashboard-info">
        <h3>Información del Sistema</h3>
        <div className="info-box">
          <p>
            <strong>Estado:</strong> Conectado
          </p>
          <p>
            <strong>Base de datos:</strong> SQLite Local
          </p>
          <p>
            <strong>Modo:</strong> Offline
          </p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
