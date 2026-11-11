const { Router } = require('express');
const prisma = require('../lib/prisma');

const router = Router();

router.get('/brands', async (req, res, next) => {
  try {
    const marcas = await prisma.brand.findMany({
      select: { id: true, nombre: true },
      orderBy: { nombre: 'asc' },
    });
    res.json(marcas);
  } catch (error) {
    next(error);
  }
});

router.get('/sizes', async (req, res, next) => {
  try {
    const filas = await prisma.productSize.findMany({
      distinct: ['talla'],
      select: { talla: true },
      orderBy: { talla: 'asc' },
    });
    res.json(filas.map((f) => f.talla));
  } catch (error) {
    next(error);
  }
});

module.exports = router;