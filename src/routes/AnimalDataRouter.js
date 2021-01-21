const express = require('express');
const animalDataController = require('../controllers/AnimalDataController')
let router = express.Router();

router.get('/', animalDataController.getAnimalDataAtLatAndLong);

module.exports = router;