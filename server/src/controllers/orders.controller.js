const crypto = require('crypto');
const prisma = require('../lib/prisma');

class PedidoError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function generarCodigo() {
  const fecha = new Date().toISOString().slice(2, 10).replace(/-/g, ''); // AAMMDD
  const aleatorio = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `SS-${fecha}-${aleatorio}`;
}

function validarEntrega({ telefono, direccion, ciudad }) {
  const entrega = {
    telefono: String(telefono || '').replace(/[\s-]/g, ''),
    direccion: String(direccion || '').trim(),
    ciudad: String(ciudad || '').trim(),
  };
  const errores = {};
  if (!/^\+?\d{7,15}$/.test(entrega.telefono)) {
    errores.telefono = 'Ingresa un teléfono válido (7 a 15 dígitos)';
  }
  if (entrega.direccion.length < 5) {
    errores.direccion = 'Ingresa la dirección de entrega';
  }
  if (entrega.ciudad.length < 2) {
    errores.ciudad = 'Ingresa la ciudad';
  }
  return { entrega, errores };
}

// Revisa los productos y junta las líneas repetidas (mismo producto y talla)
function agruparItems(items) {
  if (!Array.isArray(items) || items.length === 0) return null;
  const lineas = new Map();
  for (const item of items) {
    const productId = Number.parseInt(item?.productId, 10);
    const cantidad = Number.parseInt(item?.cantidad, 10);
    const talla = String(item?.talla ?? '').trim();
    if (!Number.isInteger(productId) || productId <= 0 || !talla) return null;
    if (!Number.isInteger(cantidad) || cantidad < 1) return null;
    const clave = `${productId}|${talla}`;
    const anterior = lineas.get(clave)?.cantidad || 0;
    lineas.set(clave, { productId, talla, cantidad: anterior + cantidad });
  }
  return [...lineas.values()];
}

const incluirDetalle = { items: { include: { product: { include: { brand: true } } } } };

function formatearPedido(order) {
  return {
    codigo: order.codigo,
    estado: order.estado,
    fecha: order.fecha,
    total: Number(order.total),
    entrega: { telefono: order.telefono, direccion: order.direccion, ciudad: order.ciudad },
    items: order.items.map((i) => ({
      nombre: i.product.nombre,
      marca: i.product.brand.nombre,
      talla: i.talla,
      cantidad: i.cantidad,
      precioUnitario: Number(i.precioUnitario),
      subtotal: Number(i.precioUnitario) * i.cantidad,
    })),
  };
}

async function createOrder(req, res, next) {
  try {
    const { entrega, errores } = validarEntrega(req.body || {});
    const items = agruparItems(req.body?.items);
    if (!items) {
      errores.items = 'El carrito está vacío o tiene datos inválidos';
    }
    if (Object.keys(errores).length > 0) {
      return res.status(400).json({ message: 'Revisa los datos del pedido', errores });
    }

    const order = await prisma.$transaction(
      async (tx) => {
        let total = 0;
        const lineas = [];

        for (const item of items) {
          const product = await tx.product.findFirst({
            where: { id: item.productId, activo: true },
          });
          if (!product) {
            throw new PedidoError(400, 'Uno de los productos del carrito ya no está disponible');
          }

          // Resta el stock solo si todavía alcanza (evita vender el mismo par dos veces)
          const actualizado = await tx.productSize.updateMany({
            where: { productId: item.productId, talla: item.talla, stock: { gte: item.cantidad } },
            data: { stock: { decrement: item.cantidad } },
          });
          if (actualizado.count === 0) {
            throw new PedidoError(
              409,
              `No hay stock suficiente de ${product.nombre} en talla ${item.talla}. Ajusta tu carrito.`
            );
          }

          const precio = Number(product.precio);
          total += precio * item.cantidad;
          lineas.push({
            productId: item.productId,
            talla: item.talla,
            cantidad: item.cantidad,
            precioUnitario: precio,
          });
        }

        return tx.order.create({
          data: {
            codigo: generarCodigo(),
            userId: req.user.id,
            ...entrega,
            total,
            items: { create: lineas },
          },
          include: incluirDetalle,
        });
      },
      { maxWait: 10000, timeout: 20000 }
    );

    return res.status(201).json(formatearPedido(order));
  } catch (error) {
    if (error instanceof PedidoError) {
      return res.status(error.status).json({ message: error.message });
    }
    return next(error);
  }
}

async function getOrderByCodigo(req, res, next) {
  try {
    const order = await prisma.order.findFirst({
      where: { codigo: req.params.codigo, userId: req.user.id },
      include: incluirDetalle,
    });
    if (!order) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }
    return res.json(formatearPedido(order));
  } catch (error) {
    return next(error);
  }
}

module.exports = { createOrder, getOrderByCodigo };