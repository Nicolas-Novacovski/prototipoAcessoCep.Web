

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Application, Document, ApplicationStatus, ValidationStatus, AppealStatus } from '../../types';
import { api } from '../../services/mockApi';
import Spinner from '../../components/ui/Spinner';
import Card, { CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { StatusBadge, ValidationStatusBadge } from '../../components/ui/Badge';
import Stepper from '../../components/ui/Stepper';
import { IconFileText, IconAlertTriangle, IconCircleX, IconTrash, IconX } from '../../constants';
import FileUpload from '../../components/ui/FileUpload';
import Select from '../../components/ui/Select';
import { useToast } from '../../hooks/useToast';
import ConfirmationModal from '../../components/ui/ConfirmationModal';

const AppealForm = ({ applicationId, onAppealSubmitted }: { applicationId: string, onAppealSubmitted: () => void }) => {
    const [reason, setReason] = useState('');
    const [justification, setJustification] = useState('');
    const [attachment, setAttachment] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addToast } = useToast();

    const appealReasons = [
        "Erro no cálculo de pontuação",
        "Problema com documentação",
        "Critério de desempate",
        "Outros motivos"
    ];
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
             if (file.type !== 'application/pdf') {
                addToast('Apenas arquivos PDF são permitidos.', 'error');
                setAttachment(null);
                e.target.value = '';
                return;
            }
            if (file.size > 10 * 1024 * 1024) { // 10MB
                addToast(`Arquivo "${file.name}" excede o tamanho de 10MB.`, 'error');
                setAttachment(null);
                e.target.value = '';
                return;
            }
            setAttachment(file);
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reason || !justification) {
            addToast('Por favor, selecione o motivo e preencha a justificativa.', 'error');
            return;
        }
        setIsSubmitting(true);
        try {
            await api.submitAppeal(applicationId, reason, justification, attachment || undefined);
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
                     <div>
                        <label htmlFor="attachment" className="block text-sm font-medium text-cep-text dark:text-slate-300">Anexar Documento (Opcional)</label>
                        {!attachment ? (
                            <input
                                id="attachment"
                                type="file"
                                accept="application/pdf"
                                onChange={handleFileChange}
                                className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cep-primary/10 file:text-cep-primary hover:file:bg-cep-primary/20"
                            />
                        ) : (
                             <div className="flex items-center text-cep-text dark:text-slate-200 bg-gray-50 dark:bg-slate-700 p-2 rounded-md border dark:border-slate-600 mt-1">
                                <IconFileText className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                <span className="flex-1 truncate" title={attachment.name}>{attachment.name}</span>
                                <button 
                                    type="button"
                                    onClick={() => setAttachment(null)} 
                                    className="ml-4 p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                                    aria-label={`Remover ${attachment.name}`}
                                >
                                    <IconX className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="text-right pt-2">
                        <Button type="submit" isLoading={isSubmitting}>Enviar Recurso</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

const CountdownTimer = ({ endDate }: { endDate: string }) => {
    const calculateTimeLeft = () => {
        const difference = +new Date(endDate) - +new Date();
        let timeLeft: { [key: string]: number } = {};

        if (difference > 0) {
            timeLeft = {
                Dias: Math.floor(difference / (1000 * 60 * 60 * 24)),
                Horas: Math.floor((difference / (1000 * 60 * 60)) % 24),
                Minutos: Math.floor((difference / 1000 / 60) % 60),
                Segundos: Math.floor((difference / 1000) % 60)
            };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearTimeout(timer);
    });

    const timerComponents = Object.entries(timeLeft);

    if (!timerComponents.length) {
        return <div className="text-center font-semibold text-red-500">Prazo para aceite da vaga encerrado.</div>;
    }

    return (
        <div className="flex justify-center space-x-2 md:space-x-4">
            {timerComponents.map(([interval, value]) => (
                <div key={interval} className="flex flex-col items-center justify-center bg-white dark:bg-slate-700/50 p-3 rounded-lg w-20 h-20 shadow-inner border border-slate-200 dark:border-slate-700">
                    <span className="text-3xl font-bold text-cep-primary dark:text-cep-accent">{String(value).padStart(2, '0')}</span>
                    <span className="text-xs uppercase text-slate-500 dark:text-slate-400">{interval}</span>
                </div>
            ))}
        </div>
    );
};


const ApplicationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filesForCorrection, setFilesForCorrection] = useState<File[]>([]);
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  const [ranking, setRanking] = useState<number | null>(null);


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

  useEffect(() => {
    if (application?.status === ApplicationStatus.CLASSIFICADO_PRELIMINAR && application.edital) {
        setRanking(null); // Reset ranking on application change
        api.getAllApplications().then(allApps => {
            const eligibleStatuses = [
                ApplicationStatus.ANALISE_CONCLUIDA,
                ApplicationStatus.CLASSIFICADO_PRELIMINAR,
                ApplicationStatus.CLASSIFICADO_FINAL,
                ApplicationStatus.VAGA_ACEITA,
            ];
            const rankedApps = allApps
                .filter(app => app.edital.id === application.edital.id && eligibleStatuses.includes(app.status) && app.finalScore != null)
                .sort((a, b) => (b.finalScore ?? 0) - (a.finalScore ?? 0));
            
            const rank = rankedApps.findIndex(app => app.id === application.id);
            if (rank !== -1) {
                setRanking(rank + 1);
            }
        });
    }
  }, [application]);

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
        fetchApplication();
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao enviar documentos.';
        addToast(message, 'error');
    } finally {
        setIsSubmitting(false);
    }
  }

  const handleAcceptVacancy = async () => {
    if (!id) return;
    try {
        await api.acceptVacancy(id);
        addToast('Vaga aceita com sucesso! Parabéns!', 'success');
        fetchApplication();
    } catch (err) {
         addToast(err instanceof Error ? err.message : 'Erro ao aceitar a vaga.', 'error');
    }
  }
  
  const handleDeclineVacancy = async () => {
    if (!id) return;
    try {
        await api.declineVacancy(id);
        addToast('Vaga recusada.', 'info');
        fetchApplication();
    } catch (err) {
         addToast(err instanceof Error ? err.message : 'Erro ao recusar a vaga.', 'error');
    } finally {
        setIsDeclineModalOpen(false);
    }
  }
  
  const commissionDeniedJustification = useMemo(() => {
    if (application?.specialNeeds && application.commissionAnalysis && !application.commissionAnalysis.isEligible) {
        return application.commissionAnalysis.justification;
    }
    return null;
  }, [application]);
  
  const laudoInvalidadoAnalyst = useMemo(() => {
    if (!application || !application.specialNeeds || !application.specialNeedsDocument) {
        return false;
    }
    // Check if invalidated by analyst, but not yet reviewed by commission
    return application.specialNeedsDocument.validationStatus === ValidationStatus.INVALIDO && !application.commissionAnalysis;
  }, [application]);

  if (isLoading || !application) {
    return <div className="flex justify-center items-center h-full"><Spinner /></div>;
  }

  const { student, edital, status, documents, analysis, appeal } = application;

  const docsForCorrection = documents.filter(doc => doc.validationStatus === ValidationStatus.SOLICITADO_REENVIO);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-cep-text dark:text-white">{student.name}</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Protocolo: {application.protocol} | Edital: {edital.number} - {edital.modality}</p>
        </div>
        <StatusBadge status={status}/>
      </div>

      <Card>
          <CardContent>
            <Stepper currentStatus={status}/>
          </CardContent>
      </Card>
      
      {commissionDeniedJustification && (
        <div className="p-4 bg-red-50 dark:bg-red-900/40 border-l-4 border-red-400 dark:border-red-600">
            <h4 className="font-bold text-red-800 dark:text-red-200 flex items-center gap-2"><IconAlertTriangle/>Aviso Importante</h4>
            <p className="text-sm text-red-700 dark:text-red-300 mt-2">O candidato concorreu à vaga de Educação Especial, mas retornou para a Ampla Concorrência por inadequação da documentação após análise da comissão.</p>
            <p className="text-sm font-semibold text-red-800 dark:text-red-200 mt-3">Justificativa da Comissão:</p>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1 p-3 bg-red-100 dark:bg-red-800/40 rounded-md whitespace-pre-wrap">{commissionDeniedJustification}</p>
        </div>
      )}
      
      {laudoInvalidadoAnalyst && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/40 border-l-4 border-yellow-400 dark:border-yellow-600">
            <h4 className="font-bold text-yellow-800 dark:text-yellow-200 flex items-center gap-2"><IconAlertTriangle/>Aviso Importante</h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">O laudo médico para necessidades especiais foi invalidado pela equipe de análise. Por este motivo, o candidato agora concorre apenas às vagas de Ampla Concorrência, conforme as regras do edital.</p>
        </div>
      )}

      {status === ApplicationStatus.DOCUMENTACAO_INCOMPLETA && (
        <Card>
            <CardHeader><CardTitle>Pendências na Documentação</CardTitle></CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h3 className="font-semibold text-cep-text dark:text-white">Justificativa do Analista</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg whitespace-pre-wrap">{analysis?.justification}</p>
                </div>
                <div>
                    <h3 className="font-semibold text-cep-text dark:text-white">Documentos a serem reenviados:</h3>
                    <ul className="list-disc list-inside mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {docsForCorrection.map(doc => <li key={doc.id}>{doc.fileName}</li>)}
                    </ul>
                </div>
                 <FileUpload
                    onFilesSelect={setFilesForCorrection}
                    requiredDocuments={docsForCorrection.map(doc => doc.fileName)}
                />
                <div className="text-right">
                    <Button onClick={handleCorrectionSubmit} isLoading={isSubmitting} disabled={filesForCorrection.length === 0}>
                        Enviar Correção
                    </Button>
                </div>
            </CardContent>
        </Card>
      )}

      {status === ApplicationStatus.CLASSIFICADO_PRELIMINAR && !appeal && (
        <div className='space-y-6'>
             <Card>
                <CardHeader>
                    <CardTitle>Resultado Preliminar</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <p className="text-lg text-gray-600 dark:text-gray-400">Parabéns! O candidato foi classificado na fase preliminar.</p>
                    <div className="flex justify-center items-baseline gap-8">
                        <div>
                            <p className="text-sm uppercase text-gray-500 dark:text-slate-400">Pontuação Final</p>
                            <p className="text-6xl font-bold text-cep-primary dark:text-cep-accent">{application.finalScore?.toFixed(2)}</p>
                        </div>
                        {ranking !== null && (
                            <div>
                                <p className="text-sm uppercase text-gray-500 dark:text-slate-400">Classificação</p>
                                <p className="text-6xl font-bold text-cep-primary dark:text-cep-accent">{ranking}º</p>
                            </div>
                        )}
                    </div>
                    {ranking !== null && <p className="text-sm text-gray-500 dark:text-gray-400">Esta é sua classificação geral no edital. O período para interposição de recursos está aberto.</p>}
                </CardContent>
            </Card>
            <AppealForm applicationId={application.id} onAppealSubmitted={fetchApplication} />
        </div>
      )}

      {status === ApplicationStatus.EM_RECURSO && appeal && (
        <Card>
            <CardHeader><CardTitle>Recurso Enviado</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Seu recurso foi enviado e está aguardando análise pela equipe do CEP. Você será notificado sobre a decisão.</p>
                <div><p className="text-sm font-semibold">Protocolo do Recurso:</p><p className="font-mono text-sm bg-gray-100 dark:bg-slate-700/50 p-2 rounded mt-1">{appeal.protocol}</p></div>
                <div><p className="text-sm font-semibold">Motivo:</p><p>{appeal.reason}</p></div>
                <div><p className="text-sm font-semibold">Sua Justificativa:</p><p className="whitespace-pre-wrap p-2 border dark:border-slate-700 rounded mt-1">{appeal.justification}</p></div>
                {appeal.attachment && (
                    <div>
                        <p className="text-sm font-semibold">Anexo:</p>
                        <a href={appeal.attachment.fileUrl} target="_blank" rel="noopener noreferrer" className="text-cep-primary hover:underline flex items-center gap-2">
                           <IconFileText className="h-4 w-4" /> {appeal.attachment.fileName}
                        </a>
                    </div>
                )}
            </CardContent>
        </Card>
      )}

      {appeal && appeal.status !== AppealStatus.PENDENTE && (
         <Card className={appeal.status === AppealStatus.DEFERIDO ? 'border-teal-500' : 'border-red-500'}>
            <CardHeader><CardTitle>Resultado do Recurso: {appeal.status}</CardTitle></CardHeader>
            <CardContent>
                 <div>
                    <h3 className="font-semibold text-cep-text dark:text-white">Parecer do Analista</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg whitespace-pre-wrap">{appeal.analystJustification}</p>
                </div>
            </CardContent>
        </Card>
      )}
      
      {status === ApplicationStatus.CLASSIFICADO_FINAL && (
        <Card>
            <CardHeader><CardTitle>Decisão Final: Aceite de Vaga</CardTitle></CardHeader>
            <CardContent className="text-center space-y-4">
                 <p className="text-lg text-gray-600 dark:text-gray-400">Parabéns! O candidato foi classificado. Você tem um prazo para aceitar ou recusar a vaga.</p>
                 <CountdownTimer endDate={edital.vacancyAcceptanceDate} />
                 <div className="flex justify-center gap-4 pt-6">
                    <Button onClick={handleAcceptVacancy} size="lg">Aceitar Vaga</Button>
                    <Button onClick={() => setIsDeclineModalOpen(true)} variant="danger" size="lg">Recusar Vaga</Button>
                 </div>
            </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Documentos Enviados</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {documents.map(doc => (
              <li key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                <div className="flex items-center">
                    <IconFileText className="h-5 w-5 mr-3 text-gray-400"/>
                    <span>{doc.fileName}</span>
                </div>
                <ValidationStatusBadge status={doc.validationStatus} />
              </li>
            ))}
             {application.specialNeedsDocument && !documents.some(d => d.id === application.specialNeedsDocument?.id) && (
                 <li key={application.specialNeedsDocument.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                    <div className="flex items-center">
                        <IconFileText className="h-5 w-5 mr-3 text-gray-400"/>
                        <span>(LAUDO) {application.specialNeedsDocument.fileName}</span>
                    </div>
                    <ValidationStatusBadge status={application.specialNeedsDocument.validationStatus} />
                 </li>
            )}
          </ul>
        </CardContent>
      </Card>

      <ConfirmationModal
        isOpen={isDeclineModalOpen}
        onClose={() => setIsDeclineModalOpen(false)}
        onConfirm={handleDeclineVacancy}
        title="Confirmar Recusa de Vaga"
        message="Tem certeza que deseja recusar a vaga? Esta ação é irreversível e o candidato perderá a classificação neste edital."
        confirmButtonText="Sim, Recusar Vaga"
        confirmButtonVariant="danger"
      />
    </div>
  );
};

export default ApplicationDetail;