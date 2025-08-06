
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Application, Edital } from '../../types';
import { api } from '../../services/mockApi';
import Card, { CardContent, CardTitle } from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import { IconFileText, IconUserCheck, IconUsers, IconBarChart } from '../../constants';

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
                <div className="mt-4 grid grid-cols-2 gap-4">
                    <button onClick={() => navigate('/admin/editais')} className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                        <IconFileText className="h-8 w-8 text-cep-primary" />
                        <span className="mt-2 text-sm font-medium">Gerenciar Editais</span>
                    </button>
                    <button onClick={() => navigate('/admin/usuarios')} className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                        <IconUsers className="h-8 w-8 text-cep-primary" />
                        <span className="mt-2 text-sm font-medium">Gerenciar Usuários</span>
                    </button>
                    <button onClick={() => navigate('/admin/analises')} className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                        <IconUserCheck className="h-8 w-8 text-cep-primary" />
                        <span className="mt-2 text-sm font-medium">Acompanhar Análises</span>
                    </button>
                    <button onClick={() => navigate('/admin/relatorios')} className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                        <IconBarChart className="h-8 w-8 text-cep-primary" />
                        <span className="mt-2 text-sm font-medium">Ver Relatórios</span>
                    </button>
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