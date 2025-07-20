import React, { useState } from 'react';

interface LoginPageProps {
  onLogin: (user: any, token: string, progress: any) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  // Registration fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEducation, setRegEducation] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regAvatarUrl, setRegAvatarUrl] = useState('');
  const [regAge, setRegAge] = useState('');
  const [regGender, setRegGender] = useState('');
  const [regLocation, setRegLocation] = useState('');
  const [regInterests, setRegInterests] = useState('');
  // Login fields
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  // UI state
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const educationOptions = [
    'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
    'Class 11', 'Class 12', 'Undergraduate', 'Graduate', 'Postgraduate', 'Other'
  ];

  const [registerStep, setRegisterStep] = useState(1);
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Validation helpers
  // General email validation regex (RFC 5322 Official Standard)
  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone: string) => /^\+\d{1,3}\d{10}$/.test(phone);
  const validateName = (name: string) => name.trim().length > 0;
  const validateEducation = (education: string) => educationOptions.includes(education);
  const validateAge = (age: string) => !!age && Number(age) > 0;
  const validateGender = (gender: string) => ['Male', 'Female', 'Other'].includes(gender);
  const validateInterests = (interests: string) => interests.trim().length > 0;
  const validatePassword = (pw: string) => pw.length >= 6;

  const isStep1Valid =
    validateName(regName) &&
    validateEmail(regEmail) &&
    validatePhone(regPhone) &&
    validateEducation(regEducation) &&
    validateAge(regAge) &&
    validateGender(regGender) &&
    validateInterests(regInterests);

  const isStep2Valid = validatePassword(regPassword) && regPassword === regConfirmPassword;

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  // Register
  const handleRegister = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          phone: regPhone,
          education: regEducation,
          password: regPassword,
          avatarUrl: regAvatarUrl,
          age: regAge ? Number(regAge) : undefined,
          gender: regGender,
          location: regLocation,
          interests: regInterests.split(',').map(s => s.trim()).filter(Boolean),
        }),
      });
      if (res.ok) {
        setMode('login');
        setError('Registration successful! Please log in.');
        setRegName('');
        setRegEmail('');
        setRegPhone('');
        setRegEducation('');
        setRegPassword('');
      } else {
        const data = await res.json();
        setError(data.error || 'Registration failed');
      }
    } catch {
      setError('Network error');
    }
    setLoading(false);
  };

  // Login
  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrPhone: loginId, password: loginPassword }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('token', data.token);
        onLogin(data.user, data.token, data.progress);
      } else {
        const data = await res.json();
        setError(data.error || 'Login failed');
      }
    } catch {
      setError('Network error');
    }
    setLoading(false);
  };

  // Add a handler for Enter key
  const handleRegisterKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (registerStep === 1 && isStep1Valid) setRegisterStep(2);
      else if (registerStep === 2 && isStep2Valid) handleRegister();
    }
  };
  const handleLoginKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && loginId && loginPassword) handleLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="bg-white/90 rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Welcome to Lingo
        </h2>
        <div className="flex justify-center mb-6">
          <button
            className={`px-4 py-2 rounded-l-xl font-semibold ${mode === 'login' ? 'bg-purple-500 text-white' : 'bg-purple-100 text-purple-700'}`}
            onClick={() => setMode('login')}
            disabled={loading}
          >
            Login
          </button>
          <button
            className={`px-4 py-2 rounded-r-xl font-semibold ${mode === 'register' ? 'bg-pink-500 text-white' : 'bg-pink-100 text-pink-700'}`}
            onClick={() => setMode('register')}
            disabled={loading}
          >
            Register
          </button>
        </div>
        {mode === 'register' ? (
          <>
            {registerStep === 1 ? (
              <>
                <input
                  className="w-full mb-3 p-3 rounded-xl border-2 border-purple-200 focus:ring-2 focus:ring-purple-400"
                  placeholder="Full Name"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  type="text"
                  disabled={loading}
                  onKeyDown={handleRegisterKeyDown}
                />
                {!validateName(regName) && regName && <div className="text-red-500 text-xs mb-2">Enter your name</div>}
                <input
                  className="w-full mb-3 p-3 rounded-xl border-2 border-purple-200 focus:ring-2 focus:ring-purple-400"
                  placeholder="Email"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  type="email"
                  disabled={loading}
                  onKeyDown={handleRegisterKeyDown}
                />
                {!validateEmail(regEmail) && regEmail && <div className="text-red-500 text-xs mb-2">Enter a valid email</div>}
                <input
                  className="w-full mb-3 p-3 rounded-xl border-2 border-purple-200 focus:ring-2 focus:ring-purple-400"
                  placeholder="Phone Number (e.g. +911234567890)"
                  value={regPhone}
                  onChange={e => setRegPhone(e.target.value)}
                  type="text"
                  disabled={loading}
                  onKeyDown={handleRegisterKeyDown}
                />
                {!validatePhone(regPhone) && regPhone && <div className="text-red-500 text-xs mb-2">Enter a valid phone with country code and 10 digits</div>}
                <select
                  className="w-full mb-3 p-3 rounded-xl border-2 border-purple-200 focus:ring-2 focus:ring-purple-400"
                  value={regEducation}
                  onChange={e => setRegEducation(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Select Education</option>
                  {educationOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                {!validateEducation(regEducation) && regEducation && <div className="text-red-500 text-xs mb-2">Select your education</div>}
                <input
                  className="w-full mb-3 p-3 rounded-xl border-2 border-purple-200 focus:ring-2 focus:ring-purple-400"
                  placeholder="Age"
                  value={regAge}
                  onChange={e => setRegAge(e.target.value.replace(/[^0-9]/g, ''))}
                  type="number"
                  min="1"
                  disabled={loading}
                  onKeyDown={handleRegisterKeyDown}
                />
                {!validateAge(regAge) && regAge && <div className="text-red-500 text-xs mb-2">Enter a valid age</div>}
                <div className="flex items-center mb-3 space-x-4">
                  <label className="font-medium">Gender:</label>
                  <label className="flex items-center space-x-1">
                    <input type="radio" name="gender" value="Male" checked={regGender === 'Male'} onChange={e => setRegGender(e.target.value)} disabled={loading} />
                    <span>Male</span>
                  </label>
                  <label className="flex items-center space-x-1">
                    <input type="radio" name="gender" value="Female" checked={regGender === 'Female'} onChange={e => setRegGender(e.target.value)} disabled={loading} />
                    <span>Female</span>
                  </label>
                  <label className="flex items-center space-x-1">
                    <input type="radio" name="gender" value="Other" checked={regGender === 'Other'} onChange={e => setRegGender(e.target.value)} disabled={loading} />
                    <span>Other</span>
                  </label>
                </div>
                {!validateGender(regGender) && regGender && <div className="text-red-500 text-xs mb-2">Select gender</div>}
                <textarea
                  className="w-full mb-3 p-3 rounded-xl border-2 border-purple-200 focus:ring-2 focus:ring-purple-400"
                  placeholder="Interests (comma separated)"
                  value={regInterests}
                  onChange={e => setRegInterests(e.target.value)}
                  disabled={loading}
                />
                {!validateInterests(regInterests) && regInterests && <div className="text-red-500 text-xs mb-2">Enter at least one interest</div>}
                <button
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl p-3 font-semibold disabled:opacity-60"
                  onClick={() => setRegisterStep(2)}
                  disabled={loading || !isStep1Valid}
                >
                  Next
                </button>
              </>
            ) : (
              <>
                <div className="mb-4 p-3 rounded-xl bg-purple-50 border border-purple-200">
                  <div className="mb-1"><b>Name:</b> {regName}</div>
                  <div className="mb-1"><b>Email:</b> {regEmail}</div>
                  <div className="mb-1"><b>Phone:</b> {regPhone}</div>
                </div>
                <input
                  className="w-full mb-3 p-3 rounded-xl border-2 border-purple-200 focus:ring-2 focus:ring-purple-400"
                  placeholder="Password (min 6 chars)"
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  type="password"
                  disabled={loading}
                  onKeyDown={handleRegisterKeyDown}
                />
                {!validatePassword(regPassword) && regPassword && <div className="text-red-500 text-xs mb-2">Password must be at least 6 characters</div>}
                <input
                  className="w-full mb-3 p-3 rounded-xl border-2 border-purple-200 focus:ring-2 focus:ring-purple-400"
                  placeholder="Confirm Password"
                  value={regConfirmPassword}
                  onChange={e => setRegConfirmPassword(e.target.value)}
                  type="password"
                  disabled={loading}
                  onKeyDown={handleRegisterKeyDown}
                />
                {regConfirmPassword && regPassword !== regConfirmPassword && <div className="text-red-500 text-xs mb-2">Passwords do not match</div>}
                <div className="flex justify-between">
                  <button
                    className="bg-gray-200 text-gray-700 rounded-xl px-4 py-2 font-semibold"
                    onClick={() => setRegisterStep(1)}
                    disabled={loading}
                  >Back</button>
                  <button
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl px-4 py-2 font-semibold disabled:opacity-60"
                    onClick={handleRegister}
                    disabled={loading || !isStep2Valid}
                  >{loading ? 'Registering...' : 'Register'}</button>
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <input
              className="w-full mb-4 p-3 rounded-xl border-2 border-purple-200 focus:ring-2 focus:ring-purple-400"
              placeholder="Email or Phone Number"
              value={loginId}
              onChange={e => setLoginId(e.target.value)}
              type="text"
              disabled={loading}
              onKeyDown={handleLoginKeyDown}
            />
            <input
              className="w-full mb-4 p-3 rounded-xl border-2 border-purple-200 focus:ring-2 focus:ring-purple-400"
              placeholder="Password"
              value={loginPassword}
              onChange={e => setLoginPassword(e.target.value)}
              type="password"
              disabled={loading}
              onKeyDown={handleLoginKeyDown}
            />
            <button
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl p-3 font-semibold disabled:opacity-60"
              onClick={handleLogin}
              disabled={loading || !loginId || !loginPassword}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </>
        )}
        {error && <div className="text-red-500 mt-4 text-center">{error}</div>}
      </div>
    </div>
  );
};

export default LoginPage; 