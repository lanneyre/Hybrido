
import React from 'react';

interface LoaderProps {
  text?: string;
}

export function Loader({ text = "Génération de votre ressource..." }: LoaderProps) {
  return (
    <div className="space-y-4 animate-fade-in">
        <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-slate-300">{text}</h3>
            <p className="text-slate-400">Cela peut prendre quelques instants.</p>
        </div>
        <div className="space-y-3">
            <div className="h-6 rounded-md bg-slate-700 w-1/2 shimmer-bg"></div>
            <div className="h-4 rounded-md bg-slate-700 w-full shimmer-bg"></div>
            <div className="h-4 rounded-md bg-slate-700 w-5/6 shimmer-bg"></div>
            <div className="h-4 rounded-md bg-slate-700 w-3/4 shimmer-bg"></div>
        </div>
        <div className="pt-4 space-y-3">
            <div className="h-6 rounded-md bg-slate-700 w-1/3 shimmer-bg"></div>
            <div className="h-4 rounded-md bg-slate-700 w-full shimmer-bg"></div>
            <div className="h-4 rounded-md bg-slate-700 w-full shimmer-bg"></div>
        </div>
        <style jsx>{`
            .shimmer-bg {
                background: linear-gradient(to right, #334155 4%, #475569 25%, #334155 36%);
                background-size: 1000px 100%;
                animation: shimmer 2s linear infinite;
            }
        `}</style>
    </div>
  );
}