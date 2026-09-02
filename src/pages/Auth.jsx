import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

// Password Policy Validation Helper
export function validatePasswordPolicy(password) {
  if (!password) return 'Password is required';
  if (password.length < 8 || password.length > 15) {
    return 'Password must be between 8 and 15 characters long';
  }
  if (/\s/.test(password)) {
    return 'Password cannot contain any spaces';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter (A-Z)';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number (0-9)';
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return 'Password must contain at least one symbol (e.g. @, #, $, %, !)';
  }
  if (!/^[\x20-\x7E]+$/.test(password)) {
    return 'Password must contain standard ASCII characters only';
  }
  return null;
}

export default function Auth({ onLogin }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Modes: 'login', 'register', 'forgot'
  const [mode, setMode] = useState(searchParams.get('mode') === 'register' ? 'register' : 'login');
  const [registerRole, setRegisterRole] = useState('farmer');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  // Forgot Password States
  const [forgotStep, setForgotStep] = useState(1);
  const [resetChannel, setResetChannel] = useState('email'); // 'email' | 'phone'
  const [resetTarget, setResetTarget] = useState('');
  const [userOtpInput, setUserOtpInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Google OAuth Modal state
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');

  // Validation & Feedback
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initialRole = searchParams.get('role');
    if (initialRole && ['farmer', 'landowner', 'buyer'].includes(initialRole)) {
      setRegisterRole(initialRole);
    }
  }, [searchParams]);

  // Email format validation
  const isValidEmail = (val) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(String(val).trim());
  };

  const handleSendVerificationCode = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMsg('');

    if (!resetTarget || !isValidEmail(resetTarget)) {
      setErrors({ resetTarget: 'Please enter a valid Gmail address (e.g. name@gmail.com)' });
      return;
    }

    setLoading(true);

    const res = await api.sendForgotPasswordOtp(resetTarget.trim(), 'email');
    setLoading(false);

    if (!res.success) {
      setServerError(res.message);
      return;
    }

    setForgotStep(2);
    setSuccessMsg(res.message);
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMsg('');

    if (!userOtpInput || userOtpInput.trim().length !== 6) {
      setErrors({ otp: 'Please enter the 6-digit verification code sent to your inbox / SMS.' });
      return;
    }

    const pwdError = validatePasswordPolicy(newPassword);
    if (pwdError) {
      setErrors({ newPassword: pwdError });
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match. Please re-enter passwords.' });
      return;
    }

    setLoading(true);

    const res = await api.verifyOtpAndResetPassword({
      target: resetTarget.trim(),
      otp: userOtpInput.trim(),
      newPassword
    });

    setLoading(false);

    if (res.success) {
      setSuccessMsg(res.message);
      setMode('login');
      setPassword(newPassword);
      setForgotStep(1);
    } else {
      setServerError(res.message);
    }
  };

  const handleGoogleAuthSubmit = async (e) => {
    e.preventDefault();
    if (!googleEmail || !isValidEmail(googleEmail)) {
      alert('Please enter a valid Google email account.');
      return;
    }

    const res = await api.googleAuth({
      email: googleEmail.trim(),
      full_name: googleEmail.split('@')[0].replace('.', ' '),
      avatar: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
      role: registerRole
    });

    setShowGoogleModal(false);

    if (onLogin) {
      onLogin(res.user);
    }
    navigate(`/${res.user.role}/dashboard`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMsg('');

    const errs = {};

    if (!email || !isValidEmail(email)) {
      errs.email = 'Please enter a valid email address (e.g. name@domain.com)';
    }

    // Enforce Password Policy on Login & Register
    const pwdErr = validatePasswordPolicy(password);
    if (pwdErr) {
      errs.password = pwdErr;
    }

    if (mode === 'register') {
      if (!fullName || fullName.trim().length < 3) {
        errs.fullName = 'Full name must be at least 3 characters';
      }

      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phone || !phoneRegex.test(phone.trim().replace(/\D/g, ''))) {
        errs.phone = 'Please enter a valid 10-digit mobile number';
      }
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await api.login({ email: email.trim(), password });
        if (!res.success) {
          setServerError(res.message || 'Invalid credentials. Please check email and password.');
          setLoading(false);
          return;
        }

        if (onLogin) {
          onLogin(res.user);
        }
        navigate(`/${res.user.role}/dashboard`);
      } else {
        const res = await api.register({
          full_name: fullName.trim(),
          email: email.trim(),
          password,
          phone: phone.trim(),
          role: registerRole
        });

        if (!res.success) {
          setServerError(res.message || 'Registration failed. Please try again.');
          setLoading(false);
          return;
        }

        if (onLogin) {
          onLogin(res.user);
        }
        navigate(`/${res.user.role}/dashboard`);
      }
    } catch (err) {
      setServerError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8">
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden bg-white">
              {/* Header Banner */}
              <div className="bg-success p-4 text-white text-center position-relative">
                <h3 className="fw-black mb-1">🌿 AgriBridge</h3>
                <p className="text-white-50 small mb-0">Connecting Farmers, Landowners & Opportunities</p>
              </div>

              <div className="p-4 p-md-5">
                {/* Login / Register Mode Toggle */}
                {mode !== 'forgot' && (
                  <div className="d-flex border-bottom mb-4">
                    <button 
                      type="button"
                      className={`btn border-0 rounded-0 pb-2 fw-bold text-success flex-grow-1 ${mode === 'login' ? 'border-bottom border-success border-3' : 'text-muted'}`}
                      onClick={() => {
                        setMode('login');
                        setErrors({});
                        setServerError('');
                        setSuccessMsg('');
                      }}
                    >
                      Login
                    </button>
                    <button 
                      type="button"
                      className={`btn border-0 rounded-0 pb-2 fw-bold text-success flex-grow-1 ${mode === 'register' ? 'border-bottom border-success border-3' : 'text-muted'}`}
                      onClick={() => {
                        setMode('register');
                        setErrors({});
                        setServerError('');
                        setSuccessMsg('');
                      }}
                    >
                      Register
                    </button>
                  </div>
                )}

                {/* Google OAuth Button */}
                {mode !== 'forgot' && (
                  <div className="mb-4 text-center">
                    <button 
                      type="button"
                      className="btn btn-outline-dark w-100 py-2 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2"
                      onClick={() => setShowGoogleModal(true)}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                      </svg>
                      Continue with Google Account
                    </button>
                    <div className="position-relative my-3">
                      <hr />
                      <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted extra-small">or email & password</span>
                    </div>
                  </div>
                )}

                {/* Alerts */}
                {serverError && (
                  <div className="alert alert-danger d-flex align-items-center gap-2 py-2 mb-4 rounded-3 small">
                    <i className="bi bi-exclamation-triangle-fill fs-5"></i>
                    <div>{serverError}</div>
                  </div>
                )}

                {successMsg && (
                  <div className="alert alert-success d-flex align-items-center gap-2 py-2 mb-4 rounded-3 small">
                    <i className="bi bi-check-circle-fill fs-5"></i>
                    <div>{successMsg}</div>
                  </div>
                )}

                {/* FORGOT PASSWORD WORKFLOW */}
                {mode === 'forgot' ? (
                  <div>
                    <div className="mb-4">
                      <h4 className="fw-bold mb-1">Reset Account Password</h4>
                      <p className="text-muted small">
                        {forgotStep === 1 
                          ? 'Enter your registered Gmail address to receive a 6-digit verification code.' 
                          : 'Enter the 6-digit verification code sent to your Gmail inbox and set your new password.'}
                      </p>
                    </div>

                    {forgotStep === 1 ? (
                      <form onSubmit={handleSendVerificationCode} className="row g-3">
                        <div className="col-12">
                          <label className="form-label fw-bold">
                            Registered Gmail Address *
                          </label>
                          <input 
                            type="email" 
                            required 
                            className={`form-control ${errors.resetTarget ? 'is-invalid' : ''}`}
                            placeholder="e.g. user@gmail.com"
                            value={resetTarget}
                            onChange={(e) => setResetTarget(e.target.value)}
                          />
                          {errors.resetTarget && <div className="invalid-feedback">{errors.resetTarget}</div>}
                        </div>

                        <div className="col-12 mt-4">
                          <button type="submit" className="btn btn-success btn-lg w-100 fw-bold" disabled={loading}>
                            {loading ? 'Sending 6-Digit OTP...' : 'Send OTP to Gmail Inbox'}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <form onSubmit={handleResetPasswordSubmit} className="row g-3">
                        <div className="col-12">
                          <label className="form-label fw-bold">
                            6-Digit OTP Verification Code *
                          </label>
                          <input 
                            type="text" 
                            required 
                            maxLength="6"
                            className={`form-control font-monospace fs-5 text-center ${errors.otp ? 'is-invalid' : ''}`}
                            placeholder="Enter 6-digit OTP code"
                            value={userOtpInput}
                            onChange={(e) => setUserOtpInput(e.target.value)}
                          />
                          <small className="text-muted extra-small d-block mt-1">
                            Check your Gmail Inbox for the 6-digit verification code.
                          </small>
                          {errors.otp && <div className="invalid-feedback">{errors.otp}</div>}
                        </div>

                        <div className="col-12">
                          <label className="form-label fw-bold">New Password *</label>
                          <input 
                            type="password" 
                            required 
                            className={`form-control ${errors.newPassword ? 'is-invalid' : ''}`}
                            placeholder="e.g. NewPass@123"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                          />
                          <small className="text-muted extra-small d-block mt-1">
                            Must be 8-15 characters, no spaces, at least 1 uppercase letter, 1 number, and 1 symbol.
                          </small>
                          {errors.newPassword && <div className="invalid-feedback">{errors.newPassword}</div>}
                        </div>

                        <div className="col-12">
                          <label className="form-label fw-bold">Confirm New Password *</label>
                          <input 
                            type="password" 
                            required 
                            className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                            placeholder="Re-enter new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                          />
                          {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                        </div>

                        <div className="col-12 mt-4">
                          <button type="submit" className="btn btn-success btn-lg w-100 fw-bold" disabled={loading}>
                            {loading ? 'Updating Password...' : 'Save New Password'}
                          </button>
                        </div>

                        <div className="col-12 d-flex justify-content-between align-items-center mt-3 pt-2 border-top extra-small">
                          <button
                            type="button"
                            className="btn btn-link text-decoration-none p-0 text-success fw-bold"
                            onClick={handleSendVerificationCode}
                            disabled={loading}
                          >
                            {loading ? 'Resending Code...' : '🔄 Resend Verification Code'}
                          </button>
                          <button
                            type="button"
                            className="btn btn-link text-decoration-none p-0 text-muted"
                            onClick={() => { setForgotStep(1); setServerError(''); setSuccessMsg(''); }}
                          >
                            ← Change Target / Method
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                ) : (
                  /* LOGIN & REGISTER FORMS */
                  <div>
                    {/* Role Choice on Register */}
                    {mode === 'register' && (
                      <div className="mb-4">
                        <label className="form-label text-muted small fw-bold text-uppercase d-block mb-2">
                          Register Account As *
                        </label>
                        <div className="btn-group w-100" role="group">
                          {[
                            ['farmer', '🌾 Farmer'],
                            ['landowner', '🏡 Landowner'],
                            ['buyer', '🛒 Buyer']
                          ].map(([r, label]) => (
                            <button
                              key={r}
                              type="button"
                              className={`btn ${registerRole === r ? 'btn-success' : 'btn-outline-success'}`}
                              onClick={() => setRegisterRole(r)}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="row g-3" noValidate>
                      {mode === 'register' && (
                        <div className="col-12">
                          <label className="form-label fw-bold">Full Name *</label>
                          <input 
                            type="text" 
                            required 
                            className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
                            placeholder="e.g. Ramesh Babu"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                          />
                          {errors.fullName && <div className="invalid-feedback">{errors.fullName}</div>}
                        </div>
                      )}

                      <div className="col-12">
                        <label className="form-label fw-bold">Email Address *</label>
                        <input 
                          type="email" 
                          required 
                          className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                          placeholder={mode === 'register' ? `${registerRole}@agribridge.com` : "name@domain.com"}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                        {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                      </div>

                      {mode === 'register' && (
                        <div className="col-12">
                          <label className="form-label fw-bold">Phone Number *</label>
                          <input 
                            type="tel" 
                            required 
                            className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                            placeholder="e.g. 9876543210"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                          />
                          {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                        </div>
                      )}

                      <div className="col-12">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <label className="form-label fw-bold mb-0">Password *</label>
                          {mode === 'login' && (
                            <button 
                              type="button" 
                              className="btn btn-link p-0 text-success text-decoration-none small"
                              onClick={() => {
                                setMode('forgot');
                                setForgotStep(1);
                                setResetTarget('');
                                setErrors({});
                                setServerError('');
                                setSuccessMsg('');
                              }}
                            >
                              Forgot Password?
                            </button>
                          )}
                        </div>
                        <input 
                          type="password" 
                          required 
                          className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                          placeholder="e.g. AgriPass@123"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <small className="text-muted extra-small d-block mt-1">
                          Must be 8-15 characters, no spaces, contain 1 uppercase letter, 1 number, and 1 symbol.
                        </small>
                        {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                      </div>

                      <div className="col-12 mt-4">
                        <button type="submit" className="btn btn-success btn-lg w-100 fw-bold" disabled={loading}>
                          {loading ? (
                            <span><span className="spinner-border spinner-border-sm me-2"></span> Processing...</span>
                          ) : mode === 'login' ? (
                            'Sign In to Account'
                          ) : (
                            `Register as ${registerRole.toUpperCase()}`
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Direct Navigation Links */}
                <div className="text-center mt-4 pt-3 border-top small">
                  {mode === 'login' && (
                    <span>
                      Don't have an account?{' '}
                      <button 
                        type="button" 
                        className="btn btn-link p-0 text-success fw-bold text-decoration-none"
                        onClick={() => {
                          setMode('register');
                          setErrors({});
                          setServerError('');
                          setSuccessMsg('');
                        }}
                      >
                        Register Here
                      </button>
                    </span>
                  )}

                  {mode === 'register' && (
                    <span>
                      Already have an account?{' '}
                      <button 
                        type="button" 
                        className="btn btn-link p-0 text-success fw-bold text-decoration-none"
                        onClick={() => {
                          setMode('login');
                          setErrors({});
                          setServerError('');
                          setSuccessMsg('');
                        }}
                      >
                        Login Here
                      </button>
                    </span>
                  )}

                  {mode === 'forgot' && (
                    <span>
                      Remember your password?{' '}
                      <button 
                        type="button" 
                        className="btn btn-link p-0 text-success fw-bold text-decoration-none"
                        onClick={() => {
                          setMode('login');
                          setErrors({});
                          setServerError('');
                          setSuccessMsg('');
                        }}
                      >
                        Back to Login
                      </button>
                    </span>
                  )}
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Google OAuth Modal Simulation */}
      {showGoogleModal && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Sign in with Google</h5>
                <button type="button" className="btn-close" onClick={() => setShowGoogleModal(false)}></button>
              </div>
              <div className="modal-body p-4 text-center">
                <img src="https://lh3.googleusercontent.com/a/default-user=s96-c" alt="Google" className="rounded-circle mb-3 border shadow-sm" style={{ width: '64px', height: '64px' }} />
                <p className="text-muted small mb-3">AgriBridge uses Google OAuth 2.0 to securely access your Google email and account details.</p>
                <form onSubmit={handleGoogleAuthSubmit}>
                  <div className="mb-3">
                    <input 
                      type="email" 
                      required 
                      className="form-control text-center" 
                      placeholder="user@gmail.com"
                      value={googleEmail}
                      onChange={(e) => setGoogleEmail(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-100 fw-bold">
                    Authorize Google Account
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}