
import React from 'react';

interface VoiceAgentVisualizerProps {
  isSpeaking: boolean;
  isListening: boolean;
}

const VoiceAgentVisualizer: React.FC<VoiceAgentVisualizerProps> = ({ isSpeaking, isListening }) => {
  const baseClasses = "relative w-48 h-48 rounded-full transition-all duration-300 ease-in-out flex items-center justify-center shadow-lg";
  const speakingClasses = "bg-indigo-500 animate-pulse";
  const listeningClasses = "bg-green-500 ring-4 ring-green-300 ring-offset-2 ring-offset-gray-100";
  const idleClasses = "bg-gray-300";

  const getDynamicClasses = () => {
    if (isSpeaking) return speakingClasses;
    if (isListening) return listeningClasses;
    return idleClasses;
  };

  return (
    <div className={`${baseClasses} ${getDynamicClasses()}`}>
        <svg className="absolute w-full h-full" viewBox="0 0 100 100">
            <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#A5B4FC" />
                    <stop offset="100%" stopColor="#6366F1" />
                </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="48" stroke="url(#gradient)" strokeWidth="3" fill="none" />
        </svg>
      <div className="text-white font-bold text-lg z-10">Maya</div>
    </div>
  );
};

export default VoiceAgentVisualizer;
