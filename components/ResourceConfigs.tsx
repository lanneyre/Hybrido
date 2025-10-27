
import React from 'react';
import type { ResourceType, ResourceConfigs } from '../types';

interface ResourceConfigsPanelProps {
  selectedResources: ResourceType[];
  configs: ResourceConfigs;
  onConfigChange: (resource: ResourceType, newConfig: any) => void;
}

const NumberInput = ({ label, value, onChange, min = 1, max = 20 }: { label: string, value: number, onChange: (val: number) => void, min?: number, max?: number }) => (
    <div>
        <label className="block text-xs text-slate-400">{label}</label>
        <input 
            type="number"
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)}
            min={min}
            max={max}
            className="w-full bg-slate-700/50 border border-slate-600 rounded-md p-1 text-sm text-center"
        />
    </div>
);


export function ResourceConfigsPanel({ selectedResources, configs, onConfigChange }: ResourceConfigsPanelProps) {
  if (selectedResources.length === 0) {
    return null;
  }

  const hasConfigurableResource = selectedResources.some(r => ['quiz', 'video_script', 'collaborative_activity'].includes(r));

  if (!hasConfigurableResource) {
    return null;
  }

  return (
    <div className="space-y-4 bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-medium text-slate-300 -mt-1">5. Configurez les ressources sélectionnées</h3>
        {selectedResources.includes('quiz') && (
            <div className="p-3 border border-slate-600 rounded-md">
                <p className="font-semibold text-sm text-slate-300 mb-2">Structure du Quiz</p>
                <div className="grid grid-cols-3 gap-3">
                    <NumberInput label="QCM" value={configs.quiz?.mcqCount ?? 0} onChange={(val) => onConfigChange('quiz', { mcqCount: val })} />
                    <NumberInput label="Vrai/Faux" value={configs.quiz?.trueFalseCount ?? 0} onChange={(val) => onConfigChange('quiz', { trueFalseCount: val })} />
                    <NumberInput label="Ouvertes" value={configs.quiz?.openCount ?? 0} onChange={(val) => onConfigChange('quiz', { openCount: val })} />
                </div>
            </div>
        )}
        {selectedResources.includes('video_script') && (
            <div className="p-3 border border-slate-600 rounded-md">
                <p className="font-semibold text-sm text-slate-300 mb-2">Durée du Script Vidéo</p>
                <div className="flex items-center gap-2">
                    <input 
                        type="range"
                        min="1"
                        max="15"
                        value={configs.video_script?.duration ?? 3}
                        onChange={(e) => onConfigChange('video_script', { duration: parseInt(e.target.value, 10) })}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="font-mono text-sm bg-slate-700 rounded-md px-2 py-0.5">{configs.video_script?.duration ?? 3} min</span>
                </div>
            </div>
        )}
        {selectedResources.includes('collaborative_activity') && (
            <div className="p-3 border border-slate-600 rounded-md">
                <p className="font-semibold text-sm text-slate-300 mb-2">Durée de l'Activité</p>
                 <div className="flex items-center gap-2">
                    <input 
                        type="range"
                        min="5"
                        max="90"
                        step="5"
                        value={configs.collaborative_activity?.duration ?? 20}
                        onChange={(e) => onConfigChange('collaborative_activity', { duration: parseInt(e.target.value, 10) })}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="font-mono text-sm bg-slate-700 rounded-md px-2 py-0.5">{configs.collaborative_activity?.duration ?? 20} min</span>
                </div>
            </div>
        )}
    </div>
  );
}