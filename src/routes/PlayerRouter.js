const express = require('express');
const playerController = require('../controllers/PlayerController')

let router = express.Router();

router.get('/', playerController.checkProfile);
router.post('/', playerController.createNewProfile);
router.delete('/', playerController.deleteProfile);
router.get('/box', playerController.getProfileCaughtAnimals);
router.put('/box', playerController.updateProfileCaughtAnimals);

module.exports = router;