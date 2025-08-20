

import React, { useState, useEffect } from 'react';
import { Application, Document } from '../../types';
import { api } from '../../services/mockApi';
import { useAuth } from '../../hooks/useAuth';
import Card, { CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import PdfViewer from '../../components/ui/PdfViewer';
import { useToast } from '../../hooks/useToast';
import { IconFileText, IconDownload } from '../../constants';

const CommissionAnalysisModal = ({
  isOpen,
  onClose,
  application,
  onDecision,
}: {
  isOpen: boolean;
  onClose: () => void;
  application: Application | null;
  onDecision: (appId: string, decision: { isEligible: boolean; justification: string }) => Promise<void>;
}) => {
  const [isEligible, setIsEligible] = useState<boolean | null>(null);
  const [justification, setJustification] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDocUrl, setSelectedDocUrl] = useState<string | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    if (isOpen && application?.specialNeedsDocuments && application.specialNeedsDocuments.length > 0) {
      setSelectedDocUrl(application.specialNeedsDocuments[0].fileUrl);
      setIsEligible(null);
      setJustification('');
    } else if (isOpen) {
      setSelectedDocUrl(null);
    }
  }, [isOpen, application]);

  const handleSubmit = async () => {
    if (isEligible === null) {
      addToast('Por favor, selecione "Deferir" ou "Indeferir".', 'error');
      return;
    }
    if (!isEligible && !justification.trim()) {
      addToast('A justificativa é obrigatória para indeferir o laudo.', 'error');
      return;
    }
    if (!application) return;

    setIsSubmitting(true);
    try {
      await onDecision(application.id, { isEligible, justification });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!application) return null;
  
  const laudos = application.specialNeedsDocuments || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Análise de Laudo - ${application.student.name}`} size="5xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Laudo List */}
        <div className="lg:col-span-3 space-y-2 lg:h-[70vh] lg:overflow-y-auto pr-2">
            <h3 className="font-semibold text-lg mb-2">Laudos Enviados</h3>
            {laudos.map(doc => (
                 <div key={doc.id} className={`p-2 rounded-md border ${
                        selectedDocUrl === doc.fileUrl
                        ? 'bg-cep-primary/10 border-cep-primary'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                    }`}>
                    <div className="flex items-center justify-between">
                         <button 
                            onClick={() => setSelectedDocUrl(doc.fileUrl)}
                            className="flex items-center text-left min-w-0"
                         >
                            <IconFileText className={`h-5 w-5 mr-2 flex-shrink-0 ${selectedDocUrl === doc.fileUrl ? 'text-cep-primary' : ''}`}/>
                            <span className="text-sm font-medium truncate">{doc.fileName}</span>
                         </button>
                         <a href={doc.fileUrl} download={doc.fileName} className="p-1 text-slate-400 hover:text-cep-primary" title={`Baixar ${doc.fileName}`}>
                            <IconDownload className="h-4 w-4" />
                        </a>
                    </div>
                 </div>
            ))}
        </div>

        {/* Document Viewer */}
        <div className="lg:col-span-5 h-[70vh] bg-gray-800 dark:bg-slate-900 rounded-lg shadow-lg">
          <PdfViewer fileUrl={selectedDocUrl} />
        </div>

        {/* Decision Form */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="max-h-[70vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Decisão da Comissão</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Avalie o conteúdo técnico do(s) laudo(s) médico(s). A decisão impactará a elegibilidade do candidato para as vagas de Educação Especial.
              </p>
              <div className="flex gap-4">
                <Button 
                    onClick={() => setIsEligible(true)} 
                    className={`w-full ${isEligible === true ? 'ring-2 ring-offset-2 ring-cep-primary' : ''}`}
                >
                    Deferir Laudo
                </Button>
                <Button 
                    onClick={() => setIsEligible(false)} 
                    variant="danger" 
                    className={`w-full ${isEligible === false ? 'ring-2 ring-offset-2 ring-red-500' : ''}`}
                >
                    Indeferir Laudo
                </Button>
              </div>
              <div>
                <label htmlFor="justification" className="block text-sm font-medium text-cep-text dark:text-slate-300">
                  Justificativa da Decisão {isEligible === false && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  id="justification"
                  rows={8}
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-cep-primary focus:border-cep-primary sm:text-sm"
                  placeholder="Se indeferido, forneça uma justificativa clara e técnica sobre o porquê do(s) laudo(s) não ser(em) considerado(s) válido(s) para os fins do edital."
                />
              </div>
            </CardContent>
          </Card>
           <div className="flex justify-end gap-2 pt-4 border-t dark:border-slate-700">
            <Button variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button onClick={handleSubmit} isLoading={isSubmitting}>Salvar Decisão</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

const ManageSpecialCases = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const { addToast } = useToast();
  const { user } = useAuth();

  const fetchApplications = () => {
    setIsLoading(true);
    api.getSpecialEducationApplications()
      .then(setApplications)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleDecision = async (appId: string, decision: { isEligible: boolean; justification: string }) => {
    if (!user) return;
    try {
      await api.submitCommissionDecision(appId, {
        ...decision,
        commissionMemberId: user.id,
        commissionMemberName: user.name,
      });
      addToast('Decisão da comissão salva com sucesso!', 'success');
      fetchApplications(); // Refetch to update the list
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Erro ao salvar decisão.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-cep-text dark:text-white">Análise de Casos Especiais</h1>
      <Card>
        <CardHeader>
          <CardTitle>Candidatos Aguardando Parecer da Comissão</CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Lista de candidatos de Educação Especial cujos laudos foram validados formalmente e aguardam análise de mérito.
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Spinner />
          ) : applications.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                <thead className="bg-gray-50 dark:bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Protocolo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Candidato</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Edital</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nº de Laudos</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                  {applications.map(app => (
                    <tr key={app.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-cep-text dark:text-white">{app.protocol}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{app.student.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{app.edital.modality}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{app.specialNeedsDocuments?.length || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button onClick={() => setSelectedApplication(app)}>Avaliar Laudo(s)</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              Nenhuma inscrição aguardando parecer da comissão no momento.
            </p>
          )}
        </CardContent>
      </Card>
      <CommissionAnalysisModal
        isOpen={!!selectedApplication}
        onClose={() => setSelectedApplication(null)}
        application={selectedApplication}
        onDecision={handleDecision}
      />
    </div>
  );
};

export default ManageSpecialCases;