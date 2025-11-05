
import React, { useEffect, useRef } from 'react';
import { Message, Speaker } from '../types';

interface ConversationLogProps {
  messages: Message[];
}

const ConversationLog: React.FC<ConversationLogProps> = ({ messages }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="w-full max-w-4xl h-48 bg-white rounded-lg shadow-inner p-4 overflow-y-auto space-y-4">
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`flex items-start gap-3 ${msg.speaker === Speaker.User ? 'justify-end' : 'justify-start'}`}
        >
          {msg.speaker === Speaker.Maya && (
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex-shrink-0 flex items-center justify-center text-white font-bold text-sm">
              M
            </div>
          )}
          <div
            className={`px-4 py-2 rounded-lg max-w-md ${
              msg.speaker === Speaker.User
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            <p className="text-sm">{msg.text}</p>
          </div>
           {msg.speaker === Speaker.User && (
            <div className="w-8 h-8 rounded-full bg-blue-500 flex-shrink-0 flex items-center justify-center text-white font-bold text-sm">
              U
            </div>
          )}
        </div>
      ))}
      <div ref={endOfMessagesRef} />
    </div>
  );
};

export default ConversationLog;
