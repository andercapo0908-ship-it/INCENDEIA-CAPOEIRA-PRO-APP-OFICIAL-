import React, { useState, useRef } from 'react';
import { FlameButton } from './FlameButton';
import { editImageWithGemini, generateImageWithGemini } from '../services/geminiService';
import { Loader2, Upload, Wand2, Download, Image as ImageIcon, Sparkles } from 'lucide-react';

export const GeminiStudio: React.FC = () => {
  const [mode, setMode] = useState<'EDIT' | 'GENERATE'>('EDIT');
  
  // Edit State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Gen State
  const [genSize, setGenSize] = useState<'1K' | '2K' | '4K'>('1K');

  // Shared State
  const [prompt, setPrompt] = useState('');
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setResultImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcess = async () => {
    if (!prompt) return;
    if (mode === 'EDIT' && !selectedImage) return;

    setIsLoading(true);
    setError(null);
    setResultImage(null);

    try {
      let result;
      if (mode === 'EDIT' && selectedImage) {
          result = await editImageWithGemini(selectedImage, prompt);
      } else {
          result = await generateImageWithGemini(prompt, genSize);
      }
      setResultImage(result);
    } catch (err) {
      setError("Failed to process request. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-brand-card p-6 rounded-3xl border border-gray-700 shadow-2xl min-h-[80vh]">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-suez text-white mb-2">Incendeia AI Studio</h2>
        <div className="flex justify-center gap-2 bg-brand-dark p-1 rounded-full w-fit mx-auto border border-gray-700">
           <button 
             onClick={() => setMode('EDIT')}
             className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${mode === 'EDIT' ? 'bg-brand-red text-white' : 'text-gray-400'}`}
           >
             EDITAR
           </button>
           <button 
             onClick={() => setMode('GENERATE')}
             className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${mode === 'GENERATE' ? 'bg-brand-orange text-white' : 'text-gray-400'}`}
           >
             CRIAR
           </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* EDIT MODE: UPLOAD */}
        {mode === 'EDIT' && (
             <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-600 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-800 transition-colors h-48"
             >
                {selectedImage ? (
                  <img 
                    src={selectedImage} 
                    alt="Original" 
                    className="max-h-full rounded-lg object-contain" 
                  />
                ) : (
                  <>
                    <Upload className="text-gray-400 mb-2" size={32} />
                    <span className="text-gray-500 text-sm font-semibold">Upload Photo</span>
                  </>
                )}
                <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageUpload}
                />
            </div>
        )}

        {/* GEN MODE: OPTIONS */}
        {mode === 'GENERATE' && (
            <div className="bg-brand-dark p-4 rounded-xl border border-gray-700">
                <label className="text-xs text-gray-400 font-bold uppercase mb-2 block">Tamanho da Imagem</label>
                <div className="flex gap-2">
                    {(['1K', '2K', '4K'] as const).map(s => (
                        <button
                          key={s}
                          onClick={() => setGenSize(s)}
                          className={`flex-1 py-2 rounded-lg text-sm font-bold border ${genSize === s ? 'border-brand-orange text-brand-orange bg-orange-900/20' : 'border-gray-700 text-gray-500 hover:bg-gray-800'}`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>
        )}

        {/* PROMPT & ACTION */}
        <div className="space-y-3">
             <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={mode === 'EDIT' ? "Ex: Adicione fogo no fundo, remova a pessoa..." : "Ex: Um roda de capoeira futurista em Marte..."}
                className="w-full bg-brand-dark border border-gray-700 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-orange h-24 resize-none"
             />
             <FlameButton 
                label={isLoading ? "Processando..." : (mode === 'EDIT' ? "TRANSFORMAR" : "GERAR IMAGEM")} 
                onClick={handleProcess}
                disabled={isLoading || !prompt || (mode === 'EDIT' && !selectedImage)}
                className="w-full"
                variant={mode === 'GENERATE' ? 'secondary' : 'primary'}
            />
        </div>
      </div>

      {/* ERROR */}
      {error && <div className="mt-4 p-3 bg-red-900/50 text-red-200 text-sm rounded-lg text-center">{error}</div>}

      {/* RESULT */}
      {resultImage && (
        <div className="mt-6 animate-fade-in space-y-3">
            <div className="relative rounded-xl overflow-hidden shadow-2xl border-2 border-brand-orange group">
                <img src={resultImage} alt="AI Result" className="w-full h-auto" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <a 
                        href={resultImage} 
                        download={`incendeia-ai-${Date.now()}.png`}
                        className="bg-white text-black px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2"
                    >
                        <Download size={16} /> Baixar
                    </a>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};