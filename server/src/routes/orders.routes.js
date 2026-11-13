const { Router } = require('express');
const { verifyToken, verifyCliente } = require('../middleware/auth');
const { createOrder, getOrderByCodigo } = require('../controllers/orders.controller');

const router = Router();

router.use(verifyToken, verifyCliente);

router.post('/', createOrder);
router.get('/:codigo', getOrderByCodigo);

module.exports = router;