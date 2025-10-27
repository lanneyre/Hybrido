
import React from 'react';
import { SparklesIcon } from './Icons';

export function Header() {
  return (
    <header className="text-center">
      <div className="inline-flex items-center gap-3 bg-slate-800/50 border border-slate-700 rounded-full px-4 py-2 mb-4">
        <SparklesIcon className="h-5 w-5 text-cyan-400" />
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-200 to-cyan-400 text-transparent bg-clip-text">
          HYBRIDO
        </h1>
      </div>
      <p className="max-w-3xl mx-auto text-slate-400">
        Transform your course materials into engaging, multimodal learning resources. Paste your content, choose a format, and let HYBRIDO create quizzes, case studies, and more.
      </p>
    </header>
  );
}
