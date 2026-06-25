import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaThLarge, FaFolderOpen, FaExclamationCircle, FaCalendarAlt, FaUser, FaSignOutAlt, FaCreditCard } from 'react-icons/fa';
import DashboardLayout from '../components/DashboardLayout';

const ClientLayout = () => {
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
        { name: 'Dashboard', path: '/client/dashboard', icon: <FaThLarge /> },
        { name: 'My Projects', path: '/client/projects', icon: <FaFolderOpen /> },
        { name: 'Payments', path: '/client/payments', icon: <FaCreditCard /> },
        { name: 'Schedule', path: '/client/schedule', icon: <FaCalendarAlt /> },
        { name: 'Complaints', path: '/client/complaints', icon: <FaExclamationCircle /> },
        { name: 'Profile', path: '/client/profile', icon: <FaUser /> },
        { name: 'Logout', action: handleLogout, icon: <FaSignOutAlt />, className: 'logout-link sidebar-link-spacer' }
    ];

    const customTitle = (
        <span style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Client Panel</span>
    );

    return (
        <DashboardLayout title={customTitle} sidebarLinks={sidebarLinks} showProfileHeader={true}>
            <Outlet />
        </DashboardLayout>
    );
};

export default ClientLayout;
