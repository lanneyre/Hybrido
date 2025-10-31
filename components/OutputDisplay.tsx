
import React, { useState, useRef, useEffect } from 'react';
import { Loader } from './Loader';
import { SparklesIcon, DownloadIcon, ChevronDownIcon } from './Icons';
import { exportAsPdf, exportAsDocx, exportAsJson, exportAsXlsx } from '../services/exportService';
import { convertMarkdownToStructuredJson } from '../services/geminiService';

interface OutputDisplayProps {
  generatedContents: Record<string, { content: string, image?: string, error?: string }>;
  currentGeneration: string | null;
  isLoading: boolean;
  friendlyResourceNames: Record<string, string>;
}

const FormattedContent = ({ text }: { text: string }) => {
  const formatText = (inputText: string): string => {
    return inputText
      .replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold text-slate-200 mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-cyan-300 mt-6 mb-3 border-b border-slate-700 pb-2">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-cyan-400 mt-8 mb-4">$1</h1>')
      .replace(/^\s*[-*] (.*$)/gim, '<li class="ml-5 list-inside list-disc marker:text-cyan-400">$1</li>')
      .replace(/<\/li>\n<li/g, '</li><li')
      .replace(/\n/g, '<br />')
      .replace(/<br \/>(\s*<li)/g, '$1');
  };

  return (
    <div
      className="prose prose-invert max-w-none text-slate-300"
      dangerouslySetInnerHTML={{ __html: formatText(text) }}
    />
  );
};

const ExportMenu = ({ resourceKey, content, structuredData, onConvertToStructured }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isConverting, setIsConverting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleExport = async (format) => {
        setIsOpen(false);
        if (['json', 'xlsx'].includes(format) && !structuredData) {
            setIsConverting(true);
            setError(null);
            try {
                const data = await onConvertToStructured();
                if (format === 'json') exportAsJson(data, resourceKey);
                if (format === 'xlsx') exportAsXlsx(data, resourceKey);
            } catch (e) {
                setError("La conversion a échoué.");
                console.error(e);
            } finally {
                setIsConverting(false);
            }
        } else {
            if (format === 'pdf') exportAsPdf(content, resourceKey);
            if (format === 'docx') exportAsDocx(content, resourceKey);
            if (format === 'json' && structuredData) exportAsJson(structuredData, resourceKey);
            if (format === 'xlsx' && structuredData) exportAsXlsx(structuredData, resourceKey);
        }
    };
    
    const isStructuredResource = ['quiz', 'glossary'].includes(resourceKey);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors p-1 rounded-md bg-slate-700/50 hover:bg-slate-700"
                title="Exporter la ressource"
            >
                {isConverting ? (
                    <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        <span className="text-xs">Conversion...</span>
                    </>
                ) : (
                    <>
                        <DownloadIcon className="h-5 w-5" />
                        <span className="text-sm">Exporter</span>
                        <ChevronDownIcon className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </>
                )}
            </button>
            {isOpen && !isConverting && (
                <div className="absolute right-0 mt-2 w-40 bg-slate-800 border border-slate-600 rounded-md shadow-lg z-10 animate-fade-in" style={{ animationDuration: '0.2s'}}>
                    <ul className="text-sm text-slate-300">
                        <li className="px-3 py-2 hover:bg-slate-700 cursor-pointer" onClick={() => handleExport('pdf')}>PDF</li>
                        <li className="px-3 py-2 hover:bg-slate-700 cursor-pointer" onClick={() => handleExport('docx')}>DOCX (Word)</li>
                        {isStructuredResource && (
                            <>
                                <li className="border-t border-slate-600"></li>
                                <li className="px-3 py-2 hover:bg-slate-700 cursor-pointer" onClick={() => handleExport('json')}>JSON</li>
                                <li className="px-3 py-2 hover:bg-slate-700 cursor-pointer" onClick={() => handleExport('xlsx')}>XLSX (Excel)</li>
                            </>
                        )}
                    </ul>
                </div>
            )}
            {error && <p className="text-xs text-red-400 absolute right-0 mt-1">{error}</p>}
        </div>
    );
};


export function OutputDisplay({ generatedContents, currentGeneration, isLoading, friendlyResourceNames }: OutputDisplayProps) {
  const [structuredDataCache, setStructuredDataCache] = useState({});

  const handleConvertToStructured = async (resourceKey: string, content: string) => {
    if (structuredDataCache[resourceKey]) {
      return structuredDataCache[resourceKey];
    }
    const data = await convertMarkdownToStructuredJson(content, resourceKey as 'quiz' | 'glossary');
    setStructuredDataCache(prev => ({ ...prev, [resourceKey]: data }));
    return data;
  };

  const renderContent = () => {
    const generatedKeys = Object.keys(generatedContents);
    
    if (isLoading === false && generatedKeys.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center text-center text-slate-500 p-8 h-full">
          <SparklesIcon className="h-12 w-12 mb-4" />
          <h3 className="text-xl font-semibold text-slate-400">Vos ressources générées apparaîtront ici</h3>
          <p>Remplissez les informations à gauche et cliquez sur "Générer" pour commencer.</p>
        </div>
      );
    }
    
    return (
        <div className="space-y-4">
            {generatedKeys.map(key => {
                const item = generatedContents[key];
                const displayName = friendlyResourceNames[key] || key.replace(/_/g, ' ');
                return (
                    <div key={key} className="bg-slate-800 border border-slate-700 rounded-lg p-4 animate-fade-in">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-semibold capitalize text-cyan-400">{displayName}</h3>
                            {item.content && (
                                <ExportMenu
                                    resourceKey={key}
                                    content={item.content}
                                    structuredData={structuredDataCache[key]}
                                    onConvertToStructured={() => handleConvertToStructured(key, item.content)}
                                />
                            )}
                        </div>
                        {item.error && <p className="text-red-400">{item.error}</p>}
                        {item.content && <FormattedContent text={item.content} />}
                        {item.image && (
                            <div className="mt-4">
                               <img src={`data:image/png;base64,${item.image}`} alt={`Visuel pour ${displayName}`} className="rounded-lg border border-slate-600" />
                                <a href={`data:image/png;base64,${item.image}`} download={`${key}.png`} className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 mt-2">
                                  <DownloadIcon className="h-4 w-4" />
                                  Télécharger l'image
                                </a>
                            </div>
                        )}
                    </div>
                );
            })}
             {isLoading && currentGeneration && (
                <div className="animate-fade-in">
                    <Loader text={`Génération de : ${friendlyResourceNames[currentGeneration] || currentGeneration.replace(/_/g, ' ')}...`} />
                </div>
            )}
        </div>
    );
  };

  return (
    <div className="h-full min-h-[500px] lg:min-h-0 rounded-lg border-2 border-slate-700 bg-slate-800/50 p-6 overflow-y-auto">
       {renderContent()}
    </div>
  );
}