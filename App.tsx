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
import MonitorAnalyses from './views/admin/MonitorAnalyses';
import ManageUsers from './views/admin/ManageUsers';
import Reports from './views/admin/Reports';
import Settings from './views/admin/Settings';
import Home from './views/Home';
import { ThemeProvider } from './hooks/useTheme';

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
                    <Route path="/analise/:id" element={<AnalysisView />} />

                    {/* Admin Routes */}
                    <Route element={<ProtectedRoute allowedRoles={[UserRole.ADMIN_CEP, UserRole.ADMIN_SEED]} />}>
                        <Route path="/admin/editais" element={<ManageEditais />} />
                        <Route path="/admin/analises" element={<MonitorAnalyses />} />
                        <Route path="/admin/usuarios" element={<ManageUsers />} />
                        <Route path="/admin/relatorios" element={<Reports />} />
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