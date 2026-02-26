import React, { useState, useEffect, useRef } from 'react';
import { Settings, BarChart3, Activity, Zap, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const mockAnalytics = [
    { name: '10:00', ctr: 0.12, wtime: 45 },
    { name: '10:05', ctr: 0.15, wtime: 52 },
    { name: '10:10', ctr: 0.14, wtime: 48 },
    { name: '10:15', ctr: 0.18, wtime: 65 },
    { name: '10:20', ctr: 0.22, wtime: 72 },
];

export default function App() {
    const [configs, setConfigs] = useState([]);
    const [syncing, setSyncing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' or 'algorithm'
    const debounceTimers = useRef({});

    useEffect(() => {
        fetchConfigs();
    }, []);

    const fetchConfigs = async () => {
        setSyncing(true);
        try {
            const res = await fetch('/api/config', {
                headers: { 'x-api-key': 'master-saas-key-2026' }
            });
            const data = await res.json();
            setConfigs(data || []);

            setTimeout(() => {
                setSyncing(false);
                setLoading(false);
            }, 600);
        } catch (err) {
            console.error('Failed to fetch configs', err);
            setSyncing(false);
            setLoading(false);
        }
    };

    const chartData = React.useMemo(() => {
        if (configs.length === 0) return mockAnalytics;

        const weights = configs.reduce((acc, c) => ({ ...acc, [c.key]: c.value }), {});
        const eng = weights['engagement_weight'] || 0.3;
        const pers = weights['personalization_weight'] || 0.2;
        const watch = weights['watch_time_weight'] || 0.3;
        const explore = weights['exploration_rate'] || 0.15;

        return mockAnalytics.map((item, idx) => {
            const ctrImpact = (eng * 1.5) + (pers * 1.2);
            const variance = explore * 0.05 * (Math.sin(idx) + 1);

            return {
                ...item,
                ctr: parseFloat((item.ctr * ctrImpact + variance).toFixed(3)),
                wtime: Math.round(item.wtime * (0.5 + watch * 2)),
                ...(syncing && idx === mockAnalytics.length - 1 ? { ctr: item.ctr * 1.5 } : {})
            };
        });
    }, [configs, syncing]);

    const handleUpdateWeight = (key, value) => {
        setConfigs(prev => prev.map(c => c.key === key ? { ...c, value } : c));

        if (debounceTimers.current[key]) {
            clearTimeout(debounceTimers.current[key]);
        }

        debounceTimers.current[key] = setTimeout(async () => {
            try {
                await fetch(`/api/config/${key}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': 'master-saas-key-2026'
                    },
                    body: JSON.stringify({ value })
                });
            } catch (err) {
                console.error('Update failed', err);
            }
        }, 200);
    };

    if (loading && configs.length === 0) {
        return <div style={{ background: '#090910', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>Loading RecEngine...</div>;
    }

    return (
        <div className="dashboard-container">
            <aside className="sidebar">
                <h2 className="gradient-text" style={{ marginBottom: '2rem' }}>RecEngine</h2>
                <nav>
                    <div
                        onClick={() => setActiveTab('analytics')}
                        className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
                    >
                        <BarChart3 size={20} /> <span>Analytics</span>
                    </div>
                    <div
                        onClick={() => setActiveTab('algorithm')}
                        className={`nav-item ${activeTab === 'algorithm' ? 'active' : ''}`}
                    >
                        <Settings size={20} /> <span>Algorithm</span>
                    </div>
                </nav>
            </aside>

            <main className="main-content">
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h1>{activeTab === 'analytics' ? 'Dashboard Overview' : 'Algorithm Tuning'}</h1>
                        <p style={{ color: 'var(--text-muted)' }}>
                            {activeTab === 'analytics'
                                ? 'Real-time recommendation performance analytics'
                                : 'Configure recommendation weights and parameters'}
                        </p>
                    </div>
                    <button
                        onClick={fetchConfigs}
                        className={`btn-primary ${syncing ? 'syncing-anim' : ''}`}
                        disabled={syncing}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: syncing ? 0.7 : 1 }}
                    >
                        <RefreshCw size={18} className={syncing ? 'rotate-anim' : ''} />
                        {syncing ? 'Syncing...' : 'Sync Config'}
                    </button>
                </header>

                {activeTab === 'analytics' && (
                    <section className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3>System Performance Simulation</h3>
                            <div style={{ display: 'flex', gap: '15px', fontSize: '0.8rem' }}>
                                <span style={{ color: '#6366f1' }}>● CTR</span>
                                <span style={{ color: '#a855f7' }}>● Watch Time</span>
                            </div>
                        </div>
                        <div style={{ height: '400px', marginTop: '1.5rem' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorCtr" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorWtime" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" vertical={false} />
                                    <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#141417', border: '1px solid #27272a', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}
                                        itemStyle={{ fontSize: '0.85rem' }}
                                    />
                                    <Area type="monotone" dataKey="ctr" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorCtr)" animationDuration={500} isAnimationActive={false} />
                                    <Area type="monotone" dataKey="wtime" stroke="#a855f7" strokeWidth={2} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorWtime)" animationDuration={800} isAnimationActive={false} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </section>
                )}

                {activeTab === 'algorithm' && (
                    <section>
                        <div className="metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                            <div className="card" style={{ borderLeft: '4px solid #6366f1' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ESTIMATED CTR IMPACT</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#6366f1' }}>
                                    +{(configs.find(c => c.key === 'engagement_weight')?.value * 15 + configs.find(c => c.key === 'personalization_weight')?.value * 10 || 0).toFixed(1)}%
                                </div>
                            </div>
                            <div className="card" style={{ borderLeft: '4px solid #a855f7' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>DIVERSITY SCORE</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#a855f7' }}>
                                    {(configs.find(c => c.key === 'diversity_factor')?.value * 8.5 || 0).toFixed(1)}
                                </div>
                            </div>
                            <div className="card" style={{ borderLeft: '4px solid #10b981' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>EXPLORATION RATE</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981' }}>
                                    {(configs.find(c => c.key === 'exploration_rate')?.value * 100 || 0).toFixed(0)}%
                                </div>
                            </div>
                        </div>

                        {configs.length === 0 ? (
                            <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                <p>No algorithm configurations found for this tenant.</p>
                                <button onClick={fetchConfigs} className="btn-primary" style={{ marginTop: '1rem' }}>Retry Fetch</button>
                            </div>
                        ) : (
                            <div className="config-grid">
                                {configs.map(config => (
                                    <div key={config.key} className="card">
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ fontWeight: 600 }}>{config.key.replace(/_/g, ' ').toUpperCase()}</span>
                                            <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{config.value}</span>
                                        </div>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '5px 0' }}>{config.description}</p>
                                        <input
                                            type="range"
                                            min="0"
                                            max={config.key.includes('factor') ? "10" : "1"}
                                            step="0.01"
                                            value={config.value}
                                            onChange={(e) => handleUpdateWeight(config.key, parseFloat(e.target.value))}
                                            style={{ cursor: 'pointer', width: '100%', accentColor: 'var(--accent-primary)' }}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}

            </main>
        </div>
    );
}
