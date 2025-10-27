// Fix: Add missing import for React to resolve namespace error.
import React from 'react';

export type ResourceType = 'quiz' | 'case_study' | 'infographic' | 'video_script' | 'collaborative_activity';
export type Complexity = 'beginner' | 'intermediate' | 'advanced';

export interface ResourceOption {
  id: ResourceType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}
