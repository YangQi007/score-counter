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
} from 'react-native';
import { ScoreboardRecord } from '../types/types';

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

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#800080" />
            </View>
          ) : results.length === 0 ? (
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsText}>没有找到记录</Text>
            </View>
          ) : (
            <ScrollView style={styles.resultsList}>
              {results.map((record) => (
                <View key={record.id} style={styles.recordContainer}>
                  <TouchableOpacity
                    style={[
                      styles.resultItem,
                      record.id === selectedRecordId && styles.selectedResultItem
                    ]}
                    onPress={() => onSelectRecord(record)}
                  >
                    <View style={styles.resultContent}>
                      <Text style={[
                        styles.resultDate,
                        record.id === selectedRecordId && styles.selectedResultText
                      ]}>
                        {new Date(record.savedAt).toLocaleString('zh-CN')}
                      </Text>
                      {record.id === selectedRecordId && (
                        <Text style={styles.selectedIndicator}>✓</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                  {showDeleteButton && (
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDelete(record)}
                    >
                      <Text style={styles.deleteButtonText}>×</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </ScrollView>
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
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noResultsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noResultsText: {
    color: '#666',
    fontSize: 16,
  },
  resultsList: {
    maxHeight: '100%',
  },
  recordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  resultItem: {
    flex: 1,
    padding: 15,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  selectedResultItem: {
    backgroundColor: '#f0e6ff',
    borderColor: '#800080',
  },
  resultContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultDate: {
    fontSize: 16,
    color: '#333',
  },
  selectedResultText: {
    color: '#800080',
    fontWeight: '600',
  },
  selectedIndicator: {
    color: '#800080',
    fontSize: 18,
    fontWeight: 'bold',
  },
  deleteButton: {
    marginLeft: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default SearchResultsModal; 