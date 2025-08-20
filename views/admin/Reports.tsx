import React, { useState } from 'react';
import Card, { CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { IconBarChart } from '../../constants';
import { useToast } from '../../hooks/useToast';
import { api } from '../../services/mockApi';
import { downloadCSV } from '../../utils/reportGenerator';
import { ApplicationStatus } from '../../types';

const Reports = () => {
  const { addToast } = useToast();
  const [loadingReport, setLoadingReport] = useState<string | null>(null);

  const handleGenerateReport = async (reportType: string) => {
    setLoadingReport(reportType);
    try {
      const apps = await api.getAllApplications();
      switch (reportType) {
        case 'Lista de Inscritos': {
          const reportData = apps.map(app => ({
            Protocolo: app.protocol,
            Candidato: app.student.name,
            CGM: app.student.cgm,
            Edital: app.edital.number,
            Modalidade: app.edital.modality,
            Status: app.status,
            DataInscricao: new Date(app.submissionDate).toLocaleString('pt-BR')
          }));
          downloadCSV(reportData, 'relatorio_inscritos.csv');
          break;
        }
        case 'Lista Preliminar': {
           const preliminaryApps = apps
            .filter(app => app.status === ApplicationStatus.CLASSIFICADO_PRELIMINAR)
            .sort((a, b) => (b.finalScore ?? 0) - (a.finalScore ?? 0));
           const reportData = preliminaryApps.map((app, index) => ({
            Classificacao: index + 1,
            Protocolo: app.protocol,
            Candidato: app.student.name,
            Pontuacao_Preliminar: app.finalScore?.toFixed(2),
           }));
           downloadCSV(reportData, 'relatorio_classificados_preliminar.csv');
           break;
        }
        case 'Lista Final de Classificados': {
           const finalApps = apps
            .filter(app => 
                app.status === ApplicationStatus.CLASSIFICADO_FINAL || 
                app.status === ApplicationStatus.VAGA_ACEITA
            )
            .sort((a, b) => (b.finalScore ?? 0) - (a.finalScore ?? 0));
           const reportData = finalApps.map((app, index) => ({
            Classificacao: index + 1,
            Protocolo: app.protocol,
            Candidato: app.student.name,
            Pontuacao_Final: app.finalScore?.toFixed(2),
            Status_Final: app.status,
           }));
           downloadCSV(reportData, 'relatorio_classificados_final.csv');
           break;
        }
        case 'Lista de Recursos': {
          const appsWithAppeals = apps.filter(app => !!app.appeal);
          if (appsWithAppeals.length === 0) {
              addToast('Nenhum recurso foi encontrado no sistema.', 'info');
              return;
          }
          const reportData = appsWithAppeals.map(app => ({
            Protocolo_Inscricao: app.protocol,
            Candidato: app.student.name,
            Data_Solicitacao: new Date(app.appeal!.date).toLocaleString('pt-BR'),
            Status_Recurso: app.appeal?.status,
            Motivo_Recurso: app.appeal?.reason,
          }));
          downloadCSV(reportData, 'relatorio_recursos.csv');
          break;
        }
        case 'Estatísticas Gerais': {
           const stats = apps.reduce((acc, app) => {
                acc[app.status] = (acc[app.status] || 0) + 1;
                return acc;
           }, {} as Record<ApplicationStatus, number>);
           const reportData = Object.entries(stats).map(([status, count]) => ({
                Status: status,
                Quantidade: count
           }));
           downloadCSV(reportData, 'relatorio_estatisticas.csv');
           break;
        }
        case 'Logs de Auditoria': {
           const logs = await api.getLogs();
           const reportData = logs.map(log => ({
             Timestamp: new Date(log.timestamp).toLocaleString('pt-BR'),
             Autor: log.actorName,
             Acao: log.action,
             Detalhes: log.details,
           }));
           downloadCSV(reportData, 'relatorio_auditoria.csv');
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
      <h1 className="text-3xl font-bold text-cep-text dark:text-white">Relatórios e Exportação</h1>
      <Card>
        <CardHeader>
          <CardTitle>Gerar Relatórios</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Selecione um tipo de relatório para gerar e exportar os dados do sistema em formato CSV.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ReportButton
              title="Lista de Inscritos"
              description="Exporta a lista completa de todos os candidatos inscritos por edital."
              onClick={() => handleGenerateReport('Lista de Inscritos')}
              isLoading={loadingReport === 'Lista de Inscritos'}
            />
            <ReportButton
              title="Lista Preliminar"
              description="Gera a lista de classificação preliminar, antes do período de recursos."
              onClick={() => handleGenerateReport('Lista Preliminar')}
              isLoading={loadingReport === 'Lista Preliminar'}
            />
            <ReportButton
              title="Lista Final de Classificados"
              description="Gera a lista final de candidatos classificados, incluindo pontuação e status final."
              onClick={() => handleGenerateReport('Lista Final de Classificados')}
               isLoading={loadingReport === 'Lista Final de Classificados'}
            />
             <ReportButton
              title="Lista de Recursos"
              description="Exporta a lista de todos os recursos interpostos, incluindo seus status."
              onClick={() => handleGenerateReport('Lista de Recursos')}
              isLoading={loadingReport === 'Lista de Recursos'}
            />
            <ReportButton
              title="Estatísticas Gerais"
              description="Relatório com estatísticas sobre o processo, como inscrições por status."
              onClick={() => handleGenerateReport('Estatísticas Gerais')}
               isLoading={loadingReport === 'Estatísticas Gerais'}
            />
             <ReportButton
              title="Logs de Auditoria"
              description="Exporta logs do sistema para fins de auditoria e segurança."
              onClick={() => handleGenerateReport('Logs de Auditoria')}
               isLoading={loadingReport === 'Logs de Auditoria'}
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

export default Reports;