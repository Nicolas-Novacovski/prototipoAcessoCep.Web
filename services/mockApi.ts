

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
      analysisStart: new Date(new Date().setDate(today.getDate() - 15)).toISOString().split('T')[0],
      analysisEnd: new Date(new Date().setDate(today.getDate() - 8)).toISOString().split('T')[0],
      preliminaryResultDate: new Date(new Date().setDate(today.getDate() - 7)).toISOString().split('T')[0], // In the past
      appealStartDate: new Date(new Date().setDate(today.getDate() - 6)).toISOString().split('T')[0],
      appealEndDate: new Date(new Date().setDate(today.getDate() - 4)).toISOString().split('T')[0],
      resultDate: new Date(new Date().setDate(today.getDate() + 3)).toISOString().split('T')[0], // In the future
      vacancyAcceptanceStartDate: new Date(new Date().setDate(today.getDate() + 4)).toISOString(),
      vacancyAcceptanceDate: new Date(new Date().setDate(today.getDate() + 8)).toISOString(),
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
    { id: 'd8', fileName: 'laudo_complementar_mariana.pdf', fileType: 'application/pdf', fileUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js-sample-files/master/tracemonkey.pdf', validationStatus: ValidationStatus.VALIDO },
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
    specialNeedsDocuments: [documents[2]],
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
    finalScore: 91.75,
    submissionDate: '2025-10-28T11:00:00Z',
    analysis: {
        analystId: '3',
        analystName: 'Ana Lúcia (Analista)',
        date: new Date().toISOString(),
        justification: 'Documentação aprovada em conformidade com o edital.',
        observation: '',
        grades: [
            { year: '6º Ano', subject: 'Português', score: 90 }, { year: '6º Ano', subject: 'Matemática', score: 95 },
            { year: '7º Ano', subject: 'Português', score: 92 }, { year: '7º Ano', subject: 'Matemática', score: 93 },
            { year: '8º Ano', subject: 'Português', score: 91 }, { year: '8º Ano', subject: 'Matemática', score: 90 },
            { year: '9º Ano (Parcial)', subject: 'Português', score: 94 }, { year: '9º Ano (Parcial)', subject: 'Matemática', score: 89 },
        ],
        isApproved: true,
        checklist: []
    }
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
            { year: '1º Ano', subject: 'Português', score: 95 }, { year: '1º Ano', subject: 'Matemática', score: 95 },
            { year: '2º Ano', subject: 'Português', score: 95 }, { year: '2º Ano', subject: 'Matemática', score: 95 },
            { year: '3º Ano', subject: 'Português', score: 95 }, { year: '3º Ano', subject: 'Matemática', score: 95 },
            { year: '4º Ano', subject: 'Português', score: 95 }, { year: '4º Ano', subject: 'Matemática', score: 95 },
            { year: '5º Ano', subject: 'Português', score: 95 }, { year: '5º Ano', subject: 'Matemática', score: 95 },
        ],
        isApproved: true,
        checklist: [
            { requirementId: 'cr1', checked: true },
            { requirementId: 'cr2', checked: true },
        ]
    }
  },
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
    documents: [documents[3], documents[4], documents[5], documents[7]],
    specialNeeds: true,
    specialNeedsDocuments: [documents[5], documents[7]],
    finalScore: 97,
    submissionDate: '2025-10-28T14:00:00Z',
    analysis: {
        analystId: '3',
        analystName: 'Ana Lúcia (Analista)',
        date: new Date().toISOString(),
        justification: 'Documentação formalmente correta. Laudo encaminhado para análise da comissão.',
        observation: '',
        grades: [
            { year: '1º Ano', subject: 'Português', score: 97 }, { year: '1º Ano', subject: 'Matemática', score: 97 },
            { year: '2º Ano', subject: 'Português', score: 97 }, { year: '2º Ano', subject: 'Matemática', score: 97 },
            { year: '3º Ano', subject: 'Português', score: 97 }, { year: '3º Ano', subject: 'Matemática', score: 97 },
            { year: '4º Ano', subject: 'Português', score: 97 }, { year: '4º Ano', subject: 'Matemática', score: 97 },
            { year: '5º Ano', subject: 'Português', score: 97 }, { year: '5º Ano', subject: 'Matemática', score: 97 },
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
    finalScore: 96,
    submissionDate: '2025-10-28T15:00:00Z',
  },
  {
    id: 'app10',
    protocol: '20250010',
    student: students[7], // Sofia Almeida
    edital: editais[0],
    status: ApplicationStatus.ANALISE_INDEFERIDA,
    documents: [documents[3], documents[6]],
    specialNeeds: true,
    specialNeedsDocuments: [documents[6]],
    finalScore: 0,
    submissionDate: '2025-10-28T16:00:00Z',
    analysis: {
        analystId: '3',
        analystName: 'Ana Lúcia (Analista)',
        date: new Date().toISOString(),
        justification: 'Documento indeferido laudo_invalido_sofia.pdf: Laudo médico vencido. É necessário um laudo emitido nos últimos 12 meses.',
        observation: '',
        grades: [],
        isApproved: false,
    }
  },
];

