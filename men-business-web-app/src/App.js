import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import AuthContext from './contexts/AuthContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import MissionsPage from './pages/MissionsPage';
import MissionDetailPage from './pages/MissionDetailPage';
import CreateMissionPage from './pages/CreateMissionPage';
import ProfilePage from './pages/ProfilePage';
import TeamPage from './pages/TeamPage';
import MessagesPage from './pages/MessagesPage';
import NetworkingPage from './pages/NetworkingPage';
import FinancialPage from './pages/FinancialPage';
import AchievementsPage from './pages/AchievementsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Simulated login function
  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
    return true;
  };

  // Simulated logout function
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
  };

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            
            <Route path="dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
            
            <Route path="missions" element={
              <ProtectedRoute>
                <MissionsPage />
              </ProtectedRoute>
            } />
            
            <Route path="missions/:id" element={
              <ProtectedRoute>
                <MissionDetailPage />
              </ProtectedRoute>
            } />
            
            <Route path="missions/create" element={
              <ProtectedRoute>
                <CreateMissionPage />
              </ProtectedRoute>
            } />
            
            <Route path="profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            
            <Route path="team" element={
              <ProtectedRoute>
                <TeamPage />
              </ProtectedRoute>
            } />
            
            <Route path="messages" element={
              <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
            } />
            
            <Route path="networking" element={
              <ProtectedRoute>
                <NetworkingPage />
              </ProtectedRoute>
            } />
            
            <Route path="financial" element={
              <ProtectedRoute>
                <FinancialPage />
              </ProtectedRoute>
            } />
            
            <Route path="achievements" element={
              <ProtectedRoute>
                <AchievementsPage />
              </ProtectedRoute>
            } />
            
            <Route path="leaderboard" element={
              <ProtectedRoute>
                <LeaderboardPage />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Box>
    </AuthContext.Provider>
  );
}

export default App;
