import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { SymbolConfig } from '../types/types';

export const SYMBOLS: SymbolConfig[] = [
  { value: '8-blue', color: 'blue' },
  { value: '9-blue', color: 'blue' },
  { value: '8-red', color: 'red' },
  { value: '9-red', color: 'red' },
  { value: '龙', color: 'red' },
  { value: '猫', color: 'blue' },
  { value: '←', color: 'orange' },
  { value: '庄', color: 'red' },
  { value: '闲', color: 'blue' },
  { value: '和', color: 'green' },
];

interface SymbolButtonsProps {
  onSymbolPress: (symbol: SymbolConfig) => void;
  disabled?: boolean;
}

const SymbolButtons: React.FC<SymbolButtonsProps> = ({ onSymbolPress, disabled }) => {
  return (
    <View style={styles.container}>
      {SYMBOLS.map((symbol, index) => (
        <TouchableOpacity
          key={`${symbol.value}-${index}`}
          style={[
            styles.button,
            { backgroundColor: symbol.color },
            disabled && styles.disabledButton
          ]}
          onPress={() => onSymbolPress(symbol)}
          disabled={disabled}
        >
          <Text style={styles.buttonText}>
            {symbol.value ? symbol.value.split('-')[0] : ''}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default SymbolButtons; 