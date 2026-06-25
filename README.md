# Construction Management System

A full-stack MERN application for managing construction projects, staff, clients, tasks, schedules, receipts, and complaints.

## Features

- **Public Website**: Home, Services, Projects showcase, Contact form
- **Admin Panel**: Complete management of staff, clients, projects, tasks, schedules, receipts, and complaints
- **Staff Panel**: View assigned tasks and schedules
- **Client Panel**: View projects, tasks, receipts, submit complaints, and manage profile

## Tech Stack

### Frontend
- React 18
- React Router DOM
- CSS (No Tailwind/MUI)
- fetch API for HTTP requests
- Vite for build tooling

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Multer for file uploads

## Project Structure

```
ConProj/
├── backend/
│   ├── models/          # Mongoose models
│   ├── controllers/     # Route controllers
│   ├── routes/          # Express routes
│   ├── middleware/      # Auth & upload middleware
│   ├── uploads/         # Uploaded files
│   └── server.js        # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── layouts/     # Layout components
│   │   ├── pages/       # Page components
│   │   ├── utils/       # Utility functions
│   │   └── App.jsx      # Main app component
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/construction_db
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

4. Start the server:
```bash
npm start
# or for development with auto-reload
npm run dev
```

The backend server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Default Users

You'll need to create users through the admin panel or directly in MongoDB. The system supports three roles:
- **admin**: Full access to all features
- **staff**: Can view and update assigned tasks
- **client**: Can view their projects, tasks, receipts, and submit complaints

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/role/:role` - Get users by role (admin only)
- `GET /api/users/:id` - Get user
- `POST /api/users` - Create user (admin only)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin only)

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project
- `POST /api/projects` - Create project (admin only)
- `PUT /api/projects/:id` - Update project (admin only)
- `DELETE /api/projects/:id` - Delete project (admin only)
- `GET /api/projects/:id/tasks` - Get project tasks
- `GET /api/projects/:id/schedules` - Get project schedules
- `GET /api/projects/:id/receipts` - Get project receipts

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get task
- `POST /api/tasks` - Create task (admin only)
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task (admin only)

### Schedules
- `GET /api/schedules` - Get all schedules
- `GET /api/schedules/:id` - Get schedule
- `POST /api/schedules` - Create schedule (admin only)
- `PUT /api/schedules/:id` - Update schedule (admin only)
- `DELETE /api/schedules/:id` - Delete schedule (admin only)

### Complaints
- `GET /api/complaints` - Get all complaints
- `GET /api/complaints/:id` - Get complaint
- `POST /api/complaints` - Create complaint
- `PUT /api/complaints/:id` - Update complaint (admin only)
- `DELETE /api/complaints/:id` - Delete complaint (admin only)

### Receipts
- `GET /api/receipts` - Get all receipts
- `GET /api/receipts/:id` - Get receipt
- `POST /api/receipts` - Create receipt (admin only)
- `PUT /api/receipts/:id` - Update receipt (admin only)
- `DELETE /api/receipts/:id` - Delete receipt (admin only)

### Dashboard
- `GET /api/dashboard/admin` - Admin dashboard stats
- `GET /api/dashboard/staff` - Staff dashboard stats
- `GET /api/dashboard/client` - Client dashboard stats

## File Uploads

Uploaded files are stored in `backend/uploads/` directory:
- Photos: `backend/uploads/photos/`
- Documents: `backend/uploads/documents/`
- Images: `backend/uploads/images/`

## Development Notes

- All API calls use `fetch()` (no axios)
- JWT tokens are stored in localStorage
- Protected routes check authentication and role
- File uploads use FormData with Multer
- MongoDB models use Mongoose schemas

## Production Deployment

1. Build frontend:
```bash
cd frontend
npm run build
```

2. Set production environment variables in backend `.env`

3. Use a process manager like PM2 for Node.js:
```bash
npm install -g pm2
pm2 start backend/server.js
```

4. Serve frontend build files using a web server (nginx, Apache, etc.)

## License

This project is created for educational purposes.

## Support

For issues or questions, please check the code comments or create an issue in the repository.




