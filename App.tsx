
import React, { useState, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { SourceInput } from './components/SourceInput';
import { Controls } from './components/Controls';
import { OutputDisplay } from './components/OutputDisplay';
import { generateResource, generateImage } from './services/geminiService';
import type { ResourceType, BloomLevel, TargetAudience, ResourceConfigs } from './types';

const friendlyResourceNames: Record<string, string> = {
    quiz: "Quiz",
    case_study: "Étude de cas",
    infographic: "Infographie",
    video_script: "Script Vidéo",
    collaborative_activity: "Activité Collaborative",
    evaluation: "Évaluation",
    didactics: "Didactique",
    glossary: "Glossaire",
};

export default function App() {
  const [sourceText, setSourceText] = useState<string>('');
  const [sourceFile, setSourceFile] = useState<{ data: string, mimeType: string, name: string } | null>(null);
  
  const [selectedResources, setSelectedResources] = useState<ResourceType[]>([]);
  const [bloomLevel, setBloomLevel] = useState<BloomLevel>('apply');
  const [targetAudience, setTargetAudience] = useState<TargetAudience>('adults');
  
  const [configs, setConfigs] = useState<ResourceConfigs>({
    quiz: { mcqCount: 5, trueFalseCount: 3, openCount: 2 },
    video_script: { duration: 3 },
    collaborative_activity: { duration: 20 },
  });

  const [generatedContents, setGeneratedContents] = useState<Record<string, { content: string, image?: string, error?: string }>>({});
  const [currentGeneration, setCurrentGeneration] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSourceFileChange = useCallback((fileData: { data: string; mimeType: string; name: string } | null) => {
    setSourceFile(fileData);
  }, []);

  const handleSelectResource = (resource: ResourceType) => {
    setSelectedResources(prev => 
      prev.includes(resource) 
        ? prev.filter(r => r !== resource) 
        : [...prev, resource]
    );
  };

  const handleConfigChange = (resource: ResourceType, newConfig: any) => {
    setConfigs(prev => ({
      ...prev,
      [resource]: { ...prev[resource], ...newConfig }
    }));
  };

  const handleGenerate = useCallback(async () => {
    if (!sourceText.trim() && !sourceFile) {
      setError('Veuillez fournir un contenu source (texte ou fichier).');
      return;
    }
    if (selectedResources.length === 0) {
        setError('Veuillez sélectionner au moins une ressource à générer.');
        return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedContents({});
    setCurrentGeneration(null);

    const sourceContent = { text: sourceText, file: (sourceFile && sourceFile.data) ? sourceFile : undefined };

    for (const resourceType of selectedResources) {
      try {
        setCurrentGeneration(resourceType);
        const result = await generateResource(sourceContent, resourceType, bloomLevel, targetAudience, configs[resourceType]);
        
        if (resourceType === 'infographic') {
          const imagePrompt = `Créez une infographie visuellement attrayante en français basée sur ces points clés : ${result}. Rendez-la claire, concise et adaptée à des fins pédagogiques. Le style visuel doit être professionnel et engageant.`;
          const imageResult = await generateImage(imagePrompt);
          setGeneratedContents(prev => ({ ...prev, [resourceType]: { content: result, image: imageResult } }));
        } else {
          setGeneratedContents(prev => ({ ...prev, [resourceType]: { content: result } }));
        }
      } catch (e) {
        console.error(`Failed to generate ${resourceType}:`, e);
        const friendlyName = friendlyResourceNames[resourceType] || resourceType;
        setGeneratedContents(prev => ({ ...prev, [resourceType]: { content: '', error: `La génération de "${friendlyName}" a échoué. Veuillez réessayer.` } }));
      }
    }

    setIsLoading(false);
    setCurrentGeneration(null);
  }, [sourceText, sourceFile, selectedResources, bloomLevel, targetAudience, configs]);

  const isGenerationDisabled = useMemo(() => {
    return (!sourceText.trim() && !sourceFile) || selectedResources.length === 0;
  }, [sourceText, sourceFile, selectedResources]);

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-200">
      <div className="absolute inset-0 -z-10 h-full w-full bg-slate-900 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      <div className="container mx-auto px-4 py-8">
        <Header />
        {error && <div className="my-4 p-3 bg-red-500/20 border border-red-500/50 text-red-300 rounded-lg text-center">{error}</div>}
        <main className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="flex flex-col gap-6 animate-fade-in">
            <SourceInput 
                textValue={sourceText} 
                onTextChange={setSourceText} 
                onFileChange={handleSourceFileChange}
                fileName={sourceFile?.name ?? null}
            />
            <Controls
              selectedResources={selectedResources}
              onSelectResource={handleSelectResource}
              bloomLevel={bloomLevel}
              onSelectBloomLevel={setBloomLevel}
              targetAudience={targetAudience}
              onSelectTargetAudience={setTargetAudience}
              configs={configs}
              onConfigChange={handleConfigChange}
              onGenerate={handleGenerate}
              isLoading={isLoading}
              disabled={isGenerationDisabled}
            />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <OutputDisplay
              generatedContents={generatedContents}
              currentGeneration={currentGeneration}
              isLoading={isLoading}
              friendlyResourceNames={friendlyResourceNames}
            />
          </div>
        </main>
      </div>
    </div>
  );
}