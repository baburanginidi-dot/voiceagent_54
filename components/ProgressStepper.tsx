
import React from 'react';
import { Stage } from '../types';

interface ProgressStepperProps {
  stages: Stage[];
  currentStage: number;
}

const ProgressStepper: React.FC<ProgressStepperProps> = ({ stages, currentStage }) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <nav aria-label="Progress">
        <ol role="list" className="flex items-center">
          {stages.map((stage, stageIdx) => (
            <li key={stage.title} className={`relative ${stageIdx !== stages.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
              {stage.id < currentStage ? (
                <>
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="h-0.5 w-full bg-indigo-600" />
                  </div>
                  <div className="relative flex h-8 w-8 items-center justify-center bg-indigo-600 rounded-full hover:bg-indigo-900">
                    <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z" clipRule="evenodd" />
                    </svg>
                  </div>
                </>
              ) : stage.id === currentStage ? (
                <>
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="h-0.5 w-full bg-gray-200" />
                  </div>
                  <div className="relative flex h-8 w-8 items-center justify-center bg-white border-2 border-indigo-600 rounded-full" aria-current="step">
                    <span className="h-2.5 w-2.5 bg-indigo-600 rounded-full" aria-hidden="true" />
                  </div>
                </>
              ) : (
                <>
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="h-0.5 w-full bg-gray-200" />
                  </div>
                  <div className="relative flex h-8 w-8 items-center justify-center bg-white border-2 border-gray-300 rounded-full hover:border-gray-400">
                  </div>
                </>
              )}
               <div className="absolute -bottom-7 w-max text-center text-xs text-gray-500 hidden sm:block">{stage.title}</div>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
};

export default ProgressStepper;
