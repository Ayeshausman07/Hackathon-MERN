const mongoose = require('mongoose');

const hijabStyleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name for the hijab style'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    image: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Reverse populate with virtuals
hijabStyleSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'hijabStyle',
  justOne: false,
});

// Cascade delete reviews when a hijab style is deleted
hijabStyleSchema.pre('remove', async function (next) {
  await this.model('Review').deleteMany({ hijabStyle: this._id });
  next();
});

module.exports = mongoose.model('HijabStyle', hijabStyleSchema);