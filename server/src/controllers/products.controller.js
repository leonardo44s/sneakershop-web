const prisma = require('../lib/prisma');

function toInt(value, defaultValue) {
  const n = Number.parseInt(value, 10);
  return Number.isNaN(n) ? defaultValue : n;
}

async function listProducts(req, res, next) {
  try {
    const page = Math.max(toInt(req.query.page, 1), 1);
    const limit = Math.min(Math.max(toInt(req.query.limit, 12), 1), 50);

    const where = { activo: true };

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: { brand: true },
        orderBy: { id: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    res.json({
      data: products.map((p) => ({
        id: p.id,
        nombre: p.nombre,
        marca: p.brand.nombre,
        precio: Number(p.precio),
        imagen: p.imagenes[0] || null,
      })),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
}

async function getProductById(req, res, next) {
  try {
    const id = Number.parseInt(req.params.id, 10);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    const product = await prisma.product.findFirst({
      where: { id, activo: true },
      include: {
        brand: true,
        sizes: { orderBy: { talla: 'asc' } },
      },
    });

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    return res.json({
      id: product.id,
      nombre: product.nombre,
      descripcion: product.descripcion,
      marca: product.brand.nombre,
      precio: Number(product.precio),
      imagenes: product.imagenes,
      tallas: product.sizes.map((s) => ({ talla: s.talla, stock: s.stock })),
    });
  } catch (error) {
    return next(error);
  }
}


module.exports = { listProducts, getProductById };
