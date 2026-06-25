import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaThLarge, FaCalendarAlt, FaTasks, FaSignOutAlt, FaUser } from 'react-icons/fa';
import DashboardLayout from '../components/DashboardLayout';

const StaffLayout = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const sidebarLinks = [
        { name: 'Dashboard', path: '/staff/dashboard', icon: <FaThLarge /> },
        { name: 'ProjectSchedule', path: '/staff/project-schedule', icon: <FaCalendarAlt /> },
        { name: 'Task', path: '/staff/tasks', icon: <FaTasks /> },
        { name: 'Profile', path: '/staff/profile', icon: <FaUser /> },
        { name: 'Logout', action: handleLogout, icon: <FaSignOutAlt />, className: 'logout-link sidebar-link-spacer' }
    ];

    // We pass the title "Staff Panel" to DashboardLayout. 
    // DashboardLayout renders it in an <h2>. passing a React Node allows custom styling.
    const customTitle = (
        <span style={{ color: '#FFFFFF' }}>Staff Panel</span>
    );

    return (
        <DashboardLayout title={customTitle} sidebarLinks={sidebarLinks} showProfileHeader={true}>
            <Outlet />
        </DashboardLayout>
    );
};

export default StaffLayout;
