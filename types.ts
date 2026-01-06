
export type ProblemType = 'MONKEY_BANANA' | 'VACUUM_WORLD';

export interface Position {
  x: number;
  y: number;
}

// Monkey & Banana State
export interface MonkeyState {
  monkeyPos: Position;
  monkeyOnBox: boolean;
  boxes: { id: string; pos: Position }[];
  bananaPos: Position;
  hasBanana: boolean;
}

// Vacuum World State
export interface VacuumState {
  vacuumPos: Position;
  grid: { x: number; y: number; isDirty: boolean }[][];
  isCleaning: boolean;
}

export interface SimulationAction {
  type: string;
  payload: any;
}
