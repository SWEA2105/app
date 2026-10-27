import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  GraduationCap, 
  ShieldCheck, 
  UserCheck, 
  Lock, 
  Mail, 
  Hash,
  ArrowRight, 
  ArrowLeft,
  BookOpenCheck, 
  FileSpreadsheet,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Info,
  Loader2,
  Sparkles,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CollegeBrand from '../components/common/CollegeBrand';

const SAMPLE_STUDENT = {
  regNo: '711023243051',
  email: 'sweatharavi21@gmail.com',
  otp: '1234',
  name: 'Sweatha Ravi',
  branch: 'B.E. Computer Science & Engineering (Semester 5)',
};

const EMPTY_4_DIGITS = ['', '', '', ''];

export default function Login({ onLoginSuccess, initialRole = 'faculty', onSwitchToStaff }) {
  const { login, requestStudentOtp, studentLogin } = useAuth();
  const [role, setRole] = useState(initialRole);

  // Faculty & Admin form state
  const [email, setEmail] = useState('meenakshi.v@college.edu');
  const [password, setPassword] = useState('••••••••••••');

  // Student form state
  const [studentStep, setStudentStep] = useState('credentials'); // 'credentials' | 'otp'
  const [studentRegNo, setStudentRegNo] = useState('711023243051');
  const [studentEmail, setStudentEmail] = useState('sweatharavi21@gmail.com');
  const [studentDigits, setStudentDigits] = useState(EMPTY_4_DIGITS);
  const [studentMaskedEmail, setStudentMaskedEmail] = useState('');
  const [studentDevOtp, setStudentDevOtp] = useState(null);
  const [studentCooldown, setStudentCooldown] = useState(0);
  const [studentExpiresIn, setStudentExpiresIn] = useState(0);

  // Common UI states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const otpRefs = useRef([]);
  const autoVerifiedRef = useRef(false);

  // Keep role synchronized if prop changes
  useEffect(() => {
    if (initialRole) {
      setRole(initialRole);
      if (initialRole === 'faculty') {
        setEmail('meenakshi.v@college.edu');
      } else if (initialRole === 'admin') {
        setEmail('hod.cse@college.edu');
      }
    }
  }, [initialRole]);

  // Resend cooldown timer for student OTP
  useEffect(() => {
    if (studentCooldown <= 0) return undefined;
    const timer = setInterval(() => {
      setStudentCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [studentCooldown]);

  // Code expiration timer for student OTP
  useEffect(() => {
    if (studentExpiresIn <= 0) return undefined;
    const timer = setInterval(() => {
      setStudentExpiresIn((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [studentExpiresIn]);

  const otpValue = useMemo(() => studentDigits.join(''), [studentDigits]);
  const isOtpComplete = studentDigits.every((d) => d.length === 1);

  // Auto-submit OTP when all 4 digits are entered
  useEffect(() => {
    if (role !== 'student' || studentStep !== 'otp' || !isOtpComplete || autoVerifiedRef.current) return;
    autoVerifiedRef.current = true;
    handleStudentVerifyOtp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, studentStep, isOtpComplete]);

  const handleRoleTabChange = (newRole) => {
    setRole(newRole);
    setError('');
    setNotice('');
    if (newRole === 'faculty') {
      setEmail('meenakshi.v@college.edu');
      if (onSwitchToStaff) onSwitchToStaff('faculty');
    } else if (newRole === 'admin') {
      setEmail('hod.cse@college.edu');
      if (onSwitchToStaff) onSwitchToStaff('admin');
    }
  };

  // Staff (Faculty / Admin) Form Submit
  const handleStaffSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setTimeout(() => {
      try {
        login(role, { email });
        setIsLoading(false);
        if (onLoginSuccess) onLoginSuccess();
      } catch (err) {
        setIsLoading(false);
        setError(err?.message || 'Login failed. Please check your credentials.');
      }
    }, 400);
  };

  // Student Step 1: Request OTP
  const handleStudentRequestOtp = async (e) => {
    e?.preventDefault();
    setError('');
    setNotice('');

    const trimmedReg = studentRegNo.trim();
    const trimmedEmail = studentEmail.trim();

    if (!trimmedReg) {
      setError('Please enter your Student Register Number.');
      return;
    }
    if (!trimmedEmail) {
      setError('Please enter your Registered Student Email ID.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await requestStudentOtp(trimmedReg, trimmedEmail);
      const data = res?.data;

      setStudentStep('otp');
      setStudentDigits(EMPTY_4_DIGITS.slice());
      setStudentMaskedEmail(data?.maskedEmail || trimmedEmail);
      setStudentDevOtp(data?.devOtp || '1234');
      setStudentCooldown(data?.resendAfterSeconds || 45);
      setStudentExpiresIn(data?.expiresInSeconds || 300);
      autoVerifiedRef.current = false;

      if (data?.delivery === 'email') {
        setNotice(`A 4-digit verification code has been dispatched to ${data.maskedEmail}.`);
      } else {
        setNotice('Verification code generated. Use code 1234 to sign in.');
      }

      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      setError(err?.message || 'Unable to send verification OTP. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Student Step 2: Verify OTP
  const handleStudentVerifyOtp = async (e) => {
    e?.preventDefault();
    if (isLoading) return;

    if (!isOtpComplete) {
      setError('Please enter all 4 digits of the verification code.');
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      const user = await studentLogin({
        regNo: studentRegNo.trim(),
        email: studentEmail.trim(),
        otp: otpValue,
      });
      if (user && onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err) {
      autoVerifiedRef.current = false;
      setError(err?.message || 'Invalid verification code. Please check and try again.');
      setStudentDigits(EMPTY_4_DIGITS.slice());
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } finally {
      setIsLoading(false);
    }
  };

  // Student OTP digit handlers
  const handleDigitChange = (index, value) => {
    const numeric = value.replace(/\D/g, '');
    if (!numeric) {
      setStudentDigits((prev) => prev.map((d, i) => (i === index ? '' : d)));
      return;
    }

    const next = [...studentDigits];
    let cursor = index;
    for (const char of numeric.slice(0, 4 - index)) {
      next[cursor] = char;
      cursor += 1;
    }
    setStudentDigits(next);

    if (cursor < 4) {
      otpRefs.current[cursor]?.focus();
    }
  };

  const handleDigitKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !studentDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (event.key === 'ArrowLeft' && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (event.key === 'ArrowRight' && index < 3) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleDigitPaste = (event) => {
    event.preventDefault();
    const pasted = (event.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 4);
    if (!pasted) return;

    const next = EMPTY_4_DIGITS.slice();
    pasted.split('').forEach((char, i) => {
      next[i] = char;
    });
    setStudentDigits(next);

    const focusIdx = Math.min(pasted.length, 3);
    otpRefs.current[focusIdx]?.focus();
  };

  const handleBackToCredentials = () => {
    setStudentStep('credentials');
    setError('');
    setNotice('');
    setStudentDevOtp(null);
    autoVerifiedRef.current = false;
    setStudentDigits(EMPTY_4_DIGITS.slice());
  };

  const handleResendOtp = async () => {
    if (studentCooldown > 0 || isLoading) return;
    await handleStudentRequestOtp();
  };

  // Auto-fill demo credentials
  const handleAutoFillDemo = () => {
    setError('');
    setNotice('');
    if (role === 'faculty') {
      setEmail('meenakshi.v@college.edu');
      setPassword('••••••••••••');
    } else if (role === 'admin') {
      setEmail('hod.cse@college.edu');
      setPassword('••••••••••••');
    } else if (role === 'student') {
      setStudentRegNo(SAMPLE_STUDENT.regNo);
      setStudentEmail(SAMPLE_STUDENT.email);
      if (studentStep === 'otp') {
        setStudentDigits(SAMPLE_STUDENT.otp.split(''));
      }
    }
  };

  // 1-Click Fast demo logins
  const handleQuickLogin = (selectedRole) => {
    setError('');
    setIsLoading(true);
    setTimeout(() => {
      login(selectedRole);
      setIsLoading(false);
      if (onLoginSuccess) onLoginSuccess();
    }, 300);
  };

  const handleInstantStudentLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      const user = await studentLogin({
        regNo: SAMPLE_STUDENT.regNo,
        email: SAMPLE_STUDENT.email,
        otp: SAMPLE_STUDENT.otp,
      });
      if (user && onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err) {
      setError(err?.message || 'Login attempt failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const expiryMinutes = Math.floor(studentExpiresIn / 60);
  const expirySeconds = String(studentExpiresIn % 60).padStart(2, '0');

  return (
    <div className="min-h-full min-h-[100dvh] bg-slate-950 flex flex-col justify-center py-6 sm:py-12 px-3.5 sm:px-6 lg:px-8 relative overflow-x-hidden pt-[max(env(safe-area-inset-top,0px),1rem)] pb-[max(env(safe-area-inset-bottom,0px),1.5rem)]">
      {/* Background ambient decorative glows */}
      <div className="absolute top-1/4 left-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* Institutional Top Header: Clean, professional white card with blue & green accents */}
      <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10 px-2 mb-4 sm:mb-6">
        <CollegeBrand variant="login-card" />
      </div>

      <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900/85 backdrop-blur-xl border border-slate-800/80 py-6 sm:py-8 px-4 sm:px-10 shadow-2xl rounded-2xl sm:rounded-3xl glass-panel space-y-5 sm:space-y-6">
          
          {/* Role selector tabs: Faculty | Admin / HOD | Student */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => handleRoleTabChange('faculty')}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-1 sm:px-2 rounded-lg text-[11px] sm:text-xs font-semibold transition cursor-pointer select-none active:scale-95 ${
                role === 'faculty'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              style={{ minHeight: '42px' }}
            >
              <UserCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span>Faculty</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleTabChange('admin')}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-1 sm:px-2 rounded-lg text-[11px] sm:text-xs font-semibold transition cursor-pointer select-none active:scale-95 ${
                role === 'admin'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              style={{ minHeight: '42px' }}
            >
              <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span>Admin/HOD</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleTabChange('student')}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-1 sm:px-2 rounded-lg text-[11px] sm:text-xs font-semibold transition cursor-pointer select-none active:scale-95 ${
                role === 'student'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              style={{ minHeight: '42px' }}
            >
              <GraduationCap className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span>Student</span>
            </button>
          </div>

          {/* Error & Notice Alerts */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {notice && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>{notice}</span>
            </div>
          )}

          {/* FACULTY & ADMIN / HOD LOGIN FORM */}
          {(role === 'faculty' || role === 'admin') && (
            <form onSubmit={handleStaffSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Official Institutional Email
                </label>
                <div className="relative">
                  <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                    placeholder="name@college.edu"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-slate-300">
                    Password
                  </label>
                  <a
                    href="#demo"
                    onClick={(e) => { e.preventDefault(); handleAutoFillDemo(); }}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300"
                  >
                    Auto-fill demo credentials
                  </a>
                </div>
                <div className="relative">
                  <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition font-mono"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0" />
                  <span>Keep me signed in</span>
                </label>
                <span className="text-slate-500 text-[11px]">Protected by Supabase Auth</span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold tracking-wide shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In as {role === 'admin' ? 'Admin / HOD' : 'Faculty'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STUDENT LOGIN FORM (STEP 1: Credentials) */}
          {role === 'student' && studentStep === 'credentials' && (
            <form onSubmit={handleStudentRequestOtp} className="space-y-4">
              <div>
                <label htmlFor="student-regno" className="block text-xs font-medium text-slate-300 mb-1.5">
                  Student Register Number
                </label>
                <div className="relative">
                  <Hash className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    id="student-regno"
                    type="text"
                    inputMode="numeric"
                    value={studentRegNo}
                    onChange={(e) => setStudentRegNo(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition font-mono"
                    placeholder="e.g. 711023243051"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="student-email" className="block text-xs font-medium text-slate-300">
                    Registered Student Email ID
                  </label>
                  <a
                    href="#demo"
                    onClick={(e) => { e.preventDefault(); handleAutoFillDemo(); }}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300"
                  >
                    Auto-fill demo credentials
                  </a>
                </div>
                <div className="relative">
                  <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    id="student-email"
                    type="email"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                    placeholder="sweatharavi21@gmail.com"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0" />
                  <span>Keep me signed in</span>
                </label>
                <span className="text-slate-500 text-[11px]">Protected by Student OTP</span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold tracking-wide shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Sending OTP...</span>
                  </>
                ) : (
                  <>
                    <span>Send OTP to Email</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STUDENT LOGIN FORM (STEP 2: OTP Verification) */}
          {role === 'student' && studentStep === 'otp' && (
            <form onSubmit={handleStudentVerifyOtp} className="space-y-4">
              <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-indigo-300 text-xs flex items-center gap-2">
                <Info className="h-4 w-4 shrink-0 text-indigo-400" />
                <span>
                  Enter 4-digit code sent to <strong className="text-white font-medium">{studentMaskedEmail || studentEmail}</strong>
                </span>
              </div>

              {studentDevOtp && (
                <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs flex items-center justify-between">
                  <span>Demo verification code:</span>
                  <span className="font-mono text-white text-xs tracking-widest bg-cyan-900/60 px-2 py-0.5 rounded border border-cyan-500/40 font-bold">
                    {studentDevOtp}
                  </span>
                </div>
              )}

              <div className="py-2">
                <label className="block text-xs font-medium text-slate-300 text-center mb-3">
                  Enter 4-Digit Verification Code
                </label>
                <div className="flex justify-center gap-3">
                  {studentDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { otpRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(index, e.target.value)}
                      onKeyDown={(e) => handleDigitKeyDown(index, e)}
                      onPaste={handleDigitPaste}
                      className={`w-12 h-12 text-center text-lg font-bold font-mono rounded-xl border transition outline-none ${
                        digit
                          ? 'bg-slate-900 border-indigo-500 text-white shadow-md shadow-indigo-500/20'
                          : 'bg-slate-950/90 border-slate-800 text-slate-300 focus:border-indigo-500'
                      }`}
                      aria-label={`Digit ${index + 1}`}
                      autoComplete={index === 0 ? 'one-time-code' : 'off'}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <button
                  type="button"
                  onClick={handleBackToCredentials}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Change Reg No</span>
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={studentCooldown > 0 || isLoading}
                  className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 disabled:text-slate-500 transition cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>{studentCooldown > 0 ? `Resend in ${studentCooldown}s` : 'Resend OTP'}</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading || !isOtpComplete}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold tracking-wide shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Verifying OTP...</span>
                  </>
                ) : (
                  <>
                    <span>Verify OTP & Sign In</span>
                    <CheckCircle2 className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="text-center text-[11px] text-slate-500">
                Code expires in{' '}
                <span className="font-mono text-amber-300">
                  {expiryMinutes}:{expirySeconds}
                </span>
              </div>
            </form>
          )}

          {/* Quick Demo Login Fast-Pills */}
          <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
            <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400 text-center uppercase tracking-wider">
              Instant Demo Access
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('faculty')}
                className={`p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border text-left transition group cursor-pointer active:scale-98 ${
                  role === 'faculty' ? 'border-indigo-500/50 bg-indigo-950/20' : 'border-slate-800'
                }`}
                style={{ minHeight: '44px' }}
              >
                <div className="text-[11px] font-semibold text-indigo-400 group-hover:text-indigo-300">
                  Demo Faculty
                </div>
                <div className="text-[10px] text-slate-400 truncate">Dr. V. Meenakshi (CSE)</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className={`p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border text-left transition group cursor-pointer active:scale-98 ${
                  role === 'admin' ? 'border-cyan-500/50 bg-cyan-950/20' : 'border-slate-800'
                }`}
                style={{ minHeight: '44px' }}
              >
                <div className="text-[11px] font-semibold text-cyan-400 group-hover:text-cyan-300">
                  Demo Admin / HOD
                </div>
                <div className="text-[10px] text-slate-400 truncate">Dr. R. Ramanathan</div>
              </button>
              <button
                type="button"
                onClick={handleInstantStudentLogin}
                className={`p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border text-left transition group cursor-pointer active:scale-98 ${
                  role === 'student' ? 'border-emerald-500/50 bg-emerald-950/20' : 'border-slate-800'
                }`}
                style={{ minHeight: '44px' }}
              >
                <div className="text-[11px] font-semibold text-emerald-400 group-hover:text-emerald-300">
                  Demo Student
                </div>
                <div className="text-[10px] text-slate-400 truncate">Sweatha Ravi (711023243051)</div>
              </button>
            </div>
          </div>
        </div>

        {/* Feature Highlights beneath Card */}
        <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-[11px] text-slate-400">
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/50">
            <BookOpenCheck className="h-4 w-4 text-indigo-400 shrink-0" />
            <span>IA-1 &amp; IA-2 Continuous Evaluation</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/50">
            <FileSpreadsheet className="h-4 w-4 text-cyan-400 shrink-0" />
            <span>University PDF Result &amp; Arrear Tracker</span>
          </div>
        </div>
      </div>
    </div>
  );
}
