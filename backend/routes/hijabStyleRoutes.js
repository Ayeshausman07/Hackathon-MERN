const express = require('express');
const router = express.Router();
const {
  getHijabStyles,
  getHijabStyle,
  createHijabStyle,
  updateHijabStyle,
  deleteHijabStyle,
} = require('../controllers/hijabStyleController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.route('/').get(getHijabStyles).post(protect, adminOnly, createHijabStyle);
router
  .route('/:id')
  .get(getHijabStyle)
  .put(protect, adminOnly, updateHijabStyle)
  .delete(protect, adminOnly, deleteHijabStyle);

module.exports = router;