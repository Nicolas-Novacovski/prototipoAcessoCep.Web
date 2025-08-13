
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Application, Edital } from '../../types';
import { api } from '../../services/mockApi';
import Card, { CardContent, CardTitle } from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import { IconFileText, IconUserCheck, IconUsers, IconBarChart, IconTrendingUp, IconListDetails } from '../../constants';

const StatCard = ({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) => (
    <Card>
        <CardContent className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</p>
                <p className="mt-1 text-3xl font-semibold text-cep-text dark:text-white">{value}</p>
            </div>
            <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center bg-cep-primary rounded-md text-white">
                {icon}
            </div>
        </CardContent>
    </Card>
)

const QuickActionButton = ({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label: string; }) => (
    <button onClick={onClick} className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
        {icon}
        <span className="mt-2 text-sm font-medium">{label}</span>
    </button>
);

const AdminDashboard = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [editais, setEditais] = useState<Edital[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([api.getAllApplications(), api.getEditais()])
        .then(([apps, eds]) => {
            setApplications(apps);
            setEditais(eds);
        })
        .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Spinner /></div>;
  }

  const stats = {
      totalApplications: applications.length,
      pendingAnalysis: applications.filter(a => a.status === 'Em Análise').length,
      activeEditais: editais.length,
  }

    const quickActions = [
      { onClick: () => navigate('/admin/editais'), icon: <IconFileText className="h-8 w-8 text-cep-primary" />, label: 'Gerenciar Editais' },
      { onClick: () => navigate('/admin/usuarios'), icon: <IconUsers className="h-8 w-8 text-cep-primary" />, label: 'Gerenciar Usuários' },
      { onClick: () => navigate('/admin/analises'), icon: <IconUserCheck className="h-8 w-8 text-cep-primary" />, label: 'Acompanhar Análises' },
      { onClick: () => navigate('/classificacao'), icon: <IconTrendingUp className="h-8 w-8 text-cep-primary" />, label: 'Classificação' },
      { onClick: () => navigate('/admin/relatorios'), icon: <IconBarChart className="h-8 w-8 text-cep-primary" />, label: 'Ver Relatórios' },
      { onClick: () => navigate('/admin/logs'), icon: <IconListDetails className="h-8 w-8 text-cep-primary" />, label: 'Logs de Auditoria' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-cep-text dark:text-white">Painel Administrativo</h1>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Total de Inscrições" value={stats.totalApplications} icon={<IconFileText className="h-6 w-6"/>} />
        <StatCard title="Análises Pendentes" value={stats.pendingAnalysis} icon={<IconUserCheck className="h-6 w-6"/>} />
        <StatCard title="Editais Ativos" value={stats.activeEditais} icon={<IconFileText className="h-6 w-6"/>} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
            <CardContent>
                <CardTitle>Ações Rápidas</CardTitle>
                <div className="mt-4 grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {quickActions.map(action => (
                        <QuickActionButton key={action.label} {...action} />
                    ))}
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardContent>
                <CardTitle>Inscrições por Edital</CardTitle>
                <ul className="mt-4 space-y-3">
                    {editais.map(edital => {
                        const count = applications.filter(a => a.edital.id === edital.id).length;
                        return (
                            <li key={edital.id} className="flex justify-between items-center text-sm text-slate-600 dark:text-slate-300">
                                <span>{edital.number} - {edital.modality}</span>
                                <span className="font-semibold text-cep-text dark:text-white">{count} inscrições</span>
                            </li>
                        )
                    })}
                </ul>
            </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
