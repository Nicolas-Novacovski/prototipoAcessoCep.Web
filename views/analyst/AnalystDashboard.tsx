import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Application, ApplicationStatus } from '../../types';
import { api } from '../../services/mockApi';
import Card, { CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import { StatusBadge } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

const AnalystDashboard = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | 'all'>('all');
  const navigate = useNavigate();

  useEffect(() => {
    api.getApplicationsForAnalyst()
      .then(setApplications)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Spinner /></div>;
  }
  
  const filteredApplications = applications.filter(app => {
    if (filterStatus === 'all') return true;
    return app.status === filterStatus;
  });

  const filterOptions: { label: string, status: ApplicationStatus | 'all' }[] = [
      { label: 'Todas', status: 'all'},
      { label: 'Em Análise', status: ApplicationStatus.EM_ANALISE },
      { label: 'Doc. Incompleta', status: ApplicationStatus.DOCUMENTACAO_INCOMPLETA },
      { label: 'Em Recurso', status: ApplicationStatus.EM_RECURSO },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-cep-text dark:text-white">Painel de Análise</h1>
      <Card>
        <CardHeader>
            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
                <CardTitle>Inscrições Pendentes de Análise</CardTitle>
                <div className="flex items-center space-x-2 bg-gray-100 dark:bg-slate-700 p-1 rounded-lg">
                    {filterOptions.map(opt => (
                        <Button 
                            key={opt.status}
                            onClick={() => setFilterStatus(opt.status)}
                            className={`px-3 py-1.5 text-xs transition-colors duration-200 rounded-md ${
                                filterStatus === opt.status 
                                ? 'bg-white text-cep-primary shadow dark:bg-slate-600 dark:text-white' 
                                : 'bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600/50'
                            }`}
                        >
                            {opt.label}
                        </Button>
                    ))}
                </div>
            </div>
        </CardHeader>
        <CardContent>
          {filteredApplications.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                <thead className="bg-gray-50 dark:bg-slate-700/50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Protocolo</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Candidato</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Edital</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Analisar</span></th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                  {filteredApplications.map(app => (
                    <tr key={app.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-cep-text dark:text-white">{app.protocol}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{app.student.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{app.edital.modality}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"><StatusBadge status={app.status}/></td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button onClick={() => navigate(`/analise/${app.id}`)}>
                          Analisar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">Nenhuma inscrição encontrada para o filtro selecionado.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalystDashboard;