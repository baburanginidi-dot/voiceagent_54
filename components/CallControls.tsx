
import React from 'react';

interface CallControlsProps {
  isMuted: boolean;
  onMuteToggle: () => void;
  onEndCall: () => void;
}

const CallControls: React.FC<CallControlsProps> = ({ isMuted, onMuteToggle, onEndCall }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-4">
      {/* Mute/Unmute Button */}
      <button
        onClick={onMuteToggle}
        title={isMuted ? "Unmute microphone" : "Mute microphone"}
        aria-pressed={isMuted}
        className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 ${
          isMuted ? 'bg-gray-500 hover:bg-gray-600 focus:ring-gray-400' : 'bg-indigo-500 hover:bg-indigo-600 focus:ring-indigo-400'
        }`}
      >
        <span className="sr-only">{isMuted ? "Unmute microphone" : "Mute microphone"}</span>
        {isMuted ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 5l14 14" />
            </svg>
        ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
        )}
      </button>

      {/* End Call Button */}
      <button
        onClick={onEndCall}
        title="End conversation"
        aria-label="End conversation"
        className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg transition-colors duration-200 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-red-400"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 6.75z" transform="rotate(-135 12 12)" />
        </svg>
      </button>
    </div>
  );
};

export default CallControls;
