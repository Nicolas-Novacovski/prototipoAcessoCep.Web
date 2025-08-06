
import { User, UserRole, Application, ApplicationStatus, Edital, EditalModalities, Student, Document, AnalysisResult, EditalFormData, Appeal, ValidationStatus, VacancyType, VacancyShift } from '../types';

// --- MOCK DATABASE ---

let users: User[] = [
  { id: '1', name: 'Admin SEED', email: 'admin.seed@email.com', cpf: '11111111111', role: UserRole.ADMIN_SEED, phone: '41911111111' },
  { id: '2', name: 'Admin CEP', email: 'admin.cep@email.com', cpf: '22222222222', role: UserRole.ADMIN_CEP, phone: '41922222222' },
  { id: '3', name: 'Ana Lúcia (Analista)', email: 'analista@email.com', cpf: '33333333333', role: UserRole.ANALISTA, phone: '41933333333' },
  { id: '4', name: 'Carlos (Responsável)', email: 'responsavel@email.com', cpf: '44444444444', role: UserRole.RESPONSAVEL, phone: '41944444444' },
  { id: '5', name: 'Beatriz (Responsável)', email: 'responsavel2@email.com', cpf: '55555555555', role: UserRole.RESPONSAVEL, phone: '' },
];

let students: Student[] = [
    { id: 's1', name: 'João da Silva', cgm: '20240001', birthDate: '2014-05-10', responsibleCpf: '44444444444' },
    { id: 's2', name: 'Maria da Silva', cgm: '20240002', birthDate: '2013-11-22', responsibleCpf: '44444444444' },
    { id: 's3', name: 'Pedro Souza', cgm: '20240003', birthDate: '2010-02-15', responsibleCpf: '55555555555' },
    { id: 's4', name: 'Ana Pereira', cgm: '20240004', birthDate: '2008-08-20', responsibleCpf: '44444444444' },
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
        { id: 'v1', count: 50, type: VacancyType.AMPLA_CONCORRENCIA, shift: VacancyShift.MANHA },
        { id: 'v2', count: 5, type: VacancyType.EDUCACAO_ESPECIAL, shift: VacancyShift.MANHA }
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
      vacancyAcceptanceDate: '2025-12-15',
      customRequirements: []
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
      inscriptionStart: closedStart1.toISOString(), 
      inscriptionEnd: closedEnd1.toISOString(), 
      analysisStart: '2025-11-26', 
      analysisEnd: '2025-12-01',
      preliminaryResultDate: '2025-12-05',
      appealStartDate: '2025-12-06',
      appealEndDate: '2025-12-08',
      resultDate: '2025-12-10', 
      vacancyAcceptanceDate: '2025-12-15', 
      customRequirements: [] 
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
      vacancyAcceptanceDate: '2025-10-15', 
      customRequirements: [
        { id: 'cr2', label: 'Certificado de Conclusão do Ensino Médio' },
        { id: 'cr3', label: 'Carteira de Trabalho (página de identificação)' },
      ]
    },
];

const documents: Document[] = [
    { id: 'd1', fileName: 'boletim_joao.pdf', fileType: 'application/pdf', fileUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js-sample-files/master/helloworld.pdf', validationStatus: ValidationStatus.PENDENTE },
    { id: 'd2', fileName: 'declaracao_matricula_joao.pdf', fileType: 'application/pdf', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', validationStatus: ValidationStatus.PENDENTE },
    { id: 'd3', fileName: 'laudo_maria.pdf', fileType: 'application/pdf', fileUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js-sample-files/master/tracemonkey.pdf', validationStatus: ValidationStatus.PENDENTE },
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
        reason: 'Erro no cálculo de pontuação',
        justification: 'Acredito que a nota de matemática do 3º ano não foi computada corretamente.',
        date: new Date().toISOString()
    }
  },
   {
    id: 'app4',
    protocol: '20250004',
    student: students[3],
    edital: editais[1],
    status: ApplicationStatus.CLASSIFICADO_FINAL,
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
];

const simulateDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- API FUNCTIONS ---

export const api = {
  login: async (cpf: string): Promise<User | undefined> => {
    await simulateDelay(500);
    const user = users.find(u => u.cpf === cpf);
    if (!user) {
        throw new Error("Usuário não encontrado.");
    }
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
    return applications.filter(app => [ApplicationStatus.EM_ANALISE, ApplicationStatus.DOCUMENTACAO_INCOMPLETA, ApplicationStatus.EM_RECURSO].includes(app.status));
  },

  getApplicationById: async (id: string): Promise<Application | undefined> => {
    await simulateDelay(300);
    return applications.find(app => app.id === id);
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
    
    applications[appIndex] = {
        ...applications[appIndex],
        analysis,
        documents: updatedDocs,
        status: newStatus,
        finalScore: newStatus === ApplicationStatus.ANALISE_CONCLUIDA ? totalScore : applications[appIndex].finalScore,
    };

    return applications[appIndex];
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
    };
    editais.push(newEdital);
    return newEdital;
  },

  updateEdital: async(editalId: string, editalData: EditalFormData): Promise<Edital> => {
    await simulateDelay(600);
    const editalIndex = editais.findIndex(e => e.id === editalId);
    if (editalIndex === -1) throw new Error("Edital não encontrado.");
    editais[editalIndex] = { ...editais[editalIndex], ...editalData };
    return editais[editalIndex];
  },

  deleteEdital: async(editalId: string): Promise<void> => {
    await simulateDelay(600);
    const editalIndex = editais.findIndex(e => e.id === editalId);
    if (editalIndex === -1) throw new Error("Edital não encontrado.");
    editais.splice(editalIndex, 1);
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

  createStudent: async (name: string, birthDate: string, responsibleCpf: string): Promise<Student> => {
    await simulateDelay(700);
    const newStudent: Student = {
        id: `s${Date.now()}`,
        name,
        birthDate,
        responsibleCpf,
        // No CGM for private school students
    };
    students.push(newStudent);
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
    return newApplication;
  },

  getUsers: async(): Promise<User[]> => {
    await simulateDelay(500);
    return [...users];
  },

  updateUser: async(userId: string, userData: Partial<User>): Promise<User> => {
    await simulateDelay(500);
    const userIndex = users.findIndex(u => u.id === userId);
    if(userIndex === -1) throw new Error("Usuário não encontrado.");
    users[userIndex] = { ...users[userIndex], ...userData };
    return users[userIndex];
  },
  
  deleteUser: async(userId: string): Promise<void> => {
    await simulateDelay(600);
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("Usuário não encontrado.");
    if (users[userIndex].role === UserRole.ADMIN_SEED) throw new Error("Não é possível excluir o usuário Admin SEED.");
    users.splice(userIndex, 1);
  },
  
  submitAppeal: async (appId: string, reason: string, justification: string): Promise<Application> => {
    await simulateDelay(800);
    const appIndex = applications.findIndex(a => a.id === appId);
    if(appIndex === -1) throw new Error("Aplicação não encontrada");

    const appeal: Appeal = {
        reason,
        justification,
        date: new Date().toISOString()
    };
    
    applications[appIndex] = {
        ...applications[appIndex],
        appeal,
        status: ApplicationStatus.EM_RECURSO,
    };
    return applications[appIndex];
  },

  acceptVacancy: async (appId: string): Promise<Application> => {
    await simulateDelay(500);
    const appIndex = applications.findIndex(a => a.id === appId);
    if(appIndex === -1) throw new Error("Aplicação não encontrada");
    
    applications[appIndex] = {
        ...applications[appIndex],
        status: ApplicationStatus.VAGA_ACEITA,
    };
    return applications[appIndex];
  },
};