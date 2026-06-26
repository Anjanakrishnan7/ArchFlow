require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dns = require('dns');

// Set DNS servers to resolve connection issues with MongoDB Atlas SRV records
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Import all models
const User = require('./models/User');
const Project = require('./models/Project');
const ProjectTeam = require('./models/ProjectTeam');
const Milestone = require('./models/Milestone');
const Task = require('./models/Task');
const PaymentRequest = require('./models/PaymentRequest');
const PaymentTransaction = require('./models/PaymentTransaction');
const Receipt = require('./models/Receipt');
const Document = require('./models/Document');
const Complaint = require('./models/Complaint');
const Minutes = require('./models/Minutes');
const MonthlyReport = require('./models/MonthlyReport');
const ProjectUpdate = require('./models/ProjectUpdate');

async function seed() {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in the environment variables');
        }

        console.log('Connecting to MongoDB Atlas...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB.');

        // 1. Fetch or create users
        let admin = await User.findOne({ role: 'admin' });
        if (!admin) {
            console.log('No admin found, creating a default admin...');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin123', salt);
            admin = await User.create({
                fullName: 'Admin',
                email: 'admin@gmail.com',
                password: hashedPassword,
                role: 'admin',
                status: 'active',
                isActive: true
            });
        }

        let managers = await User.find({ role: 'manager' });
        if (managers.length === 0) {
            console.log('No managers found, creating demo managers...');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('manager123', salt);
            managers = [
                await User.create({
                    fullName: 'Rajesh Kumar',
                    email: 'rajesh.manager@archflow.in',
                    password: hashedPassword,
                    role: 'manager',
                    status: 'active',
                    isActive: true
                }),
                await User.create({
                    fullName: 'Anjali Menon',
                    email: 'anjali.manager@archflow.in',
                    password: hashedPassword,
                    role: 'manager',
                    status: 'active',
                    isActive: true
                })
            ];
        }

        let staff = await User.find({ role: 'staff' });
        if (staff.length === 0) {
            console.log('No staff found, creating demo staff...');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('staff123', salt);
            staff = [
                await User.create({
                    fullName: 'Suresh Nair',
                    email: 'suresh.staff@archflow.in',
                    password: hashedPassword,
                    role: 'staff',
                    status: 'active',
                    isActive: true
                }),
                await User.create({
                    fullName: 'Vikram Pillai',
                    email: 'vikram.staff@archflow.in',
                    password: hashedPassword,
                    role: 'staff',
                    status: 'active',
                    isActive: true
                }),
                await User.create({
                    fullName: 'Priya Sharma',
                    email: 'priya.staff@archflow.in',
                    password: hashedPassword,
                    role: 'staff',
                    status: 'active',
                    isActive: true
                })
            ];
        }

        let clients = await User.find({ role: 'client' });
        if (clients.length === 0) {
            console.log('No clients found, creating demo clients...');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('client123', salt);
            clients = [
                await User.create({
                    fullName: 'Kalyan Builders',
                    email: 'kalyan@kalyanbuilders.com',
                    password: hashedPassword,
                    role: 'client',
                    status: 'active',
                    isActive: true
                }),
                await User.create({
                    fullName: 'Gokulam Group',
                    email: 'gokulam@gokulamgroup.com',
                    password: hashedPassword,
                    role: 'client',
                    status: 'active',
                    isActive: true
                })
            ];
        }

        console.log(`Users verified. Admin: ${admin.email}, Managers: ${managers.length}, Staff: ${staff.length}, Clients: ${clients.length}`);

        // Clean previous seed data (except Users)
        console.log('Cleaning existing construction data...');
        await Project.deleteMany({});
        await ProjectTeam.deleteMany({});
        await Milestone.deleteMany({});
        await Task.deleteMany({});
        await PaymentRequest.deleteMany({});
        await PaymentTransaction.deleteMany({});
        await Receipt.deleteMany({});
        await Document.deleteMany({});
        await Complaint.deleteMany({});
        await Minutes.deleteMany({});
        await MonthlyReport.deleteMany({});
        await ProjectUpdate.deleteMany({});
        console.log('Collections cleared successfully.');

        // Helper functions for safe retrieval from array
        const getStaff = (idx) => staff[idx % staff.length];
        const getManager = (idx) => managers[idx % managers.length];
        const getClient = (idx) => clients[idx % clients.length];

        // 2. Seed Projects (Realistic Indian Construction Data)
        const projectsData = [
            {
                name: "Skyline Apartments",
                type: "Residential",
                status: "ongoing",
                location: "Kozhikode, Kerala",
                description: "A premium 18-storey residential building featuring modern architectural design, eco-friendly rainwater harvesting, and solar power integration.",
                budget: 50000000, // 5 Crore
                paid: 15000000,
                clientId: getClient(0)._id,
                client: getClient(0).fullName,
                managerId: getManager(0)._id,
                assignedManager: getManager(0)._id,
                startDate: new Date('2026-01-15'),
                expectedEndDate: new Date('2027-08-30')
            },
            {
                name: "Green Valley Villa",
                type: "Residential",
                status: "pending",
                location: "Calicut, Kerala",
                description: "A luxury twin-villa construction focusing on sustainable design, landscaped gardens, and smart home automation features.",
                budget: 25000000, // 2.5 Crore
                paid: 0,
                clientId: getClient(1)._id,
                client: getClient(1).fullName,
                managerId: getManager(1)._id,
                assignedManager: getManager(1)._id,
                startDate: new Date('2026-07-01'),
                expectedEndDate: new Date('2027-03-15')
            },
            {
                name: "Malabar Business Hub",
                type: "Commercial",
                status: "completed",
                location: "Kochi, Kerala",
                description: "Modern commercial retail and office complex built in the heart of Kochi IT zone. Achieved LEED gold certification.",
                budget: 75000000, // 7.5 Crore
                paid: 75000000,
                clientId: getClient(0)._id,
                client: getClient(0).fullName,
                managerId: getManager(0)._id,
                assignedManager: getManager(0)._id,
                startDate: new Date('2024-05-10'),
                expectedEndDate: new Date('2026-04-20')
            }
        ];

        const createdProjects = await Project.insertMany(projectsData);
        console.log('1/12. Projects seeded successfully.');

        const pSkyline = createdProjects[0];
        const pVilla = createdProjects[1];
        const pHub = createdProjects[2];

        // 3. Seed ProjectTeam (Ensuring no duplicate {projectId, userId} entries)
        const teamMap = new Map();
        const addTeamMember = (projectId, userId, roleInProject) => {
            const key = `${projectId}_${userId}`;
            if (!teamMap.has(key)) {
                teamMap.set(key, { projectId, userId, roleInProject });
            }
        };

        // Skyline
        addTeamMember(pSkyline._id, getStaff(0)._id, 'Senior Site Engineer');
        addTeamMember(pSkyline._id, getStaff(1)._id, 'Safety Officer');
        addTeamMember(pSkyline._id, getManager(0)._id, 'Project Manager');
        // Villa
        addTeamMember(pVilla._id, getStaff(2)._id, 'Architect');
        addTeamMember(pVilla._id, getManager(1)._id, 'Project Manager');
        // Hub
        addTeamMember(pHub._id, getStaff(0)._id, 'Lead Quality Auditor');
        addTeamMember(pHub._id, getStaff(1)._id, 'Site Engineer');

        const projectTeamData = Array.from(teamMap.values());
        await ProjectTeam.insertMany(projectTeamData);
        console.log('2/12. ProjectTeam assignments seeded successfully.');

        // 4. Seed Milestones
        const milestonesData = [
            // Skyline
            {
                title: "Foundation & Piling Work",
                description: "Deep excavation, foundation reinforcement, and pile casting.",
                project: pSkyline._id,
                startDate: new Date('2026-01-20'),
                endDate: new Date('2026-04-15'),
                status: "completed",
                progress: 100,
                createdBy: admin._id
            },
            {
                title: "RCC Frame Structure",
                description: "Casting columns, beams, and slabs from ground floor to 18th floor.",
                project: pSkyline._id,
                startDate: new Date('2026-04-16'),
                endDate: new Date('2026-12-30'),
                status: "in-progress",
                progress: 45,
                createdBy: admin._id
            },
            {
                title: "Plumbing and Electrical Rough-ins",
                description: "Installing internal conduit pipes and main drainage headers.",
                project: pSkyline._id,
                startDate: new Date('2026-09-01'),
                endDate: new Date('2027-02-28'),
                status: "pending",
                progress: 0,
                createdBy: admin._id
            },
            // Villa
            {
                title: "Site Preparation & Excavation",
                description: "Clear trees, level terrain, and excavate for villa foundation footprint.",
                project: pVilla._id,
                startDate: new Date('2026-07-05'),
                endDate: new Date('2026-08-10'),
                status: "pending",
                progress: 0,
                createdBy: admin._id
            },
            {
                title: "Substructure & Foundation",
                description: "PCC work, footing layout, and plinth beam casting.",
                project: pVilla._id,
                startDate: new Date('2026-08-11'),
                endDate: new Date('2026-10-15'),
                status: "pending",
                progress: 0,
                createdBy: admin._id
            }
        ];

        const createdMilestones = await Milestone.insertMany(milestonesData);
        console.log('3/12. Milestones seeded successfully.');

        const mSkylineRCC = createdMilestones[1];

        // 5. Seed Tasks (All due dates relative to now to avoid "Due date cannot be in the past" validator error)
        const tasksData = [
            // Skyline
            {
                title: "Piling Quality Rig Test",
                description: "Perform pile load tests on designated test piles to ensure load capacity.",
                project: pSkyline._id,
                projectId: pSkyline._id,
                assignedTo: getStaff(0)._id,
                status: "completed",
                category: "Structural",
                createdBy: admin._id,
                dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
            },
            {
                title: "Casting 5th Floor Slab",
                description: "Reinforcement layout check followed by concrete casting for 5th floor slab.",
                project: pSkyline._id,
                projectId: pSkyline._id,
                assignedTo: getStaff(0)._id,
                status: "in-progress",
                category: "Concrete Casting",
                createdBy: admin._id,
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            },
            {
                title: "Safety Net Installation",
                description: "Install peripheral safety nets around active work levels (floors 4-7).",
                project: pSkyline._id,
                projectId: pSkyline._id,
                assignedTo: getStaff(1)._id,
                status: "pending",
                category: "Safety",
                createdBy: admin._id,
                dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
            },
            // Villa
            {
                title: "Boundary Wall Marking",
                description: "Survey the perimeter and mark the boundary wall pillars.",
                project: pVilla._id,
                projectId: pVilla._id,
                assignedTo: getStaff(2)._id,
                status: "todo",
                category: "Planning",
                createdBy: admin._id,
                dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000)
            }
        ];

        const createdTasks = await Task.insertMany(tasksData);
        console.log('4/12. Tasks seeded successfully.');

        const tSlabCasting = createdTasks[1];

        // 6. Seed PaymentRequests
        const paymentRequestsData = [
            {
                projectId: pSkyline._id,
                project: pSkyline._id,
                clientId: pSkyline.clientId,
                amount: 15000000, // 1.5 Crore
                purpose: "Mobilization Advance",
                description: "Initial mobilization fund request as per contract terms.",
                status: "Paid",
                requestedBy: admin._id,
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                requestedAt: new Date()
            },
            {
                projectId: pSkyline._id,
                project: pSkyline._id,
                clientId: pSkyline.clientId,
                amount: 8000000, // 80 Lakhs
                purpose: "Piling Stage Completion",
                description: "Bill for completion of foundation piling works and load tests approval.",
                status: "Requested", // pending
                requestedBy: admin._id,
                dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
                requestedAt: new Date()
            },
            {
                projectId: pVilla._id,
                project: pVilla._id,
                clientId: pVilla.clientId,
                amount: 3000000, // 30 Lakhs
                purpose: "Architectural Design Finalization",
                description: "Request for initial design fee after layout approval.",
                status: "Requested", // pending
                requestedBy: admin._id,
                dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
                requestedAt: new Date()
            }
        ];

        const createdPaymentRequests = await PaymentRequest.insertMany(paymentRequestsData);
        console.log('5/12. PaymentRequests seeded successfully.');

        // 7. Seed PaymentTransactions
        const paymentTransactionsData = [
            {
                projectId: pSkyline._id,
                clientId: pSkyline.clientId,
                requestId: createdPaymentRequests[0]._id,
                amount: 15000000,
                purpose: "Mobilization Advance Payment",
                transactionId: "TXN_SKY_MOB_100234",
                paymentProofUrl: "/uploads/payment-proofs/skyline_mob_proof.png",
                paidAt: new Date(),
                verifiedBy: admin._id,
                status: "Verified",
                paymentMethod: "Bank Transfer"
            },
            {
                projectId: pHub._id,
                clientId: pHub.clientId,
                amount: 75000000,
                purpose: "Final Handover Settlement",
                transactionId: "TXN_HUB_FINAL_554890",
                paymentProofUrl: "/uploads/payment-proofs/hub_final_proof.png",
                paidAt: new Date(),
                verifiedBy: admin._id,
                status: "Verified",
                paymentMethod: "Bank Transfer"
            }
        ];

        const createdTransactions = await PaymentTransaction.insertMany(paymentTransactionsData);
        console.log('6/12. PaymentTransactions seeded successfully.');

        // 8. Seed Receipts
        const receiptsData = [
            {
                transactionId: createdTransactions[0]._id,
                projectId: pSkyline._id,
                clientId: pSkyline.clientId,
                filename: "RECEIPT_SKY_MOB.pdf",
                receiptUrl: "/uploads/payment-proofs/RECEIPT_SKY_MOB.pdf",
                amount: 15000000
            },
            {
                transactionId: createdTransactions[1]._id,
                projectId: pHub._id,
                clientId: pHub.clientId,
                filename: "RECEIPT_HUB_FINAL.pdf",
                receiptUrl: "/uploads/payment-proofs/RECEIPT_HUB_FINAL.pdf",
                amount: 75000000
            }
        ];

        await Receipt.insertMany(receiptsData);
        console.log('7/12. Receipts seeded successfully.');

        // 9. Seed Documents
        const documentsData = [
            {
                projectId: pSkyline._id,
                title: "Architectural Floor Plan Blueprint",
                description: "Approved architectural layouts for floor plans (levels 1-18).",
                fileUrl: "/uploads/documents/skyline_blueprint_v2.pdf",
                fileName: "skyline_blueprint_v2.pdf",
                uploadedBy: getManager(0)._id,
                fileType: "application/pdf",
                fileSize: 15482930 // ~15 MB
            },
            {
                projectId: pSkyline._id,
                title: "Soil Investigation & Bearing Test Report",
                description: "Geotechnical test results confirming safe bearing pressure.",
                fileUrl: "/uploads/documents/skyline_soil_report.pdf",
                fileName: "skyline_soil_report.pdf",
                uploadedBy: getManager(0)._id,
                fileType: "application/pdf",
                fileSize: 4589020 // ~4.5 MB
            },
            {
                projectId: pVilla._id,
                title: "NOC Clearance Municipal Office",
                description: "No Objection Certificate from Local Corporation for residential villa construction.",
                fileUrl: "/uploads/documents/noc_calicut_villa.pdf",
                fileName: "noc_calicut_villa.pdf",
                uploadedBy: getManager(1)._id,
                fileType: "application/pdf",
                fileSize: 2013450
            }
        ];

        await Document.insertMany(documentsData);
        console.log('8/12. Documents seeded successfully.');

        // 10. Seed Complaints
        const complaintsData = [
            {
                title: "Steel reinforcement supply delay",
                description: "Fe550 grade TMT steel bars delivery from Fe-Tech mills is delayed by 5 days, impacting RCC frame schedule.",
                status: "pending",
                submittedBy: getStaff(0)._id,
                project: pSkyline._id,
                attachments: ["/uploads/complaints/order_invoice_delay.png"]
            },
            {
                title: "High water salinity at construction site",
                description: "Initial water test from tube well shows high salinity, requiring filter treatment before mixing concrete.",
                status: "resolved",
                submittedBy: getStaff(1)._id,
                project: pSkyline._id,
                attachments: []
            }
        ];

        await Complaint.insertMany(complaintsData);
        console.log('9/12. Complaints seeded successfully.');

        // 11. Seed Minutes
        const minutesData = [
            {
                content: "ArchFlow Team discussed project kickoff with Kalyan Builders. Settled on mobilization timelines and scheduled weekly site updates every Wednesday morning.",
                projectId: pSkyline._id,
                createdBy: getManager(0)._id
            },
            {
                content: "Discussed procurement backlog. Agreed to switch to local supplier Tata Tiscon to avoid logistics delay from interstate transportation.",
                projectId: pSkyline._id,
                createdBy: getManager(0)._id
            },
            {
                content: "Villa design kickoff meeting. Finalized twin villa specifications, color theme, and electrical solar-ready panel locations.",
                projectId: pVilla._id,
                createdBy: getManager(1)._id
            }
        ];

        await Minutes.insertMany(minutesData);
        console.log('10/12. Minutes of Meetings (Minutes) seeded successfully.');

        // 12. Seed MonthlyReports
        const monthlyReportsData = [
            {
                projectId: pSkyline._id,
                submittedBy: getManager(0)._id,
                summary: "May 2026 Monthly Progress Report. Piling successfully finished. 1st slab column structures initiated. Work moving at optimal speed.",
                workImages: ["/uploads/reports/skyline_piling_done.jpg", "/uploads/reports/skyline_excavation_wide.jpg"],
                issuesOrBlockers: "Slight shortage of local sand resolved by sourcing from approved quarry in adjacent district."
            },
            {
                projectId: pHub._id,
                submittedBy: getManager(0)._id,
                summary: "Final Completion & Handover monthly report. Interior fit-outs, fire fighting clearance, and electricity substation setup successfully certified.",
                workImages: ["/uploads/reports/hub_completed_front.jpg"],
                issuesOrBlockers: "None."
            }
        ];

        await MonthlyReport.insertMany(monthlyReportsData);
        console.log('11/12. MonthlyReports seeded successfully.');

        // 13. Seed ProjectUpdates
        const projectUpdatesData = [
            {
                projectId: pSkyline._id,
                taskId: tSlabCasting._id,
                milestoneId: mSkylineRCC._id,
                staffId: getStaff(0)._id,
                title: "RCC Grade M35 casting started",
                description: "Concrete transit mixers arrived. Placing concrete for column framework.",
                images: ["/uploads/updates/slab_casting_c1.jpg"],
                type: "work-progress",
                approvalStatus: "approved",
                approvedBy: getManager(0)._id,
                approvedAt: new Date(),
                feedback: {
                    message: "Good work, verify cube test samples are taken.",
                    seen: true,
                    seenAt: new Date()
                }
            },
            {
                projectId: pSkyline._id,
                staffId: getStaff(1)._id,
                title: "Routine safety inspection completed",
                description: "Checked workers' harness lines, safety helmets, and fire safety points. One worker warned for not wearing safety boots.",
                images: [],
                type: "site-visit",
                approvalStatus: "pending",
                feedback: {
                    message: "",
                    seen: false,
                    seenAt: null
                }
            }
        ];

        await ProjectUpdate.insertMany(projectUpdatesData);
        console.log('12/12. ProjectUpdates seeded successfully.');

        console.log('================================================');
        console.log('Success! Comprehensive demo database seed completed.');
        console.log('================================================');
        process.exit(0);

    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seed();
