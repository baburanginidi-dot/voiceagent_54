
import React from 'react';

interface CtaButtonsProps {
  stage: number;
}

const CTAS_BY_STAGE: Record<number, string[]> = {
    1: ["I'm ready, let's start ✅"],
    2: ["Got it, continue →"],
    3: ["I prefer 0% EMI", "I'll pay in full now", "I'll use a credit card"],
    4: ["Proceed with NBFC option", "I want to know more"],
    5: ["Add Co-Applicant →", "I'll get help from an expert"],
    6: ["Open KYC Portal Link ✅", "Wait for Expert Guidance"],
};

const CtaButtons: React.FC<CtaButtonsProps> = ({ stage }) => {
    const ctas = CTAS_BY_STAGE[stage] || [];

    if (ctas.length === 0) {
        return null;
    }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4">
        <p className="text-sm text-gray-600 mb-2 sm:mb-0">Suggested responses:</p>
        {ctas.map((cta, index) => (
            <button
                key={index}
                className="bg-white text-indigo-600 font-semibold py-2 px-4 border border-indigo-200 rounded-full shadow-sm hover:bg-indigo-50 transition-colors duration-200 cursor-not-allowed"
                title="Please speak your response"
            >
                {cta}
            </button>
        ))}
    </div>
  );
};

export default CtaButtons;
