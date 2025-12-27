import React, { useState, type FormEvent, type ChangeEvent } from 'react';
import './LoginForm.css'; 

const SignupForm: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Signup Submitted:', { username, email, phone, password });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo-section">
          <div className="form-logo-icon"></div>
          <span className="form-logo-text">FinFlow</span>
        </div>

        <h1 className="welcome-title">Create Account</h1>
        <p className="welcome-subtitle">Join FinFlow to get started</p>

        <form className="login-form" onSubmit={handleSubmit}>
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
            Sign Up
          </button>
        </form>

        <p className="signup-link">
          Already have an account? <a href="#">Sign In</a>
        </p>
      </div>
    </div>
  );
};

export default SignupForm;
