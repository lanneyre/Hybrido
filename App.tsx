
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { SourceInput } from './components/SourceInput';
import { Controls } from './components/Controls';
import { OutputDisplay } from './components/OutputDisplay';
import { generateResource } from './services/geminiService';
import type { ResourceType, Complexity } from './types';

export default function App() {
  const [sourceText, setSourceText] = useState<string>('');
  const [resourceType, setResourceType] = useState<ResourceType>('quiz');
  const [complexity, setComplexity] = useState<Complexity>('intermediate');
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!sourceText.trim()) {
      setError('Please provide some source content.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedContent(null);

    try {
      const result = await generateResource(sourceText, resourceType, complexity);
      setGeneratedContent(result);
    } catch (e) {
      console.error(e);
      setError('An error occurred while generating the content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [sourceText, resourceType, complexity]);

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-200">
      <div className="absolute inset-0 -z-10 h-full w-full bg-slate-900 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      <div className="container mx-auto px-4 py-8">
        <Header />
        <main className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="flex flex-col gap-6 animate-fade-in">
            <SourceInput value={sourceText} onChange={setSourceText} />
            <Controls
              selectedResource={resourceType}
              onSelectResource={setResourceType}
              selectedComplexity={complexity}
              onSelectComplexity={setComplexity}
              onGenerate={handleGenerate}
              isLoading={isLoading}
              disabled={!sourceText.trim()}
            />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <OutputDisplay
              content={generatedContent}
              isLoading={isLoading}
              error={error}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
