import React, { useState, useEffect, useCallback, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { File, BarChart2, Terminal, User, LogOut, Share2, Play, BrainCircuit, Bot } from 'lucide-react';
import { create } from 'zustand';

// --- UI Component Stub ---
// This simple button component is all we need from a "UI library".
const UiButton = ({ children, variant = 'default', size = 'default', className = '', ...props }) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  const variants = {
    default: "bg-slate-900 text-slate-50 hover:bg-slate-900/90 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90",
    outline: "border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800 dark:hover:text-slate-50",
    ghost: "hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50",
  };
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    icon: "h-10 w-10",
  };
  return <button className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>{children}</button>;
};

// --- Authentication Service ---
const authService = {
  getToken: () => localStorage.getItem('synapse_token'),
  setToken: (token) => localStorage.setItem('synapse_token', token),
  clearToken: () => localStorage.removeItem('synapse_token'),
  
  login: async (username, password) => {
    const params = new URLSearchParams();
    params.append('grant_type', 'password');
    params.append('client_id', 'synapse-frontend');
    params.append('username', username);
    params.append('password', password);

    const response = await fetch('http://localhost:8080/realms/synapse/protocol/openid-connect/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error_description || 'Authentication failed');
    }

    const data = await response.json();
    authService.setToken(data.access_token);
    return data.access_token;
  }
};

// --- API Service ---
const apiService = {
  getHeaders: () => {
    const token = authService.getToken();
    if (!token) {
        throw new Error("No authentication token found.");
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  },

  fetchModels: async () => {
    const response = await fetch('http://localhost:9000/api/models', {
      headers: apiService.getHeaders()
    });
    if (response.status === 401) {
        authService.clearToken();
        window.location.reload();
        throw new Error('Session expired. Please log in again.');
    }
    if (!response.ok) throw new Error('Failed to fetch models');
    return response.json();
  },
  
  createModel: async (modelData) => {
     const response = await fetch('http://localhost:9000/api/models', {
      method: 'POST',
      headers: apiService.getHeaders(),
      body: JSON.stringify(modelData)
    });
    if (!response.ok) throw new Error('Failed to create model');
    return response.json();
  }
};

// --- Zustand Store for State Management ---
const useStore = create((set, get) => ({
  isAuthenticated: !!authService.getToken(),
  user: { name: "Demo User" },
  models: [],
  activeModel: null,
  consoleLogs: [],
  
  login: async (username, password) => {
    get().addLog({ type: 'info', message: `Attempting to authenticate user: ${username}` });
    await authService.login(username, password);
    set({ isAuthenticated: true });
    get().addLog({ type: 'success', message: `User ${username} authenticated successfully.` });
    await get().loadModels();
  },
  logout: () => {
    authService.clearToken();
    set({ isAuthenticated: false, user: null, activeModel: null, models: [] });
    get().addLog({ type: 'info', message: 'User logged out.' });
  },
  loadModels: async () => {
    if (!get().isAuthenticated) return;
    try {
      get().addLog({ type: 'info', message: 'Fetching models from backend...' });
      const models = await apiService.fetchModels();
      set({ models });
      get().addLog({ type: 'success', message: `${models.length} model(s) loaded successfully.` });
    } catch (error) {
      get().addLog({ type: 'error', message: `Failed to load models: ${error.message}` });
       if (error.message.includes('Session expired')) {
           set({ isAuthenticated: false });
       }
    }
  },
  setActiveModel: (model) => set({ activeModel: model }),
  addLog: (log) => set((state) => ({ consoleLogs: [...state.consoleLogs, { timestamp: new Date().toISOString(), ...log }] })),
}));

// --- Main Application Components ---
function NavRail() {
  const { logout } = useStore();
  return (
    <div className="flex flex-col h-full p-2 bg-slate-800 text-white items-center justify-between">
      <div>
        <div className="p-2 mb-4">
          <BrainCircuit className="h-8 w-8 text-violet-400" />
        </div>
        <UiButton variant="ghost" size="icon" className="text-white hover:bg-slate-700 hover:text-violet-300"><File className="h-6 w-6" /></UiButton>
        <UiButton variant="ghost" size="icon" className="text-white hover:bg-slate-700 hover:text-violet-300"><BarChart2 className="h-6 w-6" /></UiButton>
        <UiButton variant="ghost" size="icon" className="text-white hover:bg-slate-700 hover:text-violet-300"><Terminal className="h-6 w-6" /></UiButton>
      </div>
      <div>
        <UiButton onClick={logout} variant="ghost" size="icon" className="text-white hover:bg-slate-700 hover:text-red-400"><LogOut className="h-6 w-6" /></UiButton>
      </div>
    </div>
  );
}

function FileExplorer() {
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
          <div key={model.id} onClick={() => handleModelSelect(model)}
            className="flex items-center p-2 rounded-lg cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
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
}

function ModelEditor() {
    const { activeModel } = useStore();
    if (!activeModel) {
        return <div className="flex items-center justify-center h-full bg-slate-100 dark:bg-slate-950 text-slate-500">Select a model to view its details</div>;
    }
    const placeholderChartData = [ { name: 'Jan', value: 400 }, { name: 'Feb', value: 300 }, { name: 'Mar', value: 600 }, { name: 'Apr', value: 450 } ];
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
                <div className="mb-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Model Details</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400"><strong>ID:</strong> {activeModel.id}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400"><strong>Owner:</strong> {activeModel.owner}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400"><strong>Last Modified:</strong> {new Date(activeModel.lastModified).toLocaleString()}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400"><strong>Content:</strong> {activeModel.content}</p>
                </div>
                 <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Performance Chart (Placeholder)</h3>
                    <div style={{width: '100%', height: 300}}>
                        <ResponsiveContainer>
                            <LineChart data={placeholderChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="name" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" />
                                <RechartsTooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                                <Line type="monotone" dataKey="value" stroke="#8b5cf6" activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Console() {
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
        default: return 'text-slate-400';
    }
  }
  return (
    <div ref={consoleRef} className="h-full bg-black font-mono text-sm p-4 overflow-y-auto">
      <div className="text-green-400 mb-2">Welcome to Synapse Console.</div>
      {consoleLogs.map((log, i) => (
        <div key={i} className="flex">
          <span className="text-slate-600 mr-2">{new Date(log.timestamp).toLocaleTimeString()}</span>
          <span className={`${getLogColor(log.type)} mr-2`}>[{log.type.toUpperCase()}]</span>
          <span className="text-slate-300">{log.message}</span>
        </div>
      ))}
    </div>
  );
}

function LoginScreen() {
  const { login } = useStore();
  const [username, setUsername] = useState('testuser');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(username, password);
    } catch (err) {
       setError('Login failed. Check console for details.');
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
              <p className="font-mono text-slate-200">{username}</p>
          </div>
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          <UiButton type="submit" className="w-full bg-violet-600 hover:bg-violet-700" disabled={isLoading}>
            {isLoading ? 'Logging in...' : <><User className="h-4 w-4 mr-2"/> Login</>}
          </UiButton>
        </form>
      </div>
    </div>
  );
}

