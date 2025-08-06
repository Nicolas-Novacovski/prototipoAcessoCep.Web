
export enum UserRole {
  ADMIN_SEED = 'Admin (SEED)',
  ADMIN_CEP = 'Administrativo (CEP)',
  ANALISTA = 'Analista',
  RESPONSAVEL = 'Responsável',
}

export enum ApplicationStatus {
  INSCRICAO_PENDENTE = 'Inscrição Pendente',
  EM_ANALISE = 'Em Análise',
  DOCUMENTACAO_INCOMPLETA = 'Documentação Incompleta',
  ANALISE_CONCLUIDA = 'Análise Concluída',
  ANALISE_INDEFERIDA = 'Análise Indeferida',
  EM_RECURSO = 'Em Recurso',
  CLASSIFICADO_PRELIMINAR = 'Classificado (Preliminar)',
  CLASSIFICADO_FINAL = 'Classificado (Final)',
  VAGA_ACEITA = 'Vaga Aceita',
  NAO_CLASSIFICADO = 'Não Classificado',
}

export enum EditalModalities {
    FUNDAMENTAL_6_ANO = '6º Ano EF',
    ENSINO_MEDIO = '1ª Série EM',
    TECNICO = 'Técnico Subsequente',
    CELEM = 'CELEM'
}

export enum ValidationStatus {
    PENDENTE = 'Pendente',
    VALIDO = 'Válido',
    INVALIDO = 'Inválido',
    SOLICITADO_REENVIO = 'Solicitado Reenvio',
}

export enum VacancyType {
    AMPLA_CONCORRENCIA = 'Ampla Concorrência',
    EDUCACAO_ESPECIAL = 'Educação Especial',
}

export enum VacancyShift {
    MANHA = 'Manhã',
    TARDE = 'Tarde',
    NOITE = 'Noite',
    INTEGRAL = 'Integral',
}

export interface User {
  id: string;
  name: string;
  email: string;
  cpf: string;
  role: UserRole;
  phone?: string;
}

export interface Student {
    id: string;
    name: string;
    cgm?: string;
    birthDate: string;
    responsibleCpf: string;
}

export interface Document {
    id: string;
    fileName: string;
    fileType: string;
    fileUrl: string; // In a real app, this would be a secure URL
    validationStatus: ValidationStatus;
    invalidationReason?: string;
}

export interface CustomRequirement {
  id: string;
  label: string;
}

export interface VacancyDetail {
  id: string;
  count: number;
  type: VacancyType;
  shift: VacancyShift;
}

export interface Edital {
    id: string;
    number: string;
    modality: EditalModalities;
    vacancyDetails: VacancyDetail[];
    year: number;
    inscriptionStart: string;
    inscriptionEnd: string;
    analysisStart: string;
    analysisEnd: string;
    preliminaryResultDate: string;
    appealStartDate: string;
    appealEndDate: string;
    resultDate: string;
    vacancyAcceptanceDate: string;
    customRequirements?: CustomRequirement[];
}

export type EditalFormData = Omit<Edital, 'id'>;


export interface Grade {
    year: number;
    subject: 'Português' | 'Matemática';
    score: number | null;
}

export interface AnalysisResult {
    analystId: string;
    analystName: string;

    date: string;
    justification: string;
    observation: string;
    grades: Grade[];
    isApproved: boolean;
}

export interface Appeal {
    reason: string;
    justification: string;
    date: string;
}

export interface Address {
    cep: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
}

export interface Application {
    id: string;
    protocol: string;
    student: Student;
    edital: Edital;
    status: ApplicationStatus;
    documents: Document[];
    specialNeeds: boolean;
    specialNeedsDocument?: Document;
    finalScore?: number;
    analysis?: AnalysisResult;
    submissionDate: string;
    siblingCgm?: string;
    appeal?: Appeal;
    address?: Address;
}