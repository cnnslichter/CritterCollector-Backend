const express = require('express');
const animalController = require('../controllers/AnimalController')

let router = express.Router();

router.post('/', animalController.addSpecialAnimal);

module.exports = router;