// Simple flexbox layout to replace ResizablePanels
function MainLayout({ children }) {
    const [nav, fileExplorer, mainContent] = React.Children.toArray(children);
    return (
        <div className="h-screen w-screen bg-slate-900 text-slate-50 flex overflow-hidden">
            <div>{nav}</div>
            <div className="w-[20%] min-w-[250px] border-r border-slate-700">{fileExplorer}</div>
            <div className="flex-1">{mainContent}</div>
        </div>
    );
}

function MainContentLayout({ children }) {
    const [editor, console] = React.Children.toArray(children);
    return (
        <div className="flex flex-col h-full">
            <div className="h-[75%]">{editor}</div>
            <div className="flex-1 border-t border-slate-700">{console}</div>
        </div>
    );
}

export default function App() {
  const { isAuthenticated, loadModels, addLog } = useStore();

  useEffect(() => {
    // This effect runs only once on initial mount
    addLog({ type: 'info', message: 'Synapse UI Initialized.' });
    if (isAuthenticated) {
      loadModels();
    }
  }, []); // Empty dependency array ensures it runs only once

  const { isAuthenticated: isAuthNow } = useStore();

  if (!isAuthNow) {
    return <LoginScreen />;
  }

  return (
    <MainLayout>
        <NavRail />
        <FileExplorer />
        <MainContentLayout>
            <ModelEditor />
            <Console />
        </MainContentLayout>
    </MainLayout>
  );
}
