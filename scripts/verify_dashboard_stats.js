const mongoose = require('mongoose');
const User = require('../backend/models/User');
const Project = require('../backend/models/Project');
const { getAdminStats } = require('../backend/controllers/adminDashboardController');

// Mock response object
const mockRes = {
    status: (code) => ({
        json: (data) => {
            console.log(`Status: ${code}`);
            console.log('Response:', data);
            return data;
        }
    })
};

// Mock request object
const mockReq = {};

async function verifyStats() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/archflow_db');
        console.log('Connected to MongoDB');

        // Create dummy users for testing
        const activeStaff = new User({
            fullName: 'Active Staff',
            email: 'active_staff@test.com',
            password: 'password123',
            role: 'staff',
            status: 'active'
        });

        const pendingStaff = new User({
            fullName: 'Pending Staff',
            email: 'pending_staff@test.com',
            password: 'password123',
            role: 'staff',
            status: 'pending'
        });

        // Save users
        try {
            await activeStaff.save();
            await pendingStaff.save();
            console.log('Dummy users created');
        } catch (e) {
            console.log('Error creating dummy users (might already exist):', e.message);
        }

        // Call the controller
        console.log('Calling getAdminStats...');
        const stats = await getAdminStats(mockReq, mockRes);

        // Fetch actual counts from DB to verify
        const actualActiveStaff = await User.countDocuments({ role: 'staff', status: 'active' });
        const allStaff = await User.countDocuments({ role: 'staff' });

        console.log(`Actual Active Staff in DB: ${actualActiveStaff}`);
        console.log(`Total Staff in DB (Active + Pending): ${allStaff}`);

        // Cleanup
        await User.deleteOne({ email: 'active_staff@test.com' });
        await User.deleteOne({ email: 'pending_staff@test.com' });
        console.log('Cleanup complete');

        process.exit(0);
    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
}

verifyStats();
