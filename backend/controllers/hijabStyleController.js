const HijabStyle = require('../models/HijabStyle');
const asyncHandler = require('express-async-handler');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// @desc    Get all hijab styles
// @route   GET /api/hijab-styles
// @access  Public
exports.getHijabStyles = asyncHandler(async (req, res) => {
  const hijabStyles = await HijabStyle.find().populate({
    path: 'reviews',
    select: 'rating comment user createdAt',
    populate: {
      path: 'user',
      select: 'name',
    },
  });

  res.status(200).json({
    success: true,
    count: hijabStyles.length,
    data: hijabStyles,
  });
});

// @desc    Get single hijab style
// @route   GET /api/hijab-styles/:id
// @access  Public
exports.getHijabStyle = asyncHandler(async (req, res, next) => {
  const hijabStyle = await HijabStyle.findById(req.params.id).populate({
    path: 'reviews',
    select: 'rating comment user createdAt',
    populate: {
      path: 'user',
      select: 'name',
    },
  });

  if (!hijabStyle) {
    return res.status(404).json({
      success: false,
      message: 'Hijab style not found',
    });
  }

  res.status(200).json({
    success: true,
    data: hijabStyle,
  });
});

// @desc    Create new hijab style
// @route   POST /api/hijab-styles
// @access  Private/Admin
exports.createHijabStyle = asyncHandler(async (req, res) => {
  // Upload image to Cloudinary
  const result = await cloudinary.uploader.upload(req.body.image, {
    folder: 'hijab-styles',
    width: 1500,
    crop: 'scale',
  });

  const hijabStyle = await HijabStyle.create({
    name: req.body.name,
    description: req.body.description,
    image: {
      public_id: result.public_id,
      url: result.secure_url,
    },
  });

  res.status(201).json({
    success: true,
    data: hijabStyle,
  });
});

// @desc    Update hijab style
// @route   PUT /api/hijab-styles/:id
// @access  Private/Admin
exports.updateHijabStyle = asyncHandler(async (req, res, next) => {
  let hijabStyle = await HijabStyle.findById(req.params.id);

  if (!hijabStyle) {
    return res.status(404).json({
      success: false,
      message: 'Hijab style not found',
    });
  }

  // Check if image is being updated
  if (req.body.image) {
    // First delete the old image
    await cloudinary.uploader.destroy(hijabStyle.image.public_id);

    // Then upload new image
    const result = await cloudinary.uploader.upload(req.body.image, {
      folder: 'hijab-styles',
      width: 1500,
      crop: 'scale',
    });

    req.body.image = {
      public_id: result.public_id,
      url: result.secure_url,
    };
  }

  hijabStyle = await HijabStyle.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: hijabStyle,
  });
});

// @desc    Delete hijab style
// @route   DELETE /api/hijab-styles/:id
// @access  Private/Admin
exports.deleteHijabStyle = asyncHandler(async (req, res, next) => {
  const hijabStyle = await HijabStyle.findById(req.params.id);

  if (!hijabStyle) {
    return res.status(404).json({
      success: false,
      message: 'Hijab style not found',
    });
  }

  // Delete image from cloudinary
  await cloudinary.uploader.destroy(hijabStyle.image.public_id);

  await hijabStyle.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});