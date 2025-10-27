
import React from 'react';
import { Loader } from './Loader';
import { SparklesIcon, WarningIcon } from './Icons';

interface OutputDisplayProps {
  content: string | null;
  isLoading: boolean;
  error: string | null;
}

const FormattedContent = ({ text }: { text: string }) => {
  const formatText = (inputText: string) => {
    let html = inputText
      // Headings
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold text-slate-200 mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-cyan-300 mt-6 mb-3 border-b border-slate-700 pb-2">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-cyan-400 mt-8 mb-4">$1</h1>')
      // Bold
      .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold text-slate-100">$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      // Lists (basic handling)
      .replace(/^\s*[-*] (.*$)/gim, '<li class="ml-5 before:content-[\'•\'] before:mr-2 before:text-cyan-400">$1</li>');

    // Wrap adjacent list items in <ul>
    html = html.replace(/(<li>.*<\/li>)/gis, '<ul>$1</ul>').replace(/<\/ul>\s*<ul>/g, '');

    // Replace newlines with <br>, but not after headings or inside list wrappers
    html = html.split('\n').map(line => {
      if (line.trim().match(/^<(h[1-3]|ul|li)/)) {
        return line;
      }
      return line + '<br/>';
    }).join('');

    return html.replace(/<br\/><(h[1-3]|ul)/g, '<$1'); // Clean up extra breaks before blocks
  };

  return (
    <div 
      className="prose prose-invert max-w-none prose-p:text-slate-300 prose-strong:text-slate-100 prose-headings:text-cyan-400"
      dangerouslySetInnerHTML={{ __html: formatText(text) }}
    />
  );
};


export function OutputDisplay({ content, isLoading, error }: OutputDisplayProps) {
  const renderContent = () => {
    if (isLoading) {
      return <Loader />;
    }
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center text-center text-red-400 p-8">
          <WarningIcon className="h-12 w-12 mb-4" />
          <h3 className="text-xl font-semibold text-red-300">An Error Occurred</h3>
          <p className="text-red-400">{error}</p>
        </div>
      );
    }
    if (content) {
      return <FormattedContent text={content} />;
    }
    return (
      <div className="flex flex-col items-center justify-center text-center text-slate-500 p-8">
        <SparklesIcon className="h-12 w-12 mb-4" />
        <h3 className="text-xl font-semibold text-slate-400">Your generated resource will appear here</h3>
        <p>Fill in the details on the left and click "Generate" to begin.</p>
      </div>
    );
  };

  return (
    <div className="h-full min-h-[500px] lg:min-h-0 rounded-lg border-2 border-slate-700 bg-slate-800/50 p-6">
       {renderContent()}
    </div>
  );
}
