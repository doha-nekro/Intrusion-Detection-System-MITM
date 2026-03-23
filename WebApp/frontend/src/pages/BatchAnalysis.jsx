import React, { useState, useRef } from 'react';
import axios from 'axios';
import {
    Upload, FileText, AlertTriangle, CheckCircle,
    Loader2, Shield, BarChart3, FileWarning, Activity
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function BatchAnalysis() {
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.name.endsWith('.csv')) {
            setFile(droppedFile);
            setError(null);
            setResults(null);
        } else {
            setError('System requirement: CSV format only.');
        }
    };

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.name.endsWith('.csv')) {
            setFile(selectedFile);
            setError(null);
            setResults(null);
        } else {
            setError('System requirement: CSV format only.');
        }
    };

    const handleAnalyze = async () => {
        if (!file) return;

        setIsAnalyzing(true);
        setError(null);
        setResults(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('http://localhost:8000/analyze', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setResults(response.data);
        } catch (err) {
            setError(err.response?.data?.error || err.response?.data?.detail || 'Uplink failure: Backend service unreachable.');
            // Assuming setIsConnected is a state variable that needs to be set to false on error.
            // However, setIsConnected is not defined in the current component's state.
            // If it were defined, it would be used here.
            // For now, this line is commented out to avoid a 'not defined' error.
            // If you intend to add an 'isConnected' state, please define it using useState.
            // setIsConnected(false);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const getThreatLevelColor = (level) => {
        switch (level) {
            case 'CRITICAL': return 'text-rose-500';
            case 'HIGH': return 'text-cyan-500';
            case 'MEDIUM': return 'text-cyan-500';
            case 'LOW': return 'text-emerald-500';
            default: return 'text-slate-400';
        }
    };

    const chartData = results ? [
        { name: 'Normal', value: results.normal_count, color: '#10b981' },
        { name: 'Threats', value: results.attack_count, color: '#f43f5e' }
    ] : [];

    const suspiciousPackets = results?.suspicious_packets ?? results?.flagged_rows ?? [];

    return (
        <div className="min-h-screen flex flex-col gap-8">
            <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg flex flex-col gap-4 relative overflow-hidden">
                <h1 className="text-2xl md:text-3xl font-semibold text-white">Batch Analysis</h1>
                <p className="text-slate-300 text-sm">Upload a CSV file to run offline anomaly analysis.</p>
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full border-2 border-dashed rounded-xl p-8 sm:p-12 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer ${isDragging
                        ? 'border-cyan-400 bg-cyan-500/10'
                        : file
                            ? 'border-emerald-500/50 bg-emerald-500/10'
                            : 'border-slate-700 bg-slate-950/50 hover:border-cyan-500/50'
                    }`}
                >
                    <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileSelect} className="hidden" />
                    <Upload size={52} className={isDragging ? 'text-cyan-500' : 'text-slate-400'} />
                    {!file ? (
                        <>
                            <p className="text-white font-medium">Drop CSV file here or click to select</p>
                            <p className="text-slate-400 text-sm">Only `.csv` files are accepted.</p>
                        </>
                    ) : (
                        <>
                            <FileText size={40} className="text-emerald-500" />
                            <p className="text-white font-medium">{file.name}</p>
                            <p className="text-slate-400 text-sm">{(file.size / 1024).toFixed(1)} KB</p>
                        </>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={handleAnalyze}
                        disabled={!file || isAnalyzing}
                        className={`rounded-lg px-5 py-2.5 text-sm font-medium border transition-colors ${file && !isAnalyzing ? 'bg-cyan-500 text-slate-950 border-cyan-500 hover:bg-cyan-400' : 'bg-slate-900 text-slate-400 border-slate-800 cursor-not-allowed'}`}
                    >
                        {isAnalyzing ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="animate-spin" size={16} />
                                Analyzing...
                            </span>
                        ) : (
                            'Analyze File'
                        )}
                    </button>
                    {file && (
                        <button
                            onClick={() => { setFile(null); setResults(null); }}
                            className="rounded-lg px-4 py-2.5 text-sm font-medium border border-slate-800 text-slate-400 hover:text-white hover:border-cyan-500 transition-colors"
                        >
                            Clear
                        </button>
                    )}

                    {error && (
                        <div className="flex items-center gap-2 text-rose-500 text-sm">
                            <AlertTriangle size={16} />
                            {error}
                        </div>
                    )}
                </div>
            </section>

            {results && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full">
                        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg flex flex-col gap-4 relative overflow-hidden">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-400 text-sm">Total Packets</span>
                                <BarChart3 size={18} className="text-cyan-500" />
                            </div>
                            <p className="text-3xl text-white font-semibold">{results.total_packets}</p>
                        </section>

                        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg flex flex-col gap-4 relative overflow-hidden">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-400 text-sm">Threats</span>
                                <AlertTriangle size={18} className="text-rose-500" />
                            </div>
                            <p className="text-3xl text-rose-500 font-semibold">{results.attack_count}</p>
                        </section>

                        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg flex flex-col gap-4 relative overflow-hidden">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-400 text-sm">Normal</span>
                                <CheckCircle size={18} className="text-emerald-500" />
                            </div>
                            <p className="text-3xl text-emerald-500 font-semibold">{results.normal_count}</p>
                        </section>

                        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg flex flex-col gap-4 relative overflow-hidden">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-400 text-sm">Threat Level</span>
                                <Shield size={18} className="text-cyan-500" />
                            </div>
                            <p className={`text-2xl font-semibold ${getThreatLevelColor(results.threat_level)}`}>{results.threat_level}</p>
                        </section>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg flex flex-col gap-4 relative overflow-hidden">
                            <div className="flex items-center gap-2">
                                <Activity size={18} className="text-cyan-500" />
                                <h3 className="text-white font-semibold">Traffic Distribution</h3>
                            </div>
                            <div className="w-full h-[400px] min-h-[400px] flex-shrink-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={chartData} innerRadius={70} outerRadius={100} paddingAngle={4} dataKey="value">
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '0.75rem' }} />
                                        <Legend iconType="circle" wrapperStyle={{ color: '#94a3b8' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </section>

                        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg flex flex-col gap-4 relative overflow-hidden">
                            <div className="flex items-center gap-2">
                                <Shield size={18} className="text-cyan-500" />
                                <h3 className="text-white font-semibold">Attack Rate</h3>
                            </div>
                            <div className="flex items-end justify-between">
                                <p className={`text-5xl font-semibold ${results.attack_rate > 15 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                    {results.attack_rate}%
                                </p>
                                <p className="text-slate-400 text-sm">Threshold: 15%</p>
                            </div>
                            <div className="w-full h-3 bg-slate-950 border border-slate-800 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${results.attack_rate > 15 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                    style={{ width: `${Math.min(100, Math.max(0, results.attack_rate))}%` }}
                                />
                            </div>
                        </section>
                    </div>

                    {suspiciousPackets.length > 0 && (
                        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg flex flex-col gap-4 relative overflow-hidden">
                            <div className="flex items-center gap-2">
                                <FileWarning size={18} className="text-rose-500" />
                                <h3 className="text-white font-semibold">Suspicious Packets</h3>
                            </div>
                            <div className="w-full max-h-[420px] overflow-y-auto border border-slate-800 rounded-xl p-4">
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[640px] text-left text-sm">
                                    <thead>
                                        <tr>
                                            <th className="pb-4 border-b border-slate-800 text-slate-400">Index</th>
                                            <th className="pb-4 border-b border-slate-800 text-slate-400">Source IP</th>
                                            <th className="pb-4 border-b border-slate-800 text-slate-400">Probability</th>
                                            <th className="pb-4 border-b border-slate-800 text-slate-400">Severity</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {suspiciousPackets.slice(0, 10).map((row, idx) => {
                                            const probability = Number(row.probability);
                                            const sourceIp = row.src_ip ?? row.source_ip ?? row['Source IP'] ?? '-';
                                            const hasProbability = Number.isFinite(probability);
                                            return (
                                            <tr key={idx}>
                                                <td className="py-3 border-b border-slate-800/50 text-slate-100">#{row.row_index}</td>
                                                <td className="py-3 border-b border-slate-800/50 text-cyan-500">{sourceIp}</td>
                                                <td className="py-3 border-b border-slate-800/50 text-slate-100">{hasProbability ? `${(probability * 100).toFixed(1)}%` : 'N/A'}</td>
                                                <td className="py-3 border-b border-slate-800/50">
                                                    <span className={hasProbability && probability > 0.9 ? 'text-rose-500' : 'text-cyan-500'}>
                                                        {hasProbability ? (probability > 0.9 ? 'Critical' : 'Elevated') : 'Suspicious'}
                                                    </span>
                                                </td>
                                            </tr>
                                            );
                                        })}
                                    </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>
                    )}
                </>
            )}
        </div>
    );
}
