
import React, { useState } from 'react';
import MonkeySimulation from './components/MonkeySimulation';
import VacuumSimulation from './components/VacuumSimulation';
import { ProblemType } from './types';

const App: React.FC = () => {
  const [activeProblem, setActiveProblem] = useState<ProblemType>('MONKEY_BANANA');

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-lg shadow-indigo-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/><path d="M12 6v6l4 2"/></svg>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">Mind<span className="text-indigo-600">Maze</span></h1>
          </div>
          
          <nav className="flex bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setActiveProblem('MONKEY_BANANA')}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeProblem === 'MONKEY_BANANA' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
            >
              🐒 Monkey & Banana
            </button>
            <button 
              onClick={() => setActiveProblem('VACUUM_WORLD')}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeProblem === 'VACUUM_WORLD' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
            >
              🧹 Vacuum World
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto py-10 px-4">
        <div className="mb-10 text-center sm:text-left">
          <div className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest rounded-full mb-4">
            State-Space Reasoning Lab
          </div>
          <h2 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">
            {activeProblem === 'MONKEY_BANANA' ? 'The Monkey & Banana Logic' : 'Autonomous Vacuum Agent'}
          </h2>
          <p className="text-slate-500 max-w-2xl text-lg leading-relaxed">
            {activeProblem === 'MONKEY_BANANA' 
              ? 'Observe how the agent navigates physical constraints to achieve a goal. This simulation tests causal reasoning and spatial planning.'
              : 'A classic test of agent efficiency. The goal is simple: maximize cleanliness while minimizing unnecessary movements.'}
          </p>
        </div>

        <div className="bg-white rounded-[2rem] shadow-2xl shadow-indigo-100/50 border border-slate-200 overflow-hidden">
          {activeProblem === 'MONKEY_BANANA' ? <MonkeySimulation /> : <VacuumSimulation />}
        </div>

        {/* Info Section */}
        <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="group bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/><path d="M22 10V4h-6"/><path d="m22 4-6.5 6.5"/></svg>
            </div>
            <h4 className="font-bold text-xl text-slate-900 mb-3">State-Space Search</h4>
            <p className="text-slate-500 leading-relaxed">Simulating the transition between initial and goal states via discrete operator actions.</p>
          </div>
          
          <div className="group bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4.5a2.5 2.5 0 0 0-4.96-.46 2.5 2.5 0 0 0-1.98 3 2.5 2.5 0 0 0 .98 4.96 2.5 2.5 0 0 0 0 5 2.5 2.5 0 0 0-1.02 4.84 2.5 2.5 0 0 0 4.96-.38 2.5 2.5 0 0 0 4.96.38 2.5 2.5 0 0 0-1.02-4.84 2.5 2.5 0 0 0 0-5 2.5 2.5 0 0 0 .98-4.96 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 12 4.5Z"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
            </div>
            <h4 className="font-bold text-xl text-slate-900 mb-3">LLM Reasoner</h4>
            <p className="text-slate-500 leading-relaxed">Utilizing Gemini 3 Pro to generate heuristic plans without hardcoded pathfinding algorithms.</p>
          </div>

          <div className="group bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>
            </div>
            <h4 className="font-bold text-xl text-slate-900 mb-3">Agentic UI</h4>
            <p className="text-slate-500 leading-relaxed">A reactive environment allowing for real-time manual manipulation and AI intervention.</p>
          </div>
        </section>
      </main>

      <footer className="mt-20 bg-slate-900 py-12 text-center text-slate-500 text-sm">
        <div className="mb-4">
           <h1 className="text-lg font-black text-white tracking-tighter uppercase italic">Mind<span className="text-indigo-400">Maze</span></h1>
        </div>
        <p>© 2025 MindMaze Lab • Powered by Gemini 3</p>
      </footer>
    </div>
  );
};

export default App;
