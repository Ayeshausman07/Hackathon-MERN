const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getHijabStyleReviews,
  addReview,
  updateReview,
  deleteReview,
  checkUserReview,
  getMyReview
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(getHijabStyleReviews)
  .post(protect, addReview);

router.get('/check/mine', protect, checkUserReview);
router.get('/my-review', protect, getMyReview);

router.route('/:reviewId')
  .put(protect, updateReview)
  .delete(protect, deleteReview);

module.exports = router;