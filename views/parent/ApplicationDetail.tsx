import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Application, Document, ApplicationStatus, ValidationStatus, AppealStatus, AnalysisResult } from '../../types';
import { api } from '../../services/mockApi';
import Spinner from '../../components/ui/Spinner';
import Card, { CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { StatusBadge, ValidationStatusBadge } from '../../components/ui/Badge';
import Stepper from '../../components/ui/Stepper';
import { IconFileText, IconAlertTriangle, IconCircleX, IconTrash, IconX, IconDownload } from '../../constants';
import Select from '../../components/ui/Select';
import { useToast } from '../../hooks/useToast';
import ConfirmationModal from '../../components/ui/ConfirmationModal';

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

const CountdownTimer = ({ startDate, endDate }: { startDate: string, endDate: string }) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const calculateTimeLeft = () => {
        const difference = +end - +now;
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

    if (now < start) {
        return (
            <div className="text-center font-semibold text-blue-500 dark:text-blue-400 p-4 bg-blue-50 dark:bg-blue-900/40 rounded-lg">
                O período para aceite da vaga iniciará em {start.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}.
            </div>
        );
    }

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
  const [filesForCorrection, setFilesForCorrection] = useState<Record<string, File>>({});
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  const [ranking, setRanking] = useState<number | null>(null);
  const [isScoreDetailsOpen, setIsScoreDetailsOpen] = useState(false);


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

    const docsForCorrection = useMemo(() => {
        if (!application) return [];
        return application.documents.filter(doc => doc.validationStatus === ValidationStatus.SOLICITADO_REENVIO);
    }, [application]);

  const handleCorrectionFileChange = (docId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        if (file.type !== 'application/pdf') {
            addToast('Apenas arquivos PDF são permitidos.', 'error');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            addToast(`Arquivo excede o tamanho de 10MB.`, 'error');
            return;
        }
        setFilesForCorrection(prev => ({ ...prev, [docId]: file }));
    }
  };

  const removeCorrectionFile = (docId: string) => {
    setFilesForCorrection(prev => {
        const newState = { ...prev };
        delete newState[docId];
        return newState;
    });
  };

  const handleCorrectionSubmit = async () => {
    if (!id || !application) return;

    if (Object.keys(filesForCorrection).length !== docsForCorrection.length) {
        addToast('Por favor, anexe todos os documentos solicitados para correção.', 'error');
        return;
    }

    setIsSubmitting(true);
    
    const newDocumentVersions: Record<string, Document> = {};
    Object.entries(filesForCorrection).forEach(([docId, file]) => {
        newDocumentVersions[docId] = {
            id: docId,
            fileName: file.name,
            fileType: file.type,
            fileUrl: URL.createObjectURL(file), // MOCK
            validationStatus: ValidationStatus.PENDENTE,
            invalidationReason: undefined,
        };
    });

    const updatedDocuments = application.documents.map(doc => 
        newDocumentVersions[doc.id] || doc
    );

    const updatedSpecialNeedsDocuments = application.specialNeedsDocuments?.map(doc =>
        newDocumentVersions[doc.id] || doc
    );

    try {
        await api.updateApplication(id, {
            documents: updatedDocuments,
            specialNeedsDocuments: updatedSpecialNeedsDocuments,
            status: ApplicationStatus.EM_ANALISE,
        });
        addToast('Documentos enviados com sucesso.', 'success');
        setFilesForCorrection({});
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
    if (!application || !application.specialNeeds || !application.specialNeedsDocuments || application.specialNeedsDocuments.length === 0) {
        return false;
    }
    return application.specialNeedsDocuments.some(d => d.validationStatus === ValidationStatus.INVALIDO) && !application.commissionAnalysis;
  }, [application]);

  if (isLoading || !application) {
    return <div className="flex justify-center items-center h-full"><Spinner /></div>;
  }

  const { student, edital, status, documents, analysis, appeal } = application;

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
                <div className="space-y-4">
                    <h3 className="font-semibold text-cep-text dark:text-white">Documentos a serem reenviados:</h3>
                    {docsForCorrection.map(doc => (
                        <div key={doc.id} className="p-4 border dark:border-slate-700 rounded-lg bg-gray-50/50 dark:bg-slate-800/30">
                            <h4 className="font-medium text-cep-text dark:text-slate-200">{doc.fileName}</h4>
                            <p className="text-xs text-red-500 mt-1">Motivo: {doc.invalidationReason}</p>
                            <div className="mt-2">
                                {!filesForCorrection[doc.id] ? (
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        onChange={(e) => handleCorrectionFileChange(doc.id, e)}
                                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cep-primary/10 file:text-cep-primary hover:file:bg-cep-primary/20"
                                    />
                                ) : (
                                    <div className="flex items-center text-cep-text dark:text-slate-200 bg-white dark:bg-slate-700 p-2 rounded-md border dark:border-slate-600 text-sm">
                                        <IconFileText className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                        <span className="flex-1 truncate" title={filesForCorrection[doc.id].name}>{filesForCorrection[doc.id].name}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeCorrectionFile(doc.id)}
                                            className="ml-4 p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                                            aria-label={`Remover ${filesForCorrection[doc.id].name}`}
                                        >
                                            <IconX className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="text-right">
                    <Button onClick={handleCorrectionSubmit} isLoading={isSubmitting} disabled={Object.keys(filesForCorrection).length !== docsForCorrection.length}>
                        Enviar Correções
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
                    
                    {application.analysis && application.analysis.grades && (
                        <div className="text-left border-t dark:border-slate-700 pt-4 mt-4">
                            <button 
                                onClick={() => setIsScoreDetailsOpen(!isScoreDetailsOpen)} 
                                className="w-full text-left font-semibold text-cep-primary hover:underline flex justify-between items-center"
                                aria-expanded={isScoreDetailsOpen}
                            >
                                <span>Ver detalhamento da pontuação</span>
                                <span className={`transform transition-transform duration-200 ${isScoreDetailsOpen ? 'rotate-180' : ''}`}>▼</span>
                            </button>
                            {isScoreDetailsOpen && (
                                <div className="mt-4 overflow-x-auto animate-fade-in-right">
                                    {(() => { 
                                        const gradesByYear: Record<string, { portugues: number | null, matematica: number | null }> = {};
                                        application.analysis!.grades.forEach(grade => {
                                            if (!gradesByYear[grade.year]) {
                                                gradesByYear[grade.year] = { portugues: null, matematica: null };
                                            }
                                            if (grade.subject === 'Português') {
                                                gradesByYear[grade.year].portugues = grade.score;
                                            } else {
                                                gradesByYear[grade.year].matematica = grade.score;
                                            }
                                        });
                                        return (
                                            <table className="min-w-full text-sm">
                                                <thead className="bg-slate-50 dark:bg-slate-700/50">
                                                    <tr>
                                                        <th className="px-4 py-2 text-left font-medium text-slate-600 dark:text-slate-300">Ano</th>
                                                        <th className="px-4 py-2 text-left font-medium text-slate-600 dark:text-slate-300">Português</th>
                                                        <th className="px-4 py-2 text-left font-medium text-slate-600 dark:text-slate-300">Matemática</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                                    {Object.entries(gradesByYear).map(([year, scores]) => (
                                                        <tr key={year}>
                                                            <td className="px-4 py-2 font-medium text-cep-text dark:text-slate-200">{year}</td>
                                                            <td className="px-4 py-2 text-gray-600 dark:text-gray-300">{scores.portugues ?? 'N/A'}</td>
                                                            <td className="px-4 py-2 text-gray-600 dark:text-gray-300">{scores.matematica ?? 'N/A'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        );
                                    })()}
                                </div>
                            )}
                        </div>
                    )}
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
                 <CountdownTimer startDate={edital.vacancyAcceptanceStartDate} endDate={edital.vacancyAcceptanceDate} />
                 <div className="flex justify-center gap-4 pt-6">
                    <Button onClick={handleAcceptVacancy} size="lg" disabled={new Date() < new Date(edital.vacancyAcceptanceStartDate) || new Date() > new Date(edital.vacancyAcceptanceDate)}>Aceitar Vaga</Button>
                    <Button onClick={() => setIsDeclineModalOpen(true)} variant="danger" size="lg" disabled={new Date() < new Date(edital.vacancyAcceptanceStartDate) || new Date() > new Date(edital.vacancyAcceptanceDate)}>Recusar Vaga</Button>
                 </div>
            </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Documentos Enviados</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {documents.map(doc => {
              const isLaudo = application.specialNeedsDocuments?.some(laudo => laudo.id === doc.id);
              return (
                <li key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                  <div className="flex items-center min-w-0">
                      <IconFileText className="h-5 w-5 mr-3 text-gray-400"/>
                      <span className='truncate'>{isLaudo ? `(LAUDO) ${doc.fileName}` : doc.fileName}</span>
                       <a href={doc.fileUrl} download={doc.fileName} className="ml-2 p-1 text-slate-400 hover:text-cep-primary" title={`Baixar ${doc.fileName}`}>
                          <IconDownload className="h-4 w-4" />
                      </a>
                  </div>
                  <ValidationStatusBadge status={doc.validationStatus} />
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      <ConfirmationModal
        isOpen={isDeclineModalOpen}
        onClose={() => setIsDeclineModalOpen(false)}
        onConfirm={handleDeclineVacancy}
        title="Confirmar Recusa de Vaga"
        message="Tem certeza que deseja recusar a vaga? Esta ação é irreversível e o candidato perderá a classificação neste processo seletivo."
        confirmButtonText="Sim, Recusar Vaga"
        confirmButtonVariant="danger"
      />
    </div>
  );
};

export default ApplicationDetail;