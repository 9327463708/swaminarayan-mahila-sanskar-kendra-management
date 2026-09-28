import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import BranchDetail from './pages/BranchDetail';
import Login from './pages/Login';

function App() {
  // Simple authentication state with localStorage persistence
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('_auth_tkn') === 'a1b2c3d4';
  });

  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('_usr_lvl') === '9f8e7d6c5b4a';
  });

  const handleLogin = (adminStatus = false) => {
    localStorage.setItem('_auth_tkn', 'a1b2c3d4');
    if (adminStatus) { localStorage.setItem('_usr_lvl', '9f8e7d6c5b4a'); } else { localStorage.removeItem('_usr_lvl'); };
    setIsAuthenticated(true);
    setIsAdmin(adminStatus);
  };

  const handleLogout = () => {
    localStorage.removeItem('_auth_tkn');
    localStorage.removeItem('_usr_lvl');
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-orange-50">
        <Header onLogout={isAuthenticated ? handleLogout : null} isAuthenticated={isAuthenticated} />
        
        <main className="flex-grow">
          <Routes>
            <Route 
              path="/login" 
              element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} 
            />
            
            <Route 
              path="/" 
              element={<Home />} 
            />
            
            <Route 
              path="/branch/:id" 
              element={<BranchDetail isAdmin={isAdmin} />} 
            />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
