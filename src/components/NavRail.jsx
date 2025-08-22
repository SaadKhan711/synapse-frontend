import React from 'react';
import { useStore } from '../store/useStore';
import { UiButton } from './UiButton';
import { File, BarChart2, Terminal, LogOut, BrainCircuit } from 'lucide-react';

export const NavRail = () => {
  const { logout } = useStore();
  return (
    <div className="flex flex-col h-full p-2 bg-slate-800 text-white items-center justify-between">
      <div>
        <div className="p-2 mb-4"><BrainCircuit className="h-8 w-8 text-violet-400" /></div>
        <UiButton variant="ghost" size="icon" className="text-white hover:bg-slate-700 hover:text-violet-300"><File className="h-6 w-6" /></UiButton>
        <UiButton variant="ghost" size="icon" className="text-white hover:bg-slate-700 hover:text-violet-300"><BarChart2 className="h-6 w-6" /></UiButton>
        <UiButton variant="ghost" size="icon" className="text-white hover:bg-slate-700 hover:text-violet-300"><Terminal className="h-6 w-6" /></UiButton>
      </div>
      <div>
        <UiButton onClick={logout} variant="ghost" size="icon" className="text-white hover:bg-slate-700 hover:text-red-400"><LogOut className="h-6 w-6" /></UiButton>
      </div>
    </div>
  );
};
