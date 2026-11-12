const { Router } = require('express');
const { listProducts, getProductById } = require('../controllers/products.controller');

const router = Router();

router.get('/', listProducts);
router.get('/:id', getProductById);

module.exports = router;
