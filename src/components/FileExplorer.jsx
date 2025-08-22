import React from 'react';
import { useStore } from '../store/useStore';
import { File } from 'lucide-react';

export const FileExplorer = () => {
  const { models, setActiveModel, addLog } = useStore();

  const handleModelSelect = (model) => {
    setActiveModel(model);
    addLog({ type: 'info', message: `Displaying model: ${model.name}` });
  };

  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-900 h-full overflow-y-auto">
      <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">File Explorer</h2>
      <div className="space-y-2">
        {models.length > 0 ? models.map(model => (
          <div key={model.id} onClick={() => handleModelSelect(model)} className="flex items-center p-2 rounded-lg cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
            <File className="h-5 w-5 mr-3 text-violet-500" />
            <div className="flex-grow">
              <p className="font-semibold text-slate-800 dark:text-slate-200">{model.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Owner ID: {model.owner.substring(0, 8)}...</p>
            </div>
          </div>
        )) : <p className="text-sm text-slate-400">No models found.</p>}
      </div>
    </div>
  );
};
