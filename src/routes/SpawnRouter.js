const express = require('express');
const spawnController = require('../controllers/SpawnController')

let router = express.Router();

router.get('/', spawnController.findSpawner);
router.post('/', spawnController.createSpawner);

module.exports = router;