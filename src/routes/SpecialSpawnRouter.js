const express = require('express');
const specialSpawnController = require('../controllers/SpecialSpawnController')

let router = express.Router();

router.get('/', specialSpawnController.findSpecialSpawner);
router.post('/', specialSpawnController.createSpecialSpawner);

module.exports = router;