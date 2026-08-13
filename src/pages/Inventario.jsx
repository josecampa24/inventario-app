cat > (src / pages / Inventario.jsx) << "EOF";
import { useState, useEffect } from "react";
import "./Inventario.css";

function Inventario() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      setCargando(true);
      const resultado = await window.electronAPI.obtenerProductos();
      if (resultado.success) {
        setProductos(resultado.data);
      }
    } catch (error) {
      console.error("Error cargando productos:", error);
    } finally {
      setCargando(false);
    }
  };

  const handleEditar = (producto) => {
    setEditando(producto.id);
    setFormData({ ...producto });
  };

  const handleGuardar = async () => {
    try {
      const resultado = await window.electronAPI.actualizarProducto(editando, {
        nombre: formData.nombre,
        cantidad: parseInt(formData.cantidad),
        precio_compra: parseFloat(formData.precio_compra),
        precio_venta: parseFloat(formData.precio_venta),
      });

      if (resultado.success) {
        setEditando(null);
        cargarProductos();
        alert("Producto actualizado correctamente");
      }
    } catch (error) {
      console.error("Error actualizando producto:", error);
      alert("Error al actualizar el producto");
    }
  };

  const handleEliminar = async (id) => {
    if (
      window.confirm("¿Estás seguro de que quieres eliminar este producto?")
    ) {
      try {
        const resultado = await window.electronAPI.eliminarProducto(id);
        if (resultado.success) {
          cargarProductos();
          alert("Producto eliminado correctamente");
        }
      } catch (error) {
        console.error("Error eliminando producto:", error);
        alert("Error al eliminar el producto");
      }
    }
  };

  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()),
  );

  if (cargando) {
    return <div className="inventario">Cargando...</div>;
  }

  return (
    <div className="inventario">
      <div className="inventario-header">
        <h2>Inventario de Productos</h2>
        <input
          type="text"
          placeholder="Buscar producto..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="search-input"
        />
      </div>

      {productosFiltrados.length === 0 ? (
        <div className="empty-state">
          <p>No hay productos en el inventario</p>
        </div>
      ) : (
        <div className="tabla-container">
          <table className="tabla-productos">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Cantidad</th>
                <th>Precio Compra</th>
                <th>Precio Venta</th>
                <th>Ganancia Unit.</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.map((producto) => (
                <tr
                  key={producto.id}
                  className={editando === producto.id ? "editing" : ""}
                >
                  <td>
                    {editando === producto.id ? (
                      <input
                        type="text"
                        value={formData.nombre}
                        onChange={(e) =>
                          setFormData({ ...formData, nombre: e.target.value })
                        }
                      />
                    ) : (
                      producto.nombre
                    )}
                  </td>
                  <td>
                    {editando === producto.id ? (
                      <input
                        type="number"
                        value={formData.cantidad}
                        onChange={(e) =>
                          setFormData({ ...formData, cantidad: e.target.value })
                        }
                      />
                    ) : (
                      producto.cantidad
                    )}
                  </td>
                  <td>
                    {editando === producto.id ? (
                      <input
                        type="number"
                        step="0.01"
                        value={formData.precio_compra}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            precio_compra: e.target.value,
                          })
                        }
                      />
                    ) : (
                      `$${producto.precio_compra.toFixed(2)}`
                    )}
                  </td>
                  <td>
                    {editando === producto.id ? (
                      <input
                        type="number"
                        step="0.01"
                        value={formData.precio_venta}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            precio_venta: e.target.value,
                          })
                        }
                      />
                    ) : (
                      `$${producto.precio_venta.toFixed(2)}`
                    )}
                  </td>
                  <td className="ganancia">
                    $
                    {(producto.precio_venta - producto.precio_compra).toFixed(
                      2,
                    )}
                  </td>
                  <td className="acciones">
                    {editando === producto.id ? (
                      <>
                        <button className="btn-guardar" onClick={handleGuardar}>
                          ✓ Guardar
                        </button>
                        <button
                          className="btn-cancelar"
                          onClick={() => setEditando(null)}
                        >
                          ✕ Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="btn-editar"
                          onClick={() => handleEditar(producto)}
                        >
                          ✏️ Editar
                        </button>
                        <button
                          className="btn-eliminar"
                          onClick={() => handleEliminar(producto.id)}
                        >
                          🗑️ Eliminar
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="inventario-footer">
        <p>
          Total de productos: <strong>{productosFiltrados.length}</strong>
        </p>
        <p>
          Valor total en inventario:{" "}
          <strong>
            $
            {productosFiltrados
              .reduce((sum, p) => sum + p.cantidad * p.precio_venta, 0)
              .toFixed(2)}
          </strong>
        </p>
      </div>
    </div>
  );
}

export default Inventario;
EOF;
