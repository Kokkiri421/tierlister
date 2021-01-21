const router = require('express').Router();

router.use('/users', require('./users'));
router.use('/tierlists', require('./tierlists'));
router.use('/tiers', require('./tiers'));
router.use('/elements', require('./elements'));

module.exports = router;
