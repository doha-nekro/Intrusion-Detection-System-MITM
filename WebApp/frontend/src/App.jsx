import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import BatchAnalysis from './pages/BatchAnalysis';
import RealTimeMonitor from './pages/RealTimeMonitor';
import './index.css';

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30">
      <Navbar />
      <main className="w-full max-w-7xl mx-auto pt-28 pb-12 px-4 sm:px-6 flex flex-col gap-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/analyze" element={<BatchAnalysis />} />
          <Route path="/monitor" element={<RealTimeMonitor />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
