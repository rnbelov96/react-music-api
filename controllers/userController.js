const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

const filterObj = (obj, ...allowedFileds) => {
  const newObj = {};

  Object.keys(obj).forEach((el) => {
    if (allowedFileds.includes(el)) {
      newObj[el] = obj[el];
    }
  });

  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

// Функция для редактирования данных самим юзером
exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password) {
    return next(
      new AppError(
        'This route in not for password update. Please use /updateMyPassword',
        400
      )
    );
  }
  //

  // Фильтрация изменяемых полей
  const filteredBody = filterObj(req.body, 'name');
  //

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

// Функция позволяет "удалить" себя из базы данных путем изменения флага active
// В будущем, при попытке получить список пользователей админом эти пользователи не появятся в списке
exports.deleteMe = catchAsync(async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getUser = factory.getOne(User, [
  {
    path: 'likes',
    populate: {
      path: 'music',
      populate: {
        path: 'creator',
      },
    },
  },
  'uploadedMusic',
]);
exports.getAllUsers = factory.getAll(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
exports.createUser = factory.createOne(User);
