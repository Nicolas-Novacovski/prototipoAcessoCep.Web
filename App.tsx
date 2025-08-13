


import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ToastProvider } from './hooks/useToast';
import { ToastContainer } from './components/ui/Toast';
import MainLayout from './components/layout/MainLayout';
import Login from './views/Login';
import Dashboard from './views/Dashboard';
import NotFound from './views/NotFound';
import AnalysisView from './views/analyst/AnalysisView';
import { UserRole } from './types';
import NewApplicationForm from './views/parent/NewApplicationForm';
import ApplicationDetail from './views/parent/ApplicationDetail';
import ManageEditais from './views/admin/ManageEditais';
import ManageComplementaryCalls from './views/admin/ManageComplementaryCalls';
import MonitorAnalyses from './views/admin/MonitorAnalyses';
import ManageUsers from './views/admin/ManageUsers';
import Reports from './views/admin/Reports';
import Settings from './views/admin/Settings';
import Home from './views/Home';
import { ThemeProvider } from './hooks/useTheme';
import RankingView from './views/admin/RankingView';
import ManageEmailTemplates from './views/admin/ManageEmailTemplates';
import ManageSpecialCases from './views/admin/ManageSpecialCases';
import AuditLogs from './views/admin/AuditLogs';
import AnalystReports from './views/analyst/AnalystReports';
import AnalysisQueue from './views/analyst/AnalysisQueue';

const ProtectedRoute = ({ allowedRoles }: { allowedRoles?: UserRole[] }) => {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            
            <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout><Outlet /></MainLayout>}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    
                    {/* Parent Routes */}
                    <Route path="/inscricao/nova" element={<NewApplicationForm />} />
                    <Route path="/inscricao/:id" element={<ApplicationDetail />} />

                    {/* Analyst Routes */}
                    <Route element={<ProtectedRoute allowedRoles={[UserRole.ANALISTA]} />}>
                        <Route path="/analise" element={<AnalysisQueue />} /> 
                        <Route path="/analise/relatorios" element={<AnalystReports />} />
                    </Route>
                    
                    {/* Analyst & Admin Routes */}
                    <Route element={<ProtectedRoute allowedRoles={[UserRole.ANALISTA, UserRole.ADMIN_CEP, UserRole.ADMIN_SEED]} />}>
                      <Route path="/analise/:id" element={<AnalysisView />} />
                      <Route path="/classificacao" element={<RankingView />} />
                    </Route>

                    {/* Admin Routes */}
                    <Route element={<ProtectedRoute allowedRoles={[UserRole.ADMIN_CEP, UserRole.ADMIN_SEED]} />}>
                        <Route path="/admin/editais" element={<ManageEditais />} />
                        <Route path="/admin/chamadas" element={<ManageComplementaryCalls />} />
                        <Route path="/admin/analises" element={<MonitorAnalyses />} />
                        <Route path="/admin/usuarios" element={<ManageUsers />} />
                        <Route path="/admin/relatorios" element={<Reports />} />
                        <Route path="/admin/email-templates" element={<ManageEmailTemplates />} />
                        <Route path="/admin/logs" element={<AuditLogs />} />
                    </Route>

                    {/* CEP & SEED Admin Route for Special Cases */}
                    <Route element={<ProtectedRoute allowedRoles={[UserRole.ADMIN_CEP, UserRole.ADMIN_SEED]} />}>
                      <Route path="/admin/casos-especiais" element={<ManageSpecialCases />} />
                    </Route>

                    {/* SEED Only Route */}
                     <Route element={<ProtectedRoute allowedRoles={[UserRole.ADMIN_SEED]} />}>
                        <Route path="/admin/config" element={<Settings />} />
                    </Route>
                </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
        </Routes>
    )
}

const App = () => {
  return (
    <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <HashRouter>
              <ToastContainer />
              <AppRoutes />
            </HashRouter>
          </ToastProvider>
        </AuthProvider>
    </ThemeProvider>
  );
};

export default App;