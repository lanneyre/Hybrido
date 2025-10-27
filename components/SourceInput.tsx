
import React, { useRef } from 'react';

interface SourceInputProps {
  textValue: string;
  onTextChange: (value: string) => void;
  onFileChange: (fileData: { data: string; mimeType: string } | null) => void;
  fileName: string | null;
}

const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (reader.result) {
                resolve((reader.result as string).split(',')[1]);
            } else {
                reject(new Error("La lecture du blob en base64 a échoué"));
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

export function SourceInput({ textValue, onTextChange, onFileChange, fileName }: SourceInputProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            onFileChange(null);
            return;
        }

        if (file.type.startsWith('image/')) {
            const base64Data = await blobToBase64(file);
            onFileChange({ data: base64Data, mimeType: file.type });
        } else {
            alert("Ce type de fichier n'est pas encore pris en charge. Veuillez utiliser des images ou coller du texte directement.");
            onFileChange(null);
            if(fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="source-text" className="text-sm font-medium text-slate-300">
        1. Fournissez votre contenu source
      </label>
      <textarea
        id="source-text"
        value={textValue}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder="Collez le texte de votre PDF, vos notes de cours, ou le contenu d'un article ici..."
        className="h-48 min-h-[8rem] w-full rounded-lg border-2 border-slate-700 bg-slate-800/50 p-4 text-slate-300 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-colors"
      />
       <div className="text-center text-slate-500 my-2">OU</div>
        <div className="flex items-center justify-center w-full">
            <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-700 border-dashed rounded-lg cursor-pointer bg-slate-800/50 hover:bg-slate-800/80">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-2 text-slate-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/></svg>
                    <p className="text-sm text-slate-500"><span className="font-semibold">Cliquez pour télécharger une image</span></p>
                    {fileName && <p className="text-xs text-cyan-400 mt-1">{fileName}</p>}
                </div>
                <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/*" ref={fileInputRef} />
            </label>
        </div> 
    </div>
  );
}