function parseIds(value) {
  if (!value) return [];
  return String(value)
    .split(',')
    .map((v) => Number.parseInt(v, 10))
    .filter((n) => Number.isInteger(n) && n > 0);
}

function buildProductWhere(query) {
  const where = { activo: true };

  const marcas = parseIds(query.marcas);
  if (marcas.length > 0) {
    where.brandId = { in: marcas };
  }

  if (query.talla) {
    where.sizes = { some: { talla: String(query.talla), stock: { gt: 0 } } };
  }

  return where;
}

module.exports = { buildProductWhere };