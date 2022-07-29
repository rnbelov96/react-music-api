const mongoose = require('mongoose');
const Music = require('./musicModel');

const likeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    music: {
      type: mongoose.Schema.ObjectId,
      ref: 'Music',
      required: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

likeSchema.index({ music: 1, user: 1 }, { unique: true });

likeSchema.statics.calcLikes = async function (musicId) {
  const stats = await this.aggregate([
    {
      $match: { music: musicId },
    },
    {
      $group: {
        _id: '$music',
        nLikes: { $sum: 1 },
      },
    },
  ]);

  await Music.findByIdAndUpdate(musicId, {
    likes: stats.length > 0 ? stats[0].nLikes : 0,
  });
};

likeSchema.post('save', function () {
  this.constructor.calcLikes(this.music);
});

likeSchema.pre(/^findOneAnd/, async function (next) {
  this.m = await this.findOne();
  next();
});

likeSchema.post(/^findOneAnd/, async function () {
  await this.m.constructor.calcLikes(this.m.music);
});

const Like = mongoose.model('Like', likeSchema);

module.exports = Like;
