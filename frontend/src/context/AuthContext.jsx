import React, { createContext, useContext, useState } from 'react';
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
  // Start with saved user, or null if unauthenticated so login screen is displayed
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('academic_analyzer_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
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

  /**
   * Step 1 of student sign-in: request OTP.
   * Dispatches to backend or uses mock fallback for sample credentials.
   */
  const requestStudentOtp = async (regNo, email) => {
    try {
      const res = await authApi.requestStudentOtp(regNo, email);
      if (res?.success === false) {
        throw new Error(res?.message || 'Unable to send the verification code.');
      }
      return res;
    } catch (err) {
      // In case of network error or backend standby, verify against sample credentials
      const cleanReg = (regNo || '').trim();
      const cleanEmail = (email || '').trim().toLowerCase();
      if (cleanReg === '711023243051' && cleanEmail === 'sweatharavi21@gmail.com') {
        return {
          success: true,
          message: 'Verification code generated for s***********1@gmail.com',
          data: {
            regNo: '711023243051',
            email: 'sweatharavi21@gmail.com',
            maskedEmail: 's***********1@gmail.com',
            otpLength: 4,
            expiresInSeconds: 300,
            resendAfterSeconds: 45,
            delivery: 'development',
            devOtp: '1234',
          },
        };
      }
      throw err;
    }
  };

  /**
   * Step 2 of student sign-in: verify OTP and establish session.
   */
  const studentLogin = async ({ regNo, email, otp }) => {
    try {
      const res = await authApi.verifyStudentOtp({ regNo, email, otp });
      const token = res?.data?.access_token;
      if (token) {
        const userObj = {
          ...res.data.user,
          student: res.data.student,
          token,
        };
        setUser(userObj);
        localStorage.setItem('academic_analyzer_token', token);
        localStorage.setItem('academic_analyzer_user', JSON.stringify(userObj));
        return userObj;
      }
    } catch (err) {
      // Resilient local fallback for sample credentials
      const cleanReg = (regNo || '').trim();
      const cleanEmail = (email || '').trim().toLowerCase();
      const cleanOtp = (otp || '').trim();

      if (cleanReg === '711023243051' && cleanEmail === 'sweatharavi21@gmail.com' && cleanOtp === '1234') {
        const mockStudent = {
          id: 's12',
          regNo: '711023243051',
          name: 'Sweatha Ravi',
          email: 'sweatharavi21@gmail.com',
          role: 'student',
          department: 'CSE',
          semester: 'sem5',
          section: 'A',
          designation: 'Student (Reg. No. 711023243051)',
          avatar: 'SR',
        };
        const userObj = {
          ...mockStudent,
          student: mockStudent,
          token: 'jwt-student-mock-session-token',
        };
        setUser(userObj);
        localStorage.setItem('academic_analyzer_token', userObj.token);
        localStorage.setItem('academic_analyzer_user', JSON.stringify(userObj));
        return userObj;
      }
      throw err;
    }
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
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        login,
        logout,
        switchRole,
        requestStudentOtp,
        studentLogin,
      }}
    >
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
