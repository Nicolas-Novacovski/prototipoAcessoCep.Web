

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Application, AnalysisResult, Grade, UserRole, Document, ValidationStatus, ApplicationStatus, EditalModalities, AppealStatus } from '../../types';
import { api } from '../../services/mockApi';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import Spinner from '../../components/ui/Spinner';
import Card, { CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { StatusBadge, ValidationStatusBadge } from '../../components/ui/Badge';
import { IconAlertTriangle, IconFileText, IconInfo, IconDownload, IconBookOpen } from '../../constants';
import PdfViewer from '../../components/ui/PdfViewer';
import Modal from '../../components/ui/Modal';


const ReasonModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    placeholder
}: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    title: string;
    placeholder: string;
}) => {
    const [reason, setReason] = useState('');
    const { addToast } = useToast();

    const handleConfirm = () => {
        if (!reason.trim()) {
            addToast('A justificativa é obrigatória.', 'error');
            return;
        }
        onConfirm(reason);
        setReason('');
    };
    
    // Clear reason when modal is reopened for a new context
    useEffect(() => {
        if(isOpen) setReason('');
    }, [isOpen]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="space-y-4">
                <textarea
                    rows={4}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-cep-primary focus:border-cep-primary sm:text-sm"
                    placeholder={placeholder}
                />
                <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button type="button" onClick={handleConfirm}>Confirmar</Button>
                </div>
            </div>
        </Modal>
    );
};

const GuidelinesModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    const guidelines = [
        { situacao: 'Ainda não atingiu', sigla: 'AN', descricao: 'O/A estudante demonstra um desenvolvimento ainda elementar em relação ao critério avaliado. Há a necessidade de um plano de trabalho individual, com proposição de atividades diferenciadas e diversificadas a fim de que construa progressivamente seu processo de aprendizagem.' },
        { situacao: 'Atingiu parcialmente', sigla: 'AP', descricao: 'O/A estudante ainda não domina com autonomia o critério de aprendizagem avaliado, necessitando de um acompanhamento pedagógico individualizado e constante. É necessária a elaboração de planejamentos em caráter de sucessivas retomadas e avanços, dando suporte para uma aprendizagem significativa e autônoma.' },
        { situacao: 'Atingiu', sigla: 'AT', descricao: 'O/A estudante demonstra domínio do critério de aprendizagem avaliado, necessitando de atividades de aprofundamento para avançar ainda mais em seus conhecimentos.' },
        { situacao: 'Supera o esperado em relação ao critério avaliado', sigla: 'SE', descricao: 'O/A estudante demonstra ir além do critério avaliado, portanto, é necessário proporcionar novos desafios a fim de manter seu interesse pela aprendizagem e auxiliá-lo/a no aprimoramento de seus conhecimentos.' }
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Diretrizes de Avaliação" size="4xl">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                    <thead className="bg-gray-100 dark:bg-slate-700/50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">Situação do/a Estudante</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">Sigla</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">Descrição</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                        {guidelines.map(item => (
                            <tr key={item.sigla}>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-cep-text dark:text-white">{item.situacao}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-bold">{item.sigla}</td>
                                <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-normal">{item.descricao}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Modal>
    );
};


