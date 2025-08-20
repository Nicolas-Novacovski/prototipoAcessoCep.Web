

import React, { ReactNode } from 'react';
import { ApplicationStatus, ValidationStatus } from '../../types';

interface BadgeProps {
  children: ReactNode;
  color: 'blue' | 'teal' | 'yellow' | 'red' | 'gray' | 'purple';
  className?: string;
}

const colorClasses = {
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    teal: 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300',
    yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    red: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    gray: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
};

const Badge: React.FC<BadgeProps> = ({ children, color, className='' }) => {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses[color]} ${className}`}>
      {children}
    </span>
  );
};


export const StatusBadge: React.FC<{ status: ApplicationStatus }> = ({ status }) => {
    const statusColorMap: Record<ApplicationStatus, 'blue' | 'teal' | 'yellow' | 'red' | 'gray' | 'purple'> = {
        [ApplicationStatus.INSCRICAO_PENDENTE]: 'gray',
        [ApplicationStatus.EM_ANALISE]: 'blue',
        [ApplicationStatus.FIM_DE_FILA]: 'blue',
        [ApplicationStatus.DOCUMENTACAO_INCOMPLETA]: 'yellow',
        [ApplicationStatus.ANALISE_CONCLUIDA]: 'teal',
        [ApplicationStatus.AGUARDANDO_PARECER_COMISSAO]: 'purple',
        [ApplicationStatus.ANALISE_INDEFERIDA]: 'red',
        [ApplicationStatus.EM_RECURSO]: 'yellow',
        [ApplicationStatus.CLASSIFICADO_PRELIMINAR]: 'teal',
        [ApplicationStatus.CLASSIFICADO_FINAL]: 'teal',
        [ApplicationStatus.VAGA_ACEITA]: 'teal',
        [ApplicationStatus.VAGA_RECUSADA]: 'red',
        [ApplicationStatus.NAO_CLASSIFICADO]: 'red',
    };

    return <Badge color={statusColorMap[status]}>{status}</Badge>;
}

export const ValidationStatusBadge: React.FC<{ status: ValidationStatus }> = ({ status }) => {
    const statusColorMap: Record<ValidationStatus, 'blue' | 'teal' | 'yellow' | 'red' | 'gray'> = {
        [ValidationStatus.PENDENTE]: 'yellow',
        [ValidationStatus.VALIDO]: 'teal',
        [ValidationStatus.INVALIDO]: 'red',
        [ValidationStatus.SOLICITADO_REENVIO]: 'yellow',
    };

    return <Badge color={statusColorMap[status]}>{status}</Badge>;
}


export default Badge;