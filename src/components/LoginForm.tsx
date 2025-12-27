import React, { useState, type FormEvent, type ChangeEvent } from 'react';
import './LoginForm.css';

const LoginForm: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Form submitted:', { email, password, activeTab });
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo-section">
          <div className="form-logo-icon"></div>
          <span className="form-logo-text">FinFlow</span>
        </div>

        <h1 className="welcome-title">Welcome Back</h1>
        <p className="welcome-subtitle">
          {activeTab === 'signin'
            ? 'Please sign in to your account'
            : 'Create a new account'}
        </p>

        <div className="tab-container">
          <button
            type="button"
            className={`tab ${activeTab === 'signin' ? 'active' : ''}`}
            onClick={() => setActiveTab('signin')}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`tab ${activeTab === 'signup' ? 'active' : ''}`}
            onClick={() => setActiveTab('signup')}
          >
            Sign Up
          </button>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              className="form-input"
              placeholder="Enter your email"
              value={email}
              onChange={handleEmailChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={handlePasswordChange}
              required
            />
          </div>

          <button type="submit" className="submit-button">
            {activeTab === 'signin' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        {activeTab === 'signin' && (
          <p className="signup-link">
            Don't have an account? <a href="#">Create An Account</a>
          </p>
        )}
      </div>
    </div>
  );
};

export default LoginForm;
