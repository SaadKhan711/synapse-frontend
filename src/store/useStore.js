import { create } from 'zustand';
import { authService } from '../services/authService';
import { apiService } from '../services/apiService';

export const useStore = create((set, get) => ({
  isAuthenticated: !!authService.getToken(),
  models: [],
  activeModel: null,
  consoleLogs: [],
  liveChartData: [],
  
  login: async (username, password) => {
    get().addLog({ type: 'info', message: `Authenticating user: ${username}` });
    await authService.login(username, password);
    set({ isAuthenticated: true });
    get().addLog({ type: 'success', message: `User ${username} authenticated.` });
    await get().loadModels();
  },
  logout: () => {
    authService.clearToken();
    set({ isAuthenticated: false, activeModel: null, models: [] });
    get().addLog({ type: 'info', message: 'User logged out.' });
  },
  loadModels: async () => {
    if (!get().isAuthenticated) return;
    try {
      get().addLog({ type: 'info', message: 'Fetching models...' });
      const models = await apiService.fetchModels();
      set({ models });
      get().addLog({ type: 'success', message: `${models.length} model(s) loaded.` });
    } catch (error) {
      get().addLog({ type: 'error', message: `Failed to load models: ${error.message}` });
      if (error.message.includes('Session expired')) set({ isAuthenticated: false });
    }
  },
  setActiveModel: (model) => set({ activeModel: model }),
  addLog: (log) => set((state) => ({ consoleLogs: [...state.consoleLogs, { timestamp: new Date().toISOString(), ...log }] })),
  
  addChartData: (tick) => set((state) => {
    const newData = [...state.liveChartData, { name: new Date(tick.timestamp).toLocaleTimeString(), price: tick.price }];
    if (newData.length > 30) {
      return { liveChartData: newData.slice(newData.length - 30) };
    }
    return { liveChartData: newData };
  }),
}));
