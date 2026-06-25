import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaChartLine, FaProjectDiagram, FaExclamationCircle, FaUser, FaSignOutAlt } from 'react-icons/fa';
import DashboardLayout from '../components/DashboardLayout';

const ManagerLayout = () => {
    const { user, logout } = useAuth();
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
        { name: 'Dashboard', path: '/manager/dashboard', icon: <FaChartLine />, roles: ['manager', 'admin'] },
        { name: 'Projects', path: '/manager/projects', icon: <FaProjectDiagram />, roles: ['manager', 'admin'] },
        { name: 'Complaints', path: '/manager/complaints', icon: <FaExclamationCircle />, roles: ['manager', 'admin'] },
        { name: 'Profile', path: '/manager/profile', icon: <FaUser />, roles: ['manager', 'admin', 'staff'] },
        { name: 'Logout', action: handleLogout, icon: <FaSignOutAlt />, className: 'logout-link sidebar-link-spacer', roles: ['manager', 'admin', 'staff'] }
    ].filter(link => !link.roles || link.roles.includes(user?.role));

    const customTitle = (
        <span style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Manager Panel</span>
    );

    return (
        <DashboardLayout title={customTitle} sidebarLinks={sidebarLinks} showProfileHeader={true}>
            <Outlet />
        </DashboardLayout>
    );
};

export default ManagerLayout;
