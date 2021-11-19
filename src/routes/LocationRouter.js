const express = require('express');
const locationController = require('../controllers/LocationController')

let router = express.Router();

router.get('/', locationController.checkLocation);
router.post('/', locationController.addSpecialLocation);
router.delete('/', locationController.removeSpecialLocation);

module.exports = router;
