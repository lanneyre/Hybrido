
import React from 'react';
import type { ResourceType, BloomLevel, TargetAudience, ResourceOption, ResourceConfigs } from '../types';
import { QuizIcon, CaseStudyIcon, InfographicIcon, VideoScriptIcon, CollaborativeActivityIcon, GenerateIcon, EvaluationIcon, DidacticsIcon, GlossaryIcon } from './Icons';
import { ResourceConfigsPanel } from './ResourceConfigs';

const resourceOptions: ResourceOption[] = [
  { id: 'quiz', label: 'Quiz', icon: QuizIcon, description: 'Questions à choix multiples' },
  { id: 'case_study', label: 'Étude de Cas', icon: CaseStudyIcon, description: 'Scénarios pratiques' },
  { id: 'infographic', label: 'Infographie', icon: InfographicIcon, description: 'Résumé visuel & textuel' },
  { id: 'video_script', label: 'Script Vidéo', icon: VideoScriptIcon, description: 'Narration engageante' },
  { id: 'collaborative_activity', label: 'Activité', icon: CollaborativeActivityIcon, description: 'Tâches de groupe' },
  { id: 'evaluation', label: 'Évaluation', icon: EvaluationIcon, description: 'Évaluer la compréhension' },
  { id: 'didactics', label: 'Didactique', icon: DidacticsIcon, description: 'Conseils pédagogiques' },
  { id: 'glossary', label: 'Glossaire', icon: GlossaryIcon, description: 'Définitions des termes clés' },
];

const bloomOptions: { id: BloomLevel; label: string }[] = [
  { id: 'remember', label: 'Se souvenir' },
  { id: 'understand', label: 'Comprendre' },
  { id: 'apply', label: 'Appliquer' },
  { id: 'analyze', label: 'Analyser' },
  { id: 'evaluate', label: 'Évaluer' },
  { id: 'create', label: 'Créer' },
];

const audienceOptions: { id: TargetAudience; label: string }[] = [
    { id: 'children', label: 'Enfants' },
    { id: 'adolescents', label: 'Adolescents' },
    { id: 'adults', label: 'Adultes' },
    { id: 'professionals', label: 'Professionnels' },
    { id: 'general_public', label: 'Grand Public' },
];

interface ControlsProps {
  selectedResources: ResourceType[];
  onSelectResource: (resource: ResourceType) => void;
  bloomLevel: BloomLevel;
  onSelectBloomLevel: (level: BloomLevel) => void;
  targetAudience: TargetAudience;
  onSelectTargetAudience: (audience: TargetAudience) => void;
  configs: ResourceConfigs;
  onConfigChange: (resource: ResourceType, newConfig: any) => void;
  onGenerate: () => void;
  isLoading: boolean;
  disabled: boolean;
}

export function Controls({
  selectedResources,
  onSelectResource,
  bloomLevel,
  onSelectBloomLevel,
  targetAudience,
  onSelectTargetAudience,
  configs,
  onConfigChange,
  onGenerate,
  isLoading,
  disabled
}: ControlsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <label htmlFor="bloom-level" className="block text-sm font-medium text-slate-300 mb-2">2. Niveau Cognitif (Bloom)</label>
            <select id="bloom-level" value={bloomLevel} onChange={(e) => onSelectBloomLevel(e.target.value as BloomLevel)} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-2 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-colors">
                {bloomOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
        </div>
        <div>
            <label htmlFor="target-audience" className="block text-sm font-medium text-slate-300 mb-2">3. Public Cible</label>
            <select id="target-audience" value={targetAudience} onChange={(e) => onSelectTargetAudience(e.target.value as TargetAudience)} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-2 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-colors">
                {audienceOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-slate-300 mb-2">4. Choisissez les ressources à générer</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {resourceOptions.map((option) => (
            <label
              key={option.id}
              className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all duration-200 aspect-square cursor-pointer ${
                selectedResources.includes(option.id)
                  ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300'
                  : 'bg-slate-800/50 border-slate-700 hover:border-slate-500 text-slate-400 hover:text-slate-200'
              }`}
            >
              <input type="checkbox" className="sr-only" checked={selectedResources.includes(option.id)} onChange={() => onSelectResource(option.id)} />
              <option.icon className="h-6 w-6" />
              <span className="text-xs font-semibold text-center">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <ResourceConfigsPanel 
        selectedResources={selectedResources}
        configs={configs}
        onConfigChange={onConfigChange}
      />

      <button
        onClick={onGenerate}
        disabled={isLoading || disabled}
        className="w-full flex items-center justify-center gap-2 rounded-lg bg-cyan-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition-all hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:bg-slate-600 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            <span>Génération en cours...</span>
          </>
        ) : (
          <>
            <GenerateIcon className="h-5 w-5" />
            <span>Générer {selectedResources.length > 0 ? selectedResources.length : ''} Ressource{selectedResources.length > 1 ? 's' : ''}</span>
          </>
        )}
      </button>
    </div>
  );
}