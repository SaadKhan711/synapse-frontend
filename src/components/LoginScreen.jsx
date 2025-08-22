import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { UiButton } from './UiButton';
import { User, BrainCircuit } from 'lucide-react';

export const LoginScreen = () => {
  const { login } = useStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login('testuser', 'password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-slate-900">
      <div className="w-96 bg-slate-800 border border-slate-700 text-white rounded-lg p-8">
        <div className="text-center mb-6">
          <h2 className="flex items-center justify-center text-2xl font-bold text-violet-400">
            <BrainCircuit className="h-8 w-8 mr-3"/> Synapse
          </h2>
          <p className="text-slate-400 mt-2">Collaborative Financial Engineering</p>
        </div>
        <form onSubmit={handleLogin} className="flex flex-col items-center">
          <div className="mb-4 text-center bg-slate-700 p-3 rounded-md w-full">
            <p className="text-sm text-slate-400">Logging in with demo credentials:</p>
            <p className="font-mono text-slate-200">testuser</p>
          </div>
          <UiButton type="submit" className="w-full bg-violet-600 hover:bg-violet-700" disabled={isLoading}>
            {isLoading ? 'Logging in...' : <><User className="h-4 w-4 mr-2"/> Login</>}
          </UiButton>
        </form>
      </div>
    </div>
  );
};
