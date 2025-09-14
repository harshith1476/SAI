import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Home from './pages/Home/Home';
import SportsCategory from './pages/SportsCategory/SportsCategory';
import Contact from './pages/Contact/Contact';
import About from './pages/About/About';
import PuzzleGames from './pages/PuzzleGames/PuzzleGames';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import SAIDashboard from './pages/SAIDashboard/SAIDashboard';
import CoachDashboard from './pages/CoachDashboard/CoachDashboard';
import VideoAssessment from './pages/VideoAssessment/VideoAssessment';
import PostureAssessment from './pages/PostureAssessment/PostureAssessment';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.css';
import ForgotPassword from './pages/Auth/Forgetpass';

// Private Route Component
const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(user.userType)) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/sports-category" element={<SportsCategory />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/about" element={<About />} />
              <Route path="/puzzle-games" element={<PuzzleGames />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/dashboard" element={
                <PrivateRoute allowedRoles={['athlete']}>
                  <Dashboard />
                </PrivateRoute>
              } />
              <Route path="/sai-dashboard" element={
                <PrivateRoute allowedRoles={['sai_official']}>
                  <SAIDashboard />
                </PrivateRoute>
              } />
              <Route path="/coach-dashboard" element={
                <PrivateRoute allowedRoles={['coach']}>
                  <CoachDashboard />
                </PrivateRoute>
              } />
              <Route path="/video-assessment" element={<VideoAssessment />} />
              <Route path="/posture-assessment/:sport/:exercise" element={<PostureAssessment />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
