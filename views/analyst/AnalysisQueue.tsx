

import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Application, Edital } from '../../types';
import { api } from '../../services/mockApi';
import Card, { CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { IconFileText } from '../../constants';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';

const AnalysisQueue = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [editais, setEditais] = useState<Edital[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEditalId, setSelectedEditalId] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.getApplicationsForAnalyst(),
      api.getEditais()
    ]).then(([apps, eds]) => {
      setApplications(apps);
      setEditais(eds);
    }).finally(() => setIsLoading(false));
  }, []);

  const filteredApplications = useMemo(() => {
    let filtered = [...applications];

    if (selectedEditalId !== 'all') {
      filtered = filtered.filter(app => app.edital.id === selectedEditalId);
    }

    if (searchTerm.trim()) {
      const lowercasedFilter = searchTerm.toLowerCase();
      filtered = filtered.filter(app =>
        app.protocol.toLowerCase().includes(lowercasedFilter) ||
        app.student.name.toLowerCase().includes(lowercasedFilter)
      );
    }
    return filtered;
  }, [applications, searchTerm, selectedEditalId]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Spinner /></div>;
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-cep-text dark:text-white">Fila de Análise</h1>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Inscrições Pendentes</CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Lista de todas as inscrições que requerem sua atenção.</p>
            </div>
             <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
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
                    placeholder="Buscar por protocolo ou nome..."
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
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Modalidade de Entrada</th>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{app.address ? 'Externo/Particular' : 'Rede Pública'}</td>
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
                {searchTerm || selectedEditalId !== 'all' ? 'Nenhuma inscrição encontrada para sua busca.' : 'Não há nenhuma inscrição aguardando sua análise no momento. Bom trabalho!'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalysisQueue;