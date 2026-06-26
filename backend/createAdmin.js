const dns = require('dns');
// Set DNS servers to Google DNS to resolve connection issues with MongoDB Atlas SRV records
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load dotenv from backend/.env
dotenv.config({ path: path.join(__dirname, '.env') });

async function createAdmin() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in the environment variables');
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected successfully.');

    // Hash the password 'admin123' using bcryptjs
    const password = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a user with name, email, password, role, and isApproved.
    // Also include fullName and status/isActive to ensure compatibility with the UserSchema.
    const adminData = {
      name: 'Admin',
      fullName: 'Admin',
      email: 'admin@gmail.com',
      password: hashedPassword,
      role: 'admin',
      isApproved: true,
      status: 'active',
      isActive: true
    };

    // Upsert the user to ensure it is created and can be re-run cleanly
    await mongoose.connection.collection('users').updateOne(
      { email: adminData.email },
      { $set: adminData },
      { upsert: true }
    );

    console.log('Admin user created successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdmin();
