const express = require('express');
const spawnController = require('../controllers/SpawnController')

let router = express.Router();

router.get('/', spawnController.getNearbySpawn);

module.exports = router;