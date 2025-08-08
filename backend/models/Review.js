const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    hijabStyle: {
      type: mongoose.Schema.ObjectId,
      ref: 'HijabStyle',
      required: true,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Please add a rating between 1 and 5'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not an integer value'
      }
    },
    comment: {
      type: String,
      required: [true, 'Please add a comment'],
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters'],
      minlength: [10, 'Comment must be at least 10 characters']
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

// Prevent duplicate reviews
reviewSchema.index({ hijabStyle: 1, user: 1 }, { unique: true });

// Static method to calculate average rating
reviewSchema.statics.getAverageRating = async function(hijabStyleId) {
  const stats = await this.aggregate([
    { $match: { hijabStyle: hijabStyleId } },
    { 
      $group: {
        _id: '$hijabStyle',
        averageRating: { $avg: '$rating' },
        count: { $sum: 1 }
      }
    }
  ]);

  try {
    await this.model('HijabStyle').findByIdAndUpdate(hijabStyleId, {
      averageRating: stats[0] ? stats[0].averageRating.toFixed(1) : 0,
      reviewCount: stats[0] ? stats[0].count : 0
    });
  } catch (err) {
    console.error('Error updating average rating:', err);
  }
};

// Update average after saving
reviewSchema.post('save', function() {
  this.constructor.getAverageRating(this.hijabStyle);
});

// Update average after removal (for document.remove())
reviewSchema.post('remove', function() {
  this.constructor.getAverageRating(this.hijabStyle);
});

// For query-based deletions (deleteOne, deleteMany)
reviewSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    await doc.constructor.getAverageRating(doc.hijabStyle);
  }
});

module.exports = mongoose.model('Review', reviewSchema);