import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { authService } from '../services/authService';

export const useWebSocket = () => {
  const { addLog, addChartData } = useStore();

  useEffect(() => {
    const token = authService.getToken();
    if (!token) {
      addLog({ type: 'error', message: 'Authentication token not found for WebSocket.' });
      return;
    }

    addLog({ type: 'info', message: 'Connecting to real-time event stream...' });
    
    const ws = new WebSocket(`ws://localhost:8086/ws/events`);

    ws.onopen = () => {
      addLog({ type: 'success', message: 'Real-time connection established.' });
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.symbol && data.price && data.timestamp) {
          addChartData(data);
        } else if (data.symbol && data.signalType) {
          const logType = data.signalType === 'BUY' ? 'signal-buy' : 'signal-sell';
          addLog({ type: logType, message: `Signal for ${data.symbol}: ${data.signalType} @ ${data.triggerPrice} (Avg: ${data.movingAverage})` });
        }
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };

    ws.onclose = () => {
      addLog({ type: 'error', message: 'Real-time connection closed.' });
    };
    
    ws.onerror = (error) => {
      addLog({ type: 'error', message: 'WebSocket error. See browser console for details.' });
      console.error("WebSocket Error: ", error);
    };

    return () => {
      ws.close();
    };
  }, [addLog, addChartData]); // Dependencies for the effect
};
