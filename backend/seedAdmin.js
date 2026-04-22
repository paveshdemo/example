const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedData = async () => {
  try {
    // Check if already connected
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('MongoDB connected...');
    }

    // Seed Admin User
    const existing = await User.findOne({ email: 'admin123@gmail.com' });
    
    if (existing) {
      console.log('✓ Admin user already exists.');
    } else {
      await User.create({
        name: 'Admin',
        email: 'admin123@gmail.com',
        password: 'admin123',
        phone: '0000000000',
        role: 'admin',
        isActive: true
      });
      console.log('✓ Admin user created successfully');
      console.log('\n📋 Admin Credentials:');
      console.log('   Email:    admin123@gmail.com');
      console.log('   Password: admin123');
    }
  } catch (err) {
    console.error('Seed error:', err.message);
    throw err;
  }
};

// Only disconnect and exit if this file is run directly
if (require.main === module) {
  seedData()
    .then(() => {
      mongoose.disconnect();
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seed error:', err.message);
      mongoose.disconnect();
      process.exit(1);
    });
} else {
  module.exports = seedData;
}
