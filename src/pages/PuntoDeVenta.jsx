import { useState, useEffect } from "react";
import "./PuntoDeVenta.css";

function PuntoDeVenta() {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [carrito, setCarrito] = useState([]);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      const resultado = await window.electronAPI.obtenerProductos();
      if (resultado.success) {
        setProductos(resultado.data);
      }
    } catch (error) {
      console.error("Error cargando productos:", error);
    }
  };

  const handleBusqueda = (valor) => {
    setBusqueda(valor);
  };

  const productosMostrados = productos.filter(
    (p) =>
      p.cantidad > 0 &&
      p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const agregarAlCarrito = (producto) => {
    const productoEnCarrito = carrito.find((p) => p.id === producto.id);

    if (productoEnCarrito) {
      if (productoEnCarrito.cantidad < producto.cantidad) {
        setCarrito(
          carrito.map((p) =>
            p.id === producto.id
              ? {
                  ...p,
                  cantidad: p.cantidad + 1,
                  subtotal: (p.cantidad + 1) * p.precio_venta,
                }
              : p,
          ),
        );
      } else {
        setMensaje("❌ No hay más stock disponible");
      }
    } else {
      if (producto.cantidad > 0) {
        setCarrito([
          ...carrito,
          {
            id: producto.id,
            nombre: producto.nombre,
            precio_venta: producto.precio_venta,
            cantidad: 1,
            subtotal: producto.precio_venta,
            stock_disponible: producto.cantidad,
          },
        ]);
      }
    }
  };

  const cambiarCantidad = (id, nueva_cantidad) => {
    const producto_carrito = carrito.find((p) => p.id === id);

    if (nueva_cantidad <= 0) {
      eliminarDelCarrito(id);
      return;
    }

    if (nueva_cantidad <= producto_carrito.stock_disponible) {
      setCarrito(
        carrito.map((p) =>
          p.id === id
            ? {
                ...p,
                cantidad: nueva_cantidad,
                subtotal: nueva_cantidad * p.precio_venta,
              }
            : p,
        ),
      );
    } else {
      setMensaje("❌ Cantidad no disponible en stock");
    }
  };

  const eliminarDelCarrito = (id) => {
    setCarrito(carrito.filter((p) => p.id !== id));
  };

  const total = carrito.reduce((sum, p) => sum + p.subtotal, 0);
  const totalItems = carrito.reduce((sum, p) => sum + p.cantidad, 0);

  const finalizarVenta = async () => {
    if (carrito.length === 0) {
      setMensaje("❌ El carrito está vacío");
      return;
    }

    try {
      // Registrar venta
      const resultadoVenta = await window.electronAPI.registrarVenta({
        items: carrito,
      });

      if (resultadoVenta.success) {
        // Registrar transacción
        const resultadoTransaccion =
          await window.electronAPI.registrarTransaccion({
            total: total,
            cantidad_items: totalItems,
          });

        if (resultadoTransaccion.success) {
          setMensaje(
            `✅ Venta realizada! Transacción: ${resultadoTransaccion.numeroTransaccion}`,
          );
          setCarrito([]);
          cargarProductos();

          setTimeout(() => {
            setMensaje("");
          }, 3000);
        }
      }
    } catch (error) {
      console.error("Error al finalizar venta:", error);
      setMensaje("❌ Error al procesar la venta");
    }
  };

  return (
    <div className="punto-venta">
      <h2>🛍️ Punto de Venta</h2>

      <div className="pv-container">
        {/* Lado izquierdo: Búsqueda y catálogo */}
        <div className="pv-busqueda">
          <div className="search-section">
            <input
              type="text"
              placeholder="Buscar producto por nombre..."
              value={busqueda}
              onChange={(e) => handleBusqueda(e.target.value)}
              className="pv-search"
            />
          </div>

          <div className="productos-grid">
            {productosMostrados.length === 0 ? (
              <div className="no-productos">No se encontraron productos en stock.</div>
            ) : (
              productosMostrados.map((producto) => (
                <div
                  key={producto.id}
                  className="producto-card"
                  onClick={() => agregarAlCarrito(producto)}
                >
                  <div className="producto-card-img-container">
                    {producto.imagen ? (
                      <img src={producto.imagen} alt={producto.nombre} className="producto-card-img" />
                    ) : (
                      <div className="producto-card-img-placeholder">
                        <span style={{ fontSize: "24px" }}>📷</span>
                      </div>
                    )}
                  </div>
                  <div className="producto-card-info">
                    <div className="producto-nombre">{producto.nombre}</div>
                    <div className="producto-precio">
                      ${producto.precio_venta.toFixed(2)}
                    </div>
                    <div className="producto-stock">
                      Disponible: {producto.cantidad}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Lado derecho: Carrito */}
        <div className="pv-carrito">
          <h3>Carrito de Compra</h3>

          {carrito.length === 0 ? (
            <div className="carrito-vacio">
              <p>El carrito está vacío</p>
            </div>
          ) : (
            <>
              <div className="items-carrito">
                {carrito.map((item) => (
                  <div key={item.id} className="item-carrito">
                    <div className="item-info">
                      <div className="item-nombre">{item.nombre}</div>
                      <div className="item-precio">
                        ${item.precio_venta.toFixed(2)} c/u
                      </div>
                    </div>
                    <div className="item-cantidad">
                      <button
                        onClick={() =>
                          cambiarCantidad(item.id, item.cantidad - 1)
                        }
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={item.cantidad}
                        onChange={(e) =>
                          cambiarCantidad(item.id, parseInt(e.target.value))
                        }
                      />
                      <button
                        onClick={() =>
                          cambiarCantidad(item.id, item.cantidad + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                    <div className="item-subtotal">
                      ${item.subtotal.toFixed(2)}
                    </div>
                    <button
                      className="btn-eliminar-item"
                      onClick={() => eliminarDelCarrito(item.id)}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>

              <div className="resumen-venta">
                <div className="resumen-fila">
                  <span>Artículos:</span>
                  <strong>{totalItems}</strong>
                </div>
                <div className="resumen-fila">
                  <span>Subtotal:</span>
                  <strong>${total.toFixed(2)}</strong>
                </div>
                <div className="resumen-fila total-fila">
                  <span>TOTAL A COBRAR:</span>
                  <strong className="total-cantidad">
                    ${total.toFixed(2)}
                  </strong>
                </div>
              </div>

              {mensaje && (
                <div
                  className={`mensaje-pv ${mensaje.startsWith("✅") ? "exito" : "error"}`}
                >
                  {mensaje}
                </div>
              )}

              <button className="btn-finalizar" onClick={finalizarVenta}>
                ✅ FINALIZAR VENTA
              </button>

              <button
                className="btn-cancelar-venta"
                onClick={() => {
                  setCarrito([]);
                  setMensaje("");
                }}
              >
                ❌ Cancelar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default PuntoDeVenta;
