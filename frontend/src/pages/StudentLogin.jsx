import React from 'react';
import Login from './Login';

/**
 * Student Login View
 * Displays student authentication with the exact same visual design,
 * ambient glows, institutional branding, and layout as Faculty and Admin / HOD.
 */
export default function StudentLogin({ onSwitchToStaff, onLoginSuccess }) {
  return (
    <Login
      initialRole="student"
      onLoginSuccess={onLoginSuccess}
      onSwitchToStaff={onSwitchToStaff}
    />
  );
}
