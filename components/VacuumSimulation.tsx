
import React, { useState, useEffect } from 'react';
import { VacuumState, Position } from '../types';
import { solveVacuumWorld } from '../services/geminiService';

const ROWS = 4;
const COLS = 4;

const VacuumSimulation: React.FC = () => {
  const [state, setState] = useState<VacuumState>({
    vacuumPos: { x: 0, y: 0 },
    grid: Array.from({ length: ROWS }, (_, y) => 
      Array.from({ length: COLS }, (_, x) => ({
        x, y, isDirty: Math.random() > 0.7
      }))
    ),
    isCleaning: false
  });
  const [isSolving, setIsSolving] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const toggleDirt = (x: number, y: number) => {
    setState(prev => {
      const newGrid = prev.grid.map(row => 
        row.map(cell => 
          (cell.x === x && cell.y === y) ? { ...cell, isDirty: !cell.isDirty } : cell
        )
      );
      return { ...prev, grid: newGrid };
    });
  };

  const moveVacuum = (direction: 'up' | 'down' | 'left' | 'right') => {
    setState(prev => {
      const newPos = { ...prev.vacuumPos };
      if (direction === 'up' && newPos.y > 0) newPos.y--;
      if (direction === 'down' && newPos.y < ROWS - 1) newPos.y++;
      if (direction === 'left' && newPos.x > 0) newPos.x--;
      if (direction === 'right' && newPos.x < COLS - 1) newPos.x++;
      return { ...prev, vacuumPos: newPos };
    });
  };

  const suck = () => {
    setState(prev => {
      const { x, y } = prev.vacuumPos;
      const newGrid = prev.grid.map(row => 
        row.map(cell => 
          (cell.x === x && cell.y === y) ? { ...cell, isDirty: false } : cell
        )
      );
      return { ...prev, grid: newGrid };
    });
  };

  const handleSolve = async () => {
    setIsSolving(true);
    setLogs(["Requesting cleaner plan..."]);
    try {
      const result = await solveVacuumWorld(state);
      setLogs(prev => [...prev, `AI found ${result.steps.length} steps.`]);
      
      for (const step of result.steps) {
        await new Promise(r => setTimeout(r, 400));
        setLogs(prev => [...prev, `Action: ${step.action}`]);
        
        setState(current => {
          if (step.action === 'move') {
            return { ...current, vacuumPos: step.target };
          } else if (step.action === 'suck') {
            const { x, y } = current.vacuumPos;
            const newGrid = current.grid.map(row => 
              row.map(cell => 
                (cell.x === x && cell.y === y) ? { ...cell, isDirty: false } : cell
              )
            );
            return { ...current, grid: newGrid };
          }
          return current;
        });
      }
    } catch (e) {
      setLogs(prev => [...prev, "Error: AI planning failed."]);
    } finally {
      setIsSolving(false);
    }
  };

  const resetGrid = () => {
     setState(prev => ({
        ...prev,
        grid: prev.grid.map(row => row.map(cell => ({ ...cell, isDirty: Math.random() > 0.7 })))
     }));
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4">
      <div className="flex-1">
        <div className="grid grid-cols-4 gap-2 bg-slate-200 p-2 rounded-xl shadow-inner max-w-[500px] aspect-square">
          {state.grid.flat().map((cell, i) => (
            <div 
              key={i} 
              onClick={() => toggleDirt(cell.x, cell.y)}
              className={`relative rounded-lg border-2 transition-all cursor-pointer flex items-center justify-center 
                ${cell.isDirty ? 'bg-amber-100 border-amber-300 shadow-sm' : 'bg-white border-white'}`}
            >
              {cell.isDirty && (
                <div className="flex flex-wrap gap-1 p-2 opacity-60">
                  <div className="w-1 h-1 bg-amber-900 rounded-full" />
                  <div className="w-1 h-1 bg-amber-800 rounded-full" />
                  <div className="w-1.5 h-1.5 bg-amber-700 rounded-full" />
                </div>
              )}
              
              {state.vacuumPos.x === cell.x && state.vacuumPos.y === cell.y && (
                <div className="absolute inset-0 flex items-center justify-center z-10 transition-all duration-300 scale-110">
                   <div className="bg-blue-600 w-12 h-12 rounded-full border-4 border-blue-400 shadow-xl flex items-center justify-center text-white font-black text-xs">
                      VAC
                   </div>
                </div>
              )}
              <div className="absolute bottom-1 right-1 text-[8px] text-slate-300 font-mono">
                {cell.x},{cell.y}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full lg:w-72 flex flex-col gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-3">Controls</h3>
          <div className="grid grid-cols-3 gap-2 max-w-[150px] mx-auto mb-4">
            <div />
            <button onClick={() => moveVacuum('up')} className="p-2 bg-slate-100 hover:bg-slate-200 rounded">↑</button>
            <div />
            <button onClick={() => moveVacuum('left')} className="p-2 bg-slate-100 hover:bg-slate-200 rounded">←</button>
            <button onClick={() => moveVacuum('down')} className="p-2 bg-slate-100 hover:bg-slate-200 rounded">↓</button>
            <button onClick={() => moveVacuum('right')} className="p-2 bg-slate-100 hover:bg-slate-200 rounded">→</button>
          </div>
          <div className="flex flex-col gap-2">
            <button onClick={suck} className="py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors">
              Manual Suck
            </button>
            <button onClick={resetGrid} className="py-2 bg-slate-200 text-slate-700 rounded font-medium hover:bg-slate-300 transition-colors">
              Reset Dirt
            </button>
          </div>
        </div>

        <button 
          onClick={handleSolve}
          disabled={isSolving}
          className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
        >
          {isSolving ? "AI Calculating..." : "Auto-Clean with Gemini"}
        </button>

        <div className="bg-slate-900 text-slate-300 p-4 rounded-xl h-48 overflow-y-auto font-mono text-xs flex flex-col-reverse">
           {logs.slice().reverse().map((log, i) => <div key={i} className="mb-1">{log}</div>)}
           <div className="text-slate-500 mb-2 uppercase tracking-widest text-[10px]">Simulation Logs</div>
        </div>
      </div>
    </div>
  );
};

export default VacuumSimulation;
