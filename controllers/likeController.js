const factory = require('./handlerFactory');
const Like = require('../models/likeModel');

exports.createLike = factory.createOne(Like);

exports.deleteLike = factory.deleteOne(Like, {isProtect: true});