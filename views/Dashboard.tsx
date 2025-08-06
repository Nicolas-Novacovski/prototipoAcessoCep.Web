
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';
import ParentDashboard from './parent/ParentDashboard';
import AnalystDashboard from './analyst/AnalystDashboard';
import AdminDashboard from './admin/AdminDashboard';
import Spinner from '../components/ui/Spinner';

const Dashboard = () => {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) {
    return <div className="flex justify-center items-center h-full"><Spinner /></div>;
  }

  switch (user.role) {
    case UserRole.RESPONSAVEL:
      return <ParentDashboard />;
    case UserRole.ANALISTA:
      return <AnalystDashboard />;
    case UserRole.ADMIN_CEP:
    case UserRole.ADMIN_SEED:
      return <AdminDashboard />;
    default:
      return <div>Papel de usuário desconhecido.</div>;
  }
};

export default Dashboard;
