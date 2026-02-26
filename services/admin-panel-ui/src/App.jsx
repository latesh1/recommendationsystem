import React, { useState, useEffect, useRef } from 'react';
import { Settings, BarChart3, Activity, Zap, RefreshCw, Layers, User, Play, Star, CheckCircle2, ChevronDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const mockAnalytics = [
    { name: '10:00', ctr: 0.12, wtime: 45 },
    { name: '10:05', ctr: 0.15, wtime: 52 },
    { name: '10:10', ctr: 0.14, wtime: 48 },
    { name: '10:15', ctr: 0.18, wtime: 65 },
    { name: '10:20', ctr: 0.22, wtime: 72 },
];

const TEST_USERS = [
    { id: '699fc111a2ca0a32d218f3b1', name: 'testuser1', icon: '👤' },
    { id: '699fc222a2ca0a32d218f3b2', name: 'testuser2', icon: '👤' },
    { id: '699fc58710d2c9880ccc9c70', name: 'testuser3', icon: '👤' },
];

export default function App() {
    const [configs, setConfigs] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [favorites, setFavorites] = useState(new Set());
    const [subscriptions, setSubscriptions] = useState(new Set());
    const [syncing, setSyncing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('feed'); // 'feed', 'analytics' or 'algorithm'
    const [selectedUserId, setSelectedUserId] = useState(TEST_USERS[2].id); // default testuser3
    const [notification, setNotification] = useState(null);
    const debounceTimers = useRef({});

    useEffect(() => {
        fetchConfigs();
    }, []);

    useEffect(() => {
        fetchRecommendations();
    }, [selectedUserId]);

    const showNotification = (message) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 3000);
    };

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

    const fetchRecommendations = async () => {
        setSyncing(true);
        try {
            const res = await fetch(`/api/recommendations/${selectedUserId}`, {
                headers: {
                    'x-api-key': 'master-saas-key-2026',
                    'x-tenant-id': 'super-admin-master'
                }
            });
            const data = await res.json();
            setRecommendations(data || []);
            setTimeout(() => setSyncing(false), 500);
        } catch (err) {
            console.error('Failed to fetch recommendations', err);
            setSyncing(false);
        }
    };

    const handleInteraction = async (streamId, type) => {
        try {
            await fetch('/api/interactions/track', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': 'master-saas-key-2026',
                    'x-tenant-id': 'super-admin-master'
                },
                body: JSON.stringify({
                    userId: selectedUserId,
                    streamId: streamId,
                    type: type, // CLICK or LIKE
                    timestamp: new Date().toISOString()
                })
            });

            if (type === 'LIKE') {
                setFavorites(prev => {
                    const next = new Set(prev);
                    if (next.has(streamId)) {
                        next.delete(streamId);
                        showNotification('Removed from favorites');
                    } else {
                        next.add(streamId);
                        showNotification('Added to favorites!');
                    }
                    return next;
                });
            } else if (type === 'CLICK') {
                setSubscriptions(prev => {
                    const next = new Set(prev);
                    if (next.has(streamId)) {
                        next.delete(streamId);
                        showNotification('Unsubscribed successfully');
                    } else {
                        next.add(streamId);
                        showNotification('Subscribed successfully!');
                    }
                    return next;
                });
            }
        } catch (err) {
            console.error('Failed to track interaction', err);
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
                // Refetch recommendations when weights change
                fetchRecommendations();
            } catch (err) {
                console.error('Update failed', err);
            }
        }, 2000); // 2 second debounce for weight changes
    };

    if (loading && configs.length === 0) {
        return <div style={{ background: '#090910', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>Loading RecEngine...</div>;
    }

    const currentUser = TEST_USERS.find(u => u.id === selectedUserId);

    return (
        <div className="dashboard-container">
            {notification && (
                <div style={{
                    position: 'fixed',
                    bottom: '2rem',
                    right: '2rem',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--accent-primary)',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '12px',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
                    zIndex: 1000,
                    animation: 'slideUp 0.3s ease'
                }}>
                    <CheckCircle2 size={18} color="#10b981" />
                    {notification}
                </div>
            )}

            <aside className="sidebar">
                <h2 className="gradient-text" style={{ marginBottom: '2rem' }}>RecEngine</h2>
                <nav>
                    <div
                        onClick={() => setActiveTab('feed')}
                        className={`nav-item ${activeTab === 'feed' ? 'active' : ''}`}
                    >
                        <Layers size={20} /> <span>Personalized Feed</span>
                    </div>
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
                        <Settings size={20} /> <span style={{ transition: 'all 0.3s ease' }}>Algorithm Tuning</span>
                    </div>
                </nav>
            </aside>

            <main className="main-content">
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h1>
                            {activeTab === 'feed' ? "User Experience Preview" :
                                activeTab === 'analytics' ? 'System Performance' : 'Algorithm Tuning'}
                        </h1>
                        <p style={{ color: 'var(--text-muted)' }}>
                            {activeTab === 'feed' ? 'Live preview of "Recommended for You" results' :
                                activeTab === 'analytics' ? 'Real-time recommendation performance analytics' :
                                    'Configure recommendation weights and parameters'}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        {activeTab === 'feed' && (
                            <div className="user-switcher" style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '4px 12px', gap: '8px' }}>
                                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)' }}>ACTIVE USER:</span>
                                <select
                                    value={selectedUserId}
                                    onChange={(e) => setSelectedUserId(e.target.value)}
                                    style={{ background: 'transparent', border: 'none', color: 'white', fontWeight: 700, cursor: 'pointer', outline: 'none' }}
                                >
                                    {TEST_USERS.map(user => (
                                        <option key={user.id} value={user.id} style={{ background: 'var(--bg-card)', color: 'white' }}>{user.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <button
                            onClick={() => { fetchConfigs(); fetchRecommendations(); }}
                            className={`btn-primary ${syncing ? 'syncing-anim' : ''}`}
                            disabled={syncing}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: syncing ? 0.7 : 1 }}
                        >
                            <RefreshCw size={18} className={syncing ? 'rotate-anim' : ''} />
                            {syncing ? 'Syncing...' : 'Refresh All'}
                        </button>
                    </div>
                </header>

                {activeTab === 'feed' && (
                    <section>
                        <div className="card" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid var(--accent-primary)', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '10px', borderRadius: '50%' }}>
                                <User size={24} color="var(--accent-primary)" />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Previewing as</div>
                                <div style={{ fontWeight: 700 }}>{currentUser?.name} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(UID: {selectedUserId.substring(0, 8)}...{selectedUserId.substring(selectedUserId.length - 2)})</span></div>
                            </div>
                            {syncing && (
                                <div style={{ position: 'absolute', bottom: 0, left: 0, height: '2px', background: 'var(--accent-primary)', width: '100%', animation: 'shimmer 1.5s infinite' }}></div>
                            )}
                        </div>

                        {recommendations.length === 0 ? (
                            <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
                                <Zap size={48} color="var(--border)" style={{ marginBottom: '1rem' }} />
                                <h3 style={{ color: 'var(--text-muted)' }}>No recommendations generated yet</h3>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Make sure streams are live and the engine is tuned.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem', opacity: syncing ? 0.5 : 1, transition: 'opacity 0.3s' }}>
                                {recommendations.map((item, idx) => (
                                    <div key={item.stream_id || idx} className="card" style={{ transition: 'all 0.3s ease', cursor: 'default', transform: syncing ? 'scale(0.98)' : 'scale(1)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                            <div style={{ background: 'var(--accent-primary)', color: 'white', padding: '4px 10px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800 }}>
                                                {item.category.toUpperCase()}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981', fontSize: '0.8rem', fontWeight: 700 }}>
                                                <Zap size={14} /> {(item.score * 100).toFixed(1)}% Match
                                            </div>
                                        </div>
                                        <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{item.title || `Recommended Stream #${idx + 1}`}</h4>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem', height: '3rem', overflow: 'hidden' }}>
                                            Suggested because of <span style={{ color: 'var(--accent-secondary)' }}>{item.reason.replace(/_/g, ' ')}</span>
                                        </p>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button
                                                onClick={() => handleInteraction(item.stream_id, 'CLICK')}
                                                className={subscriptions.has(item.stream_id) ? "btn-secondary" : "btn-primary"}
                                                style={{
                                                    flex: 1,
                                                    padding: '8px',
                                                    fontSize: '0.8rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '5px',
                                                    background: subscriptions.has(item.stream_id) ? '#27272a' : undefined,
                                                    border: subscriptions.has(item.stream_id) ? '1px solid var(--accent-primary)' : undefined,
                                                    color: subscriptions.has(item.stream_id) ? 'var(--accent-primary)' : 'white',
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                {subscriptions.has(item.stream_id) ? (
                                                    <><CheckCircle2 size={14} /> Subscribed</>
                                                ) : (
                                                    <><Zap size={14} fill="white" /> Subscribe</>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleInteraction(item.stream_id, 'LIKE')}
                                                style={{
                                                    background: favorites.has(item.stream_id) ? 'rgba(168, 85, 247, 0.1)' : '#27272a',
                                                    border: favorites.has(item.stream_id) ? '1px solid var(--accent-secondary)' : 'none',
                                                    color: favorites.has(item.stream_id) ? 'var(--accent-secondary)' : 'white',
                                                    padding: '8px',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                <Star size={16} fill={favorites.has(item.stream_id) ? "var(--accent-secondary)" : "none"} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}

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
