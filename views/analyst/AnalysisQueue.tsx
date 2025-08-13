import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Application } from '../../types';
import { api } from '../../services/mockApi';
import Card, { CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { IconFileText } from '../../constants';

const AnalysisQueue = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.getApplicationsForAnalyst()
      .then(setApplications)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Spinner /></div>;
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-cep-text dark:text-white">Fila de Análise</h1>
      
      <Card>
        <CardHeader>
            <CardTitle>Inscrições Pendentes</CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Lista de todas as inscrições que requerem sua atenção.</p>
        </CardHeader>
        <CardContent>
          {applications.length > 0 ? (
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
                  {applications.map(app => (
                    <tr key={app.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-cep-text dark:text-white">{app.protocol}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{app.student.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{app.edital.modality}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"><StatusBadge status={app.status}/></td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button variant="secondary" onClick={() => navigate(`/analise/${app.id}`)}>
                          Analisar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-10">
              <IconFileText className="h-12 w-12 text-gray-400" />
              <h2 className="mt-4 text-xl font-semibold text-cep-text dark:text-white">Fila de análise vazia.</h2>
              <p className="mt-2 max-w-xl text-gray-500 dark:text-gray-400">
                Não há nenhuma inscrição aguardando sua análise no momento. Bom trabalho!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalysisQueue;
