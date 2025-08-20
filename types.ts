

export enum UserRole {
  ADMIN_SEED = 'Admin (SEED)',
  ADMIN_CEP = 'Administrativo (CEP)',
  ANALISTA = 'Analista',
  RESPONSAVEL = 'Responsável',
}

export enum ApplicationStatus {
  INSCRICAO_PENDENTE = 'Inscrição Pendente',
  EM_ANALISE = 'Em Análise',
  FIM_DE_FILA = 'Fim de Fila',
  DOCUMENTACAO_INCOMPLETA = 'Documentação Incompleta',
  ANALISE_CONCLUIDA = 'Análise Concluída',
  AGUARDANDO_PARECER_COMISSAO = 'Aguardando Parecer da Comissão',
  ANALISE_INDEFERIDA = 'Análise Indeferida',
  EM_RECURSO = 'Em Recurso',
  CLASSIFICADO_PRELIMINAR = 'Classificado (Preliminar)',
  CLASSIFICADO_FINAL = 'Classificado (Final)',
  VAGA_ACEITA = 'Vaga Aceita',
  VAGA_RECUSADA = 'Vaga Recusada',
  NAO_CLASSIFICADO = 'Não Classificado',
}

export enum EditalModalities {
    FUNDAMENTAL_6_ANO = '6º Ano EF',
    ENSINO_MEDIO = '1ª Série EM',
    TECNICO = 'Ensino Médio Profissional',
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

export enum AppealStatus {
    PENDENTE = 'Pendente',
    DEFERIDO = 'Deferido',
    INDEFERIDO = 'Indeferido',
}

export type PermissionKey =
  | 'manage_editais'
  | 'manage_chamadas'
  | 'manage_analises'
  | 'manage_casos_especiais'
  | 'view_classificacao'
  | 'manage_usuarios'
  | 'view_relatorios'
  | 'manage_email_templates'
  | 'manage_config'
  | 'view_audit_logs';

export type UserPermissions = {
  [key in PermissionKey]?: boolean;
};

export interface User {
  id: string;
  name: string;
  email: string;
  cpf: string;
  role: UserRole;
  phone?: string;
  permissions?: UserPermissions;
  isActive: boolean;
}

export interface Student {
    id: string;
    name: string;
    cgm?: string;
    birthDate: string;
    responsibleCpf: string;
    rg?: string;
    uf?: string;
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
    vacancyAcceptanceStartDate: string;
    vacancyAcceptanceDate: string;
    customRequirements?: CustomRequirement[];
    additionalDocuments?: CustomRequirement[];
    isActive: boolean;
    editalPdfUrl?: string;
}

export type EditalFormData = Omit<Edital, 'id'>;


export interface Grade {
    year: string;
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
    checklist?: { requirementId: string; checked: boolean; }[];
}

export interface Appeal {
    protocol: string;
    reason: string;
    justification: string;
    date: string;
    status: AppealStatus;
    analystJustification?: string;
    attachment?: Document;
}

export interface CommissionAnalysis {
  commissionMemberId: string;
  commissionMemberName: string;
  date: string;
  isEligible: boolean;
  justification: string;
}

export interface ComplementaryCall {
  id: string;
  editalId: string;
  title: string;
  startDate: string;
  pdfUrl: string;
  pdfFileName: string;
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
    specialNeedsDocuments?: Document[];
    finalScore?: number;
    analysis?: AnalysisResult;
    commissionAnalysis?: CommissionAnalysis;
    submissionDate: string;
    siblingCgm?: string;
    appeal?: Appeal;
    address?: Address;
    responsibleName?: string;
    responsibleEmail?: string;
    responsiblePhone?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string; // HTML content
}

export interface LogEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  action: string;
  targetType?: string;
  targetId?: string;
  details: string;
}