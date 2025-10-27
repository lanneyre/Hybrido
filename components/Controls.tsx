
import React from 'react';
import type { ResourceType, Complexity, ResourceOption } from '../types';
import { QuizIcon, CaseStudyIcon, InfographicIcon, VideoScriptIcon, CollaborativeActivityIcon, GenerateIcon } from './Icons';

const resourceOptions: ResourceOption[] = [
  { id: 'quiz', label: 'Quiz', icon: QuizIcon, description: 'Multiple choice questions' },
  { id: 'case_study', label: 'Case Study', icon: CaseStudyIcon, description: 'Practical scenarios' },
  { id: 'infographic', label: 'Infographic', icon: InfographicIcon, description: 'Key points summary' },
  { id: 'video_script', label: 'Video Script', icon: VideoScriptIcon, description: 'Engaging narration' },
  { id: 'collaborative_activity', label: 'Activity', icon: CollaborativeActivityIcon, description: 'Group-based tasks' },
];

const complexityOptions: { id: Complexity; label: string }[] = [
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
];

interface ControlsProps {
  selectedResource: ResourceType;
  onSelectResource: (resource: ResourceType) => void;
  selectedComplexity: Complexity;
  onSelectComplexity: (complexity: Complexity) => void;
  onGenerate: () => void;
  isLoading: boolean;
  disabled: boolean;
}

export function Controls({
  selectedResource,
  onSelectResource,
  selectedComplexity,
  onSelectComplexity,
  onGenerate,
  isLoading,
  disabled
}: ControlsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-slate-300 mb-2">2. Choose resource type</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {resourceOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => onSelectResource(option.id)}
              className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all duration-200 aspect-square ${
                selectedResource === option.id
                  ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300'
                  : 'bg-slate-800/50 border-slate-700 hover:border-slate-500 text-slate-400 hover:text-slate-200'
              }`}
            >
              <option.icon className="h-6 w-6" />
              <span className="text-xs font-semibold text-center">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-slate-300 mb-2">3. Select complexity level</h3>
        <div className="flex bg-slate-800/50 border border-slate-700 rounded-lg p-1">
          {complexityOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => onSelectComplexity(option.id)}
              className={`flex-1 text-center py-1.5 px-3 text-sm font-medium rounded-md transition-colors ${
                selectedComplexity === option.id
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-700/50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onGenerate}
        disabled={isLoading || disabled}
        className="w-full flex items-center justify-center gap-2 rounded-lg bg-cyan-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition-all hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:bg-slate-600 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            <span>Generating...</span>
          </>
        ) : (
          <>
            <GenerateIcon className="h-5 w-5" />
            <span>Generate Resource</span>
          </>
        )}
      </button>
    </div>
  );
}
