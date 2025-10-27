
import React from 'react';

interface SourceInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function SourceInput({ value, onChange }: SourceInputProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="source-text" className="text-sm font-medium text-slate-300">
        1. Paste your source content
      </label>
      <textarea
        id="source-text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste your PDF text, lecture notes, or article content here..."
        className="h-64 min-h-[10rem] w-full rounded-lg border-2 border-slate-700 bg-slate-800/50 p-4 text-slate-300 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-colors"
      />
    </div>
  );
}
