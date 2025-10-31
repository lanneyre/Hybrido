
import React, { useRef, useState } from 'react';

// @ts-nocheck
declare const JSZip: any;
declare const XLSX: any;

interface SourceInputProps {
  textValue: string;
  onTextChange: (value: string) => void;
  onFileChange: (fileData: { data: string; mimeType: string; name: string } | null) => void;
  fileName: string | null;
}

const fileToB64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (reader.result) {
                resolve((reader.result as string).split(',')[1]);
            } else {
                reject(new Error("La lecture du fichier en base64 a échoué"));
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

const fileToArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (reader.result) {
                resolve(reader.result as ArrayBuffer);
            } else {
                reject(new Error("La lecture du fichier en ArrayBuffer a échoué"));
            }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

export function SourceInput({ textValue, onTextChange, onFileChange, fileName }: SourceInputProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isParsing, setIsParsing] = useState(false);

    const parseXlsx = (arrayBuffer: ArrayBuffer): string => {
        const workbook = XLSX.read(arrayBuffer, { type: 'buffer' });
        let fullText = '';
        workbook.SheetNames.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            data.forEach((row: any[]) => {
                if (Array.isArray(row)) {
                    fullText += row.join(' ') + '\n';
                }
            });
        });
        return fullText;
    };

    const parseDocx = async (arrayBuffer: ArrayBuffer): Promise<string> => {
        const zip = await JSZip.loadAsync(arrayBuffer);
        const content = await zip.file('word/document.xml').async('string');
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(content, 'application/xml');
        const textNodes = xmlDoc.getElementsByTagName('w:t');
        let fullText = '';
        for (let i = 0; i < textNodes.length; i++) {
            fullText += textNodes[i].textContent;
        }
        return fullText.replace(/\s+/g, ' ').trim();
    };

    const parsePptx = async (arrayBuffer: ArrayBuffer): Promise<string> => {
        const zip = await JSZip.loadAsync(arrayBuffer);
        const slidePromises = [];
        zip.folder('ppt/slides').forEach((_, file) => {
            if (file.name.match(/ppt\/slides\/slide\d+\.xml/)) {
                slidePromises.push(file.async('string'));
            }
        });
        const slideXmls = await Promise.all(slidePromises);
        const parser = new DOMParser();
        let fullText = '';
        for (const slideXml of slideXmls) {
            const xmlDoc = parser.parseFromString(slideXml, 'application/xml');
            const textNodes = xmlDoc.getElementsByTagName('a:t');
            for (let i = 0; i < textNodes.length; i++) {
                fullText += textNodes[i].textContent + ' ';
            }
            fullText += '\n'; // New line for each slide
        }
        return fullText.replace(/\s+/g, ' ').trim();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            onFileChange(null);
            return;
        }

        setIsParsing(true);
        try {
            const extension = file.name.split('.').pop()?.toLowerCase();
            const mimeType = file.type;

            if (mimeType.startsWith('image/') || mimeType === 'application/pdf') {
                const base64Data = await fileToB64(file);
                onFileChange({ data: base64Data, mimeType: file.type, name: file.name });
                onTextChange('');
            } else {
                const arrayBuffer = await fileToArrayBuffer(file);
                let extractedText = '';

                if (extension === 'docx') {
                    extractedText = await parseDocx(arrayBuffer);
                } else if (['xlsx', 'ods'].includes(extension) || mimeType.includes('spreadsheet')) {
                    extractedText = parseXlsx(arrayBuffer);
                } else if (extension === 'pptx') {
                    extractedText = await parsePptx(arrayBuffer);
                } else {
                    throw new Error("Type de fichier non pris en charge pour l'extraction de contenu.");
                }
                
                onTextChange(extractedText);
                // Signal that a file was used, but don't send its binary data
                onFileChange({ data: '', mimeType: file.type, name: file.name });
            }
        } catch (error) {
            console.error("Erreur de lecture ou de traitement du fichier :", error);
            alert(`Une erreur est survenue : ${error.message}`);
            onFileChange(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        } finally {
            setIsParsing(false);
        }
    };

    const fileInputAccept = "image/*,application/pdf,.docx,.xlsx,.pptx,.ods,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.oasis.opendocument.spreadsheet";

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
            <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-28 border-2 border-slate-700 border-dashed rounded-lg cursor-pointer bg-slate-800/50 hover:bg-slate-800/80">
                <div className="flex flex-col items-center justify-center text-center pt-5 pb-6 px-2">
                    {isParsing ? (
                        <>
                             <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-500 border-t-transparent mb-2"></div>
                             <p className="text-sm text-slate-400">Analyse du fichier...</p>
                        </>
                    ) : (
                        <>
                            <svg className="w-8 h-8 mb-2 text-slate-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/></svg>
                            <p className="text-sm text-slate-500"><span className="font-semibold">Cliquez pour télécharger un fichier</span></p>
                            <p className="text-xs text-slate-500">PDF, DOCX, XLSX, PPTX, Images supportés</p>
                            {fileName && <p className="text-xs text-cyan-400 mt-1 truncate max-w-full">{fileName}</p>}
                        </>
                    )}
                </div>
                <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept={fileInputAccept} ref={fileInputRef} disabled={isParsing} />
            </label>
        </div> 
    </div>
  );
}