let complementaryCalls: ComplementaryCall[] = [
    { id: 'cc1', editalId: 'e1', title: '1ª Chamada Complementar - 6º Ano', startDate: new Date(new Date().setDate(today.getDate() - 1)).toISOString(), pdfUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js-sample-files/master/helloworld.pdf', pdfFileName: 'chamada_01.pdf'},
    { id: 'cc2', editalId: 'e1', title: '2ª Chamada Complementar - 6º Ano', startDate: new Date(new Date().setDate(today.getDate() + 5)).toISOString(), pdfUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js-sample-files/master/helloworld.pdf', pdfFileName: 'chamada_02.pdf'},
];

let emailTemplates: EmailTemplate[] = [
    {
        id: 't1',
        name: 'Confirmação de Inscrição',
        subject: 'Confirmação de Inscrição - Sistema Acesso CEP',
        body: `Olá,\n\nSua inscrição para o candidato {{studentName}} foi recebida com sucesso!\n\nDetalhes da Inscrição:\nProtocolo: {{protocol}}\nEdital: {{edital}}\nData de Envio: {{submissionDate}}\n\nAcompanhe o status da sua inscrição através do portal.\n\nAtenciosamente,\nEquipe do Colégio Estadual do Paraná`,
    },
    {
        id: 't2',
        name: 'Documentação Incompleta',
        subject: 'Pendência na Inscrição - Sistema Acesso CEP',
        body: `Olá {{responsibleName}},\n\nNotamos uma pendência na documentação da inscrição do candidato {{studentName}} (Protocolo: {{protocol}}).\n\nJustificativa do analista: {{justification}}\n\nPor favor, acesse o portal para verificar os detalhes e enviar os documentos corrigidos.\n\nAtenciosamente,\nEquipe do Colégio Estadual do Paraná`,
    },
];

let logs: LogEntry[] = [];
let logIdCounter = 0;

// --- UTILITY FUNCTIONS ---

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const findUser = (cpf: string) => users.find(u => u.cpf === cpf);
const findUserById = (id: string) => users.find(u => u.id === id);
const findEdital = (id: string) => editais.find(e => e.id === id);
const findStudent = (id: string) => students.find(s => s.id === id);

const addLog = (actorId: string, actorName: string, action: string, targetType?: string, targetId?: string, details: string = '') => {
    logs.unshift({
        id: `log-${logIdCounter++}`,
        timestamp: new Date().toISOString(),
        actorId,
        actorName,
        action,
        targetType,
        targetId,
        details
    });
};

const renderEmailBody = (templateBody: string, context: Record<string, any>): string => {
    let renderedBody = templateBody;
    for (const key in context) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        renderedBody = renderedBody.replace(regex, context[key]);
    }
    return renderedBody;
};

// --- API MOCK ---

export const api = {
  // AUTH
  login: async (cpf: string): Promise<User | null> => {
    await delay(500);
    const user = findUser(cpf);
    if(user && !user.isActive) {
        throw new Error("Este usuário está desativado. Entre em contato com o administrador.");
    }
    if (user) {
        addLog(user.id, user.name, 'LOGIN_SUCCESS', 'User', user.id, `Usuário ${user.name} logado com sucesso.`);
    } else {
        addLog('system', 'System', 'LOGIN_FAILURE', 'User', cpf, `Tentativa de login falhou para o CPF: ${cpf}.`);
    }
    return user ? { ...user } : null;
  },

  // USERS
  getUsers: async (): Promise<User[]> => {
    await delay(300);
    return JSON.parse(JSON.stringify(users));
  },
  updateUser: async (id: string, data: Partial<User>): Promise<User> => {
    await delay(300);
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex > -1) {
      users[userIndex] = { ...users[userIndex], ...data };
      addLog('system_admin', 'Admin', 'UPDATE_USER', 'User', id, `Usuário ${users[userIndex].name} atualizado.`);
      return { ...users[userIndex] };
    }
    throw new Error('User not found');
  },
  deleteUser: async (id: string): Promise<void> => {
    await delay(300);
    const initialLength = users.length;
    users = users.filter(u => u.id !== id);
    if (users.length === initialLength) {
      throw new Error('User not found');
    }
    addLog('system_admin', 'Admin', 'DELETE_USER', 'User', id, `Usuário com ID ${id} foi excluído.`);
  },
  createUser: async (userData: Omit<User, 'id'>): Promise<User> => {
    await delay(300);
    if (users.some(u => u.cpf === userData.cpf)) {
        throw new Error('CPF já cadastrado no sistema.');
    }
    const newUser: User = { id: `u-${Date.now()}`, ...userData };
    users.push(newUser);
    addLog('system_admin', 'Admin', 'CREATE_USER', 'User', newUser.id, `Novo usuário ${newUser.name} criado.`);
    return newUser;
  },

  // STUDENTS
  getStudentsByResponsible: async (cpf: string): Promise<Student[]> => {
    await delay(300);
    return JSON.parse(JSON.stringify(students.filter(s => s.responsibleCpf === cpf)));
  },
  findStudentByCgm: async (cgm: string, responsibleCpf: string): Promise<Student | null> => {
    await delay(500);
    const student = students.find(s => s.cgm === cgm && s.responsibleCpf === responsibleCpf);
    return student ? { ...student } : null;
  },
  createStudent: async (name: string, birthDate: string, responsibleCpf: string, rg?: string, uf?: string): Promise<Student> => {
    await delay(300);
    const newStudent: Student = {
        id: `s-${Date.now()}`,
        name,
        birthDate,
        responsibleCpf,
        rg,
        uf,
    };
    students.push(newStudent);
    return newStudent;
  },

  // EDITAIS
  getEditais: async (): Promise<Edital[]> => {
    await delay(300);
    return JSON.parse(JSON.stringify(editais));
  },
  createEdital: async (editalData: EditalFormData): Promise<Edital> => {
    await delay(500);
    const newEdital: Edital = {
        id: `e-${Date.now()}`,
        ...editalData,
    };
    editais.unshift(newEdital);
    addLog('system_admin', 'Admin', 'CREATE_EDITAL', 'Edital', newEdital.id, `Edital ${newEdital.number} criado.`);
    return { ...newEdital };
  },
  updateEdital: async (id: string, editalData: EditalFormData): Promise<Edital> => {
    await delay(500);
    const index = editais.findIndex(e => e.id === id);
    if (index > -1) {
        editais[index] = { ...editais[index], ...editalData };
        addLog('system_admin', 'Admin', 'UPDATE_EDITAL', 'Edital', id, `Edital ${editais[index].number} atualizado.`);
        return { ...editais[index] };
    }
    throw new Error('Edital not found');
  },
  deleteEdital: async (id: string): Promise<void> => {
    await delay(500);
    editais = editais.filter(e => e.id !== id);
    addLog('system_admin', 'Admin', 'DELETE_EDITAL', 'Edital', id, `Edital com ID ${id} excluído.`);
  },

  // APPLICATIONS
  getAllApplications: async (): Promise<Application[]> => {
    await delay(400);
    return JSON.parse(JSON.stringify(applications.map(app => ({
        ...app,
        student: findStudent(app.student.id)!,
        edital: findEdital(app.edital.id)!,
    }))));
  },
  getApplicationsForResponsible: async (cpf: string): Promise<Application[]> => {
    await delay(300);
    const responsibleStudents = students.filter(s => s.responsibleCpf === cpf);
    const studentIds = responsibleStudents.map(s => s.id);
    return JSON.parse(JSON.stringify(
      applications
        .filter(app => studentIds.includes(app.student.id))
        .map(app => ({
          ...app,
          student: findStudent(app.student.id)!,
          edital: findEdital(app.edital.id)!,
        }))
    ));
  },
  getApplicationsForAnalyst: async (): Promise<Application[]> => {
    await delay(300);
    const statuses = [
        ApplicationStatus.EM_ANALISE,
        ApplicationStatus.DOCUMENTACAO_INCOMPLETA,
        ApplicationStatus.EM_RECURSO,
        ApplicationStatus.FIM_DE_FILA,
        ApplicationStatus.AGUARDANDO_PARECER_COMISSAO,
    ];
    return JSON.parse(JSON.stringify(
      applications
        .filter(app => statuses.includes(app.status))
        .map(app => ({
          ...app,
          student: findStudent(app.student.id)!,
          edital: findEdital(app.edital.id)!,
        }))
    ));
  },
  getApplicationById: async (id: string): Promise<Application | null> => {
    await delay(300);
    const app = applications.find(a => a.id === id);
    if (app) {
      return JSON.parse(JSON.stringify({
        ...app,
        student: findStudent(app.student.id)!,
        edital: findEdital(app.edital.id)!,
      }));
    }
    return null;
  },
  createApplication: async (studentId: string, editalId: string, specialNeeds: boolean, siblingCgm: string): Promise<Application> => {
    await delay(500);
    const student = findStudent(studentId);
    const edital = findEdital(editalId);
    if (!student || !edital) throw new Error('Student or Edital not found');

    const newApplication: Application = {
      id: `app-${Date.now()}`,
      protocol: `${edital.year}${String(applications.length + 1).padStart(4, '0')}`,
      student: student,
      edital: edital,
      status: ApplicationStatus.INSCRICAO_PENDENTE,
      documents: [],
      specialNeeds,
      submissionDate: new Date().toISOString(),
      siblingCgm,
    };
    applications.push(newApplication);
    return { ...newApplication };
  },
  updateApplication: async (id: string, data: Partial<Application>): Promise<Application> => {
    await delay(300);
    const appIndex = applications.findIndex(a => a.id === id);
    if (appIndex > -1) {
      applications[appIndex] = { ...applications[appIndex], ...data };
      return { ...applications[appIndex] };
    }
    throw new Error('Application not found');
  },

  // ANALYSIS
  submitAnalysis: async (applicationId: string, analysis: AnalysisResult, updatedDocuments: Document[], newStatus: ApplicationStatus): Promise<void> => {
    await delay(700);
    const appIndex = applications.findIndex(app => app.id === applicationId);
    if (appIndex > -1) {
        applications[appIndex].analysis = analysis;
        applications[appIndex].documents = updatedDocuments;
        applications[appIndex].status = newStatus;
        if (analysis.isApproved) {
            const sum = analysis.grades.reduce((acc, grade) => acc + (grade.score || 0), 0);
            applications[appIndex].finalScore = parseFloat((sum / analysis.grades.length).toFixed(2));
        } else {
            applications[appIndex].finalScore = 0;
        }

        const analyst = findUserById(analysis.analystId)!;
        addLog(analyst.id, analyst.name, 'SUBMIT_ANALYSIS', 'Application', applicationId, `Análise do protocolo ${applications[appIndex].protocol} finalizada com status ${newStatus}.`);

    } else {
        throw new Error("Inscrição não encontrada.");
    }
  },
  sendApplicationToEndOfQueue: async (applicationId: string, partialAnalysis: Partial<AnalysisResult>, updatedDocuments: Document[]): Promise<void> => {
    await delay(500);
    const appIndex = applications.findIndex(app => app.id === applicationId);
    if (appIndex > -1) {
        const app = applications[appIndex];
        
        // Update analysis data and documents
        app.analysis = { ...(app.analysis || {}), ...partialAnalysis } as AnalysisResult;
        app.documents = updatedDocuments;

        // Set status to FIM_DE_FILA
        app.status = ApplicationStatus.FIM_DE_FILA;

        // Move to end of the array
        applications.splice(appIndex, 1);
        applications.push(app);
        
        const analyst = findUserById(partialAnalysis.analystId!);
        addLog(analyst!.id, analyst!.name, 'SAVE_ANALYSIS_FOR_LATER', 'Application', applicationId, `Análise do protocolo ${app.protocol} salva para depois.`);
    } else {
        throw new Error("Inscrição não encontrada.");
    }
  },
  getSpecialEducationApplications: async(): Promise<Application[]> => {
    await delay(300);
     return JSON.parse(JSON.stringify(
      applications
        .filter(app => app.status === ApplicationStatus.AGUARDANDO_PARECER_COMISSAO)
        .map(app => ({
          ...app,
          student: findStudent(app.student.id)!,
          edital: findEdital(app.edital.id)!,
        }))
    ));
  },
  submitCommissionDecision: async(applicationId: string, decision: Omit<CommissionAnalysis, 'date'>): Promise<void> => {
    await delay(500);
    const appIndex = applications.findIndex(app => app.id === applicationId);
    if (appIndex > -1) {
        applications[appIndex].commissionAnalysis = { ...decision, date: new Date().toISOString() };
        if(decision.isEligible) {
            // If eligible, it just continues in the flow
            applications[appIndex].status = ApplicationStatus.ANALISE_CONCLUIDA;
        } else {
            // If not eligible, all laudos become invalid, and the status returns to 'ANALISE_CONCLUIDA'
            // to proceed in the general vacancy ranking. The specialNeeds flag remains true for history.
            if(applications[appIndex].specialNeedsDocuments) {
                applications[appIndex].specialNeedsDocuments!.forEach(doc => {
                    doc.validationStatus = ValidationStatus.INVALIDO;
                    doc.invalidationReason = decision.justification;
                })
            }
             applications[appIndex].status = ApplicationStatus.ANALISE_CONCLUIDA;
        }
        const member = findUserById(decision.commissionMemberId)!;
        addLog(member.id, member.name, 'SUBMIT_COMMISSION_DECISION', 'Application', applicationId, `Decisão da comissão para ${applications[appIndex].protocol}: ${decision.isEligible ? 'Elegível' : 'Não Elegível'}`);
    } else {
      throw new Error("Application not found.");
    }
  },

  // VACANCY
  acceptVacancy: async (applicationId: string): Promise<void> => {
    await delay(500);
    const appIndex = applications.findIndex(app => app.id === applicationId);
    if(appIndex > -1) {
        applications[appIndex].status = ApplicationStatus.VAGA_ACEITA;
    } else {
        throw new Error("Inscrição não encontrada.");
    }
  },
  declineVacancy: async (applicationId: string): Promise<void> => {
    await delay(500);
    const appIndex = applications.findIndex(app => app.id === applicationId);
    if(appIndex > -1) {
        applications[appIndex].status = ApplicationStatus.VAGA_RECUSADA;
    } else {
        throw new Error("Inscrição não encontrada.");
    }
  },

  // APPEAL
  submitAppeal: async (applicationId: string, reason: string, justification: string, attachment?: File): Promise<void> => {
    await delay(600);
    const appIndex = applications.findIndex(app => app.id === applicationId);
    if (appIndex > -1) {
        let attachmentDoc: Document | undefined = undefined;
        if (attachment) {
            attachmentDoc = {
                id: `doc-appeal-${Date.now()}`,
                fileName: attachment.name,
                fileType: attachment.type,
                fileUrl: URL.createObjectURL(attachment),
                validationStatus: ValidationStatus.PENDENTE
            }
        }
        applications[appIndex].appeal = {
            protocol: `REC-${applications[appIndex].protocol}-${Date.now()}`,
            reason,
            justification,
            attachment: attachmentDoc,
            date: new Date().toISOString(),
            status: AppealStatus.PENDENTE,
        };
        applications[appIndex].status = ApplicationStatus.EM_RECURSO;
    } else {
        throw new Error("Inscrição não encontrada.");
    }
  },
  resolveAppeal: async (applicationId: string, resolution: { status: AppealStatus; analystJustification: string }): Promise<void> => {
    await delay(500);
    const appIndex = applications.findIndex(app => app.id === applicationId);
    if (appIndex > -1 && applications[appIndex].appeal) {
        applications[appIndex].appeal!.status = resolution.status;
        applications[appIndex].appeal!.analystJustification = resolution.analystJustification;
        if(resolution.status === AppealStatus.INDEFERIDO) {
            // If appeal is denied, return to concluded status
            applications[appIndex].status = ApplicationStatus.ANALISE_CONCLUIDA;
        }
        // If approved, status remains EM_RECURSO until analyst resubmits
    } else {
        throw new Error("Recurso ou inscrição não encontrado(a).");
    }
  },

  // COMPLEMENTARY CALLS
  getComplementaryCalls: async (): Promise<ComplementaryCall[]> => {
    await delay(200);
    return JSON.parse(JSON.stringify(complementaryCalls));
  },
  createComplementaryCall: async (callData: Omit<ComplementaryCall, 'id'>): Promise<ComplementaryCall> => {
    await delay(400);
    const newCall: ComplementaryCall = { ...callData, id: `cc-${Date.now()}` };
    complementaryCalls.unshift(newCall);
    return { ...newCall };
  },
  deleteComplementaryCall: async (id: string): Promise<void> => {
    await delay(400);
    complementaryCalls = complementaryCalls.filter(c => c.id !== id);
  },

  // EMAIL TEMPLATES
  getEmailTemplates: async (): Promise<EmailTemplate[]> => {
    await delay(200);
    return JSON.parse(JSON.stringify(emailTemplates));
  },
  updateEmailTemplate: async (id: string, data: Partial<Omit<EmailTemplate, 'id' | 'name'>>): Promise<EmailTemplate> => {
    await delay(400);
    const index = emailTemplates.findIndex(t => t.id === id);
    if (index > -1) {
        emailTemplates[index] = { ...emailTemplates[index], ...data };
        return { ...emailTemplates[index] };
    }
    throw new Error('Template not found');
  },
  sendEmail: async (templateName: string, context: Record<string, any>): Promise<void> => {
    await delay(100);
    const template = emailTemplates.find(t => t.name === templateName);
    if (!template) {
        console.error(`Email template "${templateName}" not found.`);
        return;
    }
    
    const { actorId, actorName, recipientEmail, ...emailContext } = context;
    const body = renderEmailBody(template.body, emailContext);
    
    const bccRecipient = templateName === 'Confirmação de Inscrição' ? 'michel.delespinasse@escola.pr.gov.br' : undefined;

    console.log("--- SIMULATING EMAIL SEND ---");
    console.log(`From: noreply@cep.pr.gov.br`);
    console.log(`To: ${recipientEmail}`);
    if (bccRecipient) {
        console.log(`BCC: ${bccRecipient}`);
    }
    console.log(`Subject: ${template.subject}`);
    console.log("--- BODY ---");
    console.log(body);
    console.log("----------------------------");
    
    const recipientUser = users.find(u => u.email === recipientEmail);
    addLog(actorId, actorName, 'SEND_EMAIL', 'User', recipientUser?.id || recipientEmail, `Email "${template.name}" enviado para ${recipientEmail}.`);
  },

  // LOGS
  getLogs: async(): Promise<LogEntry[]> => {
    await delay(300);
    return JSON.parse(JSON.stringify(logs));
  }
};
