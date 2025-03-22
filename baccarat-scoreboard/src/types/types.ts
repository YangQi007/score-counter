export type SymbolType = string | null;

export interface SymbolConfig {
  value: string;
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
}

export interface SearchResult {
  records: ScoreboardRecord[];
  total: number;
} 