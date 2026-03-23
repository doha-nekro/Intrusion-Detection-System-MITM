import React, { useState, useEffect, useRef } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import {
    Activity, Shield, AlertTriangle, Wifi, Clock, Server, Zap
} from 'lucide-react';

const LiveMonitor = () => {
    const [chartData, setChartData] = useState([]);
    const [stats, setStats] = useState({
        packetsScanned: 0,
        threatsBlocked: 0,
        currentStatus: 'SAFE'
    });
    const [alerts, setAlerts] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);

    // WebSocket connection
    useEffect(() => {
        const connectWebSocket = () => {
            try {
                wsRef.current = new WebSocket('ws://localhost:8000/ws/live');

                wsRef.current.onopen = () => {
                    console.log('✅ WebSocket connected');
                    setIsConnected(true);
                };

                wsRef.current.onmessage = (event) => {
                    const data = JSON.parse(event.data);

                    // Update chart data (keep last 60 points)
                    setChartData(prev => {
                        const newData = [...prev, {
                            time: new Date(data.timestamp).toLocaleTimeString(),
                            probability: data.probability * 100,
                            status: data.status
                        }];
                        return newData.slice(-60);
                    });

                    // Update stats
                    setStats(prev => ({
                        packetsScanned: prev.packetsScanned + 1,
                        threatsBlocked: data.status === 'ATTACK' ? prev.threatsBlocked + 1 : prev.threatsBlocked,
                        currentStatus: data.status === 'ATTACK' ? 'DANGER' : 'SAFE'
                    }));

                    // Add to alerts if attack
                    if (data.status === 'ATTACK') {
                        setAlerts(prev => [{
                            id: Date.now(),
                            timestamp: data.timestamp,
                            src_ip: data.src_ip,
                            probability: data.probability,
                            protocol: data.protocol,
                            port: data.port
                        }, ...prev].slice(0, 5));
                    }
                };

                wsRef.current.onclose = () => {
                    console.log('❌ WebSocket disconnected');
                    setIsConnected(false);
                    // Attempt reconnect after 3 seconds
                    reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000);
                };

                wsRef.current.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    setIsConnected(false);
                };
            } catch (error) {
                console.error('Failed to connect:', error);
                setIsConnected(false);
            }
        };

        connectWebSocket();

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
    }, []);

    // Custom tooltip for chart
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-slate-800 border border-cyan-500/30 rounded-lg p-3 shadow-xl">
                    <p className="text-slate-400 text-xs mb-1">{data.time}</p>
                    <p className={`font-bold ${data.probability > 80 ? 'text-red-400' : 'text-cyan-400'}`}>
                        Threat Level: {data.probability.toFixed(1)}%
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="p-6 space-y-6">
            {/* Connection Status Banner */}
            <div className={`flex items-center justify-center space-x-2 py-2 rounded-lg ${isConnected
                    ? 'bg-green-500/10 border border-green-500/30'
                    : 'bg-red-500/10 border border-red-500/30'
                }`}>
                <Wifi className={`h-4 w-4 ${isConnected ? 'text-green-400' : 'text-red-400'}`} />
                <span className={`text-sm ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                    {isConnected ? 'Connected to Security Server' : 'Connecting to Security Server...'}
                </span>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Packets Scanned */}
                <div className="cyber-card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm uppercase tracking-wide">Packets Scanned</p>
                            <p className="text-3xl font-bold text-white mt-2">
                                {stats.packetsScanned.toLocaleString()}
                            </p>
                        </div>
                        <div className="p-3 bg-cyan-500/10 rounded-xl">
                            <Server className="h-8 w-8 text-cyan-400" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center space-x-2">
                        <Zap className="h-4 w-4 text-cyan-400" />
                        <span className="text-xs text-slate-400">Real-time processing</span>
                    </div>
                </div>

                {/* Threats Blocked */}
                <div className="cyber-card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm uppercase tracking-wide">Threats Blocked</p>
                            <p className="text-3xl font-bold text-red-400 mt-2">
                                {stats.threatsBlocked.toLocaleString()}
                            </p>
                        </div>
                        <div className="p-3 bg-red-500/10 rounded-xl">
                            <Shield className="h-8 w-8 text-red-400" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-400" />
                        <span className="text-xs text-slate-400">Malicious activity prevented</span>
                    </div>
                </div>

                {/* Current Status */}
                <div className={`cyber-card p-6 ${stats.currentStatus === 'DANGER' ? 'glow-red' : 'glow-green'
                    }`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm uppercase tracking-wide">Current Status</p>
                            <p className={`text-3xl font-bold mt-2 ${stats.currentStatus === 'DANGER' ? 'text-red-400' : 'text-green-400'
                                }`}>
                                {stats.currentStatus}
                            </p>
                        </div>
                        <div className={`p-3 rounded-xl ${stats.currentStatus === 'DANGER' ? 'bg-red-500/10' : 'bg-green-500/10'
                            }`}>
                            <Activity className={`h-8 w-8 ${stats.currentStatus === 'DANGER' ? 'text-red-400' : 'text-green-400'
                                }`} />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center space-x-2">
                        <div className={`h-2 w-2 rounded-full ${stats.currentStatus === 'DANGER' ? 'bg-red-400 animate-pulse' : 'bg-green-400 animate-pulse'
                            }`}></div>
                        <span className="text-xs text-slate-400">System monitoring active</span>
                    </div>
                </div>
            </div>

            {/* Threat Level Chart */}
            <div className="cyber-card p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-semibold text-white">Threat Level Monitor</h2>
                        <p className="text-sm text-slate-400">Real-time network threat analysis</p>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-slate-400">
                        <Clock className="h-4 w-4" />
                        <span>Last 60 seconds</span>
                    </div>
                </div>

                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="threatGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="dangerGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ff3366" stopOpacity={0.5} />
                                    <stop offset="95%" stopColor="#ff3366" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis
                                dataKey="time"
                                stroke="#64748b"
                                tick={{ fill: '#64748b', fontSize: 10 }}
                                axisLine={{ stroke: '#334155' }}
                            />
                            <YAxis
                                stroke="#64748b"
                                tick={{ fill: '#64748b', fontSize: 10 }}
                                axisLine={{ stroke: '#334155' }}
                                domain={[0, 100]}
                                tickFormatter={(value) => `${value}%`}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="probability"
                                stroke="#00d4ff"
                                strokeWidth={2}
                                fill="url(#threatGradient)"
                                dot={false}
                                activeDot={{ r: 4, fill: '#00d4ff', stroke: '#fff' }}
                            />
                            {/* Danger threshold line */}
                            <Line
                                type="monotone"
                                dataKey={() => 80}
                                stroke="#ff3366"
                                strokeWidth={1}
                                strokeDasharray="5 5"
                                dot={false}
                                name="Danger Threshold"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Threshold Legend */}
                <div className="mt-4 flex items-center justify-center space-x-6 text-xs">
                    <div className="flex items-center space-x-2">
                        <div className="w-4 h-0.5 bg-cyan-400"></div>
                        <span className="text-slate-400">Threat Level</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-4 h-0.5 bg-red-400 border-dashed"></div>
                        <span className="text-slate-400">Danger Threshold (80%)</span>
                    </div>
                </div>
            </div>

            {/* Recent Alerts Table */}
            <div className="cyber-card p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-semibold text-white">Recent Threat Alerts</h2>
                        <p className="text-sm text-slate-400">Last 5 detected intrusion attempts</p>
                    </div>
                    <div className="px-3 py-1 bg-red-500/10 rounded-full">
                        <span className="text-xs text-red-400 font-medium">{alerts.length} Alerts</span>
                    </div>
                </div>

                {alerts.length === 0 ? (
                    <div className="text-center py-12">
                        <Shield className="h-12 w-12 text-green-400 mx-auto mb-4" />
                        <p className="text-slate-400">No threats detected yet</p>
                        <p className="text-xs text-slate-500 mt-2">System is monitoring for intrusions</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="cyber-table">
                            <thead>
                                <tr>
                                    <th>Timestamp</th>
                                    <th>Source IP</th>
                                    <th>Protocol</th>
                                    <th>Port</th>
                                    <th>Threat Level</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {alerts.map((alert) => (
                                    <tr key={alert.id} className="animate-pulse-once">
                                        <td className="text-slate-300 font-mono text-xs">
                                            {new Date(alert.timestamp).toLocaleTimeString()}
                                        </td>
                                        <td className="text-cyan-400 font-mono">{alert.src_ip}</td>
                                        <td className="text-slate-300">{alert.protocol}</td>
                                        <td className="text-slate-300 font-mono">{alert.port}</td>
                                        <td>
                                            <div className="flex items-center space-x-2">
                                                <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full"
                                                        style={{ width: `${alert.probability * 100}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-red-400 text-xs font-medium">
                                                    {(alert.probability * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded-full">
                                                BLOCKED
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LiveMonitor;
