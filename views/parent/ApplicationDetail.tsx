
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Application, Document, ApplicationStatus, ValidationStatus } from '../../types';
import { api } from '../../services/mockApi';
import Spinner from '../../components/ui/Spinner';
import Card, { CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { StatusBadge, ValidationStatusBadge } from '../../components/ui/Badge';
import Stepper from '../../components/ui/Stepper';
import { IconFileText, IconAlertTriangle, IconCircleX, IconTrash } from '../../constants';
import FileUpload from '../../components/ui/FileUpload';
import Select from '../../components/ui/Select';
import { useToast } from '../../hooks/useToast';

const AppealForm = ({ applicationId, onAppealSubmitted }: { applicationId: string, onAppealSubmitted: () => void }) => {
    const [reason, setReason] = useState('');
    const [justification, setJustification] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addToast } = useToast();

    const appealReasons = [
        "Erro no cálculo de pontuação",
        "Problema com documentação",
        "Critério de desempate",
        "Outros motivos"
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reason || !justification) {
            addToast('Por favor, selecione o motivo e preencha a justificativa.', 'error');
            return;
        }
        setIsSubmitting(true);
        try {
            await api.submitAppeal(applicationId, reason, justification);
            addToast('Recurso enviado com sucesso.', 'success');
            onAppealSubmitted();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao enviar recurso.';
            addToast(message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
         <Card>
            <CardHeader><CardTitle>Interpor Recurso Administrativo</CardTitle></CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Se você não concorda com o resultado preliminar, pode abrir um recurso. O prazo para recursos é de 48h após a divulgação.</p>
                    <Select
                        id="appealReason"
                        label="Motivo do Recurso"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        required
                    >
                        <option value="">-- Selecione o motivo --</option>
                        {appealReasons.map(r => <option key={r} value={r}>{r}</option>)}
                    </Select>
                    <div>
                        <label htmlFor="justification" className="block text-sm font-medium text-cep-text dark:text-slate-300">Justificativa</label>
                        <textarea
                            id="justification"
                            rows={4}
                            value={justification}
                            onChange={(e) => setJustification(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-cep-primary focus:border-cep-primary sm:text-sm"
                            required
                        />
                    </div>
                    <div className="text-right pt-2">
                        <Button type="submit" isLoading={isSubmitting}>Enviar Recurso</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}


const ApplicationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filesForCorrection, setFilesForCorrection] = useState<File[]>([]);


  const fetchApplication = React.useCallback(() => {
     if (id) {
      setIsLoading(true);
      api.getApplicationById(id)
        .then(app => {
          if (app) {
            setApplication(app);
          } else {
            addToast('Inscrição não encontrada.', 'error');
            navigate('/404');
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, [id, navigate, addToast]);

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  const handleCorrectionSubmit = async () => {
    if(!id || !application || filesForCorrection.length === 0) return;
    setIsSubmitting(true);
    // This is a mock upload. In a real app, you'd upload files and get back URLs.
    const newDocuments: Document[] = filesForCorrection.map((file, index) => ({
        id: `doc-new-${Date.now()}-${index}`,
        fileName: file.name,
        fileType: file.type,
        fileUrl: URL.createObjectURL(file), // Mock URL for display
        validationStatus: ValidationStatus.PENDENTE
    }));

    try {
        await api.updateApplication(id, {
            documents: [...application.documents, ...newDocuments],
            status: ApplicationStatus.EM_ANALISE // Change status back to analysis
        });
        addToast('Documentos enviados com sucesso.', 'success');
        fetchApplication(); // Refetch to show updated data
    } catch(err) {
        addToast(err instanceof Error ? err.message : 'Erro ao enviar documentos.', 'error');
    } finally {
        setIsSubmitting(false);
    }
  }

  const handleDeleteDocument = async (docIdToDelete: string) => {
    if (!id || !application) return;
    setIsSubmitting(true);
    try {
        const updatedDocs = application.documents.filter(d => d.id !== docIdToDelete);
        await api.updateApplication(id, { documents: updatedDocs });
        addToast('Documento removido com sucesso.', 'success');
        fetchApplication(); // Refetch application to update the UI
    } catch(err) {
        addToast(err instanceof Error ? err.message : 'Erro ao remover documento.', 'error');
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const handleAcceptVacancy = async () => {
    if(!id) return;
    setIsSubmitting(true);
    try {
        await api.acceptVacancy(id);
        addToast('Vaga aceita com sucesso!', 'success');
        fetchApplication();
    } catch (err) {
        addToast(err instanceof Error ? err.message : 'Erro ao aceitar a vaga.', 'error');
    } finally {
        setIsSubmitting(false);
    }
  }

  if (isLoading || !application) {
    return <div className="flex justify-center items-center h-full"><Spinner /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-cep-text dark:text-white">Detalhes da Inscrição</h1>
        <Button variant="secondary" onClick={() => navigate('/dashboard')}>Voltar</Button>
      </div>

      <Card>
        <CardHeader>
           <div className="flex justify-between items-start">
              <div>
                <CardTitle>Status da Inscrição: {application.student.name}</CardTitle>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Protocolo: {application.protocol}</p>
              </div>
              <StatusBadge status={application.status} />
           </div>
        </CardHeader>
        <CardContent>
            <Stepper currentStatus={application.status} />
        </CardContent>
      </Card>

      {application.status === ApplicationStatus.ANALISE_INDEFERIDA && application.analysis && (
        <Card>
            <CardHeader>
                <div className="flex items-center">
                    <IconCircleX className="h-6 w-6 text-red-500 mr-3" />
                    <CardTitle>Análise Indeferida</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    A análise da documentação foi indeferida pela equipe do CEP.
                </p>
                <div className="p-3 bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-800/60 rounded-md">
                    <h4 className="font-semibold text-red-800 dark:text-red-200">Justificativa do Analista:</h4>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">{application.analysis.justification}</p>
                </div>
            </CardContent>
        </Card>
        )}
      
       {application.status === ApplicationStatus.CLASSIFICADO_FINAL && (
         <Card>
            <CardHeader><CardTitle>Confirmação de Vaga</CardTitle></CardHeader>
            <CardContent className="text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-4">Parabéns! O candidato foi classificado. Você deve aceitar a vaga para garantir a matrícula.</p>
                <Button onClick={handleAcceptVacancy} isLoading={isSubmitting}>
                    Aceitar Vaga
                </Button>
            </CardContent>
        </Card>
      )}

      {application.status === ApplicationStatus.VAGA_ACEITA && (
         <Card>
            <CardHeader><CardTitle>Vaga Confirmada!</CardTitle></CardHeader>
            <CardContent className="text-center">
                <p className="text-green-700 dark:text-green-400 font-semibold">A vaga foi aceita com sucesso! Aguarde as instruções para a matrícula.</p>
            </CardContent>
        </Card>
      )}
      
      {application.status === ApplicationStatus.CLASSIFICADO_PRELIMINAR && !application.appeal && (
        <AppealForm applicationId={application.id} onAppealSubmitted={fetchApplication} />
      )}

      {application.status === ApplicationStatus.DOCUMENTACAO_INCOMPLETA && (
        <Card>
            <CardHeader>
                <CardTitle>Enviar Documentação Pendente</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-sm text-yellow-700 dark:text-yellow-200 mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/40 border-l-4 border-yellow-400 dark:border-yellow-600">
                    Sua inscrição requer o envio de documentos adicionais ou a correção dos documentos invalidados.
                    {application.analysis?.justification && <span className="block mt-2 font-semibold">Observação do Analista: {application.analysis.justification}</span>}
                </div>
                <FileUpload onFilesSelect={setFilesForCorrection} />
                <div className="text-right mt-4">
                    <Button onClick={handleCorrectionSubmit} isLoading={isSubmitting} disabled={filesForCorrection.length === 0}>
                        Enviar Documentos e Reenviar para Análise
                    </Button>
                </div>
            </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>Informações do Candidato</CardTitle></CardHeader>
            <CardContent>
                <dl className="space-y-2 text-sm">
                    <div className="flex justify-between"><dt className="text-gray-500 dark:text-gray-400">Nome:</dt><dd className="font-medium text-cep-text dark:text-white">{application.student.name}</dd></div>
                    <div className="flex justify-between"><dt className="text-gray-500 dark:text-gray-400">CGM:</dt><dd className="font-medium text-cep-text dark:text-white">{application.student.cgm || 'N/A'}</dd></div>
                    <div className="flex justify-between"><dt className="text-gray-500 dark:text-gray-400">Data de Nascimento:</dt><dd className="font-medium text-cep-text dark:text-white">{new Date(application.student.birthDate).toLocaleDateString('pt-BR')}</dd></div>
                    <div className="flex justify-between"><dt className="text-gray-500 dark:text-gray-400">Edital:</dt><dd className="font-medium text-cep-text dark:text-white">{application.edital.number} - {application.edital.modality}</dd></div>
                    <div className="flex justify-between"><dt className="text-gray-500 dark:text-gray-400">Necessidades Especiais:</dt><dd className="font-medium text-cep-text dark:text-white">{application.specialNeeds ? 'Sim' : 'Não'}</dd></div>
                    {application.siblingCgm && (
                        <div className="flex justify-between"><dt className="text-gray-500 dark:text-gray-400">CGM Irmão:</dt><dd className="font-medium text-cep-text dark:text-white">{application.siblingCgm}</dd></div>
                    )}
                </dl>
                {application.address && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Endereço</h4>
                        <div className="mt-1 text-sm text-cep-text dark:text-white space-y-1">
                             <p>CEP: {application.address.cep}</p>
                             <p>
                                {application.address.street}, {application.address.number}
                                {application.address.complement && ` - ${application.address.complement}`}
                            </p>
                            <p>
                                {application.address.neighborhood} - {application.address.city}
                            </p>
                        </div>
                    </div>
                )}
            </CardContent>
          </Card>
           <Card>
            <CardHeader><CardTitle>Documentos Enviados</CardTitle></CardHeader>
            <CardContent>
                {application.documents.length > 0 ? (
                     <ul className="space-y-3">
                        {application.documents.map(doc => (
                            <li key={doc.id} className="text-sm p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-700">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center flex-1 min-w-0">
                                        <IconFileText className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400 flex-shrink-0"/>
                                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-cep-primary hover:underline truncate" title={doc.fileName}>
                                            {doc.fileName}
                                        </a>
                                    </div>
                                    <div className="ml-2 flex-shrink-0 flex items-center">
                                        <ValidationStatusBadge status={doc.validationStatus} />
                                        {application.status === ApplicationStatus.DOCUMENTACAO_INCOMPLETA && doc.validationStatus === ValidationStatus.INVALIDO && (
                                            <button 
                                                onClick={() => handleDeleteDocument(doc.id)} 
                                                className="ml-2 p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                                                aria-label={`Remover ${doc.fileName}`}
                                                disabled={isSubmitting}
                                            >
                                                <IconTrash className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {(doc.validationStatus === ValidationStatus.INVALIDO || doc.validationStatus === ValidationStatus.SOLICITADO_REENVIO) && doc.invalidationReason && (
                                    <div className="mt-2 pl-8 text-xs text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/40 p-2 rounded-md flex items-start">
                                        <IconAlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <strong className="font-semibold">Motivo da Invalidação:</strong> {doc.invalidationReason}
                                        </div>
                                    </div>
                                )}
                            </li>
                        ))}
                     </ul>
                ): (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Nenhum documento enviado.</p>
                )}
            </CardContent>
          </Card>
      </div>
      
      {application.appeal && (
        <Card>
            <CardHeader><CardTitle>Recurso Interposto</CardTitle></CardHeader>
            <CardContent>
                <dl className="space-y-2 text-sm">
                    <div className="flex justify-between"><dt className="text-gray-500 dark:text-gray-400">Data:</dt><dd className="font-medium text-cep-text dark:text-white">{new Date(application.appeal.date).toLocaleString('pt-BR')}</dd></div>
                    <div className="flex justify-between"><dt className="text-gray-500 dark:text-gray-400">Motivo:</dt><dd className="font-medium text-cep-text dark:text-white">{application.appeal.reason}</dd></div>
                </dl>
                <div className="mt-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Justificativa:</p>
                    <p className="text-sm font-medium text-cep-text dark:text-slate-200 mt-1 p-2 bg-gray-50 dark:bg-slate-700/50 rounded">{application.appeal.justification}</p>
                </div>
            </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ApplicationDetail;
