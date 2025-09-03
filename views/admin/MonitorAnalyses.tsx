import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Application, Edital } from '../../types';
import { api } from '../../services/mockApi';
import Card, { CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import { StatusBadge } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Pagination from '../../components/ui/Pagination';

const MonitorAnalyses = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [editais, setEditais] = useState<Edital[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEditalId, setSelectedEditalId] = useState('all');
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    Promise.all([
        api.getAllApplications(),
        api.getEditais()
    ]).then(([apps, eds]) => {
        setApplications(apps);
        setEditais(eds);
    }).finally(() => setIsLoading(false));
  }, []);

  const filteredApplications = useMemo(() => {
    let filtered = applications;

    if (selectedEditalId !== 'all') {
        filtered = filtered.filter(app => app.edital.id === selectedEditalId);
    }

    if (!searchTerm.trim()) {
      return filtered;
    }
    const lowercasedFilter = searchTerm.toLowerCase();
    return filtered.filter(app =>
      app.protocol.toLowerCase().includes(lowercasedFilter) ||
      app.student.name.toLowerCase().includes(lowercasedFilter) ||
      (app.analysis?.analystName || '').toLowerCase().includes(lowercasedFilter)
    );
  }, [applications, searchTerm, selectedEditalId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedEditalId]);

  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const paginatedApplications = filteredApplications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };


  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Spinner /></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-cep-text dark:text-white">Acompanhar Análises</h1>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Todas as Inscrições</CardTitle>
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
                  id="search-monitor"
                  label=""
                  type="text"
                  placeholder="Buscar por protocolo, candidato..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-72"
                />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredApplications.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                  <thead className="bg-gray-50 dark:bg-slate-700/50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Protocolo</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Candidato</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Edital</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                       <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Analista</th>
                      <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ver</span></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                    {paginatedApplications.map(app => (
                      <tr key={app.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-cep-text dark:text-white">{app.protocol}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{app.student.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{app.edital.modality}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"><StatusBadge status={app.status}/></td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{app.analysis?.analystName || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button variant="secondary" onClick={() => navigate(`/analise/${app.id}`)}>
                            Ver Análise
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">Nenhuma inscrição encontrada.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MonitorAnalyses;