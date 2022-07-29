const Music = require('../models/musicModel');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');
const multer = require('multer');

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/musics');
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `music-${req.user.id}-${Date.now()}.${ext}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('audio')) {
    cb(new AppError('Please, load music!', 400), false);
  }
  cb(null, true);
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: {
    fileSize: 5000000
  }
});

exports.uploadMusic = upload.single('music');

exports.createMusic = factory.createOne(Music);

exports.getAllMusics = factory.getAll(Music, ['creator']);

exports.updateMusic = factory.updateOne(Music, true);

exports.deleteMusic = factory.deleteOne(Music, {isProtect: true});
