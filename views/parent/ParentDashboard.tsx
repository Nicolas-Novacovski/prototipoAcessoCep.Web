
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Application } from '../../types';
import { api } from '../../services/mockApi';
import Card, { CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { IconPlusCircle, IconFileText } from '../../constants';

const ParentDashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      api.getApplicationsForResponsible(user.cpf)
        .then(setApplications)
        .finally(() => setIsLoading(false));
    }
  }, [user]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Spinner /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-cep-text dark:text-white">Minhas Inscrições</h1>
        <Button onClick={() => navigate('/inscricao/nova')}>
            <IconPlusCircle className="mr-2 h-5 w-5"/>
            Nova Inscrição
        </Button>
      </div>

      {applications.length === 0 ? (
        <Card>
            <CardContent className="text-center text-gray-500 dark:text-gray-400">
                <IconFileText className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"/>
                <h3 className="mt-2 text-sm font-medium text-cep-text dark:text-white">Nenhuma inscrição encontrada</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Comece uma nova inscrição para seu(s) filho(s).</p>
            </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {applications.map(app => (
            <Card key={app.id} className="hover:shadow-lg transition-shadow dark:hover:shadow-slate-700/50">
              <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>{app.student.name}</CardTitle>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Protocolo: {app.protocol}</p>
                    </div>
                    <StatusBadge status={app.status}/>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                    <p><strong>Edital:</strong> {app.edital.number} - {app.edital.modality}</p>
                    <p><strong>Data de Submissão:</strong> {new Date(app.submissionDate).toLocaleDateString('pt-BR')}</p>
                </div>
                <Button className="w-full mt-4" variant="secondary" onClick={() => navigate(`/inscricao/${app.id}`)}>
                    Ver Detalhes
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ParentDashboard;