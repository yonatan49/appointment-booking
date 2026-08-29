import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/pages/login/Login';
import NotFound from './components/pages/notFound/NotFound';
import RequireAuth from './components/auth/RequireAuth';
import DashboardLayout from './components/layout/DashboardLayout/DashboardLayout';
import Dashboard from './components/pages/dashboard/Dashboard';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route element={<RequireAuth />}>
          <Route path="/admin/*" element={<DashboardLayout />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
