


import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Application, ApplicationStatus } from '../../types';
import { api } from '../../services/mockApi';
import Card, { CardContent } from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import { IconUserCheck, IconAlertTriangle, IconCircleCheck, IconUsers } from '../../constants';
import Button from '../../components/ui/Button';


const StatCard = ({ title, value, icon, variant = 'default' }: { title: string, value: string | number, icon: React.ReactNode, variant?: 'default' | 'warning' | 'info' | 'success' }) => {
    const variantClasses = {
        default: 'bg-cep-primary text-white',
        warning: 'bg-yellow-500 text-white',
        info: 'bg-blue-500 text-white',
        success: 'bg-teal-500 text-white',
    };
    return (
        <Card>
            <CardContent className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</p>
                    <p className="mt-1 text-3xl font-semibold text-cep-text dark:text-white">{value}</p>
                </div>
                <div className={`flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-md ${variantClasses[variant]}`}>
                    {icon}
                </div>
            </CardContent>
        </Card>
    );
};


const AnalystDashboard = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch all applications for a complete overview
    api.getAllApplications()
      .then(setApplications)
      .finally(() => setIsLoading(false));
  }, []);

  const stats = useMemo(() => {
    if (!applications) return { total: 0, emAnalise: 0, docIncompleta: 0, deferidas: 0, emRecurso: 0 };
    return {
      total: applications.length,
      emAnalise: applications.filter(a => a.status === ApplicationStatus.EM_ANALISE).length,
      docIncompleta: applications.filter(a => a.status === ApplicationStatus.DOCUMENTACAO_INCOMPLETA).length,
      deferidas: applications.filter(a => a.status === ApplicationStatus.ANALISE_CONCLUIDA).length,
      emRecurso: applications.filter(a => a.status === ApplicationStatus.EM_RECURSO).length,
    };
  }, [applications]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Spinner /></div>;
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-cep-text dark:text-white">Painel do Analista</h1>
      
       <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard 
            title="Total de Inscrições" 
            value={stats.total} 
            icon={<IconUsers className="h-6 w-6"/>}
            variant="info"
        />
        <StatCard 
            title="Em Análise" 
            value={stats.emAnalise} 
            icon={<IconUserCheck className="h-6 w-6"/>}
        />
        <StatCard 
            title="Doc. Incompleta" 
            value={stats.docIncompleta} 
            icon={<IconAlertTriangle className="h-6 w-6"/>}
            variant="warning"
        />
         <StatCard 
            title="Análises Deferidas" 
            value={stats.deferidas} 
            icon={<IconCircleCheck className="h-6 w-6"/>}
            variant="success"
        />
         <StatCard 
            title="Em Recurso" 
            value={stats.emRecurso} 
            icon={<IconAlertTriangle className="h-6 w-6"/>}
            variant="warning"
        />
      </div>

      <Card>
        <CardContent className="text-center py-16">
          <h2 className="text-2xl font-semibold text-cep-text dark:text-white">Bem-vindo(a) à sua central de análises.</h2>
          <p className="mt-2 max-w-xl mx-auto text-gray-500 dark:text-gray-400">
            Utilize os cartões acima para um resumo rápido da sua carga de trabalho ou
            acesse a "Fila de Análise" no menu lateral para ver todas as inscrições pendentes.
          </p>
          <div className="mt-6">
            <Button onClick={() => navigate('/analise')}>
                Acessar Fila de Análise
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalystDashboard;