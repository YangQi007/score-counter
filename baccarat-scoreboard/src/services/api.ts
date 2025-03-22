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

// Helper function to check if pattern exists in board
const patternExistsInBoard = (
  searchPattern: SymbolType[][],
  recordBoard: SymbolType[][]
): boolean => {
  // Skip empty search patterns
  if (!searchPattern.some(row => row.some(symbol => symbol !== null))) {
    return false;
  }

  // Get dimensions
  const searchRows = searchPattern.length;
  const searchCols = searchPattern[0].length;
  const recordRows = recordBoard.length;
  const recordCols = recordBoard[0].length;

  // Try to find pattern at each possible position in the record board
  for (let startRow = 0; startRow <= recordRows - searchRows; startRow++) {
    for (let startCol = 0; startCol <= recordCols - searchCols; startCol++) {
      let matches = true;

      // Check if pattern matches at this position
      for (let row = 0; row < searchRows && matches; row++) {
        for (let col = 0; col < searchCols && matches; col++) {
          const searchSymbol = searchPattern[row][col];
          // Only check non-null symbols in search pattern
          if (searchSymbol !== null) {
            const recordSymbol = recordBoard[startRow + row][startCol + col];
            if (searchSymbol !== recordSymbol) {
              matches = false;
            }
          }
        }
      }

      if (matches) {
        return true;
      }
    }
  }

  return false;
};

export const searchRecords = async (
  searchBoard: SymbolType[][]
): Promise<SearchResult> => {
  try {
    const records = await getAllRecords();
    
    // Find records that contain the search pattern
    const matchingRecords = records.filter(record => 
      patternExistsInBoard(searchBoard, record.searchBoard)
    );

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