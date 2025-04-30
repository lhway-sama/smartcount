import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { GlobalProvider } from './contexts/GlobalContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Ecritures from './pages/comptabilite/Ecritures';
import BudgetsList from './pages/budgets/BudgetsList';
import BudgetDetail from './pages/budgets/BudgetDetail';
import ImmobilisationsList from './pages/immobilisations/ImmobilisationsList';
import ImmobilisationDetail from './pages/immobilisations/ImmobilisationDetail';
import Bilan from './pages/rapports/Bilan';
import CPC from './pages/rapports/CPC';
import TVA from './pages/rapports/TVA';
import PlanComptable from './pages/configuration/PlanComptable';
import Journaux from './pages/configuration/Journaux';
import Users from './pages/utilisateurs/Users';
import RolesAndPermissions from './pages/utilisateurs/RolesAndPermissions';
import Leaderboard from './pages/gamification/Leaderboard';
import Badges from './pages/gamification/Badges';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <GlobalProvider>
          <Routes>
            <Route path="/login" element={<Layout><Login /></Layout>} />
            
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Layout><Dashboard /></Layout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/comptabilite/ecritures" 
              element={
                <ProtectedRoute>
                  <Layout><Ecritures /></Layout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/budgets" 
              element={
                <ProtectedRoute>
                  <Layout><BudgetsList /></Layout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/budgets/:id" 
              element={
                <ProtectedRoute>
                  <Layout><BudgetDetail /></Layout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/immobilisations" 
              element={
                <ProtectedRoute>
                  <Layout><ImmobilisationsList /></Layout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/immobilisations/:id" 
              element={
                <ProtectedRoute>
                  <Layout><ImmobilisationDetail /></Layout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/rapports/bilan" 
              element={
                <ProtectedRoute>
                  <Layout><Bilan /></Layout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/rapports/cpc" 
              element={
                <ProtectedRoute>
                  <Layout><CPC /></Layout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/rapports/tva" 
              element={
                <ProtectedRoute>
                  <Layout><TVA /></Layout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/configuration/plan-comptable" 
              element={
                <ProtectedRoute>
                  <Layout><PlanComptable /></Layout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/configuration/journaux" 
              element={
                <ProtectedRoute>
                  <Layout><Journaux /></Layout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/utilisateurs-et-roles/users" 
              element={
                <ProtectedRoute>
                  <Layout><Users /></Layout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/utilisateurs-et-roles/roles-permissions" 
              element={
                <ProtectedRoute>
                  <Layout><RolesAndPermissions /></Layout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/gamification/leaderboard" 
              element={
                <ProtectedRoute>
                  <Layout><Leaderboard /></Layout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/gamification/badges" 
              element={
                <ProtectedRoute>
                  <Layout><Badges /></Layout>
                </ProtectedRoute>
              } 
            />
            
            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* 404 page */}
            <Route 
              path="*" 
              element={
                <Layout>
                  <div className="flex flex-col items-center justify-center h-[70vh]">
                    <h1 className="text-4xl font-bold text-gray-800">404</h1>
                    <p className="text-xl text-gray-600 mt-2">Page non trouvée</p>
                    <button 
                      onClick={() => window.location.href = '/dashboard'}
                      className="mt-6 px-4 py-2 bg-indigo-900 text-white rounded-lg hover:bg-indigo-800 transition-colors"
                    >
                      Retour au tableau de bord
                    </button>
                  </div>
                </Layout>
              } 
            />
          </Routes>
        </GlobalProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;