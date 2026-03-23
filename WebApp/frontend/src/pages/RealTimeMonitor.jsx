import React, { useEffect, useRef, useState } from 'react';
import {
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart
} from 'recharts';
import {
    Plug,
    Activity,
    Trash,
    Pause,
    Play,
    Shield,
    AlertTriangle,
    ShieldAlert
} from 'lucide-react';

const DEFAULT_WS_URL = 'ws://localhost:8000/ws/iiot-live';

export default function RealTimeMonitor() {
    const [chartData, setChartData] = useState([]);
    const [stats, setStats] = useState({
        packetsProcessed: 0,
        threatsDetected: 0,
        currentThreatLevel: 0
    });
    const [attackLog, setAttackLog] = useState([]);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const [wsUrl, setWsUrl] = useState(DEFAULT_WS_URL);
    const [isPaused, setIsPaused] = useState(false);

    const wsRef = useRef(null);
    const logContainerRef = useRef(null);
    const isPausedRef = useRef(false);
    const pendingChartDataRef = useRef([]);
    const pendingAttackLogRef = useRef([]);

    const isConnected = connectionStatus === 'connected';

    const pushChartPoint = (point) => {
        setChartData((prev) => [...prev, point].slice(-30));
    };

    const pushAttackLog = (entry) => {
        setAttackLog((prev) => [entry, ...prev].slice(0, 50));
    };

    const flushPausedBuffers = () => {
        if (pendingChartDataRef.current.length > 0) {
            const queuedPoints = [...pendingChartDataRef.current];
            pendingChartDataRef.current = [];
            setChartData((prev) => [...prev, ...queuedPoints].slice(-30));
        }

        if (pendingAttackLogRef.current.length > 0) {
            const queuedLogs = [...pendingAttackLogRef.current].reverse();
            pendingAttackLogRef.current = [];
            setAttackLog((prev) => [...queuedLogs, ...prev].slice(0, 50));
        }
    };

    const disconnectWebSocket = () => {
        if (!wsRef.current) {
            setConnectionStatus('disconnected');
            return;
        }

        wsRef.current.close();
    };

    const handleConnect = () => {
        if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
            return;
        }

        try {
            setConnectionStatus('connecting');

            const socket = new WebSocket(wsUrl);
            wsRef.current = socket;

            socket.onopen = () => {
                setConnectionStatus('connected');
            };

            socket.onmessage = (event) => {
                const data = JSON.parse(event.data);

                const chartPoint = {
                    time: new Date(data.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                    }),
                    threat_score: data.threat_score * 100,
                    status: data.status
                };

                setStats((prev) => ({
                    packetsProcessed: prev.packetsProcessed + 1,
                    threatsDetected: data.status === 'Attack' ? prev.threatsDetected + 1 : prev.threatsDetected,
                    currentThreatLevel: data.threat_score * 100
                }));

                if (isPausedRef.current) {
                    pendingChartDataRef.current.push(chartPoint);
                } else {
                    pushChartPoint(chartPoint);
                }

                if (data.status === 'Attack') {
                    const logEntry = {
                        id: Date.now() + Math.random(),
                        timestamp: new Date(data.timestamp).toLocaleTimeString(),
                        source_ip: data.source_ip,
                        protocol: data.protocol,
                        threat_score: data.threat_score
                    };

                    if (isPausedRef.current) {
                        pendingAttackLogRef.current.push(logEntry);
                    } else {
                        pushAttackLog(logEntry);
                    }
                }
            };

            socket.onerror = () => {
                setConnectionStatus('error');
            };

            socket.onclose = () => {
                wsRef.current = null;
                setConnectionStatus((prev) => (prev === 'error' ? 'error' : 'disconnected'));
            };
        } catch {
            setConnectionStatus('error');
        }
    };

    const handleDisconnect = () => {
        disconnectWebSocket();
    };

    const handleClearLogs = () => {
        setAttackLog([]);
        pendingAttackLogRef.current = [];
    };

    const handleTogglePause = () => {
        setIsPaused((prev) => !prev);
    };

    useEffect(() => {
        isPausedRef.current = isPaused;

        if (!isPaused) {
            flushPausedBuffers();
        }
    }, [isPaused]);

    useEffect(() => {
        if (!isPaused && logContainerRef.current) {
            logContainerRef.current.scrollTop = 0;
        }
    }, [attackLog, isPaused]);

    useEffect(() => {
        return () => {
            pendingChartDataRef.current = [];
            pendingAttackLogRef.current = [];
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, []);

    const getThreatLevelStatus = (score) => {
        if (score >= 80) return { label: 'CRITICAL', color: 'text-rose-500', icon: <ShieldAlert className="text-rose-500" size={22} /> };
        if (score >= 50) return { label: 'ELEVATED', color: 'text-cyan-500', icon: <AlertTriangle className="text-cyan-500" size={22} /> };
        return { label: 'NORMAL', color: 'text-emerald-500', icon: <Shield className="text-emerald-500" size={22} /> };
    };

    const getConnectionBadge = () => {
        if (connectionStatus === 'connected') {
            return (
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <Activity className="h-4 w-4" />
                    Connected - Live
                </span>
            );
        }

        if (connectionStatus === 'connecting') {
            return (
                <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-sm font-medium text-amber-300">
                    <span className="h-2 w-2 rounded-full bg-orange-400" />
                    Connecting...
                </span>
            );
        }

        if (connectionStatus === 'error') {
            return (
                <span className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-sm font-medium text-rose-400">
                    <span className="h-2 w-2 rounded-full bg-rose-400" />
                    Connection Error
                </span>
            );
        }

        return (
            <span className="inline-flex items-center gap-2 rounded-full border border-rose-500/20 bg-slate-800 px-3 py-1 text-sm font-medium text-rose-300">
                <span className="h-2 w-2 rounded-full bg-slate-400" />
                Disconnected
            </span>
        );
    };

    const status = getThreatLevelStatus(stats.currentThreatLevel);

    return (
        <div className="flex flex-col gap-8">
            <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg flex flex-col gap-8">
                <header className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold text-white">Moniteur Temps Réel</h1>
                    <p className="text-slate-400 mt-1">Analyse des flux IIoT en direct.</p>
                </header>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-4 flex-wrap">
                    <input
                        type="text"
                        value={wsUrl}
                        onChange={(event) => setWsUrl(event.target.value)}
                        className="bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:border-cyan-500 outline-none w-96"
                        placeholder="WebSocket URL"
                        disabled={connectionStatus === 'connecting'}
                    />

                    <button
                        type="button"
                        onClick={handleConnect}
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-white font-medium hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isConnected || connectionStatus === 'connecting'}
                    >
                        <Plug className="h-4 w-4" />
                        Connect
                    </button>

                    {isConnected && (
                        <button
                            type="button"
                            onClick={handleDisconnect}
                            className="inline-flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2 text-white font-medium hover:bg-rose-400 transition-colors"
                        >
                            <Plug className="h-4 w-4" />
                            Disconnect
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={handleTogglePause}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-slate-200 font-medium hover:border-cyan-500 transition-colors"
                    >
                        {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                        {isPaused ? 'Resume Display' : 'Pause Display'}
                    </button>

                    <div className="ml-auto">{getConnectionBadge()}</div>
                </div>

                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <section className="bg-slate-950/70 border border-slate-800 rounded-xl p-6 shadow-lg flex flex-col gap-4 justify-center">
                        <h3 className="text-slate-400 text-sm font-medium">Paquets Analysés</h3>
                        <p className="text-3xl font-bold text-white mt-2">{stats.packetsProcessed.toLocaleString()}</p>
                    </section>

                    <section className="bg-slate-950/70 border border-slate-800 rounded-xl p-6 shadow-lg flex flex-col gap-4 justify-center">
                        <h3 className="text-slate-400 text-sm font-medium">Menaces Bloquées</h3>
                        <p className="text-3xl font-bold text-rose-500 mt-2">{stats.threatsDetected.toLocaleString()}</p>
                    </section>

                    <section className="bg-slate-950/70 border border-slate-800 rounded-xl p-6 shadow-lg flex flex-col gap-4 justify-center">
                        <h3 className="text-slate-400 text-sm font-medium">Statut Système</h3>
                        <div className="flex items-center gap-3 mt-2">
                            {status.icon}
                            <p className={`text-xl font-bold ${status.color}`}>{status.label}</p>
                        </div>
                    </section>
                </section>

                <section className="bg-slate-950/70 border border-slate-800 rounded-xl p-6 shadow-lg flex flex-col gap-4">
                    <h2 className="text-xl font-semibold text-white mb-6">Niveau de Menace</h2>
                    <div className="w-full h-[400px] min-h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorThreat" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="time" axisLine={false} tickLine={false} minTickGap={30} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '0.75rem', color: '#f1f5f9' }}
                                    labelStyle={{ color: '#f8fafc' }}
                                />
                                <Area type="monotone" dataKey="threat_score" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#colorThreat)" animationDuration={450} />
                                <Line type="monotone" dataKey={() => 80} stroke="#f43f5e" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </section>

                <section className="bg-slate-950/70 border border-slate-800 rounded-xl p-6 shadow-lg flex flex-col gap-4">
                    <div className="flex items-center justify-between gap-3 mb-2">
                        <h2 className="text-xl font-semibold text-white">Log Terminal</h2>
                        <button
                            type="button"
                            onClick={handleClearLogs}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 text-sm font-medium hover:border-rose-500 hover:text-rose-400 transition-colors"
                        >
                            <Trash className="h-4 w-4" />
                            Clear Logs
                        </button>
                    </div>

                    <div className="w-full max-h-[360px] overflow-y-auto bg-black/50 border border-slate-800 rounded-lg p-4 font-mono text-sm" ref={logContainerRef}>
                        {attackLog.length === 0 ? (
                            <div className="text-slate-400">Aucune alerte détectée pour le moment.</div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-slate-400 border-b border-slate-700">
                                        <th className="py-2 pr-4 font-medium">Heure</th>
                                        <th className="py-2 pr-4 font-medium">Statut</th>
                                        <th className="py-2 pr-4 font-medium">IP Source</th>
                                        <th className="py-2 pr-4 font-medium">Protocole</th>
                                        <th className="py-2 font-medium">Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attackLog.map((log) => (
                                        <tr key={log.id} className="border-b border-slate-800/60 text-slate-200">
                                            <td className="py-2 pr-4 text-slate-400">{log.timestamp}</td>
                                            <td className="py-2 pr-4 text-rose-400">ATTACK</td>
                                            <td className="py-2 pr-4 text-cyan-400">{log.source_ip}</td>
                                            <td className="py-2 pr-4 text-emerald-400">{log.protocol}</td>
                                            <td className="py-2 text-rose-400">{(log.threat_score * 100).toFixed(1)}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </section>
            </section>
        </div>
    );
}
