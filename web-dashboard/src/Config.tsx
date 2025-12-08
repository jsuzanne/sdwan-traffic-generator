import React, { useEffect, useState } from 'react';
import { Save, Plus, Trash2, Network, Sliders } from 'lucide-react';

interface AppConfig {
    domain: string;
    weight: number;
    endpoint: string;
}

export default function Config() {
    const [apps, setApps] = useState<AppConfig[]>([]);
    const [interfaces, setInterfaces] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        Promise.all([
            fetch('/api/config/apps').then(r => r.json()),
            fetch('/api/config/interfaces').then(r => r.json())
        ]).then(([appsData, ifaceData]) => {
            setApps(appsData);
            setInterfaces(ifaceData);
            setLoading(false);
        });
    }, []);

    const handleWeightChange = async (domain: string, weight: number) => {
        // Update local state immediately for smooth UI
        setApps(apps.map(app => app.domain === domain ? { ...app, weight } : app));
    };

    const saveAppWeight = async (domain: string, weight: number) => {
        try {
            await fetch('/api/config/apps', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain, weight })
            });
        } catch (e) {
            console.error('Save failed');
        }
    };

    const addInterface = () => setInterfaces([...interfaces, 'eth0']);
    const removeInterface = (idx: number) => setInterfaces(interfaces.filter((_, i) => i !== idx));
    const updateInterface = (idx: number, val: string) => {
        const newIfaces = [...interfaces];
        newIfaces[idx] = val;
        setInterfaces(newIfaces);
    };

    const saveInterfaces = async () => {
        setSaving(true);
        try {
            await fetch('/api/config/interfaces', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ interfaces })
            });
            // Maybe show toast?
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-slate-400">Loading config...</div>;

    return (
        <div className="space-y-8">

            {/* Network Config */}
            <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><Network /></div>
                        <div>
                            <h2 className="text-xl font-semibold text-slate-100">Network Interfaces</h2>
                            <p className="text-sm text-slate-400">Traffic will be load-balanced across these interfaces</p>
                        </div>
                    </div>
                    <button
                        onClick={saveInterfaces}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg flex items-center gap-2 font-medium transition-colors"
                    >
                        {saving ? 'Saving...' : <><Save size={18} /> Save Interfaces</>}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {interfaces.map((iface, idx) => (
                        <div key={idx} className="flex gap-2">
                            <input
                                value={iface}
                                onChange={(e) => updateInterface(idx, e.target.value)}
                                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 focus:border-blue-500 outline-none"
                            />
                            <button onClick={() => removeInterface(idx)} className="p-2 text-slate-400 hover:text-red-400">
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))}
                    <button onClick={addInterface} className="flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-slate-700 rounded-lg text-slate-400 hover:text-blue-400 hover:border-blue-500/50 transition-colors">
                        <Plus size={18} /> Add Interface
                    </button>
                </div>
            </section>

            {/* App Weights */}
            <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400"><Sliders /></div>
                    <div>
                        <h2 className="text-xl font-semibold text-slate-100">Application Distribution</h2>
                        <p className="text-sm text-slate-400">Adjust the relative weight of traffic for each application</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {apps.map((app) => (
                        <div key={app.domain} className="group">
                            <div className="flex justify-between mb-2">
                                <span className="font-medium text-slate-200">{app.domain}</span>
                                <span className="text-slate-400">{app.weight}</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="200"
                                value={app.weight}
                                onChange={(e) => handleWeightChange(app.domain, parseInt(e.target.value))}
                                onMouseUp={(e) => saveAppWeight(app.domain, parseInt(e.currentTarget.value))}
                                onTouchEnd={(e) => saveAppWeight(app.domain, parseInt(e.currentTarget.value))}
                                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
