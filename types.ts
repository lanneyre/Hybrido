import React from 'react';

// Expanded resource types
export type ResourceType = 'quiz' | 'case_study' | 'infographic' | 'video_script' | 'collaborative_activity' | 'evaluation' | 'didactics' | 'glossary';

// Bloom's Taxonomy Levels
export type BloomLevel = 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';

// Target Audience
export type TargetAudience = 'children' | 'adolescents' | 'adults' | 'professionals' | 'general_public';

export interface ResourceOption {
  id: ResourceType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

// Configuration types for specific resources
export interface QuizConfig {
  mcqCount: number;
  trueFalseCount: number;
  openCount: number;
}

export interface VideoScriptConfig {
  duration: number; // in minutes
}

export interface CollaborativeActivityConfig {
  duration: number; // in minutes
}

// A map to hold all configurations
export type ResourceConfigs = {
  quiz?: QuizConfig;
  video_script?: VideoScriptConfig;
  collaborative_activity?: CollaborativeActivityConfig;
  // Other configs can be added here
};
