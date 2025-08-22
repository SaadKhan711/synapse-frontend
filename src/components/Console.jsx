import React, { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const Console = () => {
  const { consoleLogs } = useStore();
  const consoleRef = useRef(null);

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [consoleLogs]);

  const getLogColor = (type) => {
    switch(type) {
        case 'info': return 'text-blue-400';
        case 'success': return 'text-green-400';
        case 'error': return 'text-red-400';
        case 'signal-buy': return 'text-green-400 font-bold';
        case 'signal-sell': return 'text-red-400 font-bold';
        default: return 'text-slate-400';
    }
  }

  const getIcon = (type) => {
    if (type === 'signal-buy') return <TrendingUp className="h-4 w-4 mr-2 inline"/>;
    if (type === 'signal-sell') return <TrendingDown className="h-4 w-4 mr-2 inline"/>;
    return null;
  }

  return (
    <div ref={consoleRef} className="h-full bg-black font-mono text-sm p-4 overflow-y-auto">
      <div className="text-green-400 mb-2">Welcome to Synapse Console.</div>
      {consoleLogs.map((log, i) => (
        <div key={i} className="flex">
          <span className="text-slate-600 mr-2">{new Date(log.timestamp).toLocaleTimeString()}</span>
          <span className={`${getLogColor(log.type)} mr-2`}>[{log.type.toUpperCase()}]</span>
          <span className="text-slate-300">{getIcon(log.type)}{log.message}</span>
        </div>
      ))}
    </div>
  );
};
