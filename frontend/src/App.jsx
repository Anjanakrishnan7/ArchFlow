import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Public Pages
import Home from "./pages/public/Home";
import About from "./pages/public/About";
import Services from "./pages/public/Services";
import Projects from "./pages/public/Projects";
import Contact from "./pages/public/Contact";
import RegisterPage from "./pages/public/Register";
import LoginPage from "./pages/public/Login";

// Layouts
import AdminLayout from "./layouts/AdminLayout";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import PendingApprovals from "./pages/admin/PendingApprovals";
import StaffList from "./pages/admin/StaffList";
import AddStaff from "./pages/admin/AddStaff";
import EditStaff from "./pages/admin/EditStaff";
import ClientList from "./pages/admin/ClientList";
import AddClient from "./pages/admin/AddClient";
import EditClient from "./pages/admin/EditClient";
import AdminProjects from "./pages/admin/AdminProjects";
import AddProject from "./pages/admin/AddProject";
import EditProject from "./pages/admin/EditProject";
import AdminReports from "./pages/admin/AdminReports";
import AdminComplaints from "./pages/admin/AdminComplaints";
import PaymentRequests from "./pages/admin/PaymentRequests";
import RegisterManager from "./pages/admin/RegisterManager";
import ManagerList from "./pages/admin/ManagerList";
import EditManager from "./pages/admin/EditManager";
import AdminProjectDetails from "./pages/admin/AdminProjectDetails";

import ProjectReports from "./pages/admin/ProjectReports";


// Staff Pages
import StaffDashboard from "./pages/staff/StaffDashboard";
import ProjectSchedule from "./pages/staff/ProjectSchedule";
import StaffTask from "./pages/staff/task/StaffTask";
import StaffProfile from "./pages/staff/StaffProfile";

// Client Pages
import ClientDashboard from "./pages/client/ClientDashboard";
import ClientProjects from "./pages/client/ClientProjects";
import ClientPayments from "./pages/client/ClientPayments";
import ClientComplaints from "./pages/client/ClientComplaints";
import ClientSchedule from "./pages/client/ClientSchedule";
import ClientProfile from "./pages/client/ClientProfile";

// Client Project Detail Pages
import ProjectTasks from "./pages/client/project/ProjectTasks";

import ProjectDocuments from "./pages/client/project/ProjectDocuments";
// import ClientProjectDocuments from "./pages/client/project/ClientProjectDocuments"; // NEW
import ProjectTeam from "./pages/client/project/ProjectTeam";
import ProjectMinutes from "./pages/client/project/ProjectMinutes";

// Manager Pages
import ManagerLayout from "./layouts/ManagerLayout";
import StaffLayout from "./layouts/StaffLayout";
import ClientLayout from "./layouts/ClientLayout";
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import ManagerProjects from "./pages/manager/ManagerProjects";
import ProjectWorkspace from "./pages/manager/ProjectWorkspace";
import ManagerComplaints from "./pages/manager/ManagerComplaints";
import ManagerProfile from "./pages/manager/ManagerProfile";
import AddMember from "./pages/manager/workspace/AddMember";

// Core
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Chatbot from "./components/Chatbot/Chatbot";

