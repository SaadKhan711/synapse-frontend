import React from 'react';
import { useStore } from '../store/useStore';
import { UiButton } from './UiButton';
import { Share2, Play } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

export const ModelEditor = () => {
  const { activeModel, liveChartData } = useStore();

  if (!activeModel) {
    return <div className="flex items-center justify-center h-full bg-slate-100 dark:bg-slate-950 text-slate-500">Select a model to view its details</div>;
  }

  return (
    <div className="flex flex-col h-full bg-slate-100 dark:bg-slate-950">
      <header className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">{activeModel.name}</h2>
        <div className="flex items-center space-x-2">
          <UiButton variant="outline" size="sm"><Share2 className="h-4 w-4 mr-2"/> Share</UiButton>
          <UiButton size="sm" className="bg-green-600 hover:bg-green-700 text-white"><Play className="h-4 w-4 mr-2"/> Run Backtest</UiButton>
        </div>
      </header>
      <div className="flex-grow p-4 overflow-auto">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Live Market Data Chart</h3>
          <div style={{width: '100%', height: 300}}>
            <ResponsiveContainer>
              {/* This now uses the live data from our store! */}
              <LineChart data={liveChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis domain={['dataMin - 1', 'dataMax + 1']} stroke="#9ca3af" />
                <RechartsTooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  activeDot={{ r: 8 }} 
                  isAnimationActive={false} 
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
