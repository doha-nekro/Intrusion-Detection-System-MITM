import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Upload, Activity, Zap, CheckCircle, Lock, Cpu, Globe, Sparkles, TrendingUp, Eye } from 'lucide-react';

export default function Home() {
    return (
        <div className="min-h-screen flex flex-col gap-8">
            <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg flex flex-col gap-4 relative overflow-hidden items-center text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-950/60 border border-cyan-500/30 text-xs font-semibold uppercase tracking-wider text-cyan-300">
                    <Lock size={12} />
                    Military Grade IIoT Protection
                    <Sparkles size={12} />
                </div>

                <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white max-w-5xl">
                    Next-Gen Defense for{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500">
                        Industrial Ecosystems
                    </span>
                </h1>

                <p className="text-base sm:text-lg text-slate-300 max-w-3xl leading-relaxed">
                    Synapse IDS deployments utilize{' '}
                    <span className="text-cyan-400 font-bold">proprietary AI neural networks</span> to identify and neutralize{' '}
                    <span className="text-purple-400 font-bold">zero-day threats</span> across critical IIoT infrastructure with{' '}
                    <span className="text-emerald-500 font-bold">99.8% precision</span>.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                    <Link to="/analyze" className="px-6 py-3 rounded-lg bg-cyan-500 text-slate-950 font-bold uppercase text-sm tracking-wide hover:bg-cyan-400 transition-colors inline-flex items-center justify-center gap-2">
                        <Upload size={16} />
                        Start Batch Analysis
                    </Link>
                    <Link to="/monitor" className="px-6 py-3 rounded-lg bg-slate-950 border border-slate-700 text-white font-bold uppercase text-sm tracking-wide hover:border-cyan-500 transition-colors inline-flex items-center justify-center gap-2">
                        <Activity size={16} className="text-cyan-500" />
                        Live Monitor
                    </Link>
                </div>
            </section>

            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Network Latency', val: '< 0.02ms', icon: <Zap className="text-cyan-500" size={18} /> },
                    { label: 'Detection Rate', val: '99.98%', icon: <Eye className="text-purple-400" size={18} /> },
                    { label: 'Threat Definitions', val: '1.2M+', icon: <Shield className="text-emerald-500" size={18} /> },
                    { label: 'Global Uptime', val: '99.99%', icon: <TrendingUp className="text-pink-500" size={18} /> },
                ].map((stat) => (
                    <section key={stat.label} className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg flex flex-col gap-4 relative overflow-hidden">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
                            {stat.icon}
                            <span>{stat.label}</span>
                        </div>
                        <p className="text-4xl font-black text-white leading-none">{stat.val}</p>
                    </section>
                ))}
            </section>

            <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg flex flex-col gap-4 relative overflow-hidden">
                <div className="text-center flex flex-col gap-3">
                    <div className="inline-flex mx-auto items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
                        <Sparkles size={12} />
                        Core Capabilities
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-white">
                        Full-Spectrum{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Cyber Defense</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                    {[
                        { icon: <Cpu className="text-cyan-500" size={26} />, title: 'Edge Intelligence', desc: 'Low-latency detection optimized for constrained IIoT endpoints.' },
                        { icon: <Globe className="text-emerald-500" size={26} />, title: 'Global Forensics', desc: 'Replay and inspect historical traffic to identify anomaly patterns.' },
                        { icon: <Shield className="text-cyan-500" size={26} />, title: 'Adaptive Shielding', desc: 'Automated threat response for safer industrial operations.' },
                    ].map((feature) => (
                        <section key={feature.title} className="bg-slate-950/70 border border-slate-800 rounded-xl p-6 shadow-lg flex flex-col gap-4 relative overflow-hidden">
                            <div>{feature.icon}</div>
                            <h3 className="text-2xl font-bold text-white">{feature.title}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
                        </section>
                    ))}
                </div>
            </section>

            <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg flex flex-col gap-4 relative overflow-hidden text-center">
                <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">
                    Fortify Your Network{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Today</span>
                </h2>
                <p className="text-slate-300 max-w-2xl mx-auto">
                    Join industrial teams who trust Synapse IDS for mission-critical operations.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                    <Link to="/analyze" className="px-8 py-3 bg-cyan-500 text-slate-950 font-bold uppercase tracking-wider text-sm rounded-lg hover:bg-cyan-400 transition-colors">
                        Create Account
                    </Link>
                    <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        <span className="flex items-center gap-2 text-emerald-500"><CheckCircle size={14} /> No Hardware Needed</span>
                        <span className="flex items-center gap-2 text-cyan-500"><CheckCircle size={14} /> Instant Activation</span>
                    </div>
                </div>
            </section>
        </div>
    );
}