const AnalysisView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingForLater, setIsSavingForLater] = useState(false);
  const [selectedDocUrl, setSelectedDocUrl] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});

  const [modalContext, setModalContext] = useState<{ docId: string; action: ValidationStatus.INVALIDO | ValidationStatus.SOLICITADO_REENVIO; } | null>(null);
  const [justification, setJustification] = useState('');
  const [showSaveButton, setShowSaveButton] = useState(false);
  const [isGuidelinesModalOpen, setIsGuidelinesModalOpen] = useState(false);

  // State for appeal resolution
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [isResolutionModalOpen, setIsResolutionModalOpen] = useState(false);
  const [resolutionJustification, setResolutionJustification] = useState('');

  const [formState, setFormState] = useState<{ observation: string; grades: Grade[] }>({
      observation: '',
      grades: [],
  });
  
    const ageWarning = useMemo(() => {
        if (!application || application.edital.modality !== EditalModalities.FUNDAMENTAL_6_ANO) {
            return null;
        }
        const birthYear = new Date(application.student.birthDate).getFullYear();
        const currentYear = new Date().getFullYear();
        const age = currentYear - birthYear;
        if (age < 10) return 'A idade do candidato está abaixo da prevista em edital (10-11 anos).';
        if (age > 11) return 'A idade do candidato está acima da prevista em edital (10-11 anos).';
        return null;
    }, [application]);
    
    const isFormDisabled = useMemo(() => {
        if (!application || isReanalyzing) {
            return false;
        }
        // Allow re-analysis if status is EM_ANALISE or DOCUMENTACAO_INCOMPLETA
        const lockedStatuses = [
            ApplicationStatus.ANALISE_CONCLUIDA,
            ApplicationStatus.AGUARDANDO_PARECER_COMISSAO,
            ApplicationStatus.CLASSIFICADO_PRELIMINAR,
            ApplicationStatus.CLASSIFICADO_FINAL,
            ApplicationStatus.VAGA_ACEITA,
            ApplicationStatus.VAGA_RECUSADA,
            ApplicationStatus.ANALISE_INDEFERIDA,
        ];
        return lockedStatuses.includes(application.status);
    }, [application, isReanalyzing]);

  useEffect(() => {
    if (id) {
      api.getApplicationById(id)
        .then(app => {
            if (app) {
              setApplication(app);
              let allDocs = [...app.documents];
              if (app.specialNeedsDocuments) {
                 app.specialNeedsDocuments.forEach(laudo => {
                     if (!allDocs.some(d => d.id === laudo.id)) {
                         allDocs.push(laudo);
                     }
                 });
              }
              if (app.appeal?.attachment && !allDocs.some(d => d.id === app.appeal!.attachment!.id)) {
                  allDocs.push(app.appeal.attachment);
              }

              setDocuments(allDocs);
              if (allDocs.length > 0) {
                  setSelectedDocUrl(allDocs[0].fileUrl);
              }

              if(app.analysis) {
                  setFormState({ observation: app.analysis.observation, grades: app.analysis.grades })
                  setJustification(app.analysis.justification);
                  if (app.analysis.checklist) {
                    const initialChecklistState = app.analysis.checklist.reduce((acc, item) => {
                        acc[item.requirementId] = item.checked;
                        return acc;
                    }, {} as Record<string, boolean>);
                    setChecklist(initialChecklistState);
                  }
              } else {
                const gradeYears = app.edital.modality === EditalModalities.ENSINO_MEDIO || app.edital.modality === EditalModalities.TECNICO
                    ? ['6º Ano', '7º Ano', '8º Ano', '9º Ano (Parcial)']
                    : ['1º Ano', '2º Ano', '3º Ano', '4º Ano', '5º Ano'];
                
                const initialGrades = gradeYears.flatMap(year => ([
                    { year, subject: 'Português' as const, score: null },
                    { year, subject: 'Matemática' as const, score: null }
                ]));

                setFormState({ observation: '', grades: initialGrades });

                if (app.edital.customRequirements) {
                  const initialChecklistState = app.edital.customRequirements.reduce((acc, item) => {
                      acc[item.id] = false;
                      return acc;
                  }, {} as Record<string, boolean>);
                  setChecklist(initialChecklistState);
                }
              }
              if (app.appeal?.status === AppealStatus.DEFERIDO) {
                setIsReanalyzing(true);
              }
            } else {
              addToast('Inscrição não encontrada.', 'error');
              navigate('/dashboard');
            }
        })
        .finally(() => setIsLoading(false));
    }
  }, [id, navigate, addToast]);
  
  useEffect(() => {
    const allDocsValidated = documents.length > 0 && documents.every(d => d.validationStatus !== ValidationStatus.PENDENTE);
    setShowSaveButton(allDocsValidated || isReanalyzing);

    const reuploadReason = documents
        .filter(d => d.validationStatus === ValidationStatus.SOLICITADO_REENVIO && d.invalidationReason)
        .map(d => `Reenvio solicitado para ${d.fileName}: ${d.invalidationReason}`)
        .join('\n');
    
    const invalidReason = documents
        .filter(d => d.validationStatus === ValidationStatus.INVALIDO && d.invalidationReason)
        .map(d => `Documento indeferido ${d.fileName}: ${d.invalidationReason}`)
        .join('\n');

    if (reuploadReason) {
        setJustification(reuploadReason);
    } else if (invalidReason) {
        setJustification(invalidReason);
    } else if (allDocsValidated && documents.every(d => d.validationStatus === ValidationStatus.VALIDO)) {
        if(application?.specialNeeds){
            setJustification('Documentação formalmente correta. Laudo encaminhado para análise da comissão.');
        } else {
            setJustification('Documentação aprovada em conformidade com o edital.');
        }
    } else {
        setJustification('');
    }

  }, [documents, application, isReanalyzing]);

  const handleGradeChange = (index: number, value: string) => {
    const newGrades = [...formState.grades];
    newGrades[index].score = value ? parseFloat(value) : null;
    setFormState({ ...formState, grades: newGrades });
  }

  const handleSetValidationStatus = (docId: string, status: ValidationStatus.VALIDO) => {
    setDocuments(docs => docs.map(doc => {
      if (doc.id !== docId) return doc;
      return { ...doc, validationStatus: status, invalidationReason: undefined };
    }));
  };

  const handleOpenReasonModal = (docId: string, action: ValidationStatus.INVALIDO | ValidationStatus.SOLICITADO_REENVIO) => {
    setModalContext({ docId, action });
  };
  
  const handleConfirmReason = (reason: string) => {
    if (!modalContext) return;
    const { docId, action } = modalContext;
    setDocuments(docs => docs.map(doc => 
        doc.id === docId ? { ...doc, validationStatus: action, invalidationReason: reason } : doc
    ));
    setModalContext(null);
  };

    const handleChecklistChange = (requirementId: string) => {
        setChecklist(prev => ({ ...prev, [requirementId]: !prev[requirementId] }));
    };

    const handleDeferAppeal = async () => {
        if (!application || !application.appeal) return;
        setIsSubmitting(true);
        try {
            await api.resolveAppeal(application.id, {
                status: AppealStatus.DEFERIDO,
                analystJustification: "Recurso aceito. A análise foi reaberta para correção."
            });
            setIsReanalyzing(true);
            setApplication(prev => prev ? ({ ...prev, appeal: { ...prev.appeal!, status: AppealStatus.DEFERIDO } }) : null);
            addToast('Recurso deferido. Por favor, corrija as notas e salve a nova análise.', 'success');
        } catch(err) {
            const message = err instanceof Error ? err.message : 'Erro ao deferir recurso.';
            addToast(message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleIndeferAppeal = async () => {
        if (!application || !resolutionJustification.trim()) {
            addToast('A justificativa é obrigatória para indeferir o recurso.', 'error');
            return;
        }
        setIsSubmitting(true);
        try {
            await api.resolveAppeal(application.id, {
                status: AppealStatus.INDEFERIDO,
                analystJustification: resolutionJustification
            });
            addToast('Recurso indeferido com sucesso.', 'success');
            navigate('/dashboard');
        } catch(err) {
            const message = err instanceof Error ? err.message : 'Erro ao indeferir recurso.';
            addToast(message, 'error');
        } finally {
            setIsSubmitting(false);
            setIsResolutionModalOpen(false);
            setResolutionJustification('');
        }
    }
  
  const handleSaveForLater = async () => {
    if (!id || !user || !application) return;
    
    setIsSavingForLater(true);
    
    const checklistData = Object.entries(checklist).map(([requirementId, checked]) => ({
        requirementId,
        checked,
    }));

    const partialAnalysis: Partial<AnalysisResult> = {
        analystId: user.id,
        analystName: user.name,
        date: new Date().toISOString(),
        grades: formState.grades,
        observation: formState.observation,
        justification,
        checklist: checklistData,
    };

    try {
        await api.sendApplicationToEndOfQueue(id, partialAnalysis, documents);
        addToast('Análise salva. A inscrição foi movida para o fim da fila.', 'success');
        navigate('/analise');
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao salvar para depois.';
        addToast(message, 'error');
    } finally {
        setIsSavingForLater(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !user || !application) return;

    const anyPending = documents.some(d => d.validationStatus === ValidationStatus.PENDENTE);
    if (anyPending && !isReanalyzing) {
        addToast('Valide todos os documentos antes de salvar.', 'error');
        return;
    }

    let newStatus: ApplicationStatus;
    let isApproved = false;
    
    const anyReupload = documents.some(d => d.validationStatus === ValidationStatus.SOLICITADO_REENVIO);
    const anyInvalid = documents.some(d => d.validationStatus === ValidationStatus.INVALIDO);

    if (anyReupload && !isReanalyzing) {
        newStatus = ApplicationStatus.DOCUMENTACAO_INCOMPLETA;
    } else if (anyInvalid && !isReanalyzing) {
        newStatus = ApplicationStatus.ANALISE_INDEFERIDA;
    } else {
        const areAllGradesFilled = formState.grades.every(g => g.score !== null && g.score !== undefined && g.score.toString().trim() !== '');
        if (!areAllGradesFilled) {
            addToast('Preencha todas as notas para salvar uma análise deferida.', 'error');
            return;
        }
        
        const allChecklistItemsChecked = (application.edital.customRequirements || []).every(item => checklist[item.id]);
        if (!allChecklistItemsChecked) {
             addToast('Marque todos os itens do checklist para deferir a análise.', 'error');
             return;
        }
        
        isApproved = true;

        if (application.specialNeeds) {
            newStatus = ApplicationStatus.AGUARDANDO_PARECER_COMISSAO;
        } else {
            newStatus = ApplicationStatus.ANALISE_CONCLUIDA;
        }
    }

    setIsSubmitting(true);
    
    const checklistData = Object.entries(checklist).map(([requirementId, checked]) => ({
        requirementId,
        checked,
    }));
    
    const analysisResult: AnalysisResult = {
        analystId: user.id,
        analystName: user.name,
        date: new Date().toISOString(),
        grades: formState.grades,
        observation: formState.observation,
        justification: isReanalyzing ? 'Análise refeita após recurso deferido.' : justification,
        isApproved,
        checklist: checklistData,
    };
    
    try {
        await api.submitAnalysis(id, analysisResult, documents, newStatus);
        addToast(`Análise ${isReanalyzing ? 'refeita e salva' : 'salva'} com sucesso!`, 'success');
        navigate('/dashboard');
    } catch(err) {
        const message = err instanceof Error ? err.message : 'Erro ao salvar análise.';
        addToast(message, 'error');
    } finally {
        setIsSubmitting(false);
    }
  }

  const gradesByYear = useMemo(() => {
    return formState.grades.reduce((acc, grade) => {
        if (!acc[grade.year]) {
            acc[grade.year] = [];
        }
        acc[grade.year].push(grade);
        return acc;
    }, {} as Record<string, Grade[]>);
  }, [formState.grades]);


  if (isLoading || !application) {
    return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
  }
  
  if (user?.role !== UserRole.ANALISTA && user?.role !== UserRole.ADMIN_CEP) {
      return <div>Acesso negado.</div>
  }
  
  const modalInfo = modalContext ? (
    modalContext.action === ValidationStatus.INVALIDO 
        ? { title: 'Indeferir Documento', placeholder: 'Motivo do indeferimento...'} 
        : { title: 'Solicitar Reenvio de Documento', placeholder: 'Explique o que precisa ser corrigido...'}
  ) : { title: '', placeholder: ''};

  return (
    <>
      {ageWarning && (
          <div className="mb-6">
              <Card className="bg-yellow-50 dark:bg-yellow-900/40 border border-yellow-300 dark:border-yellow-700/60">
                  <CardContent className="flex items-center">
                       <IconAlertTriangle className="h-6 w-6 text-yellow-500 mr-4 flex-shrink-0" />
                       <div>
                          <CardTitle className="text-yellow-800 dark:text-yellow-200 text-lg">Alerta de Idade</CardTitle>
                          <p className="text-yellow-700 dark:text-yellow-300 mt-1">{ageWarning}</p>
                       </div>
                  </CardContent>
              </Card>
          </div>
      )}
        {application.status === ApplicationStatus.EM_RECURSO && !isReanalyzing && application.appeal && (
             <Card className="mb-6 border-blue-500">
                <CardHeader>
                    <CardTitle>Resolução de Recurso</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <p className="text-sm"><strong>Protocolo do Recurso:</strong> {application.appeal.protocol}</p>
                     <p className="text-sm"><strong>Motivo:</strong> {application.appeal.reason}</p>
                     <p className="text-sm"><strong>Justificativa do Responsável:</strong><span className="block p-2 mt-1 bg-blue-50 dark:bg-slate-700/50 rounded">{application.appeal.justification}</span></p>
                     {application.appeal.attachment && (
                        <p className="text-sm flex items-center gap-2">
                            <strong>Anexo:</strong> 
                            <button onClick={() => setSelectedDocUrl(application.appeal!.attachment!.fileUrl)} className="text-cep-primary hover:underline">{application.appeal.attachment.fileName}</button>
                            <a href={application.appeal.attachment.fileUrl} download={application.appeal.attachment.fileName} className="text-gray-400 hover:text-cep-primary" title="Baixar anexo">
                                <IconDownload className="h-4 w-4" />
                            </a>
                        </p>
                     )}
                     <div className="flex justify-end gap-4 pt-4 border-t dark:border-slate-700">
                        <Button variant="danger" onClick={() => setIsResolutionModalOpen(true)}>Indeferir Recurso</Button>
                        <Button onClick={handleDeferAppeal} isLoading={isSubmitting}>Deferir e Reanalisar</Button>
                    </div>
                </CardContent>
            </Card>
        )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Document List */}
          <div className="lg:col-span-3 space-y-3 lg:h-[80vh] lg:overflow-y-auto pr-2">
              {documents.map(doc => {
                  const isLaudo = application.specialNeedsDocuments?.some(laudo => laudo.id === doc.id) || false;
                  const isAppealAttachment = doc.id === application.appeal?.attachment?.id;
                  let displayName = doc.fileName;
                  if (isLaudo) displayName = `(LAUDO) ${doc.fileName}`;
                  if (isAppealAttachment) displayName = `(RECURSO) ${doc.fileName}`;

                  return (
                      <div key={doc.id} className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                          <div className='flex items-center justify-between'>
                            <button className="flex items-center min-w-0 text-left" onClick={() => setSelectedDocUrl(doc.fileUrl)}>
                                <IconFileText className="h-5 w-5 mr-2 text-cep-primary flex-shrink-0"/>
                                <span className="text-sm font-medium text-cep-text dark:text-slate-200 truncate" title={displayName}>{displayName}</span>
                            </button>
                             <a href={doc.fileUrl} download={doc.fileName} className="p-1 text-slate-400 hover:text-cep-primary" title={`Baixar ${doc.fileName}`}>
                                <IconDownload className="h-4 w-4" />
                            </a>
                          </div>
                          <div className='flex items-center justify-between mt-2'>
                            <ValidationStatusBadge status={doc.validationStatus} />
                             {!isAppealAttachment && (
                                <div className="flex items-center justify-start gap-1 flex-wrap">
                                    <Button size="sm" className="text-xs" onClick={() => handleSetValidationStatus(doc.id, ValidationStatus.VALIDO)} disabled={isFormDisabled}>Deferir</Button>
                                    <Button size="sm" variant="secondary" className="text-xs" onClick={() => handleOpenReasonModal(doc.id, ValidationStatus.INVALIDO)} disabled={isFormDisabled}>Indeferir</Button>
                                    <Button size="sm" variant="secondary" className="text-xs" onClick={() => handleOpenReasonModal(doc.id, ValidationStatus.SOLICITADO_REENVIO)} disabled={isFormDisabled}>Reenvio</Button>
                                </div>
                            )}
                          </div>
                           {(doc.validationStatus === ValidationStatus.INVALIDO || doc.validationStatus === ValidationStatus.SOLICITADO_REENVIO) && doc.invalidationReason && (
                              <div className="mt-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/50 p-2 rounded border border-slate-200 dark:border-slate-600">
                                  <strong>Motivo:</strong> {doc.invalidationReason}
                              </div>
                          )}
                      </div>
                  );
              })}
          </div>

          {/* Document Viewer */}
          <div className="lg:col-span-5 h-[80vh]">
              <div className="bg-gray-800 dark:bg-slate-900 rounded-lg shadow-lg h-full">
                  <PdfViewer fileUrl={selectedDocUrl} />
              </div>
          </div>

          {/* Analysis Form */}
          <div className="lg:col-span-4">
            <Card className="max-h-[80vh] overflow-y-auto">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>Análise de Candidatura</CardTitle>
                            <p className="text-slate-600 dark:text-slate-400 mt-1">{application.student.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Protocolo {application.protocol}</p>
                        </div>
                        <StatusBadge status={application.status} />
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                         {application.appeal?.status === AppealStatus.DEFERIDO && (
                             <div className="p-4 bg-blue-50 dark:bg-blue-900/40 border-l-4 border-blue-400 dark:border-blue-600">
                                <h4 className="font-bold text-blue-800 dark:text-blue-200">Recurso Deferido</h4>
                                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">O recurso foi aceito. A análise foi reaberta para correção. Por favor, ajuste as notas e salve novamente.</p>
                            </div>
                        )}
                        {application.specialNeeds && (
                            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/40 border-l-4 border-yellow-400 dark:border-yellow-600 flex items-center"><IconAlertTriangle className="h-5 w-5 text-yellow-400 mr-3" aria-hidden="true" /><p className="text-sm text-yellow-700 dark:text-yellow-200">Candidato concorre em modalidade de Educação Especial.</p></div>
                        )}
                        
                        {application.edital.customRequirements && application.edital.customRequirements.length > 0 && (
                            <div>
                                <h3 className="text-lg font-medium text-cep-text dark:text-white">Checklist de Requisitos do Edital</h3>
                                <div className="mt-2 space-y-3 p-3 border dark:border-slate-700 rounded-lg bg-slate-50/50 dark:bg-slate-700/30">
                                    {application.edital.customRequirements.map(req => (
                                        <div key={req.id} className="relative flex items-start">
                                            <div className="flex h-5 items-center">
                                                <input
                                                    id={`checklist-${req.id}`}
                                                    type="checkbox"
                                                    className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 text-cep-primary focus:ring-cep-primary"
                                                    checked={checklist[req.id] || false}
                                                    onChange={() => handleChecklistChange(req.id)}
                                                    disabled={isFormDisabled}
                                                />
                                            </div>
                                            <div className="ml-3 text-sm">
                                                <label htmlFor={`checklist-${req.id}`} className="font-medium text-cep-text dark:text-slate-200">
                                                    {req.label}
                                                </label>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-medium text-cep-text dark:text-white">Conversão de Pareceres/Notas</h3>
                                <div className="group relative flex items-center">
                                    <IconInfo className="h-5 w-5 text-slate-400 dark:text-slate-500 cursor-help" />
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 z-10 mb-2 w-64 p-3 bg-slate-700 dark:bg-slate-800 text-white dark:text-slate-200 text-xs font-normal rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                        Insira as notas na escala de 0 a 100, por exemplo: 87.
                                    </div>
                                </div>
                                <button type="button" onClick={() => setIsGuidelinesModalOpen(true)} className="p-1 text-slate-400 hover:text-cep-primary dark:text-slate-500 dark:hover:text-cep-primary transition-colors" title="Ver diretrizes de avaliação">
                                    <IconBookOpen className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="space-y-4 mt-2">
                                {Object.entries(gradesByYear).map(([year, grades]) => {
                                    const portuguesGrade = grades.find(g => g.subject === 'Português');
                                    const matematicaGrade = grades.find(g => g.subject === 'Matemática');
                                    const portuguesIndex = formState.grades.findIndex(g => g.year === year && g.subject === 'Português');
                                    const matematicaIndex = formState.grades.findIndex(g => g.year === year && g.subject === 'Matemática');
                                    if (!portuguesGrade || !matematicaGrade) return null;
                                    return (
                                        <div key={year} className="p-3 border dark:border-slate-700 rounded-lg bg-slate-50/50 dark:bg-slate-700/30">
                                          <p className="font-semibold text-sm mb-2 text-cep-text dark:text-slate-200">{year}</p>
                                          <div className="grid grid-cols-2 gap-4">
                                              <div><label className="block text-xs font-medium text-slate-600 dark:text-slate-400">Português</label><input type="number" step="1" min="0" max="100" value={portuguesGrade.score ?? ''} onChange={e => handleGradeChange(portuguesIndex, e.target.value)} disabled={isFormDisabled} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-cep-primary focus:border-cep-primary sm:text-sm disabled:bg-slate-100 dark:disabled:bg-slate-800"/></div>
                                              <div><label className="block text-xs font-medium text-slate-600 dark:text-slate-400">Matemática</label><input type="number" step="1" min="0" max="100" value={matematicaGrade.score ?? ''} onChange={e => handleGradeChange(matematicaIndex, e.target.value)} disabled={isFormDisabled} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-cep-primary focus:border-cep-primary sm:text-sm disabled:bg-slate-100 dark:disabled:bg-slate-800"/></div>
                                          </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <div><label className="block text-sm font-medium text-cep-text dark:text-white">Justificativa / Parecer Descritivo (Gerado)</label><textarea rows={3} value={justification} readOnly className="mt-1 block w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm sm:text-sm" /></div>
                        <div><label className="block text-sm font-medium text-cep-text dark:text-white">Observações Internas</label><textarea rows={2} value={formState.observation} onChange={e => setFormState({ ...formState, observation: e.target.value })} disabled={isFormDisabled} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-cep-primary focus:border-cep-primary sm:text-sm disabled:bg-slate-100 dark:disabled:bg-slate-800" /></div>

                        {showSaveButton && !isFormDisabled && (
                          <div className="flex justify-end items-center gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                              <Button 
                                  type="button" 
                                  variant="secondary" 
                                  onClick={handleSaveForLater} 
                                  isLoading={isSavingForLater}
                                  disabled={isSubmitting}
                              >
                                  Salvar para Fim de Fila
                              </Button>
                              <Button 
                                  type="submit" 
                                  isLoading={isSubmitting}
                                  disabled={isSavingForLater}
                              >
                                  {isReanalyzing ? 'Salvar Reanálise' : 'Finalizar Análise'}
                              </Button>
                          </div>
                        )}
                    </form>
                </CardContent>
            </Card>
          </div>
      </div>
      <ReasonModal isOpen={!!modalContext} onClose={() => setModalContext(null)} onConfirm={handleConfirmReason} title={modalInfo.title} placeholder={modalInfo.placeholder}/>
      <GuidelinesModal isOpen={isGuidelinesModalOpen} onClose={() => setIsGuidelinesModalOpen(false)} />
      <Modal isOpen={isResolutionModalOpen} onClose={() => setIsResolutionModalOpen(false)} title="Indeferir Recurso">
        <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Forneça uma justificativa clara para o indeferimento do recurso. Esta informação será visível para o responsável.</p>
            <textarea
                rows={4}
                value={resolutionJustification}
                onChange={(e) => setResolutionJustification(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-cep-primary focus:border-cep-primary sm:text-sm"
                placeholder="Ex: A pontuação foi calculada corretamente conforme as notas apresentadas nos boletins..."
            />
            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                <Button type="button" variant="secondary" onClick={() => setIsResolutionModalOpen(false)}>Cancelar</Button>
                <Button type="button" variant="danger" onClick={handleIndeferAppeal} isLoading={isSubmitting}>Confirmar Indeferimento</Button>
            </div>
        </div>
      </Modal>
    </>
  );
};

export default AnalysisView;
