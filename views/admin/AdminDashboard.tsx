import React, { useEffect, useState, useMemo } from 'react';
import { Application, Edital, ApplicationStatus, User } from '../../types';
import { api } from '../../services/mockApi';
import Card, { CardContent, CardTitle, CardHeader } from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import { IconFileText, IconUserCheck, IconUsers, IconAlertTriangle, IconCircleCheck, IconBookOpen } from '../../constants';
import BarChart from '../../components/ui/BarChart';
import DonutChart from '../../components/ui/DonutChart';

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


const AdminDashboard = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [editais, setEditais] = useState<Edital[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getAllApplications(), api.getEditais(), api.getUsers()])
        .then(([apps, eds, usrs]) => {
            setApplications(apps);
            setEditais(eds);
            setUsers(usrs);
        })
        .finally(() => setIsLoading(false));
  }, []);

  const { stats, barChartData, donutChartData } = useMemo(() => {
    // FIX: Initialize stats with default values during loading to satisfy TypeScript.
    if (isLoading) return { 
        stats: { 
            totalApplications: 0,
            pendingAnalysis: 0,
            docIncompleta: 0,
            emRecurso: 0,
            activeUsers: 0,
        }, 
        barChartData: [], 
        donutChartData: [] 
    };

    const statusCounts = applications.reduce((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
    }, {} as Record<ApplicationStatus, number>);

    const stats = {
        totalApplications: applications.length,
        pendingAnalysis: statusCounts[ApplicationStatus.EM_ANALISE] || 0,
        docIncompleta: statusCounts[ApplicationStatus.DOCUMENTACAO_INCOMPLETA] || 0,
        emRecurso: statusCounts[ApplicationStatus.EM_RECURSO] || 0,
        activeUsers: users.filter(u => u.isActive).length,
    };
    
    const BAR_CHART_COLORS = ['#0f766e', '#14b8a6', '#00D9B5', '#0d9488', '#06b6d4'];

    const barChartData = editais
      .filter(e => e.isActive)
      .map((edital, index) => ({
        label: `${edital.number} (${edital.modality})`,
        value: applications.filter(a => a.edital.id === edital.id).length,
        color: BAR_CHART_COLORS[index % BAR_CHART_COLORS.length]
      }));
      
    const STATUS_COLORS: Record<string, string> = {
        'Em Análise': '#3b82f6', // blue-500
        'Documentação Incompleta': '#f59e0b', // amber-500
        'Análise Concluída': '#10b981', // emerald-500
        'Classificado (Preliminar)': '#14b8a6', // teal-500
        'Classificado (Final)': '#06b6d4', // cyan-500
        'Em Recurso': '#eab308', // yellow-500
        'Análise Indeferida': '#ef4444', // red-500
        'Outros': '#64748b' // slate-500
    };

    const groupedStatuses: Record<string, number> = {
      'Em Análise': statusCounts[ApplicationStatus.EM_ANALISE] || 0,
      'Documentação Incompleta': statusCounts[ApplicationStatus.DOCUMENTACAO_INCOMPLETA] || 0,
      'Análise Concluída': statusCounts[ApplicationStatus.ANALISE_CONCLUIDA] || 0,
      'Classificado (Preliminar)': statusCounts[ApplicationStatus.CLASSIFICADO_PRELIMINAR] || 0,
      'Classificado (Final)': statusCounts[ApplicationStatus.CLASSIFICADO_FINAL] || 0,
      'Em Recurso': statusCounts[ApplicationStatus.EM_RECURSO] || 0,
      'Análise Indeferida': statusCounts[ApplicationStatus.ANALISE_INDEFERIDA] || 0,
      'Outros': 0,
    };

    // Group less common statuses into 'Outros'
    Object.entries(statusCounts).forEach(([status, count]) => {
      if (!groupedStatuses.hasOwnProperty(status)) {
        groupedStatuses['Outros'] += count;
      }
    });

    const donutChartData = Object.entries(groupedStatuses)
      .filter(([, value]) => value > 0)
      .map(([label, value]) => ({
        label,
        value,
        color: STATUS_COLORS[label] || '#64748b'
      }));

    return { stats, barChartData, donutChartData };

  }, [applications, editais, users, isLoading]);
  

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Spinner /></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-cep-text dark:text-white">Painel Administrativo</h1>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard title="Total de Inscrições" value={stats.totalApplications} icon={<IconFileText className="h-6 w-6"/>} variant="info" />
        <StatCard title="Análises Pendentes" value={stats.pendingAnalysis} icon={<IconUserCheck className="h-6 w-6"/>} />
        <StatCard title="Doc. Incompleta" value={stats.docIncompleta} icon={<IconAlertTriangle className="h-6 w-6"/>} variant="warning" />
        <StatCard title="Em Recurso" value={stats.emRecurso} icon={<IconBookOpen className="h-6 w-6"/>} variant="warning" />
        <StatCard title="Usuários Ativos" value={stats.activeUsers} icon={<IconUsers className="h-6 w-6"/>} variant="success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
            <BarChart title="Inscrições por Edital Ativo" data={barChartData} />
        </div>
        <div className="lg:col-span-2">
            <DonutChart title="Distribuição por Status" data={donutChartData} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;