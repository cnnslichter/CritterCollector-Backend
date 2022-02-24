const express = require('express');
const encyclopediaController = require('../controllers/EncyclopediaController')

let router = express.Router();

router.get('/', encyclopediaController.getWikiData);

module.exports = router;