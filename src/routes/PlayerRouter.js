const express = require('express');
const playerController = require('../controllers/PlayerController')

let router = express.Router();

router.get('/', playerController.checkProfile);
router.post('/', playerController.createNewProfile);
router.put('/', playerController.updateProfile);
router.delete('/', playerController.deleteProfile);

router.post('/login', playerController.logIn);


module.exports = router;