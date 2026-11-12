const { Router } = require('express');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

const router = Router();

router.use(verifyToken, verifyAdmin);

router.get('/me', (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;