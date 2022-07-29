const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');
const Like = require('../models/likeModel');
const fs = require('fs');
const { promisify } = require('util');

const checkPermision = async (req, Model, doc) => {
  switch (Model.modelName) {
  case 'Music':
    if (String(req.user.id) !== String(doc.creator)) {
      return false;
    }
    break;

  case 'Like':
    if (String(req.user.id) !== String(doc.user)) {
      return false;
    }
    break;

  default:
    return true;
  }
};

exports.deleteOne = (Model, options) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findById(req.params.id);

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    if (
      options.isProtect &&
      (await checkPermision(req, Model, doc)) === false
    ) {
      return next(new AppError('You do not have permision to do it', 401));
    }

    await Model.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null,
    });

    if (Model.modelName === 'Music') {
      await Like.deleteMany({ music: req.params.id });
      await promisify(fs.unlink)(`./public/musics/${doc.url}`);
    }
  });

exports.updateOne = (Model, options) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findById(req.params.id);

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    if (
      options.isProtect &&
      (await checkPermision(req, Model, doc)) === false
    ) {
      return next(new AppError('You do not have permision to do it', 401));
    }

    const newDoc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: newDoc,
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res) => {
    if (Model.modelName === 'Like') {
      req.body.user = req.user.id;
    }

    if (Model.modelName === 'Music') {
      req.body.creator = req.user.id;
    }

    if (req.file) {
      req.body.url = req.file.filename;
    }

    let doc = await Model.create(req.body);

    if (Model.modelName === 'Like') {
      doc = await doc.populate({
        path: 'music',
        populate: {
          path: 'creator',
        },
      }).execPopulate();
    }

    res.status(201).json({
      status: 'success',
      data: doc,
    });
  });

exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);

    // Если используется population
    if (populateOptions) {
      populateOptions.forEach((opt) => {
        query = query.populate(opt);
      });
    }

    const doc = await query;

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: doc,
    });
  });

exports.getAll = (Model, populateOptions) =>
  catchAsync(async (req, res) => {
    // Используется вспомогательный класс для применения фильтрации, сортировки, пагинации и др.
    const features = new APIFeatures(Model.find(), req.query).filter().sort();

    if (populateOptions) {
      populateOptions.forEach((opt) => {
        features.query.populate(opt);
      });
    }

    const doc = await features.query;
    //

    res.status(200).json({
      status: 'success',
      data: doc,
    });
  });
