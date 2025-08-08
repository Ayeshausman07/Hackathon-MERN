const Review = require('../models/Review');
const HijabStyle = require('../models/HijabStyle');
const asyncHandler = require('express-async-handler');

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Public
// In reviewController.js
exports.getMyReview = asyncHandler(async (req, res) => {
  const review = await Review.findOne({
    hijabStyle: req.params.hijabStyleId,
    user: req.user._id
  });

  if (!review) {
    return res.status(404).json({
      success: false,
      data: null
    });
  }

  res.status(200).json({
    success: true,
    data: review
  });
});

// Add this new controller function
exports.checkUserReview = asyncHandler(async (req, res) => {
  const review = await Review.findOne({
    hijabStyle: req.params.hijabStyleId, // This now comes from the parent route
    user: req.user._id
  }).populate('user', 'name');

  if (!review) {
    return res.status(404).json({
      success: false,
      data: null,
      message: 'No review found for this user'
    });
  }

  res.status(200).json({
    success: true,
    data: review
  });
});

exports.getReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find().populate({
    path: 'user',
    select: 'name',
  });

  res.status(200).json({
    success: true,
    count: reviews.length,
    data: reviews,
  });
});

// @desc    Get reviews for a specific hijab style
// @route   GET /api/hijab-styles/:hijabStyleId/reviews
// @access  Public
exports.getHijabStyleReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ hijabStyle: req.params.hijabStyleId })
    .populate({
      path: 'user',
      select: 'name',
    })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: reviews.length,
    data: reviews,
  });
});

// @desc    Add review
// @route   POST /api/hijab-styles/:hijabStyleId/reviews
// @access  Private
exports.addReview = asyncHandler(async (req, res) => {
  req.body.hijabStyle = req.params.hijabStyleId;
  req.body.user = req.user._id;

  // Validate required fields
  if (!req.body.rating || !req.body.comment) {
    return res.status(400).json({
      success: false,
      message: 'Please provide both rating and comment'
    });
  }

  // Convert rating to number if it's a string
  if (typeof req.body.rating === 'string') {
    req.body.rating = parseInt(req.body.rating);
  }

  const hijabStyle = await HijabStyle.findById(req.params.hijabStyleId);
  if (!hijabStyle) {
    return res.status(404).json({
      success: false,
      message: 'Hijab style not found'
    });
  }

  // Check for existing review
  const existingReview = await Review.findOne({
    hijabStyle: req.params.hijabStyleId,
    user: req.user._id
  });

  if (existingReview) {
    return res.status(400).json({
      success: false,
      message: 'You have already submitted a review for this hijab style'
    });
  }

  try {
    const review = await Review.create(req.body);
    res.status(201).json({
      success: true,
      data: review
    });
  } catch (err) {
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
});

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;

  let review = await Review.findById(reviewId);
  if (!review) {
    return res.status(404).json({
      success: false,
      message: 'Review not found',
    });
  }

  // Verify ownership
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this review',
    });
  }

  review = await Review.findByIdAndUpdate(
    reviewId, 
    {
      rating: req.body.rating,
      comment: req.body.comment
    },
    {
      new: true,
      runValidators: true
    }
  ).populate('user', 'name');

  res.status(200).json({
    success: true,
    data: review
  });
});


// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
// @desc    Delete review
// @route   DELETE /api/hijab-styles/:hijabStyleId/reviews/:reviewId
// @access  Private
exports.deleteReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;

  const review = await Review.findById(reviewId);
  if (!review) {
    return res.status(404).json({
      success: false,
      message: 'Review not found',
    });
  }

  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this review',
    });
  }

  await review.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});