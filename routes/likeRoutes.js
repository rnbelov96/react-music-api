const express = require('express');
const likeController = require('../controllers/likeController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router.route('/').post(likeController.createLike);
router.route('/:id').delete(likeController.deleteLike);

module.exports = router;
