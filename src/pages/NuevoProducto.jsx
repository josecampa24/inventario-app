cat > (src / pages / NuevoProducto.jsx) << "EOF";
import { useState } from "react";
import "./NuevoProducto.css";

function NuevoProducto({ onProductoAgregado }) {
  const [formData, setFormData] = useState({
    nombre: "",
    cantidad: "",
    precio_compra: "",
    precio_venta: "",
  });
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nombre.trim()) {
      setMensaje("El nombre del producto es requerido");
      return;
    }
    if (!formData.cantidad || formData.cantidad < 0) {
      setMensaje("La cantidad debe ser un número positivo");
      return;
    }
    if (!formData.precio_compra || formData.precio_compra < 0) {
      setMensaje("El precio de compra debe ser un número positivo");
      return;
    }
    if (!formData.precio_venta || formData.precio_venta < 0) {
      setMensaje("El precio de venta debe ser un número positivo");
      return;
    }

    setEnviando(true);
    setMensaje("");

    try {
      const resultado = await window.electronAPI.agregarProducto({
        nombre: formData.nombre.trim(),
        cantidad: parseInt(formData.cantidad),
        precio_compra: parseFloat(formData.precio_compra),
        precio_venta: parseFloat(formData.precio_venta),
      });

      if (resultado.success) {
        setMensaje("✅ Producto agregado correctamente");
        setFormData({
          nombre: "",
          cantidad: "",
          precio_compra: "",
          precio_venta: "",
        });

        setTimeout(() => {
          onProductoAgregado();
        }, 1500);
      } else {
        setMensaje(`❌ Error: ${resultado.error}`);
      }
    } catch (error) {
      console.error("Error:", error);
      setMensaje("❌ Error al agregar el producto");
    } finally {
      setEnviando(false);
    }
  };

  const ganancia = formData.precio_venta - formData.precio_compra;

  return (
    <div className="nuevo-producto">
      <h2>Agregar Nuevo Producto</h2>

      <form onSubmit={handleSubmit} className="formulario">
        <div className="form-group">
          <label htmlFor="nombre">Nombre del Producto *</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            placeholder="Ej: Laptop Dell XPS 13"
            disabled={enviando}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="cantidad">Cantidad *</label>
            <input
              type="number"
              id="cantidad"
              name="cantidad"
              value={formData.cantidad}
              onChange={handleChange}
              placeholder="0"
              min="0"
              disabled={enviando}
            />
          </div>

          <div className="form-group">
            <label htmlFor="precio_compra">Precio de Compra *</label>
            <div className="input-prefix">
              <span>$</span>
              <input
                type="number"
                id="precio_compra"
                name="precio_compra"
                value={formData.precio_compra}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                disabled={enviando}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="precio_venta">Precio de Venta *</label>
            <div className="input-prefix">
              <span>$</span>
              <input
                type="number"
                id="precio_venta"
                name="precio_venta"
                value={formData.precio_venta}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                disabled={enviando}
              />
            </div>
          </div>
        </div>

        {formData.precio_compra && formData.precio_venta && (
          <div className="ganancia-info">
            <p>
              Ganancia por unidad:{" "}
              <strong className={ganancia >= 0 ? "positivo" : "negativo"}>
                ${ganancia.toFixed(2)}
              </strong>
            </p>
            <p>
              Margen:{" "}
              <strong className={ganancia >= 0 ? "positivo" : "negativo"}>
                {((ganancia / formData.precio_compra) * 100).toFixed(1)}%
              </strong>
            </p>
          </div>
        )}

        {mensaje && (
          <div
            className={`mensaje ${mensaje.startsWith("✅") ? "exito" : "error"}`}
          >
            {mensaje}
          </div>
        )}

        <button type="submit" className="btn-submit" disabled={enviando}>
          {enviando ? "Agregando..." : "➕ Agregar Producto"}
        </button>
      </form>

      <div className="consejos">
        <h3>💡 Consejos útiles</h3>
        <ul>
          <li>El nombre debe ser único y descriptivo</li>
          <li>
            La cantidad inicial es la del registro (puede actualizarse después)
          </li>
          <li>Asegúrate de que el precio de venta sea mayor al de compra</li>
          <li>Los datos se guardan automáticamente en tu computadora</li>
        </ul>
      </div>
    </div>
  );
}

export default NuevoProducto;
EOF;
