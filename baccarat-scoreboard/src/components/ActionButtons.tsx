import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';

interface ActionButtonsProps {
  onSearch: () => void;
  onSave: () => void;
  onHistory: () => void;
  onReset: () => void;
  searchDisabled?: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ 
  onSearch, 
  onSave, 
  onHistory,
  onReset,
  searchDisabled = false 
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.button, searchDisabled && styles.buttonDisabled]} 
        onPress={onSearch}
        disabled={searchDisabled}
      >
        <Text style={[styles.buttonText, searchDisabled && styles.buttonTextDisabled]}>搜索</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={onSave}>
        <Text style={styles.buttonText}>保存</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={onHistory}>
        <Text style={styles.buttonText}>历史</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.resetButton]} onPress={onReset}>
        <Text style={styles.buttonText}>重置</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: '#800080',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    width: '23%',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  },
  resetButton: {
    backgroundColor: '#ff4444',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  buttonTextDisabled: {
    color: '#666666',
  },
});

export default ActionButtons; 