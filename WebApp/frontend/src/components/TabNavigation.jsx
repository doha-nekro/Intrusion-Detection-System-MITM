import React from 'react';
import { Radio, FileSearch } from 'lucide-react';

const TabNavigation = ({ activeTab, setActiveTab }) => {
    const tabs = [
        { id: 'live', label: 'Live Monitor', icon: Radio },
        { id: 'analysis', label: 'Log Analysis', icon: FileSearch },
    ];

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-2 shadow-lg flex flex-col gap-4 relative overflow-hidden">
            <div className="flex flex-wrap gap-2">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${isActive
                                    ? 'text-cyan-300 border-cyan-500/50 bg-cyan-500/10'
                                    : 'text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                                }`}
                            >
                                <Icon className="h-4 w-4" />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
            </div>
        </div>
    );
};

export default TabNavigation;
