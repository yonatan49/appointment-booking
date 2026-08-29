import React, { useContext, useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import api from '../../../lib/api';
import {
  FaCalendarAlt, FaUsers, FaCogs,
  FaSignOutAlt, FaChartBar, FaTools, FaTimes
} from 'react-icons/fa';
import './Sidebar.css';
import { AuthContext } from '../../../context/AuthContext';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [userName, setUserName] = useState('__loading__');

  useEffect(() => {
    if (!user?.id) return;

    const controller = new AbortController();
    api.get(`/api/users/${user.id}`, { signal: controller.signal })
      .then(({ data }) => {
        setUserName(data.name || 'USER');
      })
      .catch(err => {
        if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
          console.error('Failed to fetch user name', err);
          setUserName('USER');
        }
      });

    return () => controller.abort();
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h2><span style={{ color: '#e91e63' }}>Elegance</span> Nail Salon</h2>
        <p className="admin-welcome">Welcome, <strong>{userName}</strong></p>
        <FaTimes className="close-btn" onClick={toggleSidebar} />
      </div>
      <nav className="sidebar-nav">
        <hr />
        <NavLink to="/admin" end><FaCalendarAlt /> Appointments</NavLink>
        <NavLink to="/admin/clients"><FaUsers /> Clients</NavLink>
        <NavLink to="/admin/services"><FaTools /> Services</NavLink>
        <NavLink to="/admin/reports"><FaChartBar /> Reports</NavLink>
        <NavLink to="/admin/settings"><FaCogs /> Settings</NavLink>
        <hr />
        <a onClick={handleLogout}><FaSignOutAlt /> Logout</a>
        <hr />
      </nav>
    </aside>
  );
};

export default Sidebar;
