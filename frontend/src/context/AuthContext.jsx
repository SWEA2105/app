import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext();

export const DEMO_USERS = {
  faculty: {
    id: 'fac_01',
    name: 'Dr. V. Meenakshi',
    email: 'meenakshi.v@college.edu',
    role: 'faculty',
    designation: 'Associate Professor',
    department: 'CSE',
    avatar: 'VM'
  },
  admin: {
    id: 'adm_01',
    name: 'Dr. R. Ramanathan',
    email: 'hod.cse@college.edu',
    role: 'admin',
    designation: 'Head of Department / Dean',
    department: 'CSE',
    avatar: 'RR'
  }
};

export function AuthProvider({ children }) {
  // Check local storage or default to logged in as faculty demo for smooth previewing
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('academic_analyzer_user');
    return saved ? JSON.parse(saved) : DEMO_USERS.faculty;
  });

  const login = async (role = 'faculty', credentials = {}) => {
    try {
      const res = await authApi.demoLogin(role);
      if (res?.data?.access_token) {
        localStorage.setItem('academic_analyzer_token', res.data.access_token);
        const userObj = {
          ...res.data.user,
          token: res.data.access_token,
        };
        setUser(userObj);
        localStorage.setItem('academic_analyzer_user', JSON.stringify(userObj));
        return userObj;
      }
    } catch (err) {
      console.warn('Backend auth standby, using local profile:', err?.message || err);
    }

    const selectedUser = DEMO_USERS[role] || DEMO_USERS.faculty;
    const finalUser = {
      ...selectedUser,
      email: credentials.email || selectedUser.email,
    };
    setUser(finalUser);
    localStorage.setItem('academic_analyzer_user', JSON.stringify(finalUser));
    return finalUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('academic_analyzer_user');
    localStorage.removeItem('academic_analyzer_token');
  };

  const switchRole = (newRole) => {
    login(newRole);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: Boolean(user), login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
