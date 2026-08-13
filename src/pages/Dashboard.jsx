cat > src/pages/Dashboard.jsx << 'EOF'
import { useState, useEffect } from 'react'
import './Dashboard.css'

function Dashboard() {
  const [stats, setStats] = useState({
    totalProductos: 0,
    valorTotal: 0,
    ventasHoy: 0,
    totalVendidoHoy: 0,
  })
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    cargarEstadisticas()
    const intervalo = setInterval(cargarEstadisticas, 2000)
    return () => clearInterval(intervalo)
  }, [])

  const cargarEstadisticas = async () => {
    try {
      const resultado = await window.electronAPI.obtenerEstadisticas()
      if (resultado.success) {
        setStats(resultado.data)
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error)
    } finally {
      setCargando(false)
    }
  }

  if (cargando) {
    return <div className="dashboard">Cargando...</div>
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
          <div className="stat-content"></div>