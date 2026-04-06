import React, { useState, useRef, useEffect } from 'react';
import { getLiveClient } from '../services/geminiService';
import { Modality, LiveServerMessage } from '@google/genai';
import { FlameButton } from './FlameButton';
import { Mic, MicOff, PhoneOff, Volume2, Activity } from 'lucide-react';

export const LiveSession: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [status, setStatus] = useState("Ready to connect");
  
  // Audio Context Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Playback Refs
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Connection Ref
  const sessionPromiseRef = useRef<Promise<any> | null>(null);

  const cleanup = () => {
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
        audioContextRef.current.close();
    }
    sessionPromiseRef.current = null;
    setIsConnected(false);
    setStatus("Disconnected");
  };

  // --- HELPERS FOR PCM ---
  function createBlob(data: Float32Array): { data: string, mimeType: string } {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
    }
    // Simple encode to base64 for PCM
    let binary = '';
    const bytes = new Uint8Array(int16.buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    const b64 = btoa(binary);

    return {
        data: b64,
        mimeType: 'audio/pcm;rate=16000',
    };
  }

  function decodeBase64(base64: string): Uint8Array {
      const binaryString = atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
  }

  async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number = 24000,
    numChannels: number = 1
  ): Promise<AudioBuffer> {
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

  const connect = async () => {
    setStatus("Initializing...");
    const ai = getLiveClient();

    try {
        // Init Audio Contexts
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        
        await audioContextRef.current.resume();

        // Get Mic
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        // Establish Connection
        sessionPromiseRef.current = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-12-2025',
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
                }
            },
            callbacks: {
                onopen: () => {
                    setStatus("Connected & Listening");
                    setIsConnected(true);

                    // Setup Input Processing
                    const source = inputCtx.createMediaStreamSource(stream);
                    const processor = inputCtx.createScriptProcessor(4096, 1, 1);
                    
                    processor.onaudioprocess = (e) => {
                         if (isMuted) return;
                         const inputData = e.inputBuffer.getChannelData(0);
                         const pcmBlob = createBlob(inputData);
                         sessionPromiseRef.current?.then((session: any) => {
                             session.sendRealtimeInput({ media: pcmBlob });
                         });
                    };

                    source.connect(processor);
                    processor.connect(inputCtx.destination);
                    
                    inputSourceRef.current = source;
                    processorRef.current = processor;
                },
                onmessage: async (msg: LiveServerMessage) => {
                    // Handle Output
                    const base64Audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                    if (base64Audio && audioContextRef.current) {
                        const bytes = decodeBase64(base64Audio);
                        const buffer = await decodeAudioData(bytes, audioContextRef.current);
                        
                        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioContextRef.current.currentTime);
                        
                        const source = audioContextRef.current.createBufferSource();
                        source.buffer = buffer;
                        source.connect(audioContextRef.current.destination);
                        
                        source.addEventListener('ended', () => {
                           sourcesRef.current.delete(source);
                        });
                        
                        source.start(nextStartTimeRef.current);
                        nextStartTimeRef.current += buffer.duration;
                        sourcesRef.current.add(source);
                    }
                    
                    if (msg.serverContent?.interrupted) {
                        sourcesRef.current.forEach(s => s.stop());
                        sourcesRef.current.clear();
                        nextStartTimeRef.current = 0;
                    }
                },
                onclose: () => cleanup(),
                onerror: (e) => {
                    console.error(e);
                    setStatus("Error occurred");
                    cleanup();
                }
            }
        });

    } catch (e) {
        console.error("Connection failed", e);
        setStatus("Failed to connect");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-[60vh] bg-brand-card rounded-3xl border border-gray-700 shadow-2xl relative overflow-hidden">
        {/* Background Animation */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${isConnected ? 'opacity-20' : 'opacity-0'}`}>
             <div className="absolute inset-0 bg-gradient-to-t from-red-900 to-transparent animate-pulse" />
        </div>

        <div className="z-10 flex flex-col items-center gap-6">
            <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center shadow-[0_0_30px_rgba(251,133,0,0.3)] transition-all duration-500 ${isConnected ? 'border-brand-orange scale-110' : 'border-gray-700'}`}>
                {isConnected ? (
                    <Activity size={48} className="text-brand-orange animate-bounce" />
                ) : (
                    <Volume2 size={48} className="text-gray-600" />
                )}
            </div>

            <div className="text-center">
                <h3 className="font-suez text-2xl text-white">Live Voice</h3>
                <p className="text-sm text-gray-400 font-mono mt-2 uppercase tracking-widest">{status}</p>
            </div>

            <div className="flex gap-4 mt-4">
                {!isConnected ? (
                    <FlameButton label="START CALL" onClick={connect} />
                ) : (
                    <>
                        <button 
                          onClick={() => setIsMuted(!isMuted)}
                          className={`p-4 rounded-full border-2 transition-all ${isMuted ? 'bg-red-900/50 border-red-500 text-red-500' : 'bg-gray-800 border-gray-600 text-white'}`}
                        >
                           {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                        </button>
                        <button 
                          onClick={cleanup}
                          className="p-4 rounded-full bg-red-600 text-white hover:bg-red-700 shadow-lg"
                        >
                           <PhoneOff size={24} />
                        </button>
                    </>
                )}
            </div>
        </div>
    </div>
  );
};