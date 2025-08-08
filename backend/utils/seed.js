const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cloudinary = require('cloudinary').v2;
const bcrypt = require('bcryptjs');

// Load models
const HijabStyle = require('../models/HijabStyle');
const Review = require('../models/Review');
const User = require('../models/User');

// Load env vars
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Connect to DB
mongoose.connect(process.env.MONGO_URI);

// Sample data
const users = [
  {
    name: "Ayesha Khan",
    email: "ayesha@example.com",
    password: "Password123!",
    role: "user"
  },
  {
    name: "Fatima Ahmed",
    email: "fatima@example.com",
    password: "Password123!",
    role: "user"
  },
  {
    name: "Admin User",
    email: "admin@example.com",
    password: "Password123!",
    role: "admin"
  }
];

const hijabStyles = [
  {
    name: "Turkish Hijab Style",
    description: "Elegant Turkish hijab style with a modern twist, perfect for formal occasions.",
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSGFNL3ytWBoEEJ0PIbutKdcQk-gbxgky06kA&s"
  },
  {
    name: "Casual Everyday Hijab",
    description: "Simple and comfortable hijab style for daily wear with easy wrapping technique.",
    imageUrl: "https://blackcamels.com.pk/cdn/shop/products/2-5_0e406f3d-a6c9-4575-b1f5-69bf92bedb50.jpg?v=1753963988"
  },
  {
    name: "Emirati Hijab Style",
    description: "Traditional Emirati hijab style with a luxurious feel and elegant draping.",
    imageUrl: "https://blackcamels.com.pk/cdn/shop/products/19-4.jpg?v=1753963985"
  },
  {
    name: "Modern Wrap Hijab",
    description: "Contemporary hijab style with a unique wrap that stays in place all day.",
    imageUrl: "https://blackcamels.com.pk/cdn/shop/products/16-4.jpg?v=1753963986"
  },
  {
    name: "Wedding Hijab Style",
    description: "Luxurious hijab style for weddings and special occasions with embellishments.",
    imageUrl: "https://blackcamels.com.pk/cdn/shop/products/7-5_5ab2a2c6-99a2-48c2-8eba-3e0def70324e.jpg?v=1753963987"
  }
];

// Hash passwords before saving
const hashUserPasswords = async (users) => {
  return Promise.all(users.map(async user => {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    return user;
  }));
};

// Upload images to Cloudinary and get URLs
const uploadImages = async () => {
  const hijabStylesWithImages = [];

  for (const style of hijabStyles) {
    try {
      const result = await cloudinary.uploader.upload(style.imageUrl, {
        folder: 'hijab-styles',
        width: 1500,
        crop: 'scale',
      });

      hijabStylesWithImages.push({
        name: style.name,
        description: style.description,
        image: {
          public_id: result.public_id,
          url: result.secure_url,
        },
      });
    } catch (err) {
      console.error('Error uploading image:', err);
      // Fallback to original URL if upload fails
      hijabStylesWithImages.push({
        name: style.name,
        description: style.description,
        image: {
          url: style.imageUrl,
        },
      });
    }
  }

  return hijabStylesWithImages;
};

// Create users with duplicate handling
const createUsers = async () => {
  const hashedUsers = await hashUserPasswords(users);
  const createdUsers = [];
  
  for (const user of hashedUsers) {
    try {
      const existingUser = await User.findOne({ email: user.email });
      if (existingUser) {
        console.log(`User ${user.email} already exists, skipping...`);
        createdUsers.push(existingUser);
        continue;
      }
      
      const newUser = await User.create(user);
      createdUsers.push(newUser);
      console.log(`Created user: ${user.email}`);
    } catch (err) {
      console.error(`Error creating user ${user.email}:`, err.message);
    }
  }
  
  return createdUsers;
};

// Import into DB
const importData = async () => {
  try {
    // Clear existing data if --force flag is used
    if (process.argv.includes('--force')) {
      await User.deleteMany();
      await HijabStyle.deleteMany();
      await Review.deleteMany();
      console.log('Existing data cleared');
    }

    // First, create users
    const createdUsers = await createUsers();

    // Then upload images and create hijab styles
    const stylesWithImages = await uploadImages();
    const createdStyles = await HijabStyle.create(stylesWithImages);

    // Create reviews with proper references
    const reviews = [
      {
        rating: 5,
        comment: "Love this style! It's so elegant and comfortable at the same time.",
        hijabStyle: createdStyles[0]._id,
        user: createdUsers[0]._id
      },
      {
        rating: 4,
        comment: "Great for everyday wear. Would recommend to anyone looking for comfort.",
        hijabStyle: createdStyles[1]._id,
        user: createdUsers[1]._id
      },
      {
        rating: 5,
        comment: "Perfect for special occasions. Got so many compliments!",
        hijabStyle: createdStyles[2]._id,
        user: createdUsers[2]._id
      },
      {
        rating: 3,
        comment: "Nice style but took some practice to get it right.",
        hijabStyle: createdStyles[3]._id,
        user: createdUsers[0]._id
      },
      {
        rating: 5,
        comment: "Absolutely stunning! My new favorite way to wear hijab.",
        hijabStyle: createdStyles[4]._id,
        user: createdUsers[1]._id
      }
    ];

    await Review.create(reviews);

    console.log('Data Imported Successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error during data import:', err);
    process.exit(1);
  }
};

// Delete data
const deleteData = async () => {
  try {
    await User.deleteMany();
    await HijabStyle.deleteMany();
    await Review.deleteMany();

    console.log('Data Destroyed Successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error during data deletion:', err);
    process.exit(1);
  }
};

// Handle command line arguments
if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
} else {
  console.log('Please specify an option: -i (import) or -d (delete)');
  console.log('Add --force to clear existing data before import');
  process.exit(1);
}