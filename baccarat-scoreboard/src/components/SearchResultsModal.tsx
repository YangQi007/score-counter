import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { ScoreboardRecord, SymbolType } from '../types/types';
import Scoreboard from './Scoreboard';

interface SearchResultsModalProps {
  visible: boolean;
  onClose: () => void;
  results: ScoreboardRecord[];
  onSelectRecord: (record: ScoreboardRecord) => void;
  onDeleteRecord?: (record: ScoreboardRecord) => void;
  loading?: boolean;
  title?: string;
  selectedRecordId?: string;
  showDeleteButton?: boolean;
  searchPattern?: SymbolType[][];
}

const SearchResultsModal: React.FC<SearchResultsModalProps> = ({
  visible,
  onClose,
  results,
  onSelectRecord,
  onDeleteRecord,
  loading = false,
  title = '搜索结果',
  selectedRecordId,
  showDeleteButton = false,
  searchPattern,
}) => {
  const handleDelete = (record: ScoreboardRecord) => {
    Alert.alert(
      '确认删除',
      '您确定要删除这条记录吗？',
      [
        {
          text: '取消',
          style: 'cancel',
        },
        {
          text: '删除',
          style: 'destructive',
          onPress: () => onDeleteRecord?.(record),
        },
      ],
      { cancelable: true }
    );
  };

  const renderItem = ({ item }: { item: ScoreboardRecord }) => (
    <TouchableOpacity
      style={[
        styles.resultItem,
        item.id === selectedRecordId && styles.selectedItem
      ]}
      onPress={() => onSelectRecord(item)}
    >
      <View style={styles.resultHeader}>
        <Text style={styles.timestamp}>
          {new Date(item.savedAt).toLocaleString()}
        </Text>
        {showDeleteButton && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item)}
          >
            <Text style={styles.deleteButtonText}>删除</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.scoreboardContainer}>
        <Scoreboard
          data={item.searchBoard}
          type="search"
          matchedPositions={item.matchedPositions}
          searchPattern={searchPattern}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>关闭</Text>
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6200ee" />
              <Text style={styles.loadingText}>搜索中...</Text>
            </View>
          ) : results.length === 0 ? (
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsText}>未找到匹配的记录</Text>
            </View>
          ) : (
            <FlatList
              data={results}
              renderItem={renderItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={true}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    height: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: '#6200ee',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
  },
  listContent: {
    paddingBottom: 20,
  },
  resultItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedItem: {
    borderColor: '#6200ee',
    borderWidth: 2,
    backgroundColor: '#f5f5f5',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  timestamp: {
    fontSize: 14,
    color: '#666',
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  scoreboardContainer: {
    width: '100%',
    height: 180,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'visible',
    paddingBottom: 10,
  },
});

export default SearchResultsModal; 