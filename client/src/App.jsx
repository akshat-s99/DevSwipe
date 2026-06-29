import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Swipe from './pages/Swipe';
import Messages from './pages/Messages';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        {/* Navigation Bar */}
        <Navbar />
        
        {/* Main Content Area */}
        <main className="flex-grow-1 d-flex align-items-center justify-content-center">
          <Routes>
            <Route path="/" element={<Swipe />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
