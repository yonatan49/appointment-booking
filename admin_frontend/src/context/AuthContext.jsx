// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const setUserFromToken = useCallback((token) => {
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const decoded = jwtDecode(token);
      setUser(decoded);
    } catch (err) {
      console.error('Failed to decode token', err);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setUserFromToken(token);
  }, [setUserFromToken]);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'token') {
        setUserFromToken(e.newValue);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [setUserFromToken]);

  return (
    <AuthContext.Provider value={{ user, setUser, setUserFromToken }}>
      {children}
    </AuthContext.Provider>
  );
};
