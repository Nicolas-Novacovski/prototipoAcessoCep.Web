import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast, ToastType } from '../../hooks/useToast';
import { Student, Edital, ApplicationStatus, ValidationStatus, EditalModalities, Document, Address, User, Application, CustomRequirement } from '../../types';
import { api } from '../../services/mockApi';
import Card, { CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import PdfViewer from '../../components/ui/PdfViewer';
import { IconAlertTriangle, IconUploadCloud, IconFileText, IconX, IconEye, IconBookOpen, IconUserCircle, IconShieldCheck, IconHome, IconInfo } from '../../constants';
import ApplicationStepper from '../../components/ui/ApplicationStepper';

type OriginFlow = 'PUBLIC' | 'PRIVATE' | 'HYBRID' | null;
type MainStep = 'MODALIDADE' | 'CANDIDATO' | 'RESPONSAVEL' | 'RESIDENCIA' | 'DOCUMENTOS' | 'REVISAO';

const ReadOnlyDocumentSlot = ({ doc, onPreview }: { doc: Document; onPreview: (fileOrDoc: File | Document) => void }) => (
  <div className="p-4 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50/50 dark:bg-blue-900/30">
    <h4 className="font-medium text-cep-text dark:text-slate-200">
      {doc.fileName}
    </h4>
    <p className="text-xs text-blue-600 dark:text-blue-400">Este documento foi pré-carregado da base SERE e não pode ser alterado.</p>
    <div className="flex items-center text-cep-text dark:text-slate-200 bg-white dark:bg-slate-700 p-2 rounded-md border dark:border-slate-600 text-sm mt-2">
      <IconFileText className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
      <span className="flex-1 truncate" title={doc.fileName}>{doc.fileName}</span>
      <button type="button" onClick={() => onPreview(doc)} className="ml-4 p-1 text-gray-400 hover:text-cep-primary rounded-full hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors" aria-label="Visualizar">
        <IconEye className="h-5 w-5" />
      </button>
    </div>
  </div>
);


const DocumentUploadSlot = ({
  docType,
  files,
  onFileSelect,
  onFileRemove,
  onPreview,
  addToast,
}: {
  docType: { id: string; label: string; required: boolean; multiple: boolean };
  files: File[];
  onFileSelect: (id: string, files: File[]) => void;
  onFileRemove: (id: string, file: File) => void;
  onPreview: (file: File | Document) => void;
  addToast: (message: string, type: ToastType) => void;
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      const validFiles: File[] = [];

      for (const file of selectedFiles) {
        if (file.type !== 'application/pdf') {
          addToast(`Arquivo "${file.name}" inválido. Apenas PDFs são permitidos.`, 'error');
          continue;
        }
        if (file.size > 10 * 1024 * 1024) { // 10MB
          addToast(`Arquivo "${file.name}" excede o tamanho de 10MB.`, 'error');
          continue;
        }
        validFiles.push(file);
      }
      
      if(validFiles.length > 0) {
        onFileSelect(docType.id, validFiles);
      }

      if (inputRef.current) {
          inputRef.current.value = '';
      }
    }
  };
  
  const UploaderBox = () => (
     <div
      className="mt-2 p-4 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors border-gray-300 dark:border-gray-600 hover:border-cep-primary dark:hover:border-cep-primary"
      onClick={() => inputRef.current?.click()}
    >
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="application/pdf"
        multiple={docType.multiple}
      />
      <div className="flex flex-col items-center justify-center">
        <IconUploadCloud className="w-8 h-8 text-gray-400 dark:text-gray-500" />
        <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
          <span className="font-semibold text-cep-primary">Clique para enviar</span>
        </p>
        <p className="text-xs text-gray-500 mt-1">PDF (MAX. 10MB)</p>
      </div>
    </div>
  );

  return (
    <div className="p-4 border dark:border-slate-700 rounded-lg bg-gray-50/50 dark:bg-slate-800/30">
      <h4 className="font-medium text-cep-text dark:text-slate-200">
        {docType.label}
      </h4>
      {files.length > 0 && (
        <ul className="space-y-2 mt-2">
            {files.map((file, index) => (
              <li key={index} className="flex items-center text-cep-text dark:text-slate-200 bg-white dark:bg-slate-700 p-2 rounded-md border dark:border-slate-600 text-sm">
                <IconFileText className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                <span className="flex-1 truncate" title={file.name}>{file.name}</span>
                <button type="button" onClick={() => onPreview(file)} className="ml-4 p-1 text-gray-400 hover:text-cep-primary rounded-full hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors" aria-label="Visualizar">
                  <IconEye className="h-5 w-5" />
                </button>
                <button type="button" onClick={() => onFileRemove(docType.id, file)} className="ml-2 p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors" aria-label="Remover">
                  <IconX className="h-4 w-4" />
                </button>
              </li>
            ))}
        </ul>
      )}
      
      {(docType.multiple || files.length === 0) && <UploaderBox />}
    </div>
  );
};


const CgmSearchForm = ({ cgmInput, setCgmInput, cgmError, setCgmError, isSearchingCgm, handleFindStudentByCgm, setShowStudentList, originFlow }: {
    cgmInput: string;
    setCgmInput: (value: string) => void;
    cgmError: string | null;
    setCgmError: (error: string | null) => void;
    isSearchingCgm: boolean;
    handleFindStudentByCgm: (e: React.FormEvent) => void;
    setShowStudentList: (show: boolean) => void;
    originFlow: OriginFlow;
}) => (
    <form onSubmit={handleFindStudentByCgm} className="space-y-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">Digite o CGM (Código Geral de Matrícula) do aluno para pré-carregar seus dados.</p>
        <Input id="cgm" label="CGM do Aluno" value={cgmInput} onChange={e => { setCgmInput(e.target.value.replace(/\D/g, '')); setCgmError(null); }} error={cgmError || undefined} required />
        <div className="flex items-center justify-between">
            {(originFlow === 'PUBLIC' || originFlow === 'HYBRID') && <button type="button" className="text-sm text-cep-primary hover:underline" onClick={() => setShowStudentList(true)}>Não sei o CGM, selecionar da lista</button>}
            <Button type="submit" isLoading={isSearchingCgm}>Buscar Aluno</Button>
        </div>
    </form>
);

const StudentDataForm = ({
    onSubmit,
    originFlow,
    newStudentName,
    setNewStudentName,
    newStudentBirthDate,
    setNewStudentBirthDate,
    newStudentRg,
    setNewStudentRg,
    newStudentUf,
    setNewStudentUf,
    handlePrevStep
}: {
    onSubmit: (e: React.FormEvent) => void;
    originFlow: OriginFlow;
    newStudentName: string;
    setNewStudentName: (name: string) => void;
    newStudentBirthDate: string;
    setNewStudentBirthDate: (date: string) => void;
    newStudentRg: string;
    setNewStudentRg: (rg: string) => void;
    newStudentUf: string;
    setNewStudentUf: (uf: string) => void;
    handlePrevStep: () => void;
}) => (
    <form onSubmit={onSubmit} className="space-y-4">
        {originFlow === 'HYBRID' && <p className="text-sm text-blue-600 dark:text-blue-400 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-md">Confirme os dados pré-carregados e preencha o RG e UF de emissão.</p>}
        <Input id="newStudentName" label="Nome Completo do Aluno" value={newStudentName} onChange={e => setNewStudentName(e.target.value)} required />
        <Input id="newStudentBirthDate" label="Data de Nascimento" type="date" value={newStudentBirthDate} onChange={e => setNewStudentBirthDate(e.target.value)} required />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
                id="newStudentRg"
                label="RG do Aluno"
                value={newStudentRg}
                onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, "");
                    value = value.slice(0, 9);
                    if (value.length > 8) {
                        value = `${value.slice(0, 2)}.${value.slice(2, 5)}.${value.slice(5, 8)}-${value.slice(8)}`;
                    } else if (value.length > 5) {
                        value = `${value.slice(0, 2)}.${value.slice(2, 5)}.${value.slice(5)}`;
                    } else if (value.length > 2) {
                        value = `${value.slice(0, 2)}.${value.slice(2)}`;
                    }
                    setNewStudentRg(value);
                }}
                required
                className="sm:col-span-2"
                maxLength={12}
            />
            <Input
                id="newStudentUf"
                label="UF Emissor"
                value={newStudentUf}
                onChange={e => {
                    const value = e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase();
                    setNewStudentUf(value.slice(0, 2));
                }}
                required
                className="sm:col-span-1"
                maxLength={2}
            />
        </div>
        <div className="flex justify-between mt-6 pt-4 border-t dark:border-slate-700"><Button onClick={handlePrevStep} variant='secondary'>Voltar</Button><Button type="submit">Salvar e Continuar</Button></div>
    </form>
);


