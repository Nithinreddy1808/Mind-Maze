
import React, { useState, useCallback } from 'react';
import { MonkeyState, Position } from '../types';
import { solveMonkeyBanana } from '../services/geminiService';

const GRID_SIZE = 5;

const MonkeySimulation: React.FC = () => {
  const getRandomPos = (exclude: Position[] = []): Position => {
    let pos: Position;
    const isExcluded = (p: Position) => exclude.some(ex => ex.x === p.x && ex.y === p.y);
    do {
      pos = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
    } while (isExcluded(pos));
    return pos;
  };

  const createInitialState = (): MonkeyState => {
    const bananaPos = { x: 2, y: 2 }; // Fixed in middle
    const monkeyPos = getRandomPos([bananaPos]);
    const boxPos = getRandomPos([bananaPos, monkeyPos]);
    
    return {
      monkeyPos,
      monkeyOnBox: false,
      boxes: [{ id: 'box1', pos: boxPos }],
      bananaPos,
      hasBanana: false
    };
  };

  const [state, setState] = useState<MonkeyState>(createInitialState());
  const [isSolving, setIsSolving] = useState(false);
  const [logs, setLogs] = useState<string[]>(["Environment initialized."]);
  const [shake, setShake] = useState(false);

  const triggerShake = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }, []);

  const handleScramble = () => {
    setState(createInitialState());
    setLogs(l => [...l, "Environment scrambled!"]);
  };

  const handleMove = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (state.monkeyOnBox) {
      setLogs(l => [...l, "Cannot move while on box! Jump off first."]);
      triggerShake();
      return;
    }

    setState(prev => {
      const newPos = { ...prev.monkeyPos };
      if (direction === 'up' && newPos.y > 0) newPos.y--;
      if (direction === 'down' && newPos.y < GRID_SIZE - 1) newPos.y++;
      if (direction === 'left' && newPos.x > 0) newPos.x--;
      if (direction === 'right' && newPos.x < GRID_SIZE - 1) newPos.x++;

      // Logic change: Check if monkey is ALREADY on the same square as a box.
      // If yes, moving pushes that box to the new position.
      const currentBoxIndex = prev.boxes.findIndex(b => b.pos.x === prev.monkeyPos.x && b.pos.y === prev.monkeyPos.y);
      
      if (currentBoxIndex !== -1) {
        const newBoxes = [...prev.boxes];
        newBoxes[currentBoxIndex] = { ...newBoxes[currentBoxIndex], pos: newPos };
        return { ...prev, monkeyPos: newPos, boxes: newBoxes };
      }

      // Otherwise, the monkey simply moves into the newPos (even if a box is there, he stands on it/under it)
      return { ...prev, monkeyPos: newPos };
    });
  };

  const toggleClimb = () => {
    const boxAtMonkey = state.boxes.find(b => b.pos.x === state.monkeyPos.x && b.pos.y === state.monkeyPos.y);
    if (boxAtMonkey) {
      setState(prev => ({ ...prev, monkeyOnBox: !prev.monkeyOnBox }));
      setLogs(l => [...l, !state.monkeyOnBox ? "Monkey climbed onto the box!" : "Monkey jumped off the box."]);
    } else {
      setLogs(l => [...l, "No box here to climb! Move onto the box first."]);
      triggerShake();
    }
  };

  const graspBanana = () => {
    if (state.monkeyOnBox && state.monkeyPos.x === state.bananaPos.x && state.monkeyPos.y === state.bananaPos.y) {
      setState(prev => ({ ...prev, hasBanana: true }));
      setLogs(l => [...l, "Success! Monkey got the banana!"]);
    } else {
      let reason = "";
      if (!state.monkeyOnBox) reason = "Too short! Climb a box first.";
      else if (state.monkeyPos.x !== state.bananaPos.x || state.monkeyPos.y !== state.bananaPos.y) reason = "The banana is not here.";
      setLogs(l => [...l, reason]);
      triggerShake();
    }
  };

  const handleSolve = async () => {
    setIsSolving(true);
    setLogs(["Requesting AI solution..."]);
    try {
      const result = await solveMonkeyBanana(state);
      for (const step of result.steps) {
        await new Promise(r => setTimeout(r, 800));
        setState(current => {
          if (step.action === 'move') {
            return { ...current, monkeyPos: step.target, monkeyOnBox: false };
          } else if (step.action === 'push') {
            const newBoxes = current.boxes.map(b => 
                (b.id === step.boxId || current.boxes.length === 1) ? { ...b, pos: step.target } : b
            );
            return { ...current, monkeyPos: step.target, boxes: newBoxes, monkeyOnBox: false };
          } else if (step.action === 'climb') {
            return { ...current, monkeyOnBox: true };
          } else if (step.action === 'grasp') {
            return { ...current, hasBanana: true };
          }
          return current;
        });
        setLogs(prev => [...prev, `AI Action: ${step.action}`]);
      }
    } catch (e) {
      setLogs(prev => [...prev, "Error: AI failed to solve this configuration."]);
    } finally {
      setIsSolving(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6">
      <div className="flex-1">
        <div className={`relative w-full aspect-square max-w-[500px] border-4 border-slate-200 rounded-2xl overflow-hidden canvas-grid bg-white shadow-2xl transition-transform ${shake ? 'animate-bounce' : ''}`}>
          {/* Grid Cells */}
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => (
            <div key={i} className="absolute border-[0.5px] border-slate-100" style={{
              width: `${100 / GRID_SIZE}%`, height: `${100 / GRID_SIZE}%`,
              left: `${(i % GRID_SIZE) * (100 / GRID_SIZE)}%`,
              top: `${Math.floor(i / GRID_SIZE) * (100 / GRID_SIZE)}%`
            }} />
          ))}

          {/* Banana (Middle) */}
          <div className="absolute transition-all duration-500 flex items-center justify-center text-5xl z-0" style={{
            width: `${100 / GRID_SIZE}%`, height: `${100 / GRID_SIZE}%`,
            left: `${state.bananaPos.x * (100 / GRID_SIZE)}%`,
            top: `${state.bananaPos.y * (100 / GRID_SIZE)}%`,
            opacity: state.hasBanana ? 0 : 1,
            transform: `scale(${state.hasBanana ? 0 : 1})`
          }}>
            <span className="drop-shadow-lg">🍌</span>
          </div>

          {/* Boxes */}
          {state.boxes.map(box => {
            const isMonkeyHere = state.monkeyPos.x === box.pos.x && state.monkeyPos.y === box.pos.y;
            return (
              <div key={box.id} className="absolute transition-all duration-300 flex items-center justify-center" style={{
                width: `${100 / GRID_SIZE}%`, height: `${100 / GRID_SIZE}%`,
                left: `${box.pos.x * (100 / GRID_SIZE)}%`,
                top: `${box.pos.y * (100 / GRID_SIZE)}%`
              }}>
                <div className={`w-[85%] h-[85%] bg-amber-800 rounded-lg shadow-lg border-b-4 border-amber-950 flex flex-col items-center justify-center text-white font-bold transition-all ${isMonkeyHere && state.monkeyOnBox ? 'ring-4 ring-yellow-400 scale-95' : ''}`}>
                   <div className="text-[10px] opacity-50">HEAVY</div>
                   <div className="text-xs">BOX</div>
                </div>
              </div>
            );
          })}

          {/* Monkey */}
          <div className="absolute transition-all duration-500 flex flex-col items-center justify-center z-20" style={{
            width: `${100 / GRID_SIZE}%`, height: `${100 / GRID_SIZE}%`,
            left: `${state.monkeyPos.x * (100 / GRID_SIZE)}%`,
            top: `${state.monkeyPos.y * (100 / GRID_SIZE)}%`,
            transform: state.monkeyOnBox ? 'translateY(-35%) scale(1.2)' : 'none'
          }}>
            {state.monkeyOnBox && (
              <div className="absolute -top-6 px-2 py-0.5 bg-yellow-400 text-[10px] font-black rounded shadow-sm animate-pulse text-yellow-900 uppercase">
                On Box
              </div>
            )}
            <div className={`text-5xl transition-all ${state.monkeyOnBox ? 'drop-shadow-2xl' : 'drop-shadow-md'}`}>
              {state.hasBanana ? '🐒' : state.monkeyOnBox ? '🦧' : '🐵'}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-80 flex flex-col gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
              Controls
            </h3>
            <button 
              onClick={handleScramble}
              disabled={isSolving}
              className="text-xs bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md text-slate-600 transition-colors"
            >
              🔄 Scramble
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mb-6">
            <div />
            <button onClick={() => handleMove('up')} className="aspect-square flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors shadow-sm active:translate-y-0.5">↑</button>
            <div />
            <button onClick={() => handleMove('left')} className="aspect-square flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors shadow-sm active:translate-y-0.5">←</button>
            <button onClick={() => handleMove('down')} className="aspect-square flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors shadow-sm active:translate-y-0.5">↓</button>
            <button onClick={() => handleMove('right')} className="aspect-square flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors shadow-sm active:translate-y-0.5">→</button>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={toggleClimb} 
              className={`w-full py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${state.monkeyOnBox ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-100'}`}
            >
              {state.monkeyOnBox ? '⬇️ Jump Down' : '🧗 Climb Box'}
            </button>
            <button 
              onClick={graspBanana} 
              disabled={state.hasBanana}
              className="w-full py-3 px-4 bg-yellow-400 text-yellow-900 rounded-xl text-sm font-bold hover:bg-yellow-500 transition-all active:scale-95 disabled:opacity-30 flex items-center justify-center gap-2"
            >
              🍌 Grasp Banana
            </button>
          </div>
        </div>

        <button 
          onClick={handleSolve}
          disabled={isSolving || state.hasBanana}
          className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl"
        >
          {isSolving ? (
             <><div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> Thinking...</>
          ) : "Auto-Solve with Gemini"}
        </button>

        <div className="bg-slate-100 p-4 rounded-2xl h-44 overflow-y-auto font-mono text-[11px] flex flex-col-reverse border border-slate-200">
           {logs.slice().reverse().map((log, i) => (
             <div key={i} className={`mb-1.5 pb-1 border-b border-slate-200 last:border-0 ${log.includes('Success') ? 'text-green-600 font-bold' : log.includes('Cannot') || log.includes('No box') ? 'text-red-500' : 'text-slate-600'}`}>
               {log}
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default MonkeySimulation;