function App() {
  return (
    <Router>
      <Routes>

        {/* PUBLIC ROUTES WITH NAVBAR */}
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <Home />
            </>
          }
        />

        <Route
          path="/about"
          element={
            <>
              <Navbar />
              <About />
            </>
          }
        />

        <Route
          path="/services"
          element={
            <>
              <Navbar />
              <Services />
            </>
          }
        />

        <Route
          path="/projects"
          element={
            <>
              <Navbar />
              <Projects />
            </>
          }
        />

        <Route
          path="/contact"
          element={
            <>
              <Navbar />
              <Contact />
            </>
          }
        />

        <Route
          path="/register"
          element={
            <>
              <Navbar />
              <RegisterPage />
            </>
          }
        />

        <Route
          path="/login"
          element={
            <>
              <Navbar />
              <LoginPage />
            </>
          }
        />

        {/* ADMIN PROTECTED ROUTES */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/pending-approvals" element={<PendingApprovals />} />

            {/* Staff Management */}
            <Route path="/admin/staff-list" element={<StaffList />} />
            <Route path="/admin/register-staff" element={<AddStaff />} />
            <Route path="/admin/staff/edit/:id" element={<EditStaff />} />

            {/* Client Management */}
            <Route path="/admin/client-list" element={<ClientList />} />
            <Route path="/admin/register-client" element={<AddClient />} />
            <Route path="/admin/clients/edit/:id" element={<EditClient />} />

            {/* Manager Management */}
            <Route path="/admin/managers" element={<ManagerList />} />
            <Route path="/admin/register-manager" element={<RegisterManager />} />
            <Route path="/admin/managers/edit/:id" element={<EditManager />} />

            <Route path="/admin/projects" element={<AdminProjects />} />
            <Route path="/admin/add-project" element={<AddProject />} />
            <Route path="/admin/edit-project/:id" element={<EditProject />} />
            <Route path="/admin/project/:id" element={<AdminProjectDetails />} />

            <Route path="/admin/reports" element={<AdminReports />} /> {/* Kept if accessed directly, but removed from sidebar. Ideally could be removed if no longer used at all, but user only asked to remove from sidebar. Keeping for safety or removing if requested. User said remove from sidebar. Safest is to keep route but remove link. Wait, user said remove Reports section from admin sidebar. I did that. User also said "Add Route (Admin Only) ... <Route path="/admin/projects/:id/reports" element={<ProjectReports />} />". */}
            <Route path="/admin/projects/:id/reports" element={<ProjectReports />} />
            <Route path="/admin/complaints" element={<AdminComplaints />} />
            <Route path="/admin/payment-requests" element={<PaymentRequests />} />
          </Route>
        </Route>

        {/* STAFF PROTECTED ROUTES */}
        <Route element={<ProtectedRoute allowedRoles={["staff", "admin"]} />}>
          <Route element={<StaffLayout />}>
            <Route path="/staff/dashboard" element={<StaffDashboard />} />
            <Route path="/staff/project-schedule" element={<ProjectSchedule />} />
            <Route path="/staff/tasks" element={<StaffTask />} />
            <Route path="/staff/profile" element={<StaffProfile />} />
          </Route>
        </Route>

        {/* CLIENT PROTECTED ROUTES */}
        <Route element={<ProtectedRoute allowedRoles={["client", "admin"]} />}>
          <Route element={<ClientLayout />}>
            <Route path="/client/dashboard" element={<ClientDashboard />} />
            <Route path="/client/projects" element={<ClientProjects />} />
            <Route path="/client/payments" element={<ClientPayments />} />
            <Route path="/client/complaints" element={<ClientComplaints />} />
            <Route path="/client/schedule" element={<ClientSchedule />} />
            <Route path="/client/profile" element={<ClientProfile />} />

            {/* Project Detail Routes */}
            <Route path="/client/project/:id/tasks" element={<ProjectTasks />} />
            <Route path="/client/project/:id/documents" element={<ProjectDocuments />} />
            {/* <Route path="/client/project/:projectId/documents" element={<ClientProjectDocuments />} /> NEW */}
            <Route path="/client/project/:id/team" element={<ProjectTeam />} />
            <Route path="/client/project/:id/minutes" element={<ProjectMinutes />} />
          </Route>
        </Route>

        {/* MANAGER PROTECTED ROUTES */}
        <Route element={<ProtectedRoute allowedRoles={["manager", "admin", "staff"]} />}>
          <Route element={<ManagerLayout />}>
            <Route path="/manager/dashboard" element={<ManagerDashboard />} />
            <Route path="/manager/projects" element={<ManagerProjects />} />
            <Route path="/manager/project/:id" element={<ProjectWorkspace />} />
            <Route path="/manager/project/:id/add-member" element={<AddMember />} />
            <Route path="/manager/project/:id/:activeTab" element={<ProjectWorkspace />} />
            <Route path="/manager/complaints" element={<ManagerComplaints />} />
            <Route path="/manager/profile" element={<ManagerProfile />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route
          path="*"
          element={
            <div style={{ padding: "20px" }}>
              <h2>404 - Page Not Found</h2>
            </div>
          }
        />
      </Routes>
      <Chatbot />
    </Router>
  );
}

export default App;
