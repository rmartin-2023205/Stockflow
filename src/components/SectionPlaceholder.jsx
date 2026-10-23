import React from 'react';
import { Construction, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SectionPlaceholder({ title, phase, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 shadow-lg shadow-emerald-500/5">
        <Construction className="w-6 h-6" />
      </div>
      <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
      <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-[#121622] text-emerald-400 border border-[#1A2234] mb-3">
        {phase}
      </span>
      <p className="max-w-md text-xs text-slate-400 leading-relaxed mb-6">
        {description}
      </p>
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-slate-200 bg-[#0F131C] border border-[#1A212E] hover:border-emerald-500/40 transition active:scale-[0.98]"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Volver al Dashboard</span>
      </Link>
    </div>
  );
}
