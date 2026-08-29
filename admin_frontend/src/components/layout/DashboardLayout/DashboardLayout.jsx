import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from '../../ui/sidebar/Sidebar';
import Dashboard from '../../pages/dashboard/Dashboard';
import { FaBars, FaBell, FaUserCircle, FaChevronRight } from 'react-icons/fa';
import './DashboardLayout.css'; // We'll create this file
import api from '../../../lib/api';
import { AuthContext } from '../../../context/AuthContext';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useContext(AuthContext);
  const [userName, setUserName] = useState('USER');
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    if (!user?.id) return;
    const controller = new AbortController();
    api.get(`/api/users/${user.id}`, { signal: controller.signal })
      .then(({ data }) => setUserName(data.name || 'USER'))
      .catch(() => setUserName('USER'));
    return () => controller.abort();
  }, [user]);

  const pageTitle = useMemo(() => {
    const map = {
      '/admin': 'Appointments',
      '/admin/clients': 'Clients',
      '/admin/services': 'Services',
      '/admin/reports': 'Reports',
      '/admin/settings': 'Settings',
    };
    // match known routes, default to Admin
    return map[location.pathname] || 'Admin';
  }, [location.pathname]);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-left">
          <FaBars className="hamburger" onClick={toggleSidebar} />
          <div className="page-title">
            <h2 className="title-text">{pageTitle}</h2>
          </div>
        </div>
        <div className="header-right">
          <button className="icon-btn" aria-label="Notifications">
            <FaBell />
            <span className="notify-dot" />
          </button>
          <div className="user-chip">
            <FaUserCircle className="avatar" />
            <span className="name">{userName}</span>
          </div>
        </div>
      </header>

      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <main className="dashboard-content">
        <Routes>
          <Route path="" element={<Dashboard />} />
        </Routes>
      </main>
    </div>
  );
};

export default DashboardLayout;