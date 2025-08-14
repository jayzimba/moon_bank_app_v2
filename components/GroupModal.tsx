import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { getApiUrl, API_CONFIG } from '@/constants/ApiConfig';
import { useAuthStore } from '@/stores/authStore';
import { FontAwesome6, MaterialIcons } from '@expo/vector-icons';

interface Group {
  group_id: number;
  group_name: string;
  tenure_months: number;
  min_saving_duration: number;
  max_borrow_amount: string | null;
  threshold: string | null;
  created_at: string;
}

interface GroupModalProps {
  visible: boolean;
  onClose: () => void;
  onJoinSuccess: () => void;
  userId?: number; // Make userId optional since we'll get it from auth store
}

export default function GroupModal({ visible, onClose, onJoinSuccess, userId }: GroupModalProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState<number | null>(null);

  const { user, updateLastActivity } = useAuthStore();

  // Use authenticated user's ID or fallback to provided userId
  const actualUserId = user?.user_id || userId || 7;

  useEffect(() => {
    if (visible) {
      fetchGroups();
    }
  }, [visible]);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      console.log('Fetching groups from:', getApiUrl(API_CONFIG.ENDPOINTS.GET_GROUPS));
      
      // Add timeout to fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.GET_GROUPS), {
        signal: controller.signal,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      const data = await response.json();
      console.log('Groups data:', data);

      if (data.success) {
        console.log('Setting groups:', data.groups);
        setGroups(data.groups);
      } else {
        console.error('API returned error:', data);
        Alert.alert('Error', 'Failed to fetch groups');
      }
    } catch (error: any) {
      console.error('Error fetching groups:', error);
      if (error.name === 'AbortError') {
        Alert.alert('Error', 'Request timeout. Please check your connection.');
      } else {
        Alert.alert('Error', 'Failed to fetch groups. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const joinGroup = async (group: Group) => {
    setJoining(group.group_id);
    try {
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.REQUEST_JOIN_GROUP), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          user_id: actualUserId.toString(),
          group_id: group.group_id.toString(),
        }).toString(),
      });

      const data = await response.json();

      if (data.success) {
        // Update last activity when successfully joining a group
        updateLastActivity();
        
        Alert.alert('Success', data.message, [
          {
            text: 'OK',
            onPress: () => {
              onJoinSuccess();
              onClose();
            },
          },
        ]);
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      console.error('Error joining group:', error);
      Alert.alert('Error', 'Failed to join group');
    } finally {
      setJoining(null);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Join a Group</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={Colors.light.primary} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.light.primary} />
              <Text style={styles.loadingText}>Loading groups...</Text>
            </View>
          ) : (
            <View style={styles.contentContainer}>
              <Text style={styles.debugText}>Groups count: {groups.length}</Text>
              {groups.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <FontAwesome6 name="users" size={50} color="grey" />
                  <Text style={styles.emptyText}>No groups available</Text>
                  <TouchableOpacity 
                    style={styles.retryButton}
                    onPress={fetchGroups}
                  >
                    <Text style={styles.retryButtonText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <ScrollView 
                  style={styles.groupsContainer}
                  showsVerticalScrollIndicator={true}
                  contentContainerStyle={styles.scrollContent}
                >
                  {groups.map((group) => (
                    <View key={group.group_id} style={styles.groupCard}>
                      <View style={styles.groupHeader}>
                        <FontAwesome6 name="users" size={24} color={Colors.light.primary} />
                        <Text style={styles.groupName}>{group.group_name}</Text>
                      </View>
                      
                      <View style={styles.groupDetails}>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Tenure:</Text>
                          <Text style={styles.detailValue}>{group.tenure_months} months</Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Min Saving:</Text>
                          <Text style={styles.detailValue}>{group.min_saving_duration} months</Text>
                        </View>
                        {group.max_borrow_amount && (
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Max Loan:</Text>
                            <Text style={styles.detailValue}>ZMW {group.max_borrow_amount}</Text>
                          </View>
                        )}
                      </View>

                      <TouchableOpacity
                        style={[
                          styles.joinButton,
                          joining === group.group_id && styles.joinButtonDisabled
                        ]}
                        onPress={() => joinGroup(group)}
                        disabled={joining === group.group_id}
                      >
                        {joining === group.group_id ? (
                          <ActivityIndicator size="small" color="white" />
                        ) : (
                          <Text style={styles.joinButtonText}>Join Group</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    height: '80%', // Set to 70% of screen height
    maxHeight: '80%',
    minHeight: 400, // Ensure minimum height
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.primary,
  },
  closeButton: {
    padding: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: 'grey',
  },
  contentContainer: {
    flex: 1,
    minHeight: 200, // Ensure content area has minimum height
  },
  groupsContainer: {
    flex: 1,
    marginTop: 10,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: 'grey',
  },
  groupCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    color: Colors.light.primary,
  },
  groupDetails: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: 'grey',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  joinButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  joinButtonDisabled: {
    backgroundColor: '#ccc',
  },
  joinButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  debugText: {
    fontSize: 14,
    color: 'grey',
    marginBottom: 10,
    textAlign: 'center',
    backgroundColor: '#f0f0f0',
    padding: 5,
    borderRadius: 5,
  },
  retryButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 10,
    padding: 10,
    marginTop: 20,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
