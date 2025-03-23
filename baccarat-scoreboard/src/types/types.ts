export type SymbolType = '庄' | '闲' | '和' | '8-blue' | '9-blue' | '8-red' | '9-red' | '龙' | '猫' | null;

export interface SymbolConfig {
  value: SymbolType;
  color: string;
}

export interface ScoreboardCell {
  symbol: SymbolType;
  row: number;
  col: number;
}

export interface ScoreboardState {
  cells: ScoreboardCell[];
  currentColumn: number;
}

export interface ScoreboardRecord {
  id: string;
  mainBoard: SymbolType[][];
  searchBoard: SymbolType[][];
  savedAt: string;
  matchedPositions?: { startRow: number; startCol: number }[];
}

export interface SearchResult {
  records: ScoreboardRecord[];
  total: number;
} 