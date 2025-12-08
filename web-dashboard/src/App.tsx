import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Server, AlertCircle, LayoutDashboard, Settings } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Config from './Config';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

// Types
interface Stats {
  timestamp: number;
  total_requests: number;
  requests_by_app: Record<string, number>;
  errors_by_app: Record<string, number>;
}



export default function App() {
  const [view, setView] = useState<'dashboard' | 'config'>('dashboard');
  const [stats, setStats] = useState<Stats | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [status, setStatus] = useState<'running' | 'stopped' | 'unknown'>('unknown');
  const [logs, setLogs] = useState<string[]>([]);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      if (data.timestamp) {
        setStats(data);
        setHistory(prev => {
          const newEntry = {
            time: new Date(data.timestamp * 1000).toLocaleTimeString(),
            requests: data.total_requests,
            ...data.requests_by_app
          };
          // Keep last 20 points
          const newHistory = [...prev, newEntry];
          if (newHistory.length > 20) newHistory.shift();
          return newHistory;
        });
      }
    } catch (e) {
      console.error('Failed to fetch stats');
    }
  };

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      setStatus(data.status);
    } catch (e) {
      setStatus('unknown');
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/logs');
      const data = await res.json();
      if (data.logs) setLogs(data.logs);
    } catch (e) {
      console.error("Failed to fetch logs");
    }
  }

  useEffect(() => {
    // Initial fetch
    fetchStats();
    fetchStatus();
    fetchLogs();

    // Poll every 2s
    const interval = setInterval(() => {
      fetchStats();
      fetchLogs();
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const totalErrors = stats ? Object.values(stats.errors_by_app).reduce((a, b) => a + b, 0) : 0;
  const successRate = stats ? ((stats.total_requests - totalErrors) / stats.total_requests * 100).toFixed(1) : '100';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            SD-WAN Traffic Generator
          </h1>
          <p className="text-slate-400 mt-1">Real-time Control Center</p>
        </div>

        <div className="flex gap-4">
          {/* Status Indicator */}
          <div className={cn(
            "px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 h-10 border",
            status === 'running' ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
          )}>
            <div className={cn("w-2 h-2 rounded-full", status === 'running' ? "bg-green-400 animate-pulse" : "bg-red-400")} />
            {status.toUpperCase()}
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="flex gap-2 mb-8 border-b border-slate-800">
        <button
          onClick={() => setView('dashboard')}
          className={cn(
            "px-4 py-3 flex items-center gap-2 font-medium border-b-2 transition-colors",
            view === 'dashboard' ? "border-blue-500 text-blue-400" : "border-transparent text-slate-400 hover:text-slate-200"
          )}
        >
          <LayoutDashboard size={18} /> Dashboard
        </button>
        <button
          onClick={() => setView('config')}
          className={cn(
            "px-4 py-3 flex items-center gap-2 font-medium border-b-2 transition-colors",
            view === 'config' ? "border-blue-500 text-blue-400" : "border-transparent text-slate-400 hover:text-slate-200"
          )}
        >
          <Settings size={18} /> Configuration
        </button>
      </div>

      {view === 'dashboard' ? (
        <>
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card title="Total Requests" value={stats?.total_requests || 0} icon={<Activity />} />
            <Card title="Success Rate" value={`${successRate}%`} icon={<Server />} subValue={`${totalErrors} Errors`} />
            <Card title="Active Apps" value={stats ? Object.keys(stats.requests_by_app).length : 0} icon={<AlertCircle />} />
          </div>

          {/* Main Chart */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 mb-8 backdrop-blur-sm">
            <h3 className="text-lg font-semibold mb-4 text-slate-200">Traffic Volume</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="time" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                  />
                  <Line type="monotone" dataKey="requests" stroke="#38bdf8" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Logs Terminal */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden font-mono text-sm leading-6">
            <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center gap-2 text-slate-400">
              <div className="w-3 h-3 rounded-full bg-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/50" />
              <span className="ml-2">Live Logs</span>
            </div>
            <div className="p-4 h-[300px] overflow-y-auto text-slate-300">
              {logs.map((log, i) => (
                <div key={i} className="border-b border-slate-900/50 py-1">
                  {log}
                </div>
              ))}
              {logs.length === 0 && <div className="text-slate-600 italic">Waiting for logs... (Make sure traffic logs exist)</div>}
            </div>
          </div>
        </>
      ) : (
        <Config />
      )}
    </div>
  );
}

function Card({ title, value, icon, subValue }: { title: string, value: string | number, icon: React.ReactNode, subValue?: string }) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform scale-150">
        {/* @ts-ignore */}
        {React.cloneElement(icon as React.ReactElement, { size: 48 })}
      </div>
      <div className="flex items-center gap-3 mb-2 text-slate-400">
        {icon}
        <span className="font-medium text-sm text-slate-400">{title}</span>
      </div>
      <div className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
        {value}
      </div>
      {subValue && (
        <div className="text-sm text-slate-500 mt-1">{subValue}</div>
      )}
    </div>
  );
}
