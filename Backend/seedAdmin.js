const mongoose = require('mongoose');
const Admin = require('./models/Admin');
require('dotenv').config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/footflex');
    
    // Check if admin already exists
    const adminExists = await Admin.findOne({ email: 'admin@footflex.com' });
    if (adminExists) {
      console.log('Admin already exists!');
      process.exit();
    }

    const admin = new Admin({
      email: 'admin@footflex.com',
      password: 'adminpassword123' // This will be hashed by the pre-save hook
    });

    await admin.save();
    console.log('Admin created successfully!');
    console.log('Email: admin@footflex.com');
    console.log('Password: adminpassword123');
    process.exit();
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
