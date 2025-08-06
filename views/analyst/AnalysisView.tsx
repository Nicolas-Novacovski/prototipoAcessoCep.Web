

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Application, AnalysisResult, Grade, UserRole, Document, ValidationStatus, ApplicationStatus, EditalModalities } from '../../types';
import { api } from '../../services/mockApi';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import Spinner from '../../components/ui/Spinner';
import Card, { CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { StatusBadge, ValidationStatusBadge } from '../../components/ui/Badge';
import { IconAlertTriangle, IconFileText, IconCircleCheck, IconCircleX, IconInfo } from '../../constants';
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


const AnalysisView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDocUrl, setSelectedDocUrl] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);

  const [modalContext, setModalContext] = useState<{ docId: string; action: ValidationStatus.INVALIDO | ValidationStatus.SOLICITADO_REENVIO; } | null>(null);
  const [justification, setJustification] = useState('');
  const [showSaveButton, setShowSaveButton] = useState(false);

  const [formState, setFormState] = useState<{ observation: string; grades: Grade[] }>({
      observation: '',
      grades: [
          { year: 1, subject: 'Português', score: null }, { year: 1, subject: 'Matemática', score: null },
          { year: 2, subject: 'Português', score: null }, { year: 2, subject: 'Matemática', score: null },
          { year: 3, subject: 'Português', score: null }, { year: 3, subject: 'Matemática', score: null },
          { year: 4, subject: 'Português', score: null }, { year: 4, subject: 'Matemática', score: null },
          { year: 5, subject: 'Português', score: null }, { year: 5, subject: 'Matemática', score: null },
      ],
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

  useEffect(() => {
    if (id) {
      api.getApplicationById(id)
        .then(app => {
            if (app) {
              setApplication(app);
              const allDocs = [...app.documents];
              if (app.specialNeedsDocument) {
                allDocs.push({
                    ...app.specialNeedsDocument,
                    fileName: `(LAUDO) ${app.specialNeedsDocument.fileName}`
                });
              }
              setDocuments(allDocs);
              if (allDocs.length > 0) {
                  setSelectedDocUrl(allDocs[0].fileUrl);
              }
              if(app.analysis) {
                  setFormState({ observation: app.analysis.observation, grades: app.analysis.grades })
                  setJustification(app.analysis.justification);
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
    setShowSaveButton(allDocsValidated);

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
        setJustification('Documentação aprovada em conformidade com o edital.');
    } else {
        setJustification('');
    }

  }, [documents]);

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


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !user) return;

    const anyPending = documents.some(d => d.validationStatus === ValidationStatus.PENDENTE);
    if (anyPending) {
        addToast('Valide todos os documentos antes de salvar.', 'error');
        return;
    }

    let newStatus: ApplicationStatus;
    let isApproved = false;
    
    const anyReupload = documents.some(d => d.validationStatus === ValidationStatus.SOLICITADO_REENVIO);
    const anyInvalid = documents.some(d => d.validationStatus === ValidationStatus.INVALIDO);

    if (anyReupload) {
        newStatus = ApplicationStatus.DOCUMENTACAO_INCOMPLETA;
    } else if (anyInvalid) {
        newStatus = ApplicationStatus.ANALISE_INDEFERIDA;
    } else {
        newStatus = ApplicationStatus.ANALISE_CONCLUIDA;
        isApproved = true;
        const areAllGradesFilled = formState.grades.every(g => g.score !== null && g.score !== undefined && g.score.toString().trim() !== '');
        if (!areAllGradesFilled) {
            addToast('Preencha todas as notas para salvar uma análise deferida.', 'error');
            return;
        }
    }

    setIsSubmitting(true);
    
    const analysisResult: AnalysisResult = {
        analystId: user.id,
        analystName: user.name,
        date: new Date().toISOString(),
        grades: formState.grades,
        observation: formState.observation,
        justification: justification,
        isApproved,
    };
    
    try {
        await api.submitAnalysis(id, analysisResult, documents, newStatus);
        addToast('Análise salva com sucesso!', 'success');
        navigate('/dashboard');
    } catch(err) {
        const message = err instanceof Error ? err.message : 'Erro ao salvar análise.';
        addToast(message, 'error');
    } finally {
        setIsSubmitting(false);
    }
  }

  if (isLoading || !application) {
    return <div className="flex justify-center items-center h-full"><Spinner /></div>;
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Document Viewer */}
        <div className="flex flex-col">
            <Card className="flex-1 flex flex-col">
                <CardHeader>
                    <div className="flex items-center">
                        <CardTitle>Validação e Visualização de Documentos</CardTitle>
                        <div className="group relative flex justify-center ml-2">
                            <IconInfo className="h-5 w-5 text-slate-400 dark:text-slate-500 cursor-help" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 z-10 mb-2 w-72 p-3 bg-slate-700 dark:bg-slate-800 text-white dark:text-slate-200 text-xs font-normal rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                A análise dos documentos segue os critérios dos editais. Caso um documento não seja aplicável, ele poderá ser indeferido e poderá ser solicitada uma complementação.
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-0">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                        <ul className="space-y-3">
                            {documents.map(doc => (
                                <li key={doc.id} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                    <button className="w-full flex items-center justify-between text-left rounded-md transition-colors hover:bg-slate-100 dark:hover:bg-slate-600 p-1 -m-1" onClick={() => setSelectedDocUrl(doc.fileUrl)}>
                                        <div className="flex items-center min-w-0">
                                            <IconFileText className="h-5 w-5 mr-2 text-cep-primary flex-shrink-0"/>
                                            <span className="text-sm font-medium text-cep-text dark:text-slate-200 truncate" title={doc.fileName}>{doc.fileName}</span>
                                        </div>
                                        <ValidationStatusBadge status={doc.validationStatus} />
                                    </button>
                                    <div className="mt-3 pl-7 flex items-center justify-start gap-2">
                                        <Button 
                                          size="sm" 
                                          className={`transition-all duration-200 text-xs ${
                                              doc.validationStatus === ValidationStatus.VALIDO 
                                              ? 'bg-teal-600 hover:bg-teal-700 text-white ring-2 ring-offset-1 ring-teal-500' 
                                              : 'bg-teal-100 hover:bg-teal-200 text-teal-800 dark:bg-teal-800/50 dark:hover:bg-teal-700/50 dark:text-teal-200'
                                          }`}
                                          onClick={() => handleSetValidationStatus(doc.id, ValidationStatus.VALIDO)}
                                        >
                                          Deferir
                                        </Button>
                                        <Button 
                                          size="sm" 
                                          variant="danger"
                                          className={`transition-all duration-200 text-xs ${
                                              doc.validationStatus === ValidationStatus.INVALIDO 
                                              ? 'bg-red-600 hover:bg-red-700 text-white ring-2 ring-offset-1 ring-red-600' 
                                              : 'bg-red-100 hover:bg-red-200 text-red-800 dark:bg-red-800/50 dark:hover:bg-red-700/50 dark:text-red-200'
                                          }`}
                                          onClick={() => handleOpenReasonModal(doc.id, ValidationStatus.INVALIDO)}
                                        >
                                          Indeferir
                                        </Button>
                                        <Button 
                                          size="sm" 
                                          className={`transition-all duration-200 text-xs ${
                                              doc.validationStatus === ValidationStatus.SOLICITADO_REENVIO 
                                              ? 'bg-yellow-500 hover:bg-yellow-600 text-white ring-2 ring-offset-1 ring-yellow-500' 
                                              : 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800 dark:bg-yellow-800/50 dark:hover:bg-yellow-700/50 dark:text-yellow-200'
                                          }`}
                                          onClick={() => handleOpenReasonModal(doc.id, ValidationStatus.SOLICITADO_REENVIO)}
                                        >
                                          Solicitar Reenvio
                                        </Button>
                                    </div>
                                    {(doc.validationStatus === ValidationStatus.INVALIDO || doc.validationStatus === ValidationStatus.SOLICITADO_REENVIO) && doc.invalidationReason && (
                                        <div className="mt-2 ml-7 text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 p-2 rounded border border-slate-200 dark:border-slate-600">
                                            <strong>Motivo:</strong> {doc.invalidationReason}
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="flex-1 bg-gray-800 dark:bg-slate-900 p-0 rounded-b-lg min-h-[500px]">
                        <PdfViewer fileUrl={selectedDocUrl} />
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Analysis Form */}
        <div className="flex flex-col">
          <Card className="flex-1">
              <CardHeader>
                  <div className="flex justify-between items-start">
                      <div>
                          <CardTitle>Análise de Candidatura</CardTitle>
                          <p className="text-slate-600 dark:text-slate-400 mt-1">{application.student.name} - Protocolo {application.protocol}</p>
                           {application.address && (
                              <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                                  <p>CEP: {application.address.cep}</p>
                                  <p>{application.address.street}, {application.address.number} {application.address.complement && `- ${application.address.complement}`}</p>
                                  <p>{application.address.neighborhood}, {application.address.city}</p>
                              </div>
                          )}
                      </div>
                      <StatusBadge status={application.status} />
                  </div>
              </CardHeader>
              <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                      {application.appeal && (
                           <div className="p-4 bg-blue-50 dark:bg-blue-900/40 border-l-4 border-blue-400 dark:border-blue-600">
                              <h4 className="font-bold text-blue-800 dark:text-blue-200">Recurso em Análise</h4>
                              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                  <strong>Motivo:</strong> {application.appeal.reason}
                              </p>
                              <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
                                  <strong>Justificativa do Responsável:</strong>
                                  <span className="block p-2 mt-1 bg-blue-100 dark:bg-blue-900/60 rounded">{application.appeal.justification}</span>
                              </p>
                          </div>
                      )}
                      {application.specialNeeds && (
                          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/40 border-l-4 border-yellow-400 dark:border-yellow-600">
                              <div className="flex">
                                  <div className="flex-shrink-0">
                                      <IconAlertTriangle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                                  </div>
                                  <div className="ml-3">
                                      <p className="text-sm text-yellow-700 dark:text-yellow-200">
                                          Candidato concorre em modalidade de Educação Especial.
                                      </p>
                                  </div>
                              </div>
                          </div>
                      )}
                      
                      <div>
                          <h3 className="text-lg font-medium text-cep-text dark:text-white">Conversão de Pareceres/Notas</h3>
                          <div className="space-y-4 mt-2">
                              {[1, 2, 3, 4, 5].map(year => {
                                  const portuguesIndex = formState.grades.findIndex(g => g.year === year && g.subject === 'Português');
                                  const matematicaIndex = formState.grades.findIndex(g => g.year === year && g.subject === 'Matemática');
                                  const portuguesGrade = formState.grades[portuguesIndex];
                                  const matematicaGrade = formState.grades[matematicaIndex];

                                  if (!portuguesGrade || !matematicaGrade) return null;

                                  return (
                                      <div key={year} className="p-3 border dark:border-slate-700 rounded-lg bg-slate-50/50 dark:bg-slate-700/30">
                                        <p className="font-semibold text-sm mb-2 text-cep-text dark:text-slate-200">{year}º Ano</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">Português</label>
                                                <input type="number" step="0.1" min="0" max="10"
                                                    value={portuguesGrade.score ?? ''}
                                                    onChange={e => handleGradeChange(portuguesIndex, e.target.value)}
                                                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-cep-primary focus:border-cep-primary sm:text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">Matemática</label>
                                                <input type="number" step="0.1" min="0" max="10"
                                                    value={matematicaGrade.score ?? ''}
                                                    onChange={e => handleGradeChange(matematicaIndex, e.target.value)}
                                                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-cep-primary focus:border-cep-primary sm:text-sm"
                                                />
                                            </div>
                                        </div>
                                      </div>
                                  )
                              })}
                          </div>
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-cep-text dark:text-white">Justificativa / Parecer Descritivo (Gerado Automaticamente)</label>
                           <textarea rows={3} 
                              value={justification}
                              readOnly
                              className="mt-1 block w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm sm:text-sm"
                           />
                      </div>
                       <div>
                          <label className="block text-sm font-medium text-cep-text dark:text-white">Observações Internas</label>
                           <textarea rows={2}
                              value={formState.observation}
                              onChange={e => setFormState({ ...formState, observation: e.target.value })}
                              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-cep-primary focus:border-cep-primary sm:text-sm"
                           />
                      </div>

                      {showSaveButton && (
                          <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
                              <Button type="submit" isLoading={isSubmitting}>
                                  Salvar Análise
                              </Button>
                          </div>
                      )}
                  </form>
              </CardContent>
          </Card>
        </div>

        <ReasonModal 
            isOpen={!!modalContext} 
            onClose={() => setModalContext(null)} 
            onConfirm={handleConfirmReason}
            title={modalInfo.title}
            placeholder={modalInfo.placeholder}
        />
    </div>
    </>
  );
};

export default AnalysisView;
