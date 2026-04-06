import React, { useState, useRef } from 'react';
import { FlameButton } from './FlameButton';
import { chatWithGemini, transcribeAudio } from '../services/geminiService';
import { Send, Globe, Mic, Loader2, Bot, User as UserIcon } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  sources?: { title: string, uri: string }[];
}

export const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'model', text: 'Salve! Sou o assistente virtual do Incendeia. Como posso ajudar hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Prepare history for API
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const { text, groundingUrls } = await chatWithGemini(history, userMsg.text, useSearch);
      
      const botMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        text,
        sources: groundingUrls
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: 'Desculpe, tive um erro ao processar.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
           const base64Audio = reader.result as string;
           setIsLoading(true);
           try {
             const text = await transcribeAudio(base64Audio);
             setInput(prev => prev + " " + text);
           } catch (e) {
             alert("Erro na transcrição");
           } finally {
             setIsLoading(false);
           }
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (e) {
      console.error("Mic Error", e);
      alert("Erro ao acessar microfone");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  return (
    <div className="flex flex-col h-[75vh] bg-brand-card rounded-2xl overflow-hidden border border-gray-700 shadow-xl">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 bg-brand-dark flex justify-between items-center">
        <h3 className="font-suez text-white flex items-center gap-2">
           <Bot className="text-brand-orange" /> Chat Inteligente
        </h3>
        <button 
          onClick={() => setUseSearch(!useSearch)}
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-colors ${useSearch ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}
        >
           <Globe size={12} /> Google Search {useSearch ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-brand-dark/50">
        {messages.map(msg => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${
              msg.role === 'user' 
                ? 'bg-brand-red text-white rounded-tr-none' 
                : 'bg-gray-800 text-gray-100 rounded-tl-none border border-gray-700'
            }`}>
               {msg.text}
            </div>
            {msg.sources && msg.sources.length > 0 && (
               <div className="mt-2 text-[10px] text-gray-500 max-w-[85%]">
                  <strong className="block text-brand-orange mb-1">Fontes:</strong>
                  {msg.sources.map((s, i) => (
                    <a key={i} href={s.uri} target="_blank" rel="noreferrer" className="block truncate hover:text-blue-400 underline mb-1">
                      {s.title}
                    </a>
                  ))}
               </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-gray-500 text-xs pl-2">
             <Loader2 className="animate-spin" size={14} /> Pensando...
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 bg-brand-card border-t border-gray-700 flex gap-2 items-end">
        <button 
           className={`p-3 rounded-full transition-all ${isRecording ? 'bg-red-600 animate-pulse' : 'bg-gray-700 text-gray-400 hover:text-white'}`}
           onClick={isRecording ? stopRecording : startRecording}
        >
           <Mic size={20} className={isRecording ? 'text-white' : ''} />
        </button>
        <textarea 
           value={input}
           onChange={(e) => setInput(e.target.value)}
           placeholder="Digite ou grave um áudio..."
           className="flex-1 bg-brand-dark border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-orange resize-none h-12"
        />
        <button 
           onClick={handleSend}
           disabled={isLoading || !input.trim()}
           className="bg-brand-orange text-white p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-600 transition-colors"
        >
           <Send size={20} />
        </button>
      </div>
    </div>
  );
};