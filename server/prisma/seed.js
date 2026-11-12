const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const marcas = ['Nike', 'Adidas', 'Puma', 'New Balance', 'Converse'];

const productos = [
  { nombre: 'Air Max 90', marca: 'Nike', precio: 549900 },
  { nombre: 'Air Force 1', marca: 'Nike', precio: 479900 },
  { nombre: 'Dunk Low', marca: 'Nike', precio: 529900 },
  { nombre: 'Pegasus 41', marca: 'Nike', precio: 599900 },
  { nombre: 'Superstar', marca: 'Adidas', precio: 399900 },
  { nombre: 'Stan Smith', marca: 'Adidas', precio: 429900 },
  { nombre: 'Samba OG', marca: 'Adidas', precio: 499900 },
  { nombre: 'Ultraboost Light', marca: 'Adidas', precio: 749900 },
  { nombre: 'Suede Classic', marca: 'Puma', precio: 349900 },
  { nombre: 'RS-X', marca: 'Puma', precio: 459900 },
  { nombre: 'Palermo', marca: 'Puma', precio: 389900 },
  { nombre: 'Speedcat', marca: 'Puma', precio: 419900, agotado: true },
  { nombre: '550', marca: 'New Balance', precio: 569900 },
  { nombre: '574', marca: 'New Balance', precio: 449900 },
  { nombre: '9060', marca: 'New Balance', precio: 699900 },
  { nombre: '530', marca: 'New Balance', precio: 489900 },
  { nombre: 'Chuck Taylor All Star', marca: 'Converse', precio: 259900 },
  { nombre: 'Chuck 70', marca: 'Converse', precio: 329900 },
  { nombre: 'Run Star Hike', marca: 'Converse', precio: 419900 },
  { nombre: 'One Star', marca: 'Converse', precio: 299900, inactivo: true },
];

const tallas = ['37', '38', '39', '40', '41', '42', '43'];

function imagen(texto) {
  return `https://placehold.co/600x400/png?text=${encodeURIComponent(texto)}`;
}

async function main() {
  // Limpia las tablas para poder ejecutar el seed varias veces
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productSize.deleteMany();
  await prisma.product.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.user.deleteMany();

  const brandIds = {};
  for (const nombre of marcas) {
    const brand = await prisma.brand.create({ data: { nombre } });
    brandIds[nombre] = brand.id;
  }

  for (const [i, p] of productos.entries()) {
    await prisma.product.create({
      data: {
        nombre: p.nombre,
        descripcion: `Zapatillas ${p.marca} ${p.nombre}, cómodas y con estilo para el uso diario.`,
        precio: p.precio,
        imagenes: [imagen(`${p.marca} ${p.nombre}`)],
        activo: !p.inactivo,
        brandId: brandIds[p.marca],
        sizes: {
          create: tallas.map((talla, j) => ({
            talla,
            stock: p.agotado || (i + j) % 4 === 0 ? 0 : ((i * 3 + j) % 6) + 1,
          })),
        },
      },
    });
  }

  const contrasena = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin12345', 10);
  await prisma.user.create({
    data: {
      nombre: 'Administrador',
      correo: 'admin@sneakershop.com',
      contrasena,
      rol: 'admin',
    },
  });

  console.log('Seed completado: 5 marcas, 20 zapatillas con tallas y 1 administrador.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });