

import { User, UserRole, Application, ApplicationStatus, Edital, EditalModalities, Student, Document, AnalysisResult, EditalFormData, Appeal, ValidationStatus, VacancyType, VacancyShift, ComplementaryCall, EmailTemplate, CommissionAnalysis, AppealStatus, UserPermissions, LogEntry } from '../types';

// --- MOCK DATABASE ---

let users: User[] = [
  { 
    id: '1', name: 'Admin SEED', email: 'admin.seed@email.com', cpf: '11111111111', role: UserRole.ADMIN_SEED, phone: '41911111111',
    permissions: { 
      manage_editais: true, manage_chamadas: true, manage_analises: true, manage_casos_especiais: true, 
      view_classificacao: true, manage_usuarios: true, view_relatorios: true, manage_email_templates: true, manage_config: true, view_audit_logs: true
    },
    isActive: true,
  },
  { 
    id: '2', name: 'Admin CEP', email: 'admin.cep@email.com', cpf: '22222222222', role: UserRole.ADMIN_CEP, phone: '41922222222',
    permissions: {
      manage_editais: true, manage_chamadas: true, manage_analises: true, manage_casos_especiais: true,
      view_classificacao: true, manage_usuarios: true, view_relatorios: true, manage_email_templates: true, view_audit_logs: true
    },
    isActive: true,
  },
  { id: '3', name: 'Ana Lúcia (Analista)', email: 'analista@email.com', cpf: '33333333333', role: UserRole.ANALISTA, phone: '41933333333', isActive: true },
  { id: '4', name: 'Carlos (Responsável)', email: 'responsavel@email.com', cpf: '44444444444', role: UserRole.RESPONSAVEL, phone: '41944444444', isActive: true },
  { id: '5', name: 'Beatriz (Responsável)', email: 'responsavel2@email.com', cpf: '55555555555', role: UserRole.RESPONSAVEL, phone: '', isActive: true },
];

let students: Student[] = [
    { id: 's1', name: 'João da Silva', cgm: '20240001', birthDate: '2014-05-10', responsibleCpf: '44444444444' },
    { id: 's2', name: 'Maria da Silva', cgm: '20240002', birthDate: '2013-11-22', responsibleCpf: '44444444444' },
    { id: 's3', name: 'Pedro Souza', cgm: '20240003', birthDate: '2010-02-15', responsibleCpf: '55555555555' },
    { id: 's4', name: 'Ana Pereira', cgm: '20240004', birthDate: '2008-08-20', responsibleCpf: '44444444444' },
    { id: 's5', name: 'Lucas Martins', cgm: '20240005', birthDate: '2014-03-12', responsibleCpf: '44444444444' },
    { id: 's6', name: 'Mariana Costa', cgm: '20240006', birthDate: '2014-07-01', responsibleCpf: '55555555555' },
    { id: 's7', name: 'Tiago Ferreira', cgm: '20240007', birthDate: '2014-01-30', responsibleCpf: '55555555555' },
    { id: 's8', name: 'Sofia Almeida', cgm: '20240008', birthDate: '2014-09-05', responsibleCpf: '44444444444' },
];

const today = new Date();
const openStart = new Date();
openStart.setDate(today.getDate() - 15);
const openEnd = new Date();
openEnd.setDate(today.getDate() + 15);

const closedStart1 = new Date();
closedStart1.setDate(today.getDate() - 45);
const closedEnd1 = new Date();
closedEnd1.setDate(today.getDate() - 16);

const closedStart2 = new Date();
closedStart2.setDate(today.getDate() - 60);
const closedEnd2 = new Date();
closedEnd2.setDate(today.getDate() - 30);


let editais: Edital[] = [
    { 
      id: 'e1', 
      number: '005/2024', 
      modality: EditalModalities.FUNDAMENTAL_6_ANO, 
      vacancyDetails: [
        { id: 'v1', count: 3, type: VacancyType.AMPLA_CONCORRENCIA, shift: VacancyShift.MANHA },
        { id: 'v2', count: 1, type: VacancyType.EDUCACAO_ESPECIAL, shift: VacancyShift.MANHA }
      ], 
      year: new Date().getFullYear(), 
      inscriptionStart: closedStart1.toISOString(),
      inscriptionEnd: closedEnd1.toISOString(),
      analysisStart: '2025-11-26', 
      analysisEnd: '2025-12-01', 
      preliminaryResultDate: '2025-12-05',
      appealStartDate: '2025-12-06',
      appealEndDate: '2025-12-08',
      resultDate: '2025-12-10', 
      vacancyAcceptanceStartDate: new Date(new Date().setDate(today.getDate() + 3)).toISOString(),
      vacancyAcceptanceDate: new Date(new Date().setDate(today.getDate() + 5)).toISOString(), // 5 days from now
      customRequirements: [
        { id: 'cr1', label: 'Candidato concluiu o 5º ano do Ensino Fundamental.' },
        { id: 'cr2', label: 'Reside na região metropolitana de Curitiba.' },
      ],
      additionalDocuments: [
        { id: 'ad1', label: 'Declaração de Vacinação' }
      ],
      isActive: true,
      editalPdfUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js-sample-files/master/helloworld.pdf',
    },
    { 
      id: 'e2', 
      number: '004/2024', 
      modality: EditalModalities.ENSINO_MEDIO, 
      vacancyDetails: [
        { id: 'v3', count: 400, type: VacancyType.AMPLA_CONCORRENCIA, shift: VacancyShift.MANHA },
        { id: 'v4', count: 20, type: VacancyType.EDUCACAO_ESPECIAL, shift: VacancyShift.MANHA }
      ],
      year: new Date().getFullYear(), 
      inscriptionStart: openStart.toISOString(),
      inscriptionEnd: openEnd.toISOString(),
      analysisStart: '2025-11-26', 
      analysisEnd: '2025-12-01',
      preliminaryResultDate: '2025-12-05',
      appealStartDate: '2025-12-06',
      appealEndDate: '2025-12-08',
      resultDate: '2025-12-10', 
      vacancyAcceptanceStartDate: '2025-12-11',
      vacancyAcceptanceDate: '2025-12-15', 
      customRequirements: [],
      additionalDocuments: [],
      isActive: true,
      editalPdfUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js-sample-files/master/tracemonkey.pdf',
    },
    { 
      id: 'e3', 
      number: '003/2024', 
      modality: EditalModalities.TECNICO, 
      vacancyDetails: [
        { id: 'v5', count: 40, type: VacancyType.AMPLA_CONCORRENCIA, shift: VacancyShift.NOITE },
        { id: 'v6', count: 5, type: VacancyType.EDUCACAO_ESPECIAL, shift: VacancyShift.NOITE }
      ], 
      year: new Date().getFullYear(), 
      inscriptionStart: closedStart2.toISOString(), 
      inscriptionEnd: closedEnd2.toISOString(), 
      analysisStart: '2025-09-26', 
      analysisEnd: '2025-10-01', 
      preliminaryResultDate: '2025-10-05',
      appealStartDate: '2025-10-06',
      appealEndDate: '2025-10-08',
      resultDate: '2025-10-10',
      vacancyAcceptanceStartDate: '2025-10-11',
      vacancyAcceptanceDate: '2025-10-15', 
      customRequirements: [
        { id: 'cr2', label: 'Certificado de Conclusão do Ensino Médio' },
        { id: 'cr3', label: 'Carteira de Trabalho (página de identificação)' },
      ],
      additionalDocuments: [],
      isActive: false, // Inactive example
      editalPdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    },
];

let documents: Document[] = [
    { id: 'd1', fileName: 'boletim_joao.pdf', fileType: 'application/pdf', fileUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js-sample-files/master/helloworld.pdf', validationStatus: ValidationStatus.PENDENTE },
    { id: 'd2', fileName: 'declaracao_matricula_joao.pdf', fileType: 'application/pdf', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', validationStatus: ValidationStatus.PENDENTE },
    { id: 'd3', fileName: 'laudo_maria.pdf', fileType: 'application/pdf', fileUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js-sample-files/master/tracemonkey.pdf', validationStatus: ValidationStatus.PENDENTE },
    // Docs for approved application
    { id: 'd4', fileName: 'boletim_aprovado_ana.pdf', fileType: 'application/pdf', fileUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js-sample-files/master/helloworld.pdf', validationStatus: ValidationStatus.VALIDO },
    { id: 'd5', fileName: 'declaracao_aprovada_ana.pdf', fileType: 'application/pdf', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', validationStatus: ValidationStatus.VALIDO },
    { id: 'd6', fileName: 'laudo_valido_mariana.pdf', fileType: 'application/pdf', fileUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js-sample-files/master/helloworld.pdf', validationStatus: ValidationStatus.VALIDO },
    { id: 'd7', fileName: 'laudo_invalido_sofia.pdf', fileType: 'application/pdf', fileUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js-sample-files/master/tracemonkey.pdf', validationStatus: ValidationStatus.INVALIDO, invalidationReason: "Laudo médico vencido. É necessário um laudo emitido nos últimos 12 meses." },
]

let applications: Application[] = [
  {
    id: 'app1',
    protocol: '20250001',
    student: students[0],
    edital: editais[0],
    status: ApplicationStatus.EM_ANALISE,
    documents: [documents[0], documents[1]],
    specialNeeds: false,
    submissionDate: '2025-10-25T10:00:00Z',
    siblingCgm: '20220199',
    address: {
        cep: '80230-010',
        street: 'Av. Sete de Setembro',
        number: '2775',
        complement: '',
        neighborhood: 'Rebouças',
        city: 'Curitiba',
    }
  },
  {
    id: 'app2',
    protocol: '20250002',
    student: students[1],
    edital: editais[0],
    status: ApplicationStatus.DOCUMENTACAO_INCOMPLETA,
    documents: [],
    specialNeeds: true,
    specialNeedsDocument: documents[2],
    submissionDate: '2025-10-26T14:30:00Z',
  },
  {
    id: 'app3',
    protocol: '20250003',
    student: students[2],
    edital: editais[1],
    status: ApplicationStatus.EM_RECURSO,
    documents: [documents[0]],
    specialNeeds: false,
    finalScore: 85,
    submissionDate: '2025-10-27T09:00:00Z',
    appeal: {
        protocol: `REC-20250003-${Date.now()}`,
        reason: 'Erro no cálculo de pontuação',
        justification: 'Acredito que a nota de matemática do 3º ano não foi computada corretamente.',
        date: new Date().toISOString(),
        status: AppealStatus.PENDENTE
    }
  },
   {
    id: 'app4',
    protocol: '20250004',
    student: students[3],
    edital: editais[1],
    status: ApplicationStatus.CLASSIFICADO_PRELIMINAR,
    documents: [documents[0]],
    specialNeeds: false,
    finalScore: 92,
    submissionDate: '2025-10-28T11:00:00Z',
  },
   {
    id: 'app5',
    protocol: '20250005',
    student: students[0],
    edital: editais[1],
    status: ApplicationStatus.EM_ANALISE,
    documents: [documents[0]],
    specialNeeds: false,
    submissionDate: '2025-10-29T11:00:00Z',
  },
  {
    id: 'app6',
    protocol: '20250006',
    student: students[3], // Ana Pereira
    edital: editais[0],
    status: ApplicationStatus.ANALISE_CONCLUIDA,
    documents: [documents[3], documents[4]],
    specialNeeds: false,
    finalScore: 95,
    submissionDate: '2025-10-28T12:00:00Z',
     analysis: {
        analystId: '3',
        analystName: 'Ana Lúcia (Analista)',
        date: new Date().toISOString(),
        justification: 'Documentação aprovada em conformidade com o edital.',
        observation: '',
        grades: [
            { year: 1, subject: 'Português', score: 9.5 }, { year: 1, subject: 'Matemática', score: 9.5 },
            { year: 2, subject: 'Português', score: 9.5 }, { year: 2, subject: 'Matemática', score: 9.5 },
            { year: 3, subject: 'Português', score: 9.5 }, { year: 3, subject: 'Matemática', score: 9.5 },
            { year: 4, subject: 'Português', score: 9.5 }, { year: 4, subject: 'Matemática', score: 9.5 },
            { year: 5, subject: 'Português', score: 9.5 }, { year: 5, subject: 'Matemática', score: 9.5 },
        ],
        isApproved: true,
        checklist: [
            { requirementId: 'cr1', checked: true },
            { requirementId: 'cr2', checked: true },
        ]
    }
  },
  // New applications for ranking and vacancy acceptance
  {
    id: 'app7',
    protocol: '20250007',
    student: students[4], // Lucas Martins
    edital: editais[0],
    status: ApplicationStatus.CLASSIFICADO_FINAL,
    documents: [documents[3], documents[4]],
    specialNeeds: false,
    finalScore: 98,
    submissionDate: '2025-10-28T13:00:00Z',
  },
  {
    id: 'app8',
    protocol: '20250008',
    student: students[5], // Mariana Costa
    edital: editais[0],
    status: ApplicationStatus.AGUARDANDO_PARECER_COMISSAO,
    documents: [documents[3], documents[4], documents[5]],
    specialNeeds: true,
    specialNeedsDocument: documents[5],
    finalScore: 97,
    submissionDate: '2025-10-28T14:00:00Z',
    analysis: {
        analystId: '3',
        analystName: 'Ana Lúcia (Analista)',
        date: new Date().toISOString(),
        justification: 'Documentação formalmente correta. Laudo encaminhado para análise da comissão.',
        observation: '',
        grades: [
             { year: 1, subject: 'Português', score: 9.8 }, { year: 1, subject: 'Matemática', score: 9.5 },
            { year: 2, subject: 'Português', score: 9.6 }, { year: 2, subject: 'Matemática', score: 9.8 },
            { year: 3, subject: 'Português', score: 9.7 }, { year: 3, subject: 'Matemática', score: 9.7 },
            { year: 4, subject: 'Português', score: 9.9 }, { year: 4, subject: 'Matemática', score: 9.6 },
            { year: 5, subject: 'Português', score: 9.8 }, { year: 5, subject: 'Matemática', score: 9.6 },
        ],
        isApproved: true,
        checklist: [
            { requirementId: 'cr1', checked: true },
            { requirementId: 'cr2', checked: true },
        ]
    }
  },
  {
    id: 'app9',
    protocol: '20250009',
    student: students[6], // Tiago Ferreira
    edital: editais[0],
    status: ApplicationStatus.ANALISE_CONCLUIDA,
    documents: [documents[3], documents[4]],
    specialNeeds: false,
    finalScore: 88,
    submissionDate: '2025-10-28T15:00:00Z',
  },
  {
    id: 'app10',
    protocol: '20250010',
    student: students[7], // Sofia Almeida
    edital: editais[0],
    status: ApplicationStatus.ANALISE_CONCLUIDA,
    documents: [documents[3], documents[4], documents[6]],
    specialNeeds: true,
    specialNeedsDocument: documents[6], // Invalid laudo
    finalScore: 91,
    submissionDate: '2025-10-28T16:00:00Z',
  },
];

// New data for Complementary Calls
const callStart = new Date();
callStart.setDate(today.getDate() - 2);

let complementaryCalls: ComplementaryCall[] = [
    {
        id: 'cc1',
        editalId: 'e1', // Edital 005/2024 - 6º Ano EF
        title: '2ª Chamada Complementar',
        startDate: callStart.toISOString(),
        pdfUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js-sample-files/master/tracemonkey.pdf',
        pdfFileName: 'chamada_complementar_edital_005_2024.pdf'
    },
    {
        id: 'cc2',
        editalId: 'e1', // Same edital
        title: '3ª Chamada Complementar - Vagas Remanescentes',
        startDate: callStart.toISOString(),
        pdfUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js-sample-files/master/helloworld.pdf',
        pdfFileName: 'chamada_complementar_3_edital_005_2024.pdf'
    }
];

let emailTemplates: EmailTemplate[] = [
    {
        id: 'tmpl_1',
        name: 'Confirmação de Inscrição',
        subject: 'Confirmação de Inscrição - Sistema Acesso CEP',
        body: `Olá {{studentName}},

Sua inscrição foi recebida com sucesso.

Detalhes:
- Protocolo: {{protocol}}
- Edital: {{edital}}
- Data de Envio: {{submissionDate}}

Acompanhe o status no portal.

Atenciosamente,
Equipe do Colégio Estadual do Paraná (CEP)`,
    },
    {
        id: 'tmpl_2',
        name: 'Documentação Incompleta',
        subject: 'Ação Necessária: Documentação Incompleta na sua Inscrição',
        body: `Olá {{studentName}},

A análise da sua inscrição (protocolo {{protocol}}) encontrou pendências.

Por favor, acesse o portal para visualizar as observações do analista e enviar os documentos corrigidos.

Justificativa do analista:
{{justification}}

Atenciosamente,
Equipe do Colégio Estadual do Paraná (CEP)`,
    },
];

let logs: LogEntry[] = [];

const simulateDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

const addLog = (
  actorId: string,
  actorName: string,
  action: string,
  details: string,
  targetType?: string,
  targetId?: string
) => {
  const newLog: LogEntry = {
    id: `log-${Date.now()}-${Math.random()}`,
    timestamp: new Date().toISOString(),
    actorId,
    actorName,
    action,
    details,
    targetType,
    targetId,
  };
  logs.unshift(newLog);
};

// --- API FUNCTIONS ---

export const api = {
  login: async (cpf: string): Promise<User | undefined> => {
    await simulateDelay(500);
    const user = users.find(u => u.cpf === cpf);
    if (!user) {
        throw new Error("Usuário não encontrado.");
    }
    if (!user.isActive) {
        throw new Error("Este usuário está desativado. Contate o administrador.");
    }
    addLog(user.id, user.name, 'LOGIN', 'Usuário realizou login com sucesso.');
    return user;
  },

  getApplicationsForResponsible: async (cpf: string): Promise<Application[]> => {
    await simulateDelay(800);
    const userStudents = students.filter(s => s.responsibleCpf === cpf);
    const studentIds = userStudents.map(s => s.id);
    return applications.filter(app => studentIds.includes(app.student.id));
  },

  getApplicationsForAnalyst: async (): Promise<Application[]> => {
    await simulateDelay(800);
    return applications.filter(app => [ApplicationStatus.EM_ANALISE, ApplicationStatus.DOCUMENTACAO_INCOMPLETA, ApplicationStatus.ANALISE_CONCLUIDA, ApplicationStatus.EM_RECURSO, ApplicationStatus.AGUARDANDO_PARECER_COMISSAO].includes(app.status));
  },

  getApplicationById: async (id: string): Promise<Application | undefined> => {
    await simulateDelay(300);
    const app = applications.find(app => app.id === id);
    if (app) {
        // Ensure specialNeedsDocument is also in the documents array for consistency
        if (app.specialNeedsDocument && !app.documents.find(d => d.id === app.specialNeedsDocument!.id)) {
            return { ...app, documents: [...app.documents, app.specialNeedsDocument] };
        }
    }
    return app;
  },
  
  getAllApplications: async (): Promise<Application[]> => {
      await simulateDelay(1000);
      return [...applications];
  },
  
  updateApplication: async (appId: string, data: Partial<Application>): Promise<Application> => {
    await simulateDelay(700);
    const appIndex = applications.findIndex(a => a.id === appId);
    if(appIndex === -1) throw new Error("Aplicação não encontrada");
    applications[appIndex] = { ...applications[appIndex], ...data };
    return applications[appIndex];
  },

  submitAnalysis: async (appId: string, analysis: AnalysisResult, updatedDocs: Document[], newStatus: ApplicationStatus): Promise<Application> => {
    await simulateDelay(1000);
    const appIndex = applications.findIndex(a => a.id === appId);
    if (appIndex === -1) throw new Error("Aplicação não encontrada");

    const totalScore = analysis.grades.reduce((acc, grade) => acc + (grade.score || 0), 0);
    
    const app = applications[appIndex];
    app.analysis = analysis;
    app.documents = updatedDocs;
    app.status = newStatus;
    app.finalScore = (newStatus === ApplicationStatus.ANALISE_CONCLUIDA || newStatus === ApplicationStatus.AGUARDANDO_PARECER_COMISSAO) ? totalScore : app.finalScore;
    
    if (app.specialNeedsDocument) {
        const updatedLaudo = updatedDocs.find(d => d.id === app.specialNeedsDocument!.id);
        if (updatedLaudo) {
            app.specialNeedsDocument = updatedLaudo;
        }
    }
    
    addLog(analysis.analystId, analysis.analystName, 'SUBMIT_ANALYSIS', `Análise submetida para protocolo ${app.protocol}. Novo status: ${newStatus}.`, 'Application', appId);
    return app;
  },
  
  getEditais: async (): Promise<Edital[]> => {
      await simulateDelay(400);
      return [...editais];
  },

  createEdital: async (editalData: EditalFormData): Promise<Edital> => {
    await simulateDelay(600);
    const newEdital: Edital = {
        id: `e${Date.now()}`,
        ...editalData,
        isActive: true, // New editais are active by default
    };
    editais.push(newEdital);
    addLog('system', 'Sistema', 'CREATE_EDITAL', `Edital "${newEdital.number}" criado.`, 'Edital', newEdital.id);
    return newEdital;
  },

  updateEdital: async(editalId: string, editalData: Partial<EditalFormData>): Promise<Edital> => {
    await simulateDelay(600);
    const editalIndex = editais.findIndex(e => e.id === editalId);
    if (editalIndex === -1) throw new Error("Edital não encontrado.");
    editais[editalIndex] = { ...editais[editalIndex], ...editalData };
    addLog('system', 'Sistema', 'UPDATE_EDITAL', `Edital "${editais[editalIndex].number}" atualizado.`, 'Edital', editalId);
    return editais[editalIndex];
  },

  deleteEdital: async(editalId: string): Promise<void> => {
    await simulateDelay(600);
    const editalIndex = editais.findIndex(e => e.id === editalId);
    if (editalIndex === -1) throw new Error("Edital não encontrado.");
    const editalNumber = editais[editalIndex].number;
    editais.splice(editalIndex, 1);
    complementaryCalls = complementaryCalls.filter(c => c.editalId !== editalId);
    addLog('system', 'Sistema', 'DELETE_EDITAL', `Edital "${editalNumber}" excluído.`, 'Edital', editalId);
  },

  getComplementaryCalls: async (): Promise<ComplementaryCall[]> => {
    await simulateDelay(300);
    return [...complementaryCalls];
  },

  createComplementaryCall: async (data: Omit<ComplementaryCall, 'id'>): Promise<ComplementaryCall> => {
    await simulateDelay(600);
    const newCall: ComplementaryCall = {
        id: `cc${Date.now()}`,
        ...data,
    };
    complementaryCalls.push(newCall);
    addLog('system', 'Sistema', 'CREATE_COMPLEMENTARY_CALL', `Chamada "${newCall.title}" criada para o edital ID ${newCall.editalId}.`, 'ComplementaryCall', newCall.id);
    return newCall;
  },
  
  deleteComplementaryCall: async (callId: string): Promise<void> => {
    await simulateDelay(600);
    const callIndex = complementaryCalls.findIndex(c => c.id === callId);
    if (callIndex === -1) throw new Error("Chamada complementar não encontrada.");
    const callTitle = complementaryCalls[callIndex].title;
    complementaryCalls.splice(callIndex, 1);
    addLog('system', 'Sistema', 'DELETE_COMPLEMENTARY_CALL', `Chamada "${callTitle}" excluída.`, 'ComplementaryCall', callId);
  },

  getStudentsByResponsible: async(cpf: string): Promise<Student[]> => {
      await simulateDelay(600);
      return students.filter(s => s.responsibleCpf === cpf);
  },

  findStudentByCgm: async (cgm: string, responsibleCpf: string): Promise<Student | undefined> => {
    await simulateDelay(600);
    const student = students.find(s => s.cgm === cgm && s.responsibleCpf === responsibleCpf);
    return student;
  },

  createStudent: async (name: string, birthDate: string, responsibleCpf: string, rg?: string, uf?: string): Promise<Student> => {
    await simulateDelay(700);
    const newStudent: Student = {
        id: `s${Date.now()}`,
        name,
        birthDate,
        responsibleCpf,
        rg,
        uf,
    };
    students.push(newStudent);
    addLog('system', 'Sistema', 'CREATE_STUDENT', `Estudante "${name}" criado.`, 'Student', newStudent.id);
    return newStudent;
  },

  createApplication: async(studentId: string, editalId: string, specialNeeds: boolean, siblingCgm?: string): Promise<Application> => {
    await simulateDelay(1000);
    const student = students.find(s => s.id === studentId);
    const edital = editais.find(e => e.id === editalId);
    if (!student || !edital) throw new Error("Estudante ou edital inválido.");

    const newApplication: Application = {
        id: `app${applications.length + 1}`,
        protocol: `2025000${applications.length + 1}`,
        student,
        edital,
        status: ApplicationStatus.INSCRICAO_PENDENTE,
        documents: [],
        specialNeeds: specialNeeds,
        submissionDate: new Date().toISOString(),
        siblingCgm: siblingCgm || undefined
    };
    applications.push(newApplication);
    addLog(student.responsibleCpf, 'Responsável', 'CREATE_APPLICATION', `Inscrição criada para "${student.name}" no edital ${edital.number}.`, 'Application', newApplication.id);
    return newApplication;
  },

  getUsers: async(): Promise<User[]> => {
    await simulateDelay(500);
    return [...users];
  },

  createUser: async (userData: Omit<User, 'id'>): Promise<User> => {
    await simulateDelay(600);
    if (users.some(u => u.cpf === userData.cpf)) {
      throw new Error("Já existe um usuário com este CPF.");
    }
    const newUser: User = {
      id: `u${Date.now()}`,
      isActive: true,
      ...userData,
    };
    users.push(newUser);
    addLog('system', 'Sistema', 'CREATE_USER', `Usuário "${newUser.name}" (${newUser.role}) criado.`, 'User', newUser.id);
    return newUser;
  },

  updateUser: async(userId: string, userData: Partial<User>): Promise<User> => {
    await simulateDelay(500);
    const userIndex = users.findIndex(u => u.id === userId);
    if(userIndex === -1) throw new Error("Usuário não encontrado.");
    const existingPermissions = users[userIndex].permissions || {};
    const updatedPermissions = { ...existingPermissions, ...userData.permissions };
    users[userIndex] = { ...users[userIndex], ...userData, permissions: updatedPermissions };
    addLog('system', 'Sistema', 'UPDATE_USER', `Usuário "${users[userIndex].name}" atualizado.`, 'User', userId);
    return users[userIndex];
  },
  
  deleteUser: async(userId: string): Promise<void> => {
    await simulateDelay(600);
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("Usuário não encontrado.");
    if (users[userIndex].role === UserRole.ADMIN_SEED) throw new Error("Não é possível excluir o usuário Admin SEED.");
    const deletedUser = users[userIndex];
    users.splice(userIndex, 1);
    addLog('system', 'Sistema', 'DELETE_USER', `Usuário "${deletedUser.name}" excluído.`, 'User', userId);
  },
  
  submitAppeal: async (appId: string, reason: string, justification: string, attachmentFile?: File): Promise<Application> => {
    await simulateDelay(800);
    const appIndex = applications.findIndex(a => a.id === appId);
    if(appIndex === -1) throw new Error("Aplicação não encontrada");
    const app = applications[appIndex];

    let attachment: Document | undefined = undefined;
    if (attachmentFile) {
        const newDocId = `d-appeal-${Date.now()}`;
        attachment = {
            id: newDocId,
            fileName: attachmentFile.name,
            fileType: attachmentFile.type,
            fileUrl: URL.createObjectURL(attachmentFile),
            validationStatus: ValidationStatus.VALIDO,
        };
        documents.push(attachment);
    }

    const appeal: Appeal = {
        protocol: `REC-${app.protocol}-${Date.now()}`,
        reason,
        justification,
        date: new Date().toISOString(),
        status: AppealStatus.PENDENTE,
        attachment,
    };
    
    app.appeal = appeal;
    app.status = ApplicationStatus.EM_RECURSO;
    
    addLog(app.student.responsibleCpf, 'Responsável', 'SUBMIT_APPEAL', `Recurso submetido para protocolo ${app.protocol}.`, 'Application', app.id);
    return app;
  },

  resolveAppeal: async (appId: string, decision: { status: AppealStatus.DEFERIDO | AppealStatus.INDEFERIDO, analystJustification: string }): Promise<Application> => {
    await simulateDelay(800);
    const appIndex = applications.findIndex(a => a.id === appId);
    if(appIndex === -1) throw new Error("Aplicação não encontrada");
    const app = applications[appIndex];
    if (!app.appeal) throw new Error("Aplicação não possui um recurso para ser resolvido.");

    const updatedAppeal: Appeal = {
        ...app.appeal,
        status: decision.status,
        analystJustification: decision.analystJustification,
    };

    app.appeal = updatedAppeal;

    if (decision.status === AppealStatus.INDEFERIDO) {
        app.status = ApplicationStatus.CLASSIFICADO_PRELIMINAR; 
    }
    
    addLog(app.analysis?.analystId || 'system', app.analysis?.analystName || 'Sistema', 'RESOLVE_APPEAL', `Recurso para protocolo ${app.protocol} foi ${decision.status}.`, 'Application', app.id);
    return app;
  },

  acceptVacancy: async (appId: string): Promise<Application> => {
    await simulateDelay(500);
    const appIndex = applications.findIndex(a => a.id === appId);
    if(appIndex === -1) throw new Error("Aplicação não encontrada");
    
    const app = applications[appIndex];
    app.status = ApplicationStatus.VAGA_ACEITA;
    addLog(app.student.responsibleCpf, 'Responsável', 'ACCEPT_VACANCY', `Vaga para protocolo ${app.protocol} foi aceita.`, 'Application', appId);
    return app;
  },

  declineVacancy: async (appId: string): Promise<Application> => {
    await simulateDelay(500);
    const appIndex = applications.findIndex(a => a.id === appId);
    if(appIndex === -1) throw new Error("Aplicação não encontrada");
    
    const app = applications[appIndex];
    app.status = ApplicationStatus.VAGA_RECUSADA;
    addLog(app.student.responsibleCpf, 'Responsável', 'DECLINE_VACANCY', `Vaga para protocolo ${app.protocol} foi recusada.`, 'Application', appId);
    return app;
  },
  
  getEmailTemplates: async (): Promise<EmailTemplate[]> => {
    await simulateDelay(300);
    return [...emailTemplates];
  },

  updateEmailTemplate: async (templateId: string, data: Partial<Omit<EmailTemplate, 'id' | 'name'>>): Promise<EmailTemplate> => {
    await simulateDelay(500);
    const templateIndex = emailTemplates.findIndex(t => t.id === templateId);
    if (templateIndex === -1) throw new Error('Template não encontrado');
    emailTemplates[templateIndex] = { ...emailTemplates[templateIndex], ...data };
    addLog('system', 'Sistema', 'UPDATE_EMAIL_TEMPLATE', `Template "${emailTemplates[templateIndex].name}" atualizado.`, 'EmailTemplate', templateId);
    return emailTemplates[templateIndex];
  },

  sendEmail: async (templateName: string, context: Record<string, string>): Promise<void> => {
    await simulateDelay(200);
    const template = emailTemplates.find(t => t.name === templateName);
    if (!template) {
        console.error(`Email template "${templateName}" not found.`);
        return;
    }

    const mainRecipient = context.recipientEmail;
    const recipientUser = users.find(u => u.email === mainRecipient);

    addLog(
      context.actorId || 'system',
      context.actorName || 'Sistema',
      'SEND_EMAIL',
      `E-mail "${templateName}" enviado para ${mainRecipient}.`,
      'User',
      recipientUser?.id
    );

    const bccRecipient = templateName === 'Confirmação de Inscrição' ? 'michel.delespinasse@escola.pr.gov.br' : null;

    console.log(`--- SIMULATING EMAIL SEND ---
Template: ${template.name}
To: ${mainRecipient || 'N/A'}
BCC: ${bccRecipient || 'N/A'}
---------------------------`);
  },
  
  getSpecialEducationApplications: async (): Promise<Application[]> => {
    await simulateDelay(800);
    return applications.filter(app => app.status === ApplicationStatus.AGUARDANDO_PARECER_COMISSAO);
  },

  submitCommissionDecision: async (appId: string, decision: { isEligible: boolean; justification: string; commissionMemberId: string; commissionMemberName: string; }): Promise<Application> => {
      await simulateDelay(1000);
      const appIndex = applications.findIndex(a => a.id === appId);
      if (appIndex === -1) throw new Error("Aplicação não encontrada");

      const app = applications[appIndex];
      const commissionAnalysis: CommissionAnalysis = {
          ...decision,
          date: new Date().toISOString()
      };
      
      app.commissionAnalysis = commissionAnalysis;
      app.status = ApplicationStatus.ANALISE_CONCLUIDA;

      if (!decision.isEligible && app.specialNeedsDocument) {
          const docId = app.specialNeedsDocument!.id;
          const reason = `Indeferido pela comissão: ${decision.justification}`;
          
          const docIndex = documents.findIndex(d => d.id === docId);
          if (docIndex !== -1) {
              documents[docIndex].validationStatus = ValidationStatus.INVALIDO;
              documents[docIndex].invalidationReason = reason;
          }
          
          const appDocIndex = app.documents.findIndex(d => d.id === docId);
          if(appDocIndex !== -1) {
              app.documents[appDocIndex].validationStatus = ValidationStatus.INVALIDO;
              app.documents[appDocIndex].invalidationReason = reason;
          }
          
          app.specialNeedsDocument!.validationStatus = ValidationStatus.INVALIDO;
          app.specialNeedsDocument!.invalidationReason = reason;
      }
      addLog(decision.commissionMemberId, decision.commissionMemberName, 'SUBMIT_COMMISSION_DECISION', `Decisão da comissão para protocolo ${app.protocol} foi ${decision.isEligible ? 'Elegível' : 'Inelegível'}.`, 'Application', appId);
      return app;
  },

  getLogs: async (filters?: { userId?: string, text?: string }): Promise<LogEntry[]> => {
      await simulateDelay(500);
      if (!filters) {
          return [...logs];
      }

      let filteredLogs = [...logs];

      if (filters.userId && filters.userId !== 'all') {
          filteredLogs = filteredLogs.filter(log =>
              log.actorId === filters.userId ||
              log.targetId === filters.userId
          );
      }
      
      if (filters.text) {
          const searchText = filters.text.toLowerCase();
          filteredLogs = filteredLogs.filter(log =>
              log.actorName.toLowerCase().includes(searchText) ||
              log.action.toLowerCase().replace(/_/g, ' ').includes(searchText) ||
              log.details.toLowerCase().includes(searchText) ||
              log.targetId?.toLowerCase().includes(searchText)
          );
      }

      return filteredLogs;
  },
};