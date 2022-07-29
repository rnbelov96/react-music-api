const mongoose = require('mongoose');

const musicSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: [true, 'A music must have a url'],
    },
    likes: {
      type: Number,
      default: 0,
    },
    artist: {
      type: String,
      required: [true, 'A music must have an artist'],
    },
    name: {
      type: String,
      required: [true, 'A music must have a name'],
    },
    creator: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

musicSchema.post('save', async function () {
  const populatedTrack = await this.populate('creator').execPopulate();

  this.creator = populatedTrack.creator;
});

const Music = mongoose.model('Music', musicSchema);

module.exports = Music;
