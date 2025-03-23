import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView, Alert } from 'react-native';
import Scoreboard from './src/components/Scoreboard';
import SymbolButtons, { SYMBOLS } from './src/components/SymbolButtons';
import ActionButtons from './src/components/ActionButtons';
import SearchResultsModal from './src/components/SearchResultsModal';
import { SymbolType, SymbolConfig, ScoreboardRecord } from './src/types/types';
import { saveRecord, searchRecords, getAllRecords, deleteRecord } from './src/services/api';

export default function App() {
  const [activePanel, setActivePanel] = useState<'main' | 'search' | 'history'>('main');
  const [mainBoard, setMainBoard] = useState<SymbolType[][]>(
    Array(6).fill(null).map(() => Array(70).fill(null))
  );
  const [searchBoard, setSearchBoard] = useState<SymbolType[][]>(
    Array(5).fill(null).map(() => Array(70).fill(null))
  );
  const [historyBoard, setHistoryBoard] = useState<SymbolType[][]>(
    Array(5).fill(null).map(() => Array(70).fill(null))
  );
  const [currentRow, setCurrentRow] = useState<number>(0);
  const [currentCol, setCurrentCol] = useState<number>(0);
  const [searchRow, setSearchRow] = useState<number>(0);
  const [searchCol, setSearchCol] = useState<number>(0);
  const [historyRow, setHistoryRow] = useState<number>(0);
  const [historyCol, setHistoryCol] = useState<number>(0);
  const [lastSymbolColor, setLastSymbolColor] = useState<string | null>(null);
  const [lastHistoryColor, setLastHistoryColor] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<ScoreboardRecord[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [historyRecords, setHistoryRecords] = useState<ScoreboardRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState<string | undefined>();
  const [symbolPositions, setSymbolPositions] = useState<{row: number, col: number}[]>([]);
  const [historyPositions, setHistoryPositions] = useState<{row: number, col: number}[]>([]);
  const [matchedPositions, setMatchedPositions] = useState<{ startRow: number; startCol: number }[]>([]);

  const handleSymbolPress = (symbol: SymbolConfig) => {
    if (symbol.value === '←' as SymbolType) {
      handleBackPress();
      return;
    }

    if (currentCol < 70) {
      if (activePanel === 'main') {
        // Update main board and search board together
        const newMainBoard = mainBoard.map(row => [...row]);
        const newSearchBoard = searchBoard.map(row => [...row]);

        // Update main board (vertical filling)
        if (newMainBoard[currentRow]) {
          newMainBoard[currentRow][currentCol] = symbol.value;
        }

        let placed = false;

        // Find the previous symbol's position (not necessarily same color)
        const findPreviousSymbolPosition = () => {
          // Start from the last position in symbolPositions
          if (symbolPositions.length > 0) {
            const lastPos = symbolPositions[symbolPositions.length - 1];
            return { row: lastPos.row, col: lastPos.col };
          }
          return null;
        };

        // Different color from previous (excluding '和') - ALWAYS start new column at row 0
        if (symbol.value !== '和' && (lastSymbolColor === null || lastSymbolColor !== symbol.color)) {
          // Find first empty column at row 0
          let startCol = 0;
          for (let col = 0; col < 70; col++) {
            if (newSearchBoard[0][col] === null) {
              startCol = col;
              break;
            }
          }
          // Place at row 0 in first empty column
          newSearchBoard[0][startCol] = symbol.value;
          setSymbolPositions(prev => [...prev, {row: 0, col: startCol}]);
          setSearchRow(1);
          setSearchCol(startCol);
          placed = true;
        } else {
          // Same color as previous or '和' symbol
          const prevPos = findPreviousSymbolPosition();
          
          if (prevPos) {
            // First try vertical placement in the same column as previous symbol
            for (let row = prevPos.row + 1; row < 5 && !placed; row++) {
              if (newSearchBoard[row][prevPos.col] === null) {
                newSearchBoard[row][prevPos.col] = symbol.value;
                setSymbolPositions(prev => [...prev, {row, col: prevPos.col}]);
                setSearchRow(row + 1);
                setSearchCol(prevPos.col);
                placed = true;
                break;
              }
            }

            // If no vertical position available, try horizontal placement from previous position
            if (!placed) {
              for (let col = prevPos.col + 1; col < 70 && !placed; col++) {
                if (newSearchBoard[prevPos.row][col] === null) {
                  newSearchBoard[prevPos.row][col] = symbol.value;
                  setSymbolPositions(prev => [...prev, {row: prevPos.row, col}]);
                  setSearchRow(prevPos.row);
                  setSearchCol(col + 1);
                  placed = true;
                  break;
                }
              }
            }
          }

          // If still not placed (first symbol or no position found), start new column at row 0
          if (!placed) {
            for (let col = 0; col < 70; col++) {
              if (newSearchBoard[0][col] === null) {
                newSearchBoard[0][col] = symbol.value;
                setSymbolPositions(prev => [...prev, {row: 0, col}]);
                setSearchRow(1);
                setSearchCol(col);
                placed = true;
                break;
              }
            }
          }
        }

        // Update states
        setMainBoard(newMainBoard);
        setSearchBoard(newSearchBoard);
        
        if (symbol.value !== '和') {
          setLastSymbolColor(symbol.color);
        }

        // Update main board position
        if (currentRow === 5) {
          if (currentCol < 69) {
            setCurrentRow(0);
            setCurrentCol(currentCol + 1);
          }
        } else {
          setCurrentRow(currentRow + 1);
        }
      } else if (activePanel === 'history') {
        // Clear matched positions when editing history panel
        setMatchedPositions([]);
        
        // Update history board
        const newHistoryBoard = historyBoard.map(row => [...row]);
        let placed = false;

        // Find the previous symbol's position (not necessarily same color)
        const findPreviousHistoryPosition = () => {
          // Start from the last position in historyPositions
          if (historyPositions.length > 0) {
            const lastPos = historyPositions[historyPositions.length - 1];
            return { row: lastPos.row, col: lastPos.col };
          }
          return null;
        };

        // Different color from previous (excluding '和') - ALWAYS start new column at row 0
        if (symbol.value !== '和' && (lastHistoryColor === null || lastHistoryColor !== symbol.color)) {
          // Find first empty column at row 0
          let startCol = 0;
          for (let col = 0; col < 70; col++) {
            if (newHistoryBoard[0][col] === null) {
              startCol = col;
              break;
            }
          }
          // Place at row 0 in first empty column
          newHistoryBoard[0][startCol] = symbol.value;
          setHistoryPositions(prev => [...prev, {row: 0, col: startCol}]);
          setHistoryRow(1);
          setHistoryCol(startCol);
          placed = true;
        } else {
          // Same color as previous or '和' symbol
          const prevPos = findPreviousHistoryPosition();
          
          if (prevPos) {
            // First try vertical placement in the same column as previous symbol
            for (let row = prevPos.row + 1; row < 5 && !placed; row++) {
              if (newHistoryBoard[row][prevPos.col] === null) {
                newHistoryBoard[row][prevPos.col] = symbol.value;
                setHistoryPositions(prev => [...prev, {row, col: prevPos.col}]);
                setHistoryRow(row + 1);
                setHistoryCol(prevPos.col);
                placed = true;
                break;
              }
            }

            // If no vertical position available, try horizontal placement from previous position
            if (!placed) {
              for (let col = prevPos.col + 1; col < 70 && !placed; col++) {
                if (newHistoryBoard[prevPos.row][col] === null) {
                  newHistoryBoard[prevPos.row][col] = symbol.value;
                  setHistoryPositions(prev => [...prev, {row: prevPos.row, col}]);
                  setHistoryRow(prevPos.row);
                  setHistoryCol(col + 1);
                  placed = true;
                  break;
                }
              }
            }
          }

          // If still not placed (first symbol or no position found), start new column at row 0
          if (!placed) {
            for (let col = 0; col < 70; col++) {
              if (newHistoryBoard[0][col] === null) {
                newHistoryBoard[0][col] = symbol.value;
                setHistoryPositions(prev => [...prev, {row: 0, col}]);
                setHistoryRow(1);
                setHistoryCol(col);
                placed = true;
                break;
              }
            }
          }
        }

        // Update states
        setHistoryBoard(newHistoryBoard);
        
        if (symbol.value !== '和') {
          setLastHistoryColor(symbol.color);
        }
      }
    }
  };

  const handleBackPress = () => {
    if (activePanel === 'main') {
      const newMainBoard = mainBoard.map(row => [...row]);
      const newSearchBoard = searchBoard.map(row => [...row]);
      
      // Handle main board backspace (6 rows)
      if (currentRow === 0 && currentCol > 0) {
        setCurrentRow(5);
        setCurrentCol(currentCol - 1);
        if (newMainBoard[5] && newMainBoard[5][currentCol - 1] !== undefined) {
          newMainBoard[5][currentCol - 1] = null;
        }
      } else if (currentRow > 0) {
        setCurrentRow(currentRow - 1);
        if (newMainBoard[currentRow - 1] && newMainBoard[currentRow - 1][currentCol] !== undefined) {
          newMainBoard[currentRow - 1][currentCol] = null;
        }
      }

      // Handle search board deletion
      if (symbolPositions.length > 0) {
        const lastPos = symbolPositions[symbolPositions.length - 1];
        const symbolToDelete = newSearchBoard[lastPos.row][lastPos.col];
        
        // Delete the symbol
        newSearchBoard[lastPos.row][lastPos.col] = null;
        
        // Update lastSymbolColor by finding the previous non-'和' symbol
        if (symbolToDelete !== '和') {
          let foundPrevColor = false;
          for (let i = symbolPositions.length - 2; i >= 0; i--) {
            const prevPos = symbolPositions[i];
            const prevSymbol = newSearchBoard[prevPos.row][prevPos.col];
            if (prevSymbol && prevSymbol !== '和') {
              const symbolConfig = SYMBOLS.find(s => s.value === prevSymbol);
              if (symbolConfig) {
                setLastSymbolColor(symbolConfig.color);
                foundPrevColor = true;
                break;
              }
            }
          }
          if (!foundPrevColor) {
            setLastSymbolColor(null);
          }
        }

        // Update positions
        setSearchRow(lastPos.row);
        setSearchCol(lastPos.col);
        setSymbolPositions(prev => prev.slice(0, -1));
      }

      // Reset if all symbols are deleted
      if (symbolPositions.length === 0) {
        setSearchRow(0);
        setSearchCol(0);
        setLastSymbolColor(null);
      }

      setMainBoard(newMainBoard);
      setSearchBoard(newSearchBoard);
    } else if (activePanel === 'history') {
      // Clear matched positions when deleting from history panel
      setMatchedPositions([]);
      
      const newHistoryBoard = historyBoard.map(row => [...row]);
      
      if (historyPositions.length > 0) {
        const lastPos = historyPositions[historyPositions.length - 1];
        const symbolToDelete = newHistoryBoard[lastPos.row][lastPos.col];
        newHistoryBoard[lastPos.row][lastPos.col] = null;

        if (symbolToDelete !== '和') {
          let foundPrevColor = false;
          for (let i = historyPositions.length - 2; i >= 0; i--) {
            const prevPos = historyPositions[i];
            const prevSymbol = newHistoryBoard[prevPos.row][prevPos.col];
            if (prevSymbol && prevSymbol !== '和') {
              const symbolConfig = SYMBOLS.find(s => s.value === prevSymbol);
              if (symbolConfig) {
                setLastHistoryColor(symbolConfig.color);
                foundPrevColor = true;
                break;
              }
            }
          }
          if (!foundPrevColor) {
            setLastHistoryColor(null);
          }
        }

        setHistoryRow(lastPos.row);
        setHistoryCol(lastPos.col);
        setHistoryPositions(prev => prev.slice(0, -1));
      }

      if (historyPositions.length === 0) {
        setHistoryRow(0);
        setHistoryCol(0);
        setLastHistoryColor(null);
      }

      setHistoryBoard(newHistoryBoard);
    }
  };

  const handleSave = async () => {
    // Check if both boards are empty
    const isMainBoardEmpty = mainBoard.every(row => row.every(cell => cell === null));
    const isSearchBoardEmpty = searchBoard.every(row => row.every(cell => cell === null));

    if (isMainBoardEmpty && isSearchBoardEmpty) {
      Alert.alert('提示', '无法保存空白记录，请先输入符号。');
      return;
    }

    try {
      // Get all existing records
      const existingRecords = await getAllRecords();

      // Check for duplicate by comparing search board patterns
      const isDuplicate = existingRecords.some(record => {
        // First check if boards have same dimensions
        if (record.searchBoard.length !== searchBoard.length || 
            record.searchBoard[0].length !== searchBoard[0].length) {
          return false;
        }

        // Compare each cell
        for (let row = 0; row < searchBoard.length; row++) {
          for (let col = 0; col < searchBoard[0].length; col++) {
            if (record.searchBoard[row][col] !== searchBoard[row][col]) {
              return false;
            }
          }
        }
        return true;
      });

      if (isDuplicate) {
        Alert.alert('提示', '相同的记录已存在，无需重复保存。');
        return;
      }

      const savedRecord = await saveRecord(mainBoard, searchBoard);
      setSelectedRecordId(savedRecord.id);
      Alert.alert('成功', '记录保存成功');
    } catch (error) {
      Alert.alert('错误', '保存记录失败');
    }
  };

  const handleSearch = async () => {
    // Check if history board is empty
    const isHistoryBoardEmpty = historyBoard.every(row => row.every(cell => cell === null));

    if (isHistoryBoardEmpty) {
      Alert.alert('提示', '请先输入要搜索的图案。');
      return;
    }

    try {
      setIsSearching(true);
      setShowSearchResults(true);
      const results = await searchRecords(historyBoard);
      setSearchResults(results.records);
    } catch (error) {
      Alert.alert('错误', '搜索记录失败');
    } finally {
      setIsSearching(false);
    }
  };

  const findLastPositions = (board: SymbolType[][], maxRows: number) => {
    let lastRow = 0;
    let lastCol = 0;
    let lastColor = null;

    // Find the last non-null position
    for (let col = board[0].length - 1; col >= 0; col--) {
      let hasSymbol = false;
      for (let row = maxRows - 1; row >= 0; row--) {
        if (board[row][col] !== null) {
          hasSymbol = true;
          lastRow = row;
          lastCol = col;
          // Find the color of the last symbol
          const symbol = board[row][col];
          const symbolConfig = SYMBOLS.find(s => s.value === symbol);
          if (symbolConfig) {
            lastColor = symbolConfig.color;
          }
          break;
        }
      }
      if (hasSymbol) break;
    }

    // Calculate next position
    if (lastRow === maxRows - 1) {
      return {
        nextRow: 0,
        nextCol: lastCol + 1,
        lastColor
      };
    } else {
      return {
        nextRow: lastRow + 1,
        nextCol: lastCol,
        lastColor
      };
    }
  };

  const handleSelectRecord = async (record: ScoreboardRecord) => {
    // First, reset ALL states to initial values for all panels
    const emptyMainBoard = Array(6).fill(null).map(() => Array(70).fill(null));
    const emptySearchBoard = Array(5).fill(null).map(() => Array(70).fill(null));
    
    // Important: Clear symbolPositions first and wait for it to complete
    await new Promise<void>(resolve => {
        setSymbolPositions([]);
        setMatchedPositions(record.matchedPositions || []);
        resolve();
    });

    // Clear main and search panels and their states
    await new Promise<void>(resolve => {
        setMainBoard(emptyMainBoard);
        setSearchBoard(emptySearchBoard);
        
        // Reset position trackers for main and search panels
        setCurrentRow(0);
        setCurrentCol(0);
        setSearchRow(0);
        setSearchCol(0);
        
        // Reset color tracker for search panel
        setLastSymbolColor(null);
        resolve();
    });

    // Now load the selected record
    setMainBoard(record.mainBoard);
    setSearchBoard(record.searchBoard);
    setShowSearchResults(false);
    setShowHistory(false); // Close history modal as well
    setSelectedRecordId(record.id);
    
    // Only change activePanel if we're selecting from history
    if (showHistory) {
        setActivePanel('main');
    }

    // Process main board positions
    const mainPositions = findLastPositions(record.mainBoard, 6);
    setCurrentRow(mainPositions.nextRow);
    setCurrentCol(mainPositions.nextCol);

    // Build positions array for search board
    const positions: {row: number; col: number; symbol: SymbolType}[] = [];
    
    // First collect all positions with their symbols in the order they appear
    for (let col = 0; col < record.searchBoard[0].length; col++) {
        for (let row = 0; row < record.searchBoard.length; row++) {
            const symbol = record.searchBoard[row][col];
            if (symbol !== null) {
                positions.push({row, col, symbol});
            }
        }
    }

    // Sort positions by column first, then by row
    positions.sort((a, b) => {
        if (a.col !== b.col) return a.col - b.col;
        return a.row - b.row;
    });

    // Set the positions array directly
    await new Promise<void>(resolve => {
        const newPositions = positions.map(({row, col}) => ({row, col}));
        setSymbolPositions(newPositions);
        
        // Update last color from the last non-'和' symbol
        for (let i = positions.length - 1; i >= 0; i--) {
            const symbol = positions[i].symbol;
            if (symbol !== '和') {
                const symbolConfig = SYMBOLS.find(s => s.value === symbol);
                if (symbolConfig) {
                    setLastSymbolColor(symbolConfig.color);
                    break;
                }
            }
        }

        // Set search board position to the last position
        if (positions.length > 0) {
            const lastPos = positions[positions.length - 1];
            setSearchRow(lastPos.row);
            setSearchCol(lastPos.col);
        } else {
            setSearchRow(0);
            setSearchCol(0);
        }
        
        resolve();
    });
  };

  const handleHistory = async () => {
    try {
      setIsLoadingHistory(true);
      setShowHistory(true);
      const records = await getAllRecords();
      records.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
      setHistoryRecords(records);
    } catch (error) {
      Alert.alert('错误', '加载历史记录失败');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSelectHistoryRecord = (record: ScoreboardRecord) => {
    // Use the same logic as handleSelectRecord
    handleSelectRecord(record);
  };

  const handleDeleteRecord = async (record: ScoreboardRecord) => {
    try {
      await deleteRecord(record.id);
      // Refresh the history records list
      const records = await getAllRecords();
      records.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
      setHistoryRecords(records);
      
      // If the deleted record was selected, clear everything
      if (record.id === selectedRecordId) {
        // Clear the selection
        setSelectedRecordId(undefined);
        
        // Clear both boards
        setMainBoard(Array(6).fill(null).map(() => Array(70).fill(null)));
        setSearchBoard(Array(5).fill(null).map(() => Array(70).fill(null)));
        
        // Reset positions
        setCurrentRow(0);
        setCurrentCol(0);
        setSearchRow(0);
        setSearchCol(0);
        
        // Reset color tracking
        setLastSymbolColor(null);
        setMatchedPositions([]);
      }
      
      Alert.alert('成功', '记录已删除');
    } catch (error) {
      Alert.alert('错误', '删除记录失败');
    }
  };

  const handleReset = () => {
    Alert.alert(
      '确认重置',
      '您确定要重置所有面板吗？这将清除所有已输入的数据。',
      [
        {
          text: '取消',
          style: 'cancel',
        },
        {
          text: '重置',
          style: 'destructive',
          onPress: () => {
            // Reset all boards
            setMainBoard(Array(6).fill(null).map(() => Array(70).fill(null)));
            setSearchBoard(Array(5).fill(null).map(() => Array(70).fill(null)));
            setHistoryBoard(Array(5).fill(null).map(() => Array(70).fill(null)));
            
            // Reset all positions
            setCurrentRow(0);
            setCurrentCol(0);
            setSearchRow(0);
            setSearchCol(0);
            setHistoryRow(0);
            setHistoryCol(0);
            
            // Reset color tracking
            setLastSymbolColor(null);
            setLastHistoryColor(null);
            
            // Reset position tracking
            setSymbolPositions([]);
            setHistoryPositions([]);
            setMatchedPositions([]);
            
            // Reset selected record
            setSelectedRecordId(undefined);
            
            // Set active panel to main
            setActivePanel('main');
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.mainSection}>
        <View style={styles.scoreboardsContainer}>
            <View style={[
              styles.relatedPanels,
              activePanel === 'main' && styles.selectedPanel
            ]}>
              <Scoreboard 
                data={mainBoard} 
                type="main" 
                onPress={() => setActivePanel('main')}
                isActive={activePanel === 'main'}
              />
              <Scoreboard 
                data={searchBoard} 
                type="search"
                onPress={() => setActivePanel('main')}
                isActive={activePanel === 'main'}
                matchedPositions={matchedPositions}
                searchPattern={historyBoard}
              />
            </View>
            <View style={[
              styles.historyPanel,
              activePanel === 'history' && styles.selectedPanel
            ]}>
              <Scoreboard 
                data={historyBoard} 
                type="history"
                onPress={() => setActivePanel('history')}
                isActive={activePanel === 'history'}
              />
            </View>
        </View>
          <View style={styles.actionButtonsContainer}>
          <ActionButtons
              onSearch={handleSearch}
              onSave={handleSave}
              onHistory={handleHistory}
              onReset={handleReset}
              searchDisabled={activePanel !== 'history'}
            />
          </View>
          <View style={styles.symbolButtonsContainer}>
            <SymbolButtons
              onSymbolPress={handleSymbolPress}
              disabled={false}
            />
          </View>
        </View>
      </View>

      <SearchResultsModal
        visible={showSearchResults}
        onClose={() => setShowSearchResults(false)}
        results={searchResults}
        onSelectRecord={handleSelectRecord}
        loading={isSearching}
        selectedRecordId={selectedRecordId}
        searchPattern={historyBoard}
      />

      <SearchResultsModal
        visible={showHistory}
        onClose={() => setShowHistory(false)}
        results={historyRecords}
        onSelectRecord={handleSelectRecord}
        onDeleteRecord={handleDeleteRecord}
        loading={isLoadingHistory}
        title="历史记录"
        selectedRecordId={selectedRecordId}
        showDeleteButton={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  mainSection: {
    flex: 1,
    flexDirection: 'column',
    padding: 10,
    paddingBottom: 20,
  },
  scoreboardsContainer: {
    height: 420,
    marginBottom: 100,
  },
  relatedPanels: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
  },
  historyPanel: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
  },
  selectedPanel: {
    borderColor: '#6200ee',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    backgroundColor: '#fff',
  },
  actionButtonsContainer: {
    marginTop: 110,
    marginBottom: 10,
  },
  symbolButtonsContainer: {
    marginTop: 10,
  }
});


