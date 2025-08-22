import React, { useEffect } from 'react';
import { useStore } from './store/useStore';
import { useWebSocket } from './hooks/useWebSocket';
import { LoginScreen } from './components/LoginScreen';
import { NavRail } from './components/NavRail';
import { FileExplorer } from './components/FileExplorer';
import { ModelEditor } from './components/ModelEditor';
import { Console } from './components/Console';

// Main application layout component
const MainApp = () => {
  // This custom hook handles all WebSocket logic
  useWebSocket();

  return (
    <div className="h-screen w-screen bg-slate-900 text-slate-50 flex overflow-hidden">
      <NavRail />
      <div className="flex-1 flex">
        <div className="w-[20%] min-w-[250px] border-r border-slate-700"><FileExplorer /></div>
        <div className="flex-1 flex flex-col">
            <div className="h-[75%]"><ModelEditor /></div>
            <div className="flex-1 border-t border-slate-700"><Console /></div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const { isAuthenticated, loadModels, addLog } = useStore();

  useEffect(() => {
    addLog({ type: 'info', message: 'Synapse UI Initialized.' });
    if (isAuthenticated) {
      loadModels();
    }
  }, [isAuthenticated, loadModels, addLog]);

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return <MainApp />;
}
