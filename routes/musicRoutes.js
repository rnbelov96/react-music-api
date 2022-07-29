const express = require('express');
const musicController = require('../controllers/musicController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(musicController.getAllMusics)
  .post(authController.protect, musicController.uploadMusic, musicController.createMusic);

router
  .route('/:id')
  .patch(authController.protect, musicController.updateMusic)
  .delete(authController.protect, musicController.deleteMusic);

module.exports = router;
