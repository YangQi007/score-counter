import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScoreboardRecord, SymbolType, SearchResult } from '../types/types';
import { SYMBOLS } from '../components/SymbolButtons';

const STORAGE_KEY = 'baccarat_records';

// Helper function to get all records
export const getAllRecords = async (): Promise<ScoreboardRecord[]> => {
  try {
    const recordsJson = await AsyncStorage.getItem(STORAGE_KEY);
    return recordsJson ? JSON.parse(recordsJson) : [];
  } catch (error) {
    console.error('Error reading records:', error);
    return [];
  }
};

// Helper function to calculate pattern similarity score
const calculateSimilarity = (
  searchPattern: SymbolType[][],
  recordPattern: SymbolType[][],
): { score: number; exactMatch: boolean } => {
  let matchCount = 0;
  let totalSearchSymbols = 0;
  let exactMatch = true;

  // Count non-null symbols in search pattern
  for (let row = 0; row < searchPattern.length; row++) {
    for (let col = 0; col < searchPattern[row].length; col++) {
      const searchSymbol = searchPattern[row][col];
      if (searchSymbol) {
        totalSearchSymbols++;
        const recordSymbol = recordPattern[row][col];
        
        // Check both symbol value and color
        if (recordSymbol === searchSymbol) {
          // Get color of both symbols
          const searchConfig = SYMBOLS.find(s => s.value === searchSymbol);
          const recordConfig = SYMBOLS.find(s => s.value === recordSymbol);
          
          if (searchConfig && recordConfig && searchConfig.color === recordConfig.color) {
            matchCount++;
          } else {
            exactMatch = false;
          }
        } else {
          exactMatch = false;
        }
      }
    }
  }

  // Calculate similarity score (0 to 1)
  const score = totalSearchSymbols > 0 ? matchCount / totalSearchSymbols : 0;
  return { score, exactMatch };
};

export const saveRecord = async (
  mainBoard: SymbolType[][],
  searchBoard: SymbolType[][]
): Promise<ScoreboardRecord> => {
  try {
    const records = await getAllRecords();
    
    const newRecord: ScoreboardRecord = {
      id: Date.now().toString(), // Use timestamp as ID
      mainBoard,
      searchBoard,
      savedAt: new Date().toISOString(),
    };

    // Add new record to the beginning of the array
    records.unshift(newRecord);

    // Save updated records
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    return newRecord;
  } catch (error) {
    console.error('Error saving record:', error);
    throw error;
  }
};

// Helper function to check if pattern exists in board at any position
const findPatternPositions = (
  searchPattern: SymbolType[][],
  recordBoard: SymbolType[][]
): { found: boolean; positions: { startRow: number; startCol: number }[] } => {
  // Skip empty search patterns
  if (!searchPattern.some(row => row.some(symbol => symbol !== null))) {
    return { found: false, positions: [] };
  }

  // Get dimensions
  const searchRows = searchPattern.length;
  const searchCols = searchPattern[0].length;
  const recordRows = recordBoard.length;
  const recordCols = recordBoard[0].length;
  
  // Store all matching positions
  const matchingPositions: { startRow: number; startCol: number }[] = [];

  // Get non-null positions in search pattern
  const nonNullPositions: { row: number; col: number; value: SymbolType }[] = [];
  let firstNonNullPos = { row: -1, col: -1 };
  let hasFoundFirst = false;

  searchPattern.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell !== null) {
        if (!hasFoundFirst) {
          firstNonNullPos = { row: rowIndex, col: colIndex };
          hasFoundFirst = true;
        }
        nonNullPositions.push({ row: rowIndex, col: colIndex, value: cell });
      }
    });
  });

  if (nonNullPositions.length === 0) {
    return { found: false, positions: [] };
  }

  // Try to find pattern at each position in the record board
  for (let row = 0; row < recordRows; row++) {
    for (let col = 0; col < recordCols; col++) {
      let matches = true;

      // Check if all non-null positions in pattern match relative to current position
      for (const pos of nonNullPositions) {
        // Calculate relative position from the first non-null position
        const relativeRow = row + (pos.row - firstNonNullPos.row);
        const relativeCol = col + (pos.col - firstNonNullPos.col);

        // Check if position is within bounds
        if (relativeRow < 0 || relativeRow >= recordRows || 
            relativeCol < 0 || relativeCol >= recordCols) {
          matches = false;
          break;
        }

        // Check if symbols match
        const recordSymbol = recordBoard[relativeRow][relativeCol];
        if (pos.value !== recordSymbol) {
          matches = false;
          break;
        }
      }

      if (matches) {
        // Calculate the starting position relative to the first non-null position
        const startRow = row - firstNonNullPos.row;
        const startCol = col - firstNonNullPos.col;
        
        // Only add if the starting position is within bounds
        if (startRow >= 0 && startCol >= 0) {
          matchingPositions.push({ startRow, startCol });
        }
      }
    }
  }

  return {
    found: matchingPositions.length > 0,
    positions: matchingPositions
  };
};

// Update the search result type to include matched positions
interface SearchResultWithPositions extends SearchResult {
  records: (ScoreboardRecord & {
    matchedPositions: { startRow: number; startCol: number }[];
  })[];
}

export const searchRecords = async (
  searchBoard: SymbolType[][]
): Promise<SearchResultWithPositions> => {
  try {
    const records = await getAllRecords();
    
    // Find records that contain the search pattern and their positions
    const matchingRecords = records.map(record => {
      const { found, positions } = findPatternPositions(searchBoard, record.searchBoard);
      return {
        ...record,
        matchedPositions: positions
      };
    }).filter(record => record.matchedPositions.length > 0);

    // Sort by most recent first
    matchingRecords.sort((a, b) => 
      new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
    );

    return {
      records: matchingRecords,
      total: matchingRecords.length
    };
  } catch (error) {
    console.error('Error searching records:', error);
    throw error;
  }
};

export const deleteRecord = async (recordId: string): Promise<void> => {
  try {
    const records = await getAllRecords();
    const updatedRecords = records.filter(record => record.id !== recordId);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRecords));
  } catch (error) {
    console.error('Error deleting record:', error);
    throw error;
  }
};

// Optional: Add function to clear all records (useful for testing)
export const clearAllRecords = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing records:', error);
    throw error;
  }
}; 