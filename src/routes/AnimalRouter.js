const express = require('express');
const animalController = require('../controllers/AnimalController')

let router = express.Router();

router.post('/', animalController.addSpecialAnimal);
// router.delete('/', animalController.removeSpecialAnimal);

module.exports = router;
