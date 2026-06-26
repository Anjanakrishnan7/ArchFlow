require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);

const User = require('./models/User');
const Complaint = require('./models/Complaint');

async function fixComplaints() {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in the environment variables');
        }

        console.log('Connecting to MongoDB Atlas...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB.');

        // Find or create Client "Adwaith"
        let clientAdwaith = await User.findOne({ 
            $or: [
                { fullName: { $regex: 'Adwaith', $options: 'i' } },
                { email: 'adwaith@gmail.com' }
            ], 
            role: 'client' 
        });

        if (!clientAdwaith) {
            console.log('Client "Adwaith" not found. Creating a new client user "Adwaith"...');
            const bcrypt = require('bcryptjs');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('client123', salt);
            clientAdwaith = await User.create({
                fullName: 'Adwaith Client',
                email: 'adwaith@gmail.com',
                password: hashedPassword,
                role: 'client',
                status: 'active',
                isActive: true
            });
            console.log(`Created client: ${clientAdwaith.fullName} (${clientAdwaith._id})`);
        } else {
            console.log(`Found client "Adwaith": ${clientAdwaith.fullName} (${clientAdwaith._id})`);
        }

        // Find Staff "Adhithyan"
        let staffAdhithyan = await User.findOne({ 
            $or: [
                { fullName: { $regex: 'Adhithyan', $options: 'i' } },
                { email: 'adhithyan@gmail.com' }
            ],
            role: 'staff'
        });

        if (!staffAdhithyan) {
            console.log('Staff "Adhithyan" not found in database. Searching for complaints submitted by any staff...');
        } else {
            console.log(`Found staff "Adhithyan": ${staffAdhithyan.fullName} (${staffAdhithyan._id})`);
        }

        // Find complaints to update
        // We will update all complaints submitted by Adhithyan (or all existing complaints if Adhithyan isn't set/found as the submitter)
        const query = staffAdhithyan ? { submittedBy: staffAdhithyan._id } : {};
        const complaints = await Complaint.find(query);
        console.log(`Found ${complaints.length} complaints to update.`);

        if (complaints.length === 0) {
            console.log('No complaints matched the criteria. Finding all complaints instead...');
            const allComplaints = await Complaint.find({});
            console.log(`Found ${allComplaints.length} total complaints in database.`);
            for (let complaint of allComplaints) {
                complaints.push(complaint);
            }
        }

        // Realistic client-perspective complaints
        const clientPerspectives = [
            {
                title: "Delay in milestone execution",
                description: "We noticed there is slow progress on the structure frame structure. The completion date was planned for earlier this month, please expedite.",
            },
            {
                title: "Water seepage near plinth beam",
                description: "During our weekend site visit, we observed minor water logging and seepage near the plinth beam. Please investigate and fix it.",
            },
            {
                title: "Discrepancy in invoice amount",
                description: "The payment request amount doesn't match the work completed audit sheet. Please verify and send the updated breakdown.",
            }
        ];

        let index = 0;
        for (let complaint of complaints) {
            const updateData = {
                submittedBy: clientAdwaith._id
            };

            // Update title and description to client perspective
            const perspective = clientPerspectives[index % clientPerspectives.length];
            updateData.title = perspective.title;
            updateData.description = perspective.description;

            await Complaint.findByIdAndUpdate(complaint._id, updateData);
            console.log(`Updated complaint ID: ${complaint._id} - New Title: "${updateData.title}"`);
            index++;
        }

        console.log('Successfully updated all matching complaints.');
        process.exit(0);

    } catch (error) {
        console.error('Error fixing complaints:', error);
        process.exit(1);
    }
}

fixComplaints();
