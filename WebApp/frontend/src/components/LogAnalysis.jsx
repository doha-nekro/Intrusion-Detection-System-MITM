import React, { useState, useRef } from 'react';
import axios from 'axios';
import {
    Upload, FileText, AlertTriangle, CheckCircle, XCircle,
    Loader2, Shield, Target, BarChart3, FileWarning
} from 'lucide-react';

const LogAnalysis = () => {
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
            setError('Please upload a CSV file');
        }
    };

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.name.endsWith('.csv')) {
            setFile(selectedFile);
            setError(null);
            setResults(null);
        } else {
            setError('Please upload a CSV file');
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
            setError(err.response?.data?.error || 'Analysis failed. Is the backend running?');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const getThreatLevelColor = (level) => {
        switch (level) {
            case 'CRITICAL': return 'text-red-500';
            case 'HIGH': return 'text-orange-500';
            case 'MEDIUM': return 'text-yellow-500';
            case 'LOW': return 'text-green-500';
            default: return 'text-slate-400';
        }
    };

    const getThreatLevelBg = (level) => {
        switch (level) {
            case 'CRITICAL': return 'bg-red-500/20 border-red-500/30';
            case 'HIGH': return 'bg-orange-500/20 border-orange-500/30';
            case 'MEDIUM': return 'bg-yellow-500/20 border-yellow-500/30';
            case 'LOW': return 'bg-green-500/20 border-green-500/30';
            default: return 'bg-slate-500/20 border-slate-500/30';
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Upload Section */}
            <div className="cyber-card p-6">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-cyan-500/10 rounded-lg">
                        <Upload className="h-6 w-6 text-cyan-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-white">Log File Analysis</h2>
                        <p className="text-sm text-slate-400">Upload network traffic logs for intrusion detection</p>
                    </div>
                </div>

                {/* Drop Zone */}
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`
            drop-zone relative overflow-hidden
            ${isDragging ? 'border-cyan-400 bg-cyan-500/10' : ''}
            ${file ? 'border-green-500/50 bg-green-500/5' : ''}
          `}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        onChange={handleFileSelect}
                        className="hidden"
                    />

                    {file ? (
                        <div className="flex items-center justify-center space-x-4">
                            <div className="p-3 bg-green-500/10 rounded-xl">
                                <FileText className="h-8 w-8 text-green-400" />
                            </div>
                            <div className="text-left">
                                <p className="text-white font-medium">{file.name}</p>
                                <p className="text-sm text-slate-400">
                                    {(file.size / 1024).toFixed(2)} KB • Ready to analyze
                                </p>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setFile(null);
                                    setResults(null);
                                }}
                                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                            >
                                <XCircle className="h-5 w-5 text-slate-400 hover:text-red-400" />
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="p-4 bg-cyan-500/10 rounded-full w-fit mx-auto">
                                <Upload className="h-10 w-10 text-cyan-400" />
                            </div>
                            <div>
                                <p className="text-white font-medium">Drop your CSV file here</p>
                                <p className="text-sm text-slate-400 mt-1">or click to browse</p>
                            </div>
                            <div className="flex items-center justify-center space-x-4 text-xs text-slate-500">
                                <span className="flex items-center space-x-1">
                                    <FileText className="h-3 w-3" />
                                    <span>CSV format only</span>
                                </span>
                                <span>•</span>
                                <span>Network traffic logs</span>
                            </div>
                        </div>
                    )}

                    {/* Animated border */}
                    {isDragging && (
                        <div className="absolute inset-0 border-2 border-cyan-400 rounded-lg animate-pulse pointer-events-none"></div>
                    )}
                </div>

                {/* Analyze Button */}
                <div className="mt-6 flex justify-center">
                    <button
                        onClick={handleAnalyze}
                        disabled={!file || isAnalyzing}
                        className="cyber-button flex items-center space-x-2 px-8"
                    >
                        {isAnalyzing ? (
                            <>
                                <Loader2 className="h-5 w-5 loading-spinner" />
                                <span>Analyzing...</span>
                            </>
                        ) : (
                            <>
                                <Target className="h-5 w-5" />
                                <span>Analyze Logs</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center space-x-3">
                        <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0" />
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}
            </div>

            {/* Results Section */}
            {results && (
                <div className="space-y-6 animate-fade-in">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Total Packets */}
                        <div className="cyber-card p-5">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-cyan-500/10 rounded-lg">
                                    <BarChart3 className="h-5 w-5 text-cyan-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 uppercase">Total Packets</p>
                                    <p className="text-2xl font-bold text-white">{results.total_packets.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Attacks Detected */}
                        <div className="cyber-card p-5">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-red-500/10 rounded-lg">
                                    <AlertTriangle className="h-5 w-5 text-red-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 uppercase">Attacks Detected</p>
                                    <p className="text-2xl font-bold text-red-400">{results.attack_count.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Normal Traffic */}
                        <div className="cyber-card p-5">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-green-500/10 rounded-lg">
                                    <CheckCircle className="h-5 w-5 text-green-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 uppercase">Normal Traffic</p>
                                    <p className="text-2xl font-bold text-green-400">{results.normal_count.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Threat Level */}
                        <div className={`cyber-card p-5 border ${getThreatLevelBg(results.threat_level)}`}>
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-slate-800 rounded-lg">
                                    <Shield className={`h-5 w-5 ${getThreatLevelColor(results.threat_level)}`} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 uppercase">Threat Level</p>
                                    <p className={`text-2xl font-bold ${getThreatLevelColor(results.threat_level)}`}>
                                        {results.threat_level}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Attack Rate Bar */}
                    <div className="cyber-card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-white font-medium">Attack Rate Analysis</h3>
                            <span className={`text-lg font-bold ${results.attack_rate > 15 ? 'text-red-400' : 'text-green-400'}`}>
                                {results.attack_rate}%
                            </span>
                        </div>
                        <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-1000 ${results.attack_rate > 30 ? 'bg-gradient-to-r from-red-500 to-red-400' :
                                        results.attack_rate > 15 ? 'bg-gradient-to-r from-orange-500 to-yellow-400' :
                                            'bg-gradient-to-r from-green-500 to-green-400'
                                    }`}
                                style={{ width: `${Math.min(results.attack_rate, 100)}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-slate-500">
                            <span>0%</span>
                            <span>Safe (&lt;5%)</span>
                            <span>Medium (5-15%)</span>
                            <span>High (15-30%)</span>
                            <span>Critical (&gt;30%)</span>
                        </div>
                    </div>

                    {/* Flagged Rows Table */}
                    {results.flagged_rows && results.flagged_rows.length > 0 && (
                        <div className="cyber-card p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-red-500/10 rounded-lg">
                                        <FileWarning className="h-5 w-5 text-red-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-medium">Flagged Suspicious Packets</h3>
                                        <p className="text-xs text-slate-400">Packets identified as potential threats</p>
                                    </div>
                                </div>
                                <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded-full">
                                    {results.flagged_rows.length} Flagged
                                </span>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="cyber-table">
                                    <thead>
                                        <tr>
                                            <th>Row #</th>
                                            <th>Source IP</th>
                                            <th>Dest IP</th>
                                            <th>Threat Probability</th>
                                            <th>Risk Level</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {results.flagged_rows.slice(0, 10).map((row, index) => (
                                            <tr key={index}>
                                                <td className="text-slate-300 font-mono">{row.row_index}</td>
                                                <td className="text-cyan-400 font-mono">{row.src_ip}</td>
                                                <td className="text-slate-300 font-mono">{row.dst_ip}</td>
                                                <td>
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full"
                                                                style={{ width: `${row.probability * 100}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-red-400 text-xs font-medium">
                                                            {(row.probability * 100).toFixed(1)}%
                                                        </span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${row.probability > 0.9 ? 'bg-red-500/20 text-red-400' :
                                                            row.probability > 0.8 ? 'bg-orange-500/20 text-orange-400' :
                                                                'bg-yellow-500/20 text-yellow-400'
                                                        }`}>
                                                        {row.probability > 0.9 ? 'Critical' : row.probability > 0.8 ? 'High' : 'Medium'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {results.flagged_rows.length > 10 && (
                                <p className="text-center text-slate-400 text-sm mt-4">
                                    Showing 10 of {results.flagged_rows.length} flagged packets
                                </p>
                            )}
                        </div>
                    )}

                    {/* Mock Mode Notice */}
                    {results.mock_mode && (
                        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center space-x-3">
                            <AlertTriangle className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                            <div>
                                <p className="text-yellow-400 font-medium text-sm">Mock Mode Active</p>
                                <p className="text-slate-400 text-xs">
                                    Results are simulated. Load the trained model for real predictions.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default LogAnalysis;
