
import React from 'react';
import { Loader } from './Loader';
import { SparklesIcon, WarningIcon, DownloadIcon } from './Icons';

interface OutputDisplayProps {
  generatedContents: Record<string, { content: string, image?: string, error?: string }>;
  currentGeneration: string | null;
  isLoading: boolean;
  friendlyResourceNames: Record<string, string>;
}

const FormattedContent = ({ text }: { text: string }) => {
  const formatText = (inputText: string): string => {
    // Basic Markdown to HTML conversion. A library like 'marked' would be more robust.
    return inputText
      .replace(/</g, "&lt;").replace(/>/g, "&gt;") // Sanitize HTML
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold text-slate-200 mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-cyan-300 mt-6 mb-3 border-b border-slate-700 pb-2">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-cyan-400 mt-8 mb-4">$1</h1>')
      .replace(/^\s*[-*] (.*$)/gim, '<li class="ml-5 list-inside list-disc marker:text-cyan-400">$1</li>') // Improved list
      .replace(/<\/li>\n<li/g, '</li><li') // Compact list items
      .replace(/\n/g, '<br />')
      .replace(/<br \/>(\s*<li)/g, '$1'); // Remove breaks before list items
  };

  return (
    <div
      className="prose prose-invert max-w-none text-slate-300"
      dangerouslySetInnerHTML={{ __html: formatText(text) }}
    />
  );
};


export function OutputDisplay({ generatedContents, currentGeneration, isLoading, friendlyResourceNames }: OutputDisplayProps) {

  const handleDownload = (filename: string, content: string, mimeType: string = 'text/plain;charset=utf-8') => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
                                <button onClick={() => handleDownload(`${key}.txt`, item.content)} className="text-slate-400 hover:text-white transition-colors" title="Télécharger le texte">
                                    <DownloadIcon className="h-5 w-5" />
                                </button>
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