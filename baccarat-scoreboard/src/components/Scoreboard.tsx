import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Text } from 'react-native';
import { SymbolType } from '../types/types';

interface ScoreboardProps {
  data: SymbolType[][];
  type: 'main' | 'search' | 'history';
  onPress?: () => void;
  isActive?: boolean;
  matchedPositions?: { startRow: number; startCol: number }[];
  searchPattern?: SymbolType[][];
}

const Scoreboard: React.FC<ScoreboardProps> = ({ 
  data, 
  type, 
  onPress,
  matchedPositions = [],
  searchPattern = []
}) => {
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (matchedPositions && matchedPositions.length > 0 && scrollViewRef.current) {
      // Get the first match position
      const firstMatch = matchedPositions[0];
      // Calculate scroll position to center the match
      // Each cell is 30px wide, we want to center the pattern
      const patternWidth = searchPattern[0]?.length || 1;
      const scrollToX = Math.max(0, (firstMatch.startCol * 30) - 100); // 100px offset from left
      
      // Scroll to position with animation
      scrollViewRef.current.scrollTo({ x: scrollToX, animated: true });
    }
  }, [matchedPositions, searchPattern]);

  const isPositionHighlighted = (rowIndex: number, colIndex: number): boolean => {
    if (!matchedPositions || !searchPattern) return false;

    return matchedPositions.some(pos => {
      const searchRows = searchPattern.length;
      const searchCols = searchPattern[0]?.length || 0;
      
      // Check if current position is within a matched pattern area
      if (rowIndex >= pos.startRow && 
          rowIndex < pos.startRow + searchRows && 
          colIndex >= pos.startCol && 
          colIndex < pos.startCol + searchCols) {
        // Only highlight if the corresponding position in search pattern is not null
        const searchPatternRow = rowIndex - pos.startRow;
        const searchPatternCol = colIndex - pos.startCol;
        return searchPattern[searchPatternRow][searchPatternCol] !== null;
      }
      return false;
    });
  };

  const getCellColor = (cell: SymbolType) => {
    switch (cell) {
      case '庄':
      case '龙':
      case '8-red':
      case '9-red':
        return styles.redCell;
      case '闲':
      case '猫':
      case '8-blue':
      case '9-blue':
        return styles.blueCell;
      case '和':
        return styles.greenCell;
      default:
        return null;
    }
  };

  return (
    <View 
      style={[
        styles.container, 
        styles[type]
      ]}
      onTouchEnd={onPress}
    >
      <View style={styles.outerContainer}>
        <ScrollView 
          ref={scrollViewRef}
          horizontal 
          showsHorizontalScrollIndicator={true}
        >
          <View style={[
            styles.gridContainer,
            type === 'main' && styles.mainGridContainer
          ]}>
            {data.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.row}>
                {row.map((cell, colIndex) => (
                  <View
                    key={`${rowIndex}-${colIndex}`}
                    style={[
                      styles.cell
                    ]}
                  >
                    {cell && (
                      <View style={[
                        getCellColor(cell),
                        isPositionHighlighted(rowIndex, colIndex) && styles.highlightedCell
                      ]}>
                        <Text style={styles.cellText}>
                          {cell === '8-blue' || cell === '8-red' ? '8' :
                           cell === '9-blue' || cell === '9-red' ? '9' :
                           cell}
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginVertical: 5,
    height: 170,
  },
  outerContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
  },
  gridContainer: {
    flexDirection: 'column',
    height: 150,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  mainGridContainer: {
    height: 180,
  },
  main: {
    height: 200,
  },
  search: {
    height: 170,
  },
  history: {
    height: 170,
  },
  row: {
    flexDirection: 'row',
    height: 30,
  },
  cell: {
    width: 30,
    height: 30,
    borderWidth: 0.5,
    borderColor: '#ddd',
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
    lineHeight: 20,
  },
  redCell: {
    backgroundColor: 'red',
    borderRadius: 15,
    width: 26,
    height: 26,
    margin: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blueCell: {
    backgroundColor: 'blue',
    borderRadius: 15,
    width: 26,
    height: 26,
    margin: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greenCell: {
    backgroundColor: 'green',
    borderRadius: 15,
    width: 26,
    height: 26,
    margin: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  highlightedCell: {
    borderWidth: 2,
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default Scoreboard; 