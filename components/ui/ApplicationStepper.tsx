import React from 'react';

// Define step configuration
interface StepConfig {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface ApplicationStepperProps {
  steps: StepConfig[];
  currentStepId: string;
}

const ApplicationStepper: React.FC<ApplicationStepperProps> = ({ steps, currentStepId }) => {
  const currentIndex = steps.findIndex(step => step.id === currentStepId);

  return (
    <div className="w-full py-8">
      <div className="flex items-start justify-center">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;

          const circleClasses = isCompleted
            ? 'bg-cep-secondary text-white'
            : isActive
            ? 'bg-cep-primary text-white ring-4 ring-cep-primary/30'
            : 'bg-gray-200 dark:bg-slate-700 text-gray-400 dark:text-gray-500';
          
          const labelClasses = isActive ? 'text-cep-primary font-bold' : 'text-gray-600 dark:text-slate-400';
          
          const lineClasses = isCompleted ? 'bg-cep-secondary' : 'bg-gray-200 dark:bg-slate-700';

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center w-28 text-center">
                <div className={`w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 ${circleClasses}`}>
                  {React.cloneElement(step.icon as React.ReactElement<React.SVGProps<SVGSVGElement>>, { className: "w-6 h-6" })}
                </div>
                <p className={`mt-2 text-xs transition-colors ${labelClasses}`}>
                  {step.label}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mt-6 transition-colors duration-500 ${lineClasses}`}></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default ApplicationStepper;