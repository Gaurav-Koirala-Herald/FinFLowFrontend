import React from 'react';
import AuthForm from './components/AuthForm';
import './App.css';
import Header from './components/Header';

const App: React.FC = () => {
  return (
    <div className="app">
        <Header />
      <main className="main-content">
        <AuthForm />
      </main>
    </div>
  );
};

export default App;
