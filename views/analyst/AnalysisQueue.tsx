
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Application, ApplicationStatus, Edital } from '../../types';
import { api } from '../../services/mockApi';
import Card, { CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { IconFileText } from '../../constants';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';

const statusGroups = {
  pending: [
    ApplicationStatus.EM_ANALISE,
    ApplicationStatus.DOCUMENTACAO_INCOMPLETA,
    ApplicationStatus.EM_RECURSO,
    ApplicationStatus.FIM_DE_FILA,
    ApplicationStatus.AGUARDANDO_PARECER_COMISSAO,
  ],
  completed: [
    ApplicationStatus.ANALISE_CONCLUIDA,
    ApplicationStatus.CLASSIFICADO_PRELIMINAR,
    ApplicationStatus.CLASSIFICADO_FINAL,
    ApplicationStatus.VAGA_ACEITA,
  ],
  rejected: [
    ApplicationStatus.ANALISE_INDEFERIDA,
    ApplicationStatus.VAGA_RECUSADA,
    ApplicationStatus.NAO_CLASSIFICADO,
  ],
};

const AnalysisQueue = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [editais, setEditais] = useState<Edital[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEditalId, setSelectedEditalId] = useState('all');
  const [statusFilter, setStatusFilter] = useState('pending');
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.getAllApplications(), // Fetch all applications
      api.getEditais()
    ]).then(([apps, eds]) => {
      setApplications(apps);
      setEditais(eds);
    }).finally(() => setIsLoading(false));
  }, []);

  const filteredApplications = useMemo(() => {
    let filtered = [...applications];

    if (statusFilter !== 'all') {
      const targetStatuses = statusGroups[statusFilter as keyof typeof statusGroups];
      if (targetStatuses) {
        filtered = filtered.filter(app => targetStatuses.includes(app.status));
      }
    }

    if (selectedEditalId !== 'all') {
      filtered = filtered.filter(app => app.edital.id === selectedEditalId);
    }

    if (searchTerm.trim()) {
      const lowercasedFilter = searchTerm.toLowerCase();
      filtered = filtered.filter(app =>
        app.protocol.toLowerCase().includes(lowercasedFilter) ||
        app.student.name.toLowerCase().includes(lowercasedFilter) ||
        (app.analysis?.analystName || '').toLowerCase().includes(lowercasedFilter)
      );
    }
    return filtered;
  }, [applications, searchTerm, selectedEditalId, statusFilter]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Spinner /></div>;
  }
  
  const isPendingView = statusFilter === 'pending';

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-cep-text dark:text-white">Fila de Análise</h1>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Inscrições</CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Visualize e filtre todas as inscrições do sistema.</p>
            </div>
             <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Select
                    id="status-filter"
                    label=""
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full sm:w-64"
                >
                    <option value="pending">Pendentes de Análise</option>
                    <option value="completed">Análises Concluídas</option>
                    <option value="rejected">Análises Indeferidas</option>
                    <option value="all">Todos os Status</option>
                </Select>
                <Select
                    id="edital-filter"
                    label=""
                    value={selectedEditalId}
                    onChange={(e) => setSelectedEditalId(e.target.value)}
                    className="w-full sm:w-64"
                >
                    <option value="all">Todos os Editais</option>
                    {editais.map(edital => (
                        <option key={edital.id} value={edital.id}>
                            Edital {edital.number} - {edital.modality}
                        </option>
                    ))}
                </Select>
                <Input
                    id="search-queue"
                    label=""
                    placeholder="Buscar por protocolo, nome, analista..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-72"
                />
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
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Analista</th>
                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ação</span></th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                  {filteredApplications.map(app => (
                    <tr key={app.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-cep-text dark:text-white">{app.protocol}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{app.student.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{app.edital.modality}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"><StatusBadge status={app.status}/></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{app.analysis?.analystName || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button variant="secondary" onClick={() => navigate(`/analise/${app.id}`)}>
                          {isPendingView ? 'Analisar' : 'Ver Detalhes'}
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
              <h2 className="mt-4 text-xl font-semibold text-cep-text dark:text-white">Nenhuma inscrição encontrada.</h2>
              <p className="mt-2 max-w-xl text-gray-500 dark:text-gray-400">
                {searchTerm || selectedEditalId !== 'all' || statusFilter !== 'pending' ? 'Nenhuma inscrição encontrada para os filtros aplicados.' : 'Não há nenhuma inscrição aguardando sua análise no momento. Bom trabalho!'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalysisQueue;
