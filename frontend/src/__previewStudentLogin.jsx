// TEMPORARY preview entry used only for visual verification. Safe to delete.
import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import StudentLogin from './pages/StudentLogin';

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <StudentLogin onSwitchToStaff={() => {}} onLoginSuccess={() => {}} />
  </AuthProvider>
);

// When loaded with #otp, submit the sample credentials so the OTP step can be
// screenshotted without manual interaction.
if (window.location.hash === '#otp') {
  const setValue = (selector, value) => {
    const el = document.querySelector(selector);
    if (!el) return;
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(el, value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  };

  setTimeout(() => {
    setValue('#student-regno', '711023243051');
    setValue('#student-email', 'sweatharavi21@gmail.com');
  }, 600);

  setTimeout(() => {
    document.querySelector('form')?.requestSubmit();
  }, 1000);
}
