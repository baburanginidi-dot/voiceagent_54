
import React, { useState, useRef, useCallback, useEffect } from 'react';
// FIX: Remove LiveSession from import as it is not an exported member.
import { GoogleGenAI, LiveServerMessage, Modality, FunctionDeclaration, Type, Blob } from '@google/genai';
import { STAGES, SYSTEM_INSTRUCTION } from './constants';
import { Speaker, Message } from './types';
import ProgressStepper from './components/ProgressStepper';
import VoiceAgentVisualizer from './components/VoiceAgentVisualizer';
import ConversationLog from './components/ConversationLog';
import CtaButtons from './components/CtaButtons';

// --- Audio Helper Functions (as per Gemini docs) ---
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function createBlob(data: Float32Array): Blob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
}

// FIX: Infer the session promise type from the SDK to avoid using a non-exported type.
type LiveSessionPromise = ReturnType<InstanceType<typeof GoogleGenAI>['live']['connect']>;


const App: React.FC = () => {
    const [hasStarted, setHasStarted] = useState(false);
    const [studentName, setStudentName] = useState('');
    const [studentMobileNo, setStudentMobileNo] = useState('');
    const [currentStage, setCurrentStage] = useState(0);
    const [conversation, setConversation] = useState<Message[]>([]);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // FIX: Use the inferred type for the session promise ref.
    const sessionPromiseRef = useRef<LiveSessionPromise | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const outputNodeRef = useRef<GainNode | null>(null);
    
    const currentInputTranscriptionRef = useRef('');
    const currentOutputTranscriptionRef = useRef('');
    
    const nextStartTimeRef = useRef(0);
    const sourcesRef = useRef(new Set<AudioBufferSourceNode>());

    const updateOnboardingStageFunctionDeclaration: FunctionDeclaration = {
        name: 'updateOnboardingStage',
        parameters: {
            type: Type.OBJECT,
            description: 'Updates the current stage of the user onboarding process.',
            properties: {
                stageNumber: {
                    type: Type.NUMBER,
                    description: 'The stage number to set as current.',
                },
            },
            required: ['stageNumber'],
        },
    };

    const handleStartOnboarding = async () => {
        setHasStarted(true);
        setError(null);

        if (!outputAudioContextRef.current) {
            try {
                outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                outputNodeRef.current = outputAudioContextRef.current.createGain();
                outputNodeRef.current.connect(outputAudioContextRef.current.destination);
            } catch (e) {
                console.error("Could not create audio context", e);
                setError("Could not initialize audio. Please check your browser permissions.");
                return;
            }
        }
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: { onopen, onmessage, onerror, onclose },
                config: {
                    responseModalities: [Modality.AUDIO],
                    outputAudioTranscription: {},
                    inputAudioTranscription: {},
                    tools: [{ functionDeclarations: [updateOnboardingStageFunctionDeclaration] }],
                    systemInstruction: SYSTEM_INSTRUCTION,
                },
            });
            sessionPromiseRef.current = sessionPromise;

        } catch (e) {
            console.error("Failed to connect to Gemini Live API", e);
            setError("Failed to start the session. Please check your API key and try again.");
            setHasStarted(false);
        }
    };
    
    const onopen = useCallback(async () => {
        setIsListening(true);
        const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const source = inputAudioContext.createMediaStreamSource(stream);
        const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
        
        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
            const pcmBlob = createBlob(inputData);
            if (sessionPromiseRef.current) {
                sessionPromiseRef.current.then((session) => {
                    session.sendRealtimeInput({ media: pcmBlob });
                });
            }
        };
        source.connect(scriptProcessor);
        scriptProcessor.connect(inputAudioContext.destination);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onmessage = useCallback(async (message: LiveServerMessage) => {
        if (message.serverContent?.outputTranscription?.text) {
            currentOutputTranscriptionRef.current += message.serverContent.outputTranscription.text;
        }
        if (message.serverContent?.inputTranscription?.text) {
            currentInputTranscriptionRef.current += message.serverContent.inputTranscription.text;
        }

        if (message.toolCall?.functionCalls) {
            for (const fc of message.toolCall.functionCalls) {
                if (fc.name === 'updateOnboardingStage') {
                    const stage = fc.args.stageNumber;
                    // FIX: Type-check argument from tool call before using it to prevent type errors.
                    if (typeof stage === 'number') {
                        setCurrentStage(stage);
                        // FIX: As per Gemini guidelines, a response must be sent for each tool call.
                        const result = "ok";
                        sessionPromiseRef.current?.then((session) => {
                            session.sendToolResponse({
                                functionResponses: {
                                    id: fc.id,
                                    name: fc.name,
                                    response: { result },
                                }
                            });
                        });
                    }
                }
            }
        }
        
        if (message.serverContent?.turnComplete) {
            if (currentInputTranscriptionRef.current) {
                setConversation(prev => [...prev, { speaker: Speaker.User, text: currentInputTranscriptionRef.current.trim() }]);
                currentInputTranscriptionRef.current = '';
            }
             if (currentOutputTranscriptionRef.current) {
                setConversation(prev => [...prev, { speaker: Speaker.Maya, text: currentOutputTranscriptionRef.current.trim() }]);
                currentOutputTranscriptionRef.current = '';
            }
        }
        
        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
        if (base64Audio && outputAudioContextRef.current && outputNodeRef.current) {
            setIsSpeaking(true);
            const audioCtx = outputAudioContextRef.current;
            const outputNode = outputNodeRef.current;

            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioCtx.currentTime);
            const audioBuffer = await decodeAudioData(decode(base64Audio), audioCtx, 24000, 1);
            const source = audioCtx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(outputNode);
            
            source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) {
                    setIsSpeaking(false);
                }
            });
            
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += audioBuffer.duration;
            sourcesRef.current.add(source);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onerror = useCallback((e: ErrorEvent) => {
        console.error('Session error:', e);
        setError('A connection error occurred. Please try restarting the session.');
        setIsListening(false);
        setIsSpeaking(false);
        setHasStarted(false);
    }, []);

    const onclose = useCallback((e: CloseEvent) => {
        setIsListening(false);
        setIsSpeaking(false);
    }, []);
    
    useEffect(() => {
        return () => {
            if (sessionPromiseRef.current) {
                sessionPromiseRef.current.then(session => session.close());
            }
        };
    }, []);


    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 space-y-8 font-sans">
            {!hasStarted ? (
                <div className="text-center w-full max-w-md mx-auto">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome to NxtWave Onboarding</h1>
                    <p className="text-lg text-gray-600 mb-8">Meet Maya, your voice assistant learning portel access.</p>
                    <div className="space-y-4 text-left">
                        <div>
                            <label htmlFor="studentName" className="block text-sm font-medium text-gray-700">
                                Student Name
                            </label>
                            <input
                                type="text"
                                id="studentName"
                                value={studentName}
                                onChange={(e) => setStudentName(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="e.g., Jane Doe"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="studentMobileNo" className="block text-sm font-medium text-gray-700">
                                Student Mobile Number
                            </label>
                            <input
                                type="text"
                                id="studentMobileNo"
                                value={studentMobileNo}
                                onChange={(e) => setStudentMobileNo(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="e.g., 9876543210"
                                required
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleStartOnboarding}
                        disabled={!studentName.trim() || !studentMobileNo.trim()}
                        className="mt-8 w-full bg-indigo-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-indigo-700 transition-transform transform hover:scale-105 disabled:bg-indigo-300 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        Start Onboarding
                    </button>
                    {error && <p className="text-red-500 mt-4">{error}</p>}
                </div>
            ) : (
                <>
                    <ProgressStepper stages={STAGES} currentStage={currentStage} />
                    <VoiceAgentVisualizer isSpeaking={isSpeaking} isListening={isListening} />
                    <ConversationLog messages={conversation} />
                    <CtaButtons stage={currentStage} />
                    {error && <p className="text-red-500 mt-4">{error}</p>}
                </>
            )}
        </div>
    );
};

export default App;
