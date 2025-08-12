

import React from 'react';
import { ApplicationStatus } from '../../types';
import { IconFileCheck } from '../../constants';

const statusSteps = [
    ApplicationStatus.INSCRICAO_PENDENTE,
    ApplicationStatus.EM_ANALISE,
    ApplicationStatus.ANALISE_CONCLUIDA,
    ApplicationStatus.CLASSIFICADO_PRELIMINAR,
    ApplicationStatus.CLASSIFICADO_FINAL,
    ApplicationStatus.VAGA_ACEITA,
];

// A single step in the stepper, refactored for better text layout
const Step = ({ title, isActive, isCompleted }: { title: string; isActive: boolean; isCompleted: boolean }) => {
  const getCircleClasses = () => {
    if (isActive) return 'bg-cep-primary text-white ring-4 ring-cep-primary/30';
    if (isCompleted) return 'bg-cep-secondary text-white';
    return 'bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-gray-400';
  };

  const getLabelClasses = () => {
    if (isActive) return 'font-bold text-cep-primary';
    return 'text-cep-text dark:text-slate-300';
  };

  return (
    <div className="flex flex-col items-center flex-shrink-0 w-28 text-center">
      <div className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 font-bold ${getCircleClasses()}`}>
        {isCompleted && <IconFileCheck className="w-5 h-5" />}
      </div>
      <p className={`mt-2 text-xs h-8 flex items-center justify-center ${getLabelClasses()}`}>
        {title}
      </p>
    </div>
  );
};

const Stepper = ({ currentStatus }: { currentStatus: ApplicationStatus }) => {
  const currentIndex = statusSteps.indexOf(currentStatus);

  const isOffTrack = currentIndex === -1;
  let offTrackMessage = '';
  if (isOffTrack) {
    if (currentStatus === ApplicationStatus.DOCUMENTACAO_INCOMPLETA) offTrackMessage = 'Aguardando correção da documentação pelo responsável.';
    else if (currentStatus === ApplicationStatus.EM_RECURSO) offTrackMessage = 'Processo em fase de recurso administrativo.';
    else if (currentStatus === ApplicationStatus.AGUARDANDO_PARECER_COMISSAO) offTrackMessage = 'Laudo médico em análise pela comissão técnica especializada.';
    else if (currentStatus === ApplicationStatus.NAO_CLASSIFICADO) offTrackMessage = 'Candidato não classificado neste edital.';
    else if (currentStatus === ApplicationStatus.ANALISE_INDEFERIDA) offTrackMessage = 'Análise indeferida pela equipe do CEP. O responsável foi notificado com a justificativa.';
    else if (currentStatus === ApplicationStatus.VAGA_RECUSADA) offTrackMessage = 'A vaga foi recusada pelo responsável. O processo está encerrado.';
  }

  return (
    <div className="w-full pt-8 pb-12">
      {isOffTrack ? (
        <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200 rounded-lg border border-yellow-200 dark:border-yellow-800/60">
          <p className='font-semibold text-base'>{currentStatus}</p>
          <p className="text-sm mt-1">{offTrackMessage}</p>
        </div>
      ) : (
        <div className="flex items-start">
          {statusSteps.map((status, index) => (
            <React.Fragment key={status}>
              <Step
                title={status}
                isActive={index === currentIndex}
                isCompleted={index < currentIndex}
              />
              {index < statusSteps.length - 1 && (
                <div className={`flex-1 h-1 mt-5 transition-colors duration-500 ${index < currentIndex ? 'bg-cep-secondary' : 'bg-gray-200 dark:bg-slate-700'}`}></div>
              )}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

export default Stepper;