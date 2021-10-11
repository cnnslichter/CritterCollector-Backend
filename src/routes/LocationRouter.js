const express = require('express');
const locationController = require('../controllers/LocationController')

let router = express.Router();

router.get('/', locationController.checkLocation);

module.exports = router;
