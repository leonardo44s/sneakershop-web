import { useEffect, useMemo, useState } from 'react';
import { CartContext } from './cart-context.js';

const STORAGE_KEY = 'sneakershop_cart';

function leerCarrito() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const items = raw ? JSON.parse(raw) : [];
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

function mismaLinea(item, productId, talla) {
  return item.productId === productId && item.talla === talla;
}

export default function CartProvider({ children }) {
  const [items, setItems] = useState(leerCarrito);

  // Cada vez que cambia el carrito, se guarda en el navegador
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo(() => {
    function addItem(producto, cantidad = 1) {
      const existente = items.find((i) => mismaLinea(i, producto.productId, producto.talla));
      const enCarrito = existente ? existente.cantidad : 0;
      const disponible = producto.stock - enCarrito;

      if (disponible <= 0) {
        return {
          ok: false,
          mensaje: 'Ya tienes en el carrito todas las unidades disponibles de esta talla.',
        };
      }

      const agregar = Math.min(cantidad, disponible);

      setItems((prev) =>
        existente
          ? prev.map((i) =>
              mismaLinea(i, producto.productId, producto.talla)
                ? { ...i, cantidad: i.cantidad + agregar, stock: producto.stock }
                : i
            )
          : [...prev, { ...producto, cantidad: agregar }]
      );

      return { ok: true, mensaje: 'Agregado al carrito.' };
    }

    function updateQuantity(productId, talla, cantidad) {
      setItems((prev) =>
        prev.map((i) =>
          mismaLinea(i, productId, talla)
            ? { ...i, cantidad: Math.min(Math.max(cantidad, 1), i.stock) }
            : i
        )
      );
    }

    function removeItem(productId, talla) {
      setItems((prev) => prev.filter((i) => !mismaLinea(i, productId, talla)));
    }

    function clearCart() {
      setItems([]);
    }

    const totalItems = items.reduce((suma, i) => suma + i.cantidad, 0);
    const subtotal = items.reduce((suma, i) => suma + i.cantidad * i.precio, 0);

    return { items, addItem, updateQuantity, removeItem, clearCart, totalItems, subtotal };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
