import React, { useState, type FormEvent, type ChangeEvent } from 'react';
import './LoginForm.css';
const AuthForm: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');


  const [username, setUsername] = useState<string>('');
  const [phone, setPhone] = useState<string>('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (activeTab === 'signin') {
      console.log('Sign In:', { email, password });
    } else {
      console.log('Sign Up:', { username, email, phone, password });
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo-section">
          <div className="form-logo-icon"></div>
          <span className="form-logo-text">FinFlow</span>
        </div>

        <h1 className="welcome-title">
          {activeTab === 'signin' ? 'Welcome Back' : 'Create Account'}
        </h1>

        <p className="welcome-subtitle">
          {activeTab === 'signin'
            ? 'Please sign in to your account'
            : 'Join FinFlow to get started'}
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
          {activeTab === 'signup' && (
            <div className="form-group">
              <label htmlFor="username" className="form-label">Username</label>
              <input
                type="text"
                id="username"
                className="form-input"
                placeholder="Enter your username"
                value={username}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                required
              />
            </div>
          )}

          {activeTab === 'signup' && (
            <div className="form-group">
              <label htmlFor="phone" className="form-label">Phone</label>
              <input
                type="tel"
                id="phone"
                className="form-input"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              className="form-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
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
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="submit-button">
            {activeTab === 'signin' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <p className="signup-link">
          {activeTab === 'signin' ? (
            <>Don't have an account? <a onClick={() => setActiveTab('signup')} style={{cursor:'progress'}}>Create One</a></>
          ) : (
            <>Already have an account? <a onClick={() => setActiveTab('signin')} style={{cursor:'pointer'}}>Sign In</a></>
          )}
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