const NewApplicationForm = () => {
  const { user, updateUserContext } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [students, setStudents] = useState<Student[]>([]);
  const [editais, setEditais] = useState<Edital[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [originFlow, setOriginFlow] = useState<OriginFlow>(null);
  const [mainStep, setMainStep] = useState<MainStep>('MODALIDADE');

  const [cgmInput, setCgmInput] = useState('');
  const [isSearchingCgm, setIsSearchingCgm] = useState(false);
  const [cgmError, setCgmError] = useState<string | null>(null);
  const [showStudentList, setShowStudentList] = useState(false);
  const [hybridStudentFormVisible, setHybridStudentFormVisible] = useState(false);
  
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentBirthDate, setNewStudentBirthDate] = useState('');
  const [newStudentRg, setNewStudentRg] = useState('');
  const [newStudentUf, setNewStudentUf] = useState('');
  
  const [responsibleName, setResponsibleName] = useState(user?.name || '');
  const [responsibleCpf, setResponsibleCpf] = useState(user?.cpf || '');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState(user?.phone || '');
  
  const [isCepLoading, setIsCepLoading] = useState(false);
  const [address, setAddress] = useState<Address>({
      cep: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: 'Curitiba',
  });

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedEdital, setSelectedEdital] = useState<Edital | null>(null);
  const [hasSpecialNeeds, setHasSpecialNeeds] = useState(false);
  const [siblingCgm, setSiblingCgm] = useState('');
  const [docFiles, setDocFiles] = useState<Record<string, File[]>>({});
  const [prefetchedDocs, setPrefetchedDocs] = useState<Document[]>([]);
  const [ageWarning, setAgeWarning] = useState<string | null>(null);
  
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [reviewAccepted, setReviewAccepted] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | Document | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const activeSteps = useMemo(() => {
    const allSteps: { id: MainStep, label: string, icon: React.ReactNode }[] = [
        { id: 'MODALIDADE', label: 'Modalidade', icon: <IconBookOpen /> },
        { id: 'CANDIDATO', label: 'Candidato', icon: <IconUserCircle /> },
        { id: 'RESPONSAVEL', label: 'Cadastro do Responsável', icon: <IconShieldCheck /> },
        { id: 'RESIDENCIA', label: 'Residência', icon: <IconHome /> },
        { id: 'DOCUMENTOS', label: 'Documentos', icon: <IconFileText /> },
        { id: 'REVISAO', label: 'Revisão', icon: <IconEye /> },
    ];
    if (originFlow === 'PRIVATE' || originFlow === 'HYBRID') {
        return allSteps;
    }
    return allSteps.filter(step => step.id !== 'RESIDENCIA');
  }, [originFlow]);

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      Promise.all([
        api.getStudentsByResponsible(user.cpf),
        api.getEditais()
      ]).then(([studentData, editalData]) => {
        setStudents(studentData);
        setEditais(editalData.filter(e => e.isActive));
      }).finally(() => setIsLoading(false));
    }
  }, [user]);
  
  useEffect(() => {
    if (selectedStudent && selectedEdital && selectedEdital.modality === EditalModalities.FUNDAMENTAL_6_ANO) {
        const birthYear = new Date(selectedStudent.birthDate).getFullYear();
        const currentYear = new Date().getFullYear();
        const age = currentYear - birthYear;
        if (age < 10) setAgeWarning('A idade está abaixo da prevista em edital.');
        else if (age > 11) setAgeWarning('A idade está acima da prevista em edital.');
        else setAgeWarning(null);
    } else {
        setAgeWarning(null);
    }
  }, [selectedStudent, selectedEdital]);

  const prefetchedDocIds = useMemo(() => prefetchedDocs.map(d => d.id), [prefetchedDocs]);

  const allDocTypes = useMemo(() => {
    let docs: { id: string; label: string; required: boolean; multiple: boolean }[] = [];

    if (originFlow === 'PRIVATE' || originFlow === 'HYBRID') {
      docs.push(
        { id: 'rg_frente', label: 'RG (Frente)', required: true, multiple: false },
        { id: 'rg_verso', label: 'RG (Verso)', required: true, multiple: false },
      );
    }

    const commonDocs = [
      { id: 'certidao', label: 'Certidão de nascimento', required: true, multiple: false },
      { id: 'residencia', label: 'Comprovante de residência', required: originFlow === 'PRIVATE' || originFlow === 'HYBRID', multiple: false },
      { id: 'boletins', label: 'Boletins do 1º ao 5º ano', required: true, multiple: true },
      { id: 'declaracao', label: 'Declaração de matrícula', required: true, multiple: false },
    ];
    
    docs.push(...commonDocs);

    if (hasSpecialNeeds) {
        docs.push({ id: 'laudo', label: 'Laudo(s) médico(s) (se aplicável)', required: true, multiple: true });
    }
    
    if (selectedEdital?.additionalDocuments) {
        const customDocs = selectedEdital.additionalDocuments.map((req: CustomRequirement) => ({
            id: req.id,
            label: req.label,
            required: true,
            multiple: false,
        }));
        docs.push(...customDocs);
    }
    
    return docs;
  }, [originFlow, hasSpecialNeeds, selectedEdital]);
  
  const handleNextStep = () => {
    const currentIndex = activeSteps.findIndex(s => s.id === mainStep);
    if (currentIndex < activeSteps.length - 1) setMainStep(activeSteps[currentIndex + 1].id);
  };
  
  const handlePrevStep = () => {
    const currentIndex = activeSteps.findIndex(s => s.id === mainStep);
    if (currentIndex > 0) {
        if (mainStep === 'CANDIDATO' && originFlow === 'HYBRID') {
            setHybridStudentFormVisible(false); // Go back to CGM search from form
        } else {
            setMainStep(activeSteps[currentIndex - 1].id);
        }
    } else {
        setOriginFlow(null); // Go back to origin choice
    }
  };

  const handleFileSelect = (id: string, newFiles: File[]) => {
    const isMultiple = allDocTypes.find(d => d.id === id)?.multiple || false;
    setDocFiles(prev => ({ ...prev, [id]: isMultiple ? [...(prev[id] || []), ...newFiles] : [newFiles[0]] }));
  };

  const handleFileRemove = (id: string, fileToRemove: File) => {
    setDocFiles(prev => ({...prev, [id]: (prev[id] || []).filter(f => f !== fileToRemove)}));
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleCepSearch = async (cep: string) => {
    const cleanedCep = cep.replace(/\D/g, '');
    setAddress(prev => ({ ...prev, cep: cleanedCep }));

    if (cleanedCep.length === 8) {
        setIsCepLoading(true);
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cleanedCep}/json/`);
            if (!response.ok) {
                throw new Error('Erro ao buscar CEP. Tente novamente.');
            }
            const data = await response.json();
            if (data.erro) {
                addToast('CEP não encontrado ou inválido.', 'error');
                setAddress(prev => ({ ...prev, street: '', neighborhood: '', city: '' }));
            } else {
                setAddress(prev => ({
                    ...prev,
                    street: data.logradouro,
                    neighborhood: data.bairro,
                    city: data.localidade,
                }));
                addToast('Endereço preenchido automaticamente.', 'success');
            }
        } catch (error) {
            addToast(error instanceof Error ? error.message : 'Falha na comunicação com o serviço de CEP.', 'error');
        } finally {
            setIsCepLoading(false);
        }
    }
  };


  const handleResidenceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.cep || !address.street || !address.number || !address.neighborhood || !address.city) {
        addToast('Por favor, preencha todos os campos de endereço obrigatórios.', 'error');
        return;
    }
    handleNextStep();
  };

  const handleFindStudentByCgm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cgmInput || !user) return;
    setIsSearchingCgm(true);
    setCgmError(null);
    try {
        const student = await api.findStudentByCgm(cgmInput, user.cpf);
        if (student) {
            setSelectedStudent(student);
            if (originFlow === 'HYBRID') {
                setNewStudentName(student.name);
                setNewStudentBirthDate(student.birthDate);
                const mockBoletim: Document = {
                    id: 'boletins',
                    fileName: 'Boletins_Parciais_SERE.pdf',
                    fileType: 'application/pdf',
                    fileUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js-sample-files/master/helloworld.pdf',
                    validationStatus: ValidationStatus.VALIDO,
                };
                setPrefetchedDocs([mockBoletim]);
                addToast(`Dados de ${student.name} pré-carregados. Por favor, confirme ou edite os dados e complete o cadastro.`, 'success');
                setHybridStudentFormVisible(true);
            } else {
                addToast(`Aluno ${student.name} encontrado.`, 'success');
                handleNextStep();
            }
        } else {
            setCgmError('CGM não encontrado ou não pertence a um de seus filhos.');
        }
    } catch (err) {
        setCgmError('Ocorreu um erro ao buscar o aluno.');
    } finally {
        setIsSearchingCgm(false);
    }
  };

  const handleSelectStudentForHybrid = (student: Student) => {
    setSelectedStudent(student);
    setNewStudentName(student.name);
    setNewStudentBirthDate(student.birthDate);
    
    const mockBoletim: Document = {
        id: 'boletins',
        fileName: 'Boletins_Parciais_SERE.pdf',
        fileType: 'application/pdf',
        fileUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js-sample-files/master/helloworld.pdf',
        validationStatus: ValidationStatus.VALIDO,
    };
    setPrefetchedDocs([mockBoletim]);
    addToast(`Dados de ${student.name} pré-carregados. Por favor, confirme ou edite os dados e complete o cadastro.`, 'success');
    
    setHybridStudentFormVisible(true);
    setShowStudentList(false);
  };


  const handleStudentDataSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName || !newStudentBirthDate || !user) return;
    if (!newStudentRg || !newStudentUf) {
        addToast('RG e UF são obrigatórios para esta modalidade de inscrição.', 'error');
        return;
    }
    
    // Use existing student data if available, otherwise create a temporary object
    const studentData: Student = selectedStudent && !selectedStudent.id.startsWith('temp-')
        ? { ...selectedStudent, name: newStudentName, birthDate: newStudentBirthDate, rg: newStudentRg, uf: newStudentUf }
        : {
            id: `temp-${Date.now()}`,
            name: newStudentName,
            birthDate: newStudentBirthDate,
            responsibleCpf: '',
            rg: newStudentRg,
            uf: newStudentUf,
        };
    
    setSelectedStudent(studentData);
    handleNextStep();
  };
  
  const handleConfirmContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!contactEmail.includes('@') || contactPhone.replace(/\D/g, '').length < 10) {
        addToast('Por favor, insira um e-mail e telefone válidos.', 'error');
        return;
    }
    if (originFlow === 'PRIVATE' || originFlow === 'HYBRID') {
        if (!responsibleName.trim()) {
            addToast('Por favor, preencha o nome do responsável.', 'error');
            return;
        }
        const cleanedCpf = responsibleCpf.replace(/\D/g, '');
        if (cleanedCpf.length !== 11) {
            addToast('Por favor, insira um CPF válido com 11 dígitos.', 'error');
            return;
        }
    }
    handleNextStep();
  };

  const handleSubmit = async () => {
    if (!selectedEdital || !user) return;

    setIsSubmitting(true);
    try {
      let finalStudent = selectedStudent;

      // Handle private or hybrid school student creation/update
      if ((originFlow === 'PRIVATE' || originFlow === 'HYBRID') && finalStudent && finalStudent.id.startsWith('temp-')) {
          const cleanedCpf = responsibleCpf.replace(/\D/g, '');
          const createdStudent = await api.createStudent(
              finalStudent.name,
              finalStudent.birthDate,
              cleanedCpf,
              finalStudent.rg,
              finalStudent.uf,
          );
          setStudents(prev => [...prev, createdStudent]);
          finalStudent = createdStudent;
      }
      
      if (!finalStudent) {
          throw new Error("Candidato não selecionado ou criado.");
      }
      
      // Update logged-in user's contact info if changed.
      const responsibleDataOwner = (originFlow === 'PRIVATE' || originFlow === 'HYBRID') ? { email: '', phone: '' } : user;
      const userDataToUpdate: Partial<User> = {};
      if (responsibleDataOwner.email !== contactEmail) userDataToUpdate.email = contactEmail;
      if (responsibleDataOwner.phone !== contactPhone) userDataToUpdate.phone = contactPhone;

      if (Object.keys(userDataToUpdate).length > 0) {
          await api.updateUser(user.id, userDataToUpdate);
          updateUserContext(userDataToUpdate);
      }

      const newApplication = await api.createApplication(finalStudent.id, selectedEdital.id, hasSpecialNeeds, siblingCgm);
      
      let allDocumentsForApp: Document[] = [...prefetchedDocs];
      let specialNeedsDocsForApp: Document[] = [];

      Object.entries(docFiles).forEach(([docTypeId, files]) => {
         const newDocs = files.map((file, i) => ({
             id: `d-new-${docTypeId}-${Date.now()}-${i}`,
             fileName: file.name,
             fileType: file.type,
             fileUrl: URL.createObjectURL(file), // MOCK
             validationStatus: ValidationStatus.PENDENTE,
         }));

         allDocumentsForApp.push(...newDocs);

         if (docTypeId === 'laudo') {
             specialNeedsDocsForApp.push(...newDocs);
         }
      });

      const updatePayload: Partial<Application> = {
        documents: allDocumentsForApp,
        specialNeedsDocuments: specialNeedsDocsForApp.length > 0 ? specialNeedsDocsForApp : undefined,
        status: ApplicationStatus.EM_ANALISE,
        address: (originFlow === 'PRIVATE' || originFlow === 'HYBRID') ? address : undefined,
      };

      if (originFlow === 'PRIVATE' || originFlow === 'HYBRID') {
          updatePayload.responsibleName = responsibleName;
          updatePayload.responsibleEmail = contactEmail;
          updatePayload.responsiblePhone = contactPhone;
      }
      
      const finalApplication = await api.updateApplication(newApplication.id, updatePayload);


      // Send notification email using the new template system
      api.sendEmail('Confirmação de Inscrição', {
        actorId: user.id,
        actorName: user.name,
        recipientEmail: contactEmail,
        editalId: finalApplication.edital.id,
        studentName: finalStudent.name,
        protocol: finalApplication.protocol,
        edital: `${finalApplication.edital.number} - ${finalApplication.edital.modality}`,
        submissionDate: new Date(finalApplication.submissionDate).toLocaleString('pt-BR'),
      });

      addToast('Inscrição realizada com sucesso!', 'success');
      navigate(`/inscricao/${finalApplication.id}`);
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Erro ao criar inscrição.', 'error');
      setIsSubmitting(false);
    }
  };
  
  const requiredDocsUploaded = useMemo(() => {
    const requiredDocs = allDocTypes.filter(d => d.required);
    return requiredDocs.every(dt =>
        (docFiles[dt.id] && docFiles[dt.id].length > 0) ||
        prefetchedDocIds.includes(dt.id)
    );
  }, [allDocTypes, docFiles, prefetchedDocIds]);

  const allUploadedFiles = useMemo(() => {
    const userFiles = Object.values(docFiles).flat();
    return [...prefetchedDocs, ...userFiles];
  }, [docFiles, prefetchedDocs]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Spinner /></div>;
  }
  
  const renderStepContent = () => {
    switch(mainStep) {
      case 'MODALIDADE':
        return (
          <Card>
            <CardHeader><CardTitle>1. Seleção de Modalidade (Edital)</CardTitle><p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Escolha o edital para o qual deseja inscrever o candidato.</p></CardHeader>
            <CardContent>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                    {editais.map(edital => (
                        <div key={edital.id} onClick={() => setSelectedEdital(edital)} className={`p-4 border dark:border-slate-700 rounded-lg cursor-pointer transition-all ${selectedEdital?.id === edital.id ? 'ring-2 ring-cep-primary bg-cep-primary/5 dark:bg-cep-primary/10' : 'hover:shadow-md dark:hover:bg-slate-700/50'}`}>
                            <h3 className="font-bold text-lg text-cep-primary">{edital.modality}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Edital nº {edital.number}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Vagas: {edital.vacancyDetails.reduce((sum, v) => sum + v.count, 0)}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Inscrições: {new Date(edital.inscriptionStart).toLocaleDateString()} a {new Date(edital.inscriptionEnd).toLocaleDateString()}</p>
                        </div>
                    ))}
                </div>
                <div className="flex justify-end mt-6 pt-4 border-t dark:border-slate-700"><Button onClick={handleNextStep} disabled={!selectedEdital}>Continuar</Button></div>
            </CardContent>
          </Card>
        );
      case 'CANDIDATO':
        if (originFlow === 'PUBLIC') return (
            <Card>
              <CardHeader><CardTitle>2. Seleção do Candidato (Rede Pública)</CardTitle></CardHeader>
              <CardContent>
                {!showStudentList ? <CgmSearchForm cgmInput={cgmInput} setCgmInput={setCgmInput} cgmError={cgmError} setCgmError={setCgmError} isSearchingCgm={isSearchingCgm} handleFindStudentByCgm={handleFindStudentByCgm} setShowStudentList={setShowStudentList} originFlow={originFlow} /> : (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Selecione o aluno da lista.</p>
                    <div className="grid md:grid-cols-2 gap-4">
                        {students.filter(s => s.cgm).map(student => (
                            <div key={student.id} onClick={() => setSelectedStudent(student)} className={`p-4 border dark:border-slate-700 rounded-lg cursor-pointer transition-all ${selectedStudent?.id === student.id ? 'ring-2 ring-cep-primary bg-cep-primary/5 dark:bg-cep-primary/10' : 'hover:shadow-md dark:hover:bg-slate-700/50'}`}>
                                <h3 className="font-semibold text-cep-text dark:text-slate-200">{student.name}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">CGM: {student.cgm}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Nascimento: {new Date(student.birthDate).toLocaleDateString()}</p>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t dark:border-slate-700"><button type="button" className="text-sm text-cep-primary hover:underline" onClick={() => setShowStudentList(false)}>Buscar por CGM</button><Button onClick={handleNextStep} disabled={!selectedStudent}>Continuar</Button></div>
                  </div>
                )}
                 <div className="flex justify-start mt-6 pt-4 border-t dark:border-slate-700"><Button onClick={handlePrevStep} variant='secondary'>Voltar</Button></div>
              </CardContent>
            </Card>
        );
        if (originFlow === 'PRIVATE') return (
            <Card>
              <CardHeader><CardTitle>2. Cadastro do Candidato (Escola Particular)</CardTitle><p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Preencha os dados do aluno.</p></CardHeader>
              <CardContent>
                <StudentDataForm
                    onSubmit={handleStudentDataSubmit}
                    originFlow={originFlow}
                    newStudentName={newStudentName}
                    setNewStudentName={setNewStudentName}
                    newStudentBirthDate={newStudentBirthDate}
                    setNewStudentBirthDate={setNewStudentBirthDate}
                    newStudentRg={newStudentRg}
                    setNewStudentRg={setNewStudentRg}
                    newStudentUf={newStudentUf}
                    setNewStudentUf={setNewStudentUf}
                    handlePrevStep={handlePrevStep}
                />
              </CardContent>
            </Card>
        );
        if (originFlow === 'HYBRID') return (
            <Card>
                <CardHeader><CardTitle>2. Identificação do Candidato (Histórico Misto)</CardTitle></CardHeader>
                <CardContent>
                    {hybridStudentFormVisible ? (
                        <StudentDataForm
                            onSubmit={handleStudentDataSubmit}
                            originFlow={originFlow}
                            newStudentName={newStudentName}
                            setNewStudentName={setNewStudentName}
                            newStudentBirthDate={newStudentBirthDate}
                            setNewStudentBirthDate={setNewStudentBirthDate}
                            newStudentRg={newStudentRg}
                            setNewStudentRg={setNewStudentRg}
                            newStudentUf={newStudentUf}
                            setNewStudentUf={setNewStudentUf}
                            handlePrevStep={handlePrevStep}
                        />
                    ) : showStudentList ? (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Selecione o aluno da lista para pré-carregar seus dados.</p>
                            <div className="grid md:grid-cols-2 gap-4">
                                {students.filter(s => s.cgm).map(student => (
                                    <div key={student.id} onClick={() => handleSelectStudentForHybrid(student)} className={`p-4 border dark:border-slate-700 rounded-lg cursor-pointer transition-all hover:shadow-md dark:hover:bg-slate-700/50`}>
                                        <h3 className="font-semibold text-cep-text dark:text-slate-200">{student.name}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">CGM: {student.cgm}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Nascimento: {new Date(student.birthDate).toLocaleDateString()}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center justify-between mt-4 pt-4 border-t dark:border-slate-700">
                                <button type="button" className="text-sm text-cep-primary hover:underline" onClick={() => setShowStudentList(false)}>Buscar por CGM</button>
                            </div>
                        </div>
                    ) : (
                        <CgmSearchForm cgmInput={cgmInput} setCgmInput={setCgmInput} cgmError={cgmError} setCgmError={setCgmError} isSearchingCgm={isSearchingCgm} handleFindStudentByCgm={handleFindStudentByCgm} setShowStudentList={setShowStudentList} originFlow={originFlow} />
                    )}
                    
                    {!hybridStudentFormVisible && (
                        <div className="flex justify-start mt-6 pt-4 border-t dark:border-slate-700">
                            <Button onClick={handlePrevStep} variant='secondary'>Voltar</Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        );
        return null;
      case 'RESPONSAVEL':
        return(
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                    <CardTitle>3. Cadastro do Responsável</CardTitle>
                    <div className="group relative flex items-center">
                        <IconInfo className="h-5 w-5 text-slate-400 dark:text-slate-500 cursor-help" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 z-10 mb-2 w-72 p-3 bg-slate-700 dark:bg-slate-800 text-white dark:text-slate-200 text-xs font-normal rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            Essas informações não serão atualizadas no SERE, são apenas para uso do sistema.
                        </div>
                    </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Confirme ou atualize seus dados de contato.</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleConfirmContact} className="space-y-4">
                  <Input 
                    id="responsibleName" 
                    label="Nome Completo do(a) Responsável Legal" 
                    value={responsibleName}
                    onChange={e => setResponsibleName(e.target.value)}
                    disabled={originFlow === 'PUBLIC'}
                    required
                  />
                  <Input 
                    id="responsibleCpf" 
                    label="CPF do Responsável Legal"
                    value={responsibleCpf}
                    onChange={(e) => {
                        let v = e.target.value.replace(/\D/g, '').slice(0, 11);
                        v = v.replace(/(\d{3})(\d)/, '$1.$2');
                        v = v.replace(/(\d{3})(\d)/, '$1.$2');
                        v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                        setResponsibleCpf(v);
                    }}
                    disabled={originFlow === 'PUBLIC'}
                    maxLength={14}
                    required={originFlow !== 'PUBLIC'}
                   />
                  <Input id="contactEmail" label="Digite o e-mail do responsável para contato" type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} required placeholder="responsavel@email.com" />
                  <Input id="contactPhone" label="Telefone com DDD" type="tel" value={contactPhone} onChange={e => setContactPhone(e.target.value)} required placeholder="(XX) XXXXX-XXXX" />
                  <div className="flex justify-between mt-6 pt-4 border-t dark:border-slate-700"><Button onClick={handlePrevStep} variant='secondary'>Voltar</Button><Button type="submit">Confirmar e Continuar</Button></div>
                </form>
              </CardContent>
            </Card>
        );
      case 'RESIDENCIA':
        return (
            <Card>
                <CardHeader><CardTitle>4. Endereço do Candidato</CardTitle><p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Informe o CEP e confirme o endereço residencial do candidato.</p></CardHeader>
                <CardContent>
                    <form onSubmit={handleResidenceSubmit} className="space-y-4">
                        <div className="relative">
                            <Input
                                id="cep"
                                name="cep"
                                label="CEP"
                                value={address.cep}
                                onChange={(e) => handleCepSearch(e.target.value)}
                                maxLength={8}
                                placeholder="Apenas números"
                                required
                            />
                            {isCepLoading && (
                                <div className="absolute right-3 top-8">
                                    <Spinner size="sm" />
                                </div>
                            )}
                        </div>

                        <Input id="street" name="street" label="Nome da Rua" value={address.street} onChange={handleAddressChange} required />
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Input id="number" name="number" label="Número" value={address.number} onChange={handleAddressChange} required className="sm:col-span-1" />
                            <Input id="complement" name="complement" label="Complemento" value={address.complement || ''} onChange={handleAddressChange} className="sm:col-span-2" placeholder="Apto, bloco, casa" />
                        </div>
                        <Input id="neighborhood" name="neighborhood" label="Bairro" value={address.neighborhood} onChange={handleAddressChange} required />
                        <Input id="city" name="city" label="Município" value={address.city} onChange={handleAddressChange} required />
                        <div className="flex justify-between mt-6 pt-4 border-t dark:border-slate-700">
                            <Button type="button" onClick={handlePrevStep} variant='secondary'>Voltar</Button>
                            <Button type="submit">Continuar</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        );
      case 'DOCUMENTOS':
        return (
          <Card>
            <CardHeader><CardTitle>5. Envio de Documentos</CardTitle></CardHeader>
            <CardContent className="space-y-6">
                {ageWarning && <div className="p-3 bg-yellow-50 dark:bg-yellow-900/40 border-l-4 border-yellow-400 dark:border-yellow-600 text-yellow-700 dark:text-yellow-200 flex items-center"><IconAlertTriangle className="h-5 w-5 mr-3" /><p className="text-sm">{ageWarning}</p></div>}
                {prefetchedDocs.length > 0 && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/40 border-l-4 border-blue-400 dark:border-blue-600 text-blue-700 dark:text-blue-200 flex items-center">
                        <IconInfo className="h-5 w-5 mr-3 flex-shrink-0" />
                        <p className="text-sm">Alguns documentos foram pré-carregados da base de dados da Secretaria da Educação (SERE). Por favor, anexe os documentos restantes.</p>
                    </div>
                )}
                <Input id="siblingCgm" label="CGM do Irmão (critério de desempate)" value={siblingCgm} onChange={e => setSiblingCgm(e.target.value)} placeholder="Opcional" />
                <div className="relative flex items-start"><div className="flex h-5 items-center"><input id="specialNeeds" type="checkbox" className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 text-cep-primary focus:ring-cep-primary" checked={hasSpecialNeeds} onChange={(e) => setHasSpecialNeeds(e.target.checked)} /></div><div className="ml-3 text-sm"><label htmlFor="specialNeeds" className="font-medium text-cep-text dark:text-slate-200">Candidato concorre em modalidade de Educação Especial?</label></div></div>
                <div className="space-y-4">
                    {prefetchedDocs.map(doc => <ReadOnlyDocumentSlot key={doc.id} doc={doc} onPreview={setPreviewFile} />)}
                    {allDocTypes.filter(dt => dt.required && !prefetchedDocIds.includes(dt.id)).map(docType => {
                         if (docType.id === 'laudo') {
                            return (
                                <div key={docType.id} className="p-4 border dark:border-slate-700 rounded-lg bg-gray-50/50 dark:bg-slate-800/30">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-medium text-cep-text dark:text-slate-200">
                                            {docType.label}
                                        </h4>
                                        <div className="group relative flex items-center">
                                            <IconInfo className="h-5 w-5 text-slate-400 dark:text-slate-500 cursor-help" />
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 z-10 mb-2 w-72 p-3 bg-slate-700 dark:bg-slate-800 text-white dark:text-slate-200 text-xs font-normal rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                Apenas laudos médicos oficiais são permitidos. Declarações médicas simples não serão aceitas.
                                            </div>
                                        </div>
                                    </div>
                                    <DocumentUploadSlot docType={{...docType, label: ''}} files={docFiles[docType.id] || []} onFileSelect={handleFileSelect} onFileRemove={handleFileRemove} onPreview={setPreviewFile} addToast={addToast} />
                                </div>
                            );
                         }
                         return <DocumentUploadSlot key={docType.id} docType={docType} files={docFiles[docType.id] || []} onFileSelect={handleFileSelect} onFileRemove={handleFileRemove} onPreview={setPreviewFile} addToast={addToast} />
                    })}
                </div>
                <div className="flex justify-between mt-6 pt-4 border-t dark:border-slate-700"><Button onClick={handlePrevStep} variant='secondary'>Voltar</Button><Button onClick={handleNextStep}>Continuar para Revisão</Button></div>
            </CardContent>
          </Card>
        );
    case 'REVISAO':
        return(
            <Card>
                <CardHeader><CardTitle>6. Revisão da Inscrição</CardTitle><p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Confira todos os dados antes de finalizar.</p></CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <div><h4 className="font-semibold text-lg text-cep-text dark:text-white">Modalidade</h4><p>{selectedEdital?.number} - {selectedEdital?.modality}</p></div>
                        <div>
                            <h4 className="font-semibold text-lg text-cep-text dark:text-white">Candidato</h4>
                            <p>{selectedStudent?.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Nascimento: {selectedStudent ? new Date(selectedStudent.birthDate).toLocaleDateString() : ''}</p>
                             {(originFlow === 'PRIVATE' || originFlow === 'HYBRID') && selectedStudent?.rg && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">RG: {selectedStudent.rg} - {selectedStudent.uf}</p>
                            )}
                        </div>
                        <div><h4 className="font-semibold text-lg text-cep-text dark:text-white">Responsável</h4><p>{responsibleName}</p><p className="text-sm text-gray-500 dark:text-gray-400">CPF: {responsibleCpf} | Email: {contactEmail} | Telefone: {contactPhone}</p></div>
                        {(originFlow === 'PRIVATE' || originFlow === 'HYBRID') && (
                            <div>
                                <h4 className="font-semibold text-lg text-cep-text dark:text-white">Endereço</h4>
                                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                    <p>CEP: {address.cep}</p>
                                    <p>
                                        {address.street}, {address.number} {address.complement && `- ${address.complement}`}
                                    </p>
                                    <p>
                                        {address.neighborhood} - {address.city}
                                    </p>
                                </div>
                            </div>
                        )}
                        <div><h4 className="font-semibold text-lg text-cep-text dark:text-white">Documentos</h4><ul className="list-disc list-inside">{allUploadedFiles.map((f, i) => (<li key={'fileName' in f ? f.id : `${f.name}-${i}`} className="text-sm">{'fileName' in f ? `${f.fileName} (Pré-carregado)` : f.name}</li>))}</ul></div>
                    </div>
                    <div className="pt-6 border-t border-gray-200 dark:border-slate-700 space-y-4">
                      <div className="flex items-start"><input id="terms" type="checkbox" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} className="h-4 w-4 mt-1 rounded border-gray-300 dark:border-slate-600 text-cep-primary focus:ring-cep-primary" /><label htmlFor="terms" className="ml-2 block text-sm text-cep-text dark:text-slate-300">Declaro que li e concordo com os termos do edital e que as informações prestadas são verdadeiras. <span className="text-red-500">*</span></label></div>
                      <div className="flex items-start"><input id="review" type="checkbox" checked={reviewAccepted} onChange={e => setReviewAccepted(e.target.checked)} className="h-4 w-4 mt-1 rounded border-gray-300 dark:border-slate-600 text-cep-primary focus:ring-cep-primary" /><label htmlFor="review" className="ml-2 block text-sm text-cep-text dark:text-slate-300">Declaro que revisei os documentos e confirmo o envio correto dos mesmos. <span className="text-red-500">*</span></label></div>
                    </div>
                    <div className="flex justify-between mt-6 pt-4 border-t dark:border-slate-700"><Button onClick={handlePrevStep} variant='secondary'>Voltar</Button><Button onClick={() => setIsConfirmModalOpen(true)} disabled={!termsAccepted || !reviewAccepted || !requiredDocsUploaded}>Finalizar Inscrição</Button></div>
                </CardContent>
            </Card>
        );
      default: return null;
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-cep-text dark:text-white">Nova Inscrição</h1>
      
      {!originFlow ? (
          <Card>
            <CardHeader>
              <CardTitle>Origem do Aluno</CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Selecione se o aluno já pertence à rede pública estadual (possui CGM) ou vem de uma escola particular.</p>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4 pt-6">
              <Button size="lg" className="h-auto text-left py-4 items-start" onClick={() => setOriginFlow('PUBLIC')}>
                <div>
                  <p className="font-bold">Aluno da Rede Pública</p>
                  <p className="text-xs font-normal mt-1">O aluno possui CGM e todos os boletins na rede estadual.</p>
                </div>
              </Button>
               <Button size="lg" className="h-auto text-left py-4 items-start" onClick={() => {
                    setOriginFlow('HYBRID');
                    setResponsibleName('');
                    setResponsibleCpf('');
                }}>
                  <div>
                    <p className="font-bold">Aluno com Histórico Misto</p>
                    <p className="text-xs font-normal mt-1">O aluno possui CGM, mas parte dos boletins é de outra rede.</p>
                  </div>
                </Button>
              <Button size="lg" variant="secondary" className="h-auto text-left py-4 items-start" onClick={() => {
                  setOriginFlow('PRIVATE');
                  setResponsibleName('');
                  setResponsibleCpf('');
              }}>
                <div>
                    <p className="font-bold">Aluno de Escola Particular</p>
                    <p className="text-xs font-normal mt-1">O aluno não possui CGM na rede estadual.</p>
                </div>
              </Button>
            </CardContent>
          </Card>
      ) : (
        <>
            <ApplicationStepper steps={activeSteps} currentStepId={mainStep} />
            <div className="mt-8">
                {renderStepContent()}
            </div>
        </>
      )}

      {previewFile && (
        <Modal isOpen={!!previewFile} onClose={() => setPreviewFile(null)} title={`Visualizando: ${previewFile instanceof File ? previewFile.name : previewFile.fileName}`} size="5xl">
          <div className="w-full h-[75vh]"><PdfViewer fileUrl={previewFile instanceof File ? URL.createObjectURL(previewFile) : previewFile.fileUrl} /></div>
        </Modal>
      )}
      <Modal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} title="Confirmar Envio">
        <div>
            <p className="text-gray-600 dark:text-gray-400">Tem certeza que deseja finalizar e enviar a inscrição? Após a confirmação, você não poderá editar os dados até que uma análise seja feita.</p>
            <div className="flex justify-end gap-2 pt-6 mt-4 border-t dark:border-slate-700">
                <Button variant="secondary" onClick={() => setIsConfirmModalOpen(false)} disabled={isSubmitting}>Cancelar</Button>
                <Button onClick={handleSubmit} isLoading={isSubmitting}>Confirmar Inscrição</Button>
            </div>
        </div>
      </Modal>
    </div>
  );
};

export default NewApplicationForm;