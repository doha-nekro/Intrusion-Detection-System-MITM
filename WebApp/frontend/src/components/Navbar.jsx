import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Shield, Home, Activity, Layers } from 'lucide-react';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Home', path: '/', Icon: Home },
        { name: 'Batch Analysis', path: '/analyze', Icon: Layers },
        { name: 'Live Monitor', path: '/monitor', Icon: Activity },
    ];

    return (
        <nav className="fixed top-0 w-full h-16 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 flex items-center px-6">
            <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-4">
                <Link to="/" className="flex items-center gap-2 text-white font-semibold tracking-tight hover:text-cyan-400 transition-colors">
                    <Shield size={18} className={scrolled ? 'text-cyan-500' : 'text-slate-100'} />
                    <span className="whitespace-nowrap">Synapse IDS</span>
                </Link>

                <div className="flex items-center gap-2 sm:gap-3">
                    {navLinks.map(({ name, path, Icon }) => (
                        <NavLink
                            key={path}
                            to={path}
                            className={({ isActive }) =>
                                `inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm whitespace-nowrap transition-colors border ${isActive
                                    ? 'text-cyan-300 border-cyan-500/50 bg-cyan-500/10'
                                    : 'text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                                }`
                            }
                        >
                            <Icon size={16} />
                            <span className="hidden md:inline">{name}</span>
                        </NavLink>
                    ))}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
