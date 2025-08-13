
import React, { useState } from 'react';
import Card, { CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { IconBarChart } from '../../constants';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/mockApi';
import { downloadCSV } from '../../utils/reportGenerator';
import { ApplicationStatus } from '../../types';

const AnalystReports = () => {
  const { addToast } = useToast();
  const { user } = useAuth();
  const [loadingReport, setLoadingReport] = useState<string | null>(null);

  const handleGenerateReport = async (reportType: string) => {
    if (!user) {
        addToast('Usuário não autenticado.', 'error');
        return;
    }

    setLoadingReport(reportType);
    try {
      const allAnalystApps = await api.getApplicationsForAnalyst();
      
      switch (reportType) {
        case 'Minhas Análises Concluídas': {
          const myCompletedApps = allAnalystApps.filter(app => 
            app.analysis?.analystId === user.id && 
            (app.status === ApplicationStatus.ANALISE_CONCLUIDA || app.status === ApplicationStatus.AGUARDANDO_PARECER_COMISSAO)
          );
          if (myCompletedApps.length === 0) {
              addToast('Você ainda não concluiu nenhuma análise.', 'info');
              return;
          }
          const reportData = myCompletedApps.map(app => ({
            Protocolo: app.protocol,
            Candidato: app.student.name,
            Edital: app.edital.number,
            Data_Analise: new Date(app.analysis!.date).toLocaleString('pt-BR'),
            Pontuacao_Final: app.finalScore?.toFixed(2) ?? 'N/A',
          }));
          downloadCSV(reportData, 'meu_relatorio_concluidas.csv');
          break;
        }
        case 'Minhas Pendências Geradas': {
           const myPendingApps = allAnalystApps.filter(app => 
                app.analysis?.analystId === user.id && 
                app.status === ApplicationStatus.DOCUMENTACAO_INCOMPLETA
            );
            if (myPendingApps.length === 0) {
              addToast('Você não gerou nenhuma pendência no momento.', 'info');
              return;
            }
            const reportData = myPendingApps.map(app => ({
                Protocolo: app.protocol,
                Candidato: app.student.name,
                Edital: app.edital.number,
                Data_Pendencia: new Date(app.analysis!.date).toLocaleString('pt-BR'),
                Justificativa: app.analysis!.justification,
            }));
           downloadCSV(reportData, 'meu_relatorio_pendencias.csv');
           break;
        }
        default:
          throw new Error('Tipo de relatório desconhecido');
      }
      addToast(`Relatório "${reportType}" gerado com sucesso!`, 'success');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Erro ao gerar relatório', 'error');
    } finally {
      setLoadingReport(null);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-cep-text dark:text-white">Meus Relatórios</h1>
      <Card>
        <CardHeader>
          <CardTitle>Gerar Relatórios de Desempenho</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Gere relatórios sobre suas atividades de análise. Os dados são exportados em formato CSV.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ReportButton
              title="Minhas Análises Concluídas"
              description="Exporta a lista de todas as análises que você finalizou."
              onClick={() => handleGenerateReport('Minhas Análises Concluídas')}
              isLoading={loadingReport === 'Minhas Análises Concluídas'}
            />
            <ReportButton
              title="Minhas Pendências Geradas"
              description="Gera uma lista de todas as pendências de documentação que você solicitou."
              onClick={() => handleGenerateReport('Minhas Pendências Geradas')}
               isLoading={loadingReport === 'Minhas Pendências Geradas'}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const ReportButton = ({ title, description, onClick, isLoading }: { title: string; description: string; onClick: () => void; isLoading?: boolean }) => (
  <div className="p-4 border dark:border-slate-700 rounded-lg flex flex-col bg-slate-50 dark:bg-slate-800/50">
    <div className="flex-grow">
      <div className="flex items-center">
        <IconBarChart className="h-6 w-6 text-cep-primary mr-3" />
        <h3 className="font-semibold text-cep-text dark:text-white">{title}</h3>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{description}</p>
    </div>
    <div className="mt-4">
      <Button onClick={onClick} variant="secondary" className="w-full" isLoading={isLoading}>
        Gerar Relatório
      </Button>
    </div>
  </div>
);

export default AnalystReports;
