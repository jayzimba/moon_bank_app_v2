import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { getApiUrl, API_CONFIG } from '@/constants/ApiConfig';
import { useAuthStore } from '@/stores/authStore';
import {
  FontAwesome6,
  MaterialIcons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

interface GroupMember {
  user_id: number;
  username: string;
  email: string;
  join_date: string;
  status: string;
}

interface GroupInfo {
  group_id: number;
  group_name: string;
  tenure_months: number;
  min_saving_duration: number;
  max_borrow_amount: string;
  threshold: string;
  total_members: number;
  total_contributions: number;
  created_at: string;
}

export default function GroupsScreen() {
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'members'>('info');

  const { user, updateLastActivity } = useAuthStore();

  useEffect(() => {
    fetchGroupData();
  }, []);

  const fetchGroupData = async () => {
    try {
      // Fetch user's group information
      const groupResponse = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.CHECK_USER_GROUP), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          user_id: user?.user_id?.toString() || '',
        }).toString(),
      });

      const groupData = await groupResponse.json();

      if (groupData.success && groupData.is_member) {
        // Fetch detailed group information and members
        const membersResponse = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.GET_GROUP_MEMBERS), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            group_id: groupData.group.group_id.toString(),
          }).toString(),
        });

        const membersData = await membersResponse.json();

        if (membersData.success) {
          setGroupInfo({
            group_id: membersData.group_info.group_id,
            group_name: membersData.group_info.group_name,
            tenure_months: membersData.group_info.tenure_months,
            min_saving_duration: membersData.group_info.min_saving_duration,
            max_borrow_amount: membersData.group_info.max_borrow_amount || '5000.00',
            threshold: membersData.group_info.threshold || '1000.00',
            total_members: membersData.total_members,
            total_contributions: membersData.total_contributions,
            created_at: membersData.group_info.created_at,
          });

          setMembers(membersData.members.map((member: any) => ({
            user_id: member.user_id,
            username: member.username,
            email: member.email,
            join_date: member.join_date,
            status: member.status,
          })));
        }
      }
    } catch (error) {
      console.error('Error fetching group data:', error);
      Alert.alert('Error', 'Failed to load group information');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    updateLastActivity();
    
    try {
      await fetchGroupData();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLeaveGroup = () => {
    Alert.alert(
      'Leave Group',
      'Are you sure you want to leave this group? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave Group',
          style: 'destructive',
          onPress: () => {
            // Implement leave group functionality
            Alert.alert('Success', 'You have left the group successfully');
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={styles.loadingText}>Loading group information...</Text>
      </View>
    );
  }

  if (!groupInfo) {
    return (
      <View style={styles.noGroupContainer}>
        <FontAwesome6 name="users" size={80} color="#ccc" />
        <Text style={styles.noGroupTitle}>No Group Found</Text>
        <Text style={styles.noGroupText}>
          You are not currently a member of any group. Join a group to access this feature.
        </Text>
        <TouchableOpacity style={styles.joinGroupButton}>
          <Text style={styles.joinGroupButtonText}>Join a Group</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[Colors.light.primary]}
          tintColor={Colors.light.primary}
          title="Pull to refresh"
          titleColor={Colors.light.primary}
          progressBackgroundColor="#f8f9fa"
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <FontAwesome6 name="users" size={24} color={Colors.light.primary} />
          <Text style={styles.headerTitle}>My Group</Text>
        </View>
        <TouchableOpacity onPress={handleLeaveGroup} style={styles.leaveButton}>
          <MaterialIcons name="exit-to-app" size={20} color="#dc3545" />
          <Text style={styles.leaveButtonText}>Leave</Text>
        </TouchableOpacity>
      </View>

      {/* Group Overview Card */}
      <View style={styles.overviewCard}>
        <View style={styles.groupNameContainer}>
          <FontAwesome6 name="building" size={24} color={Colors.light.primary} />
          <Text style={styles.groupName}>{groupInfo.group_name}</Text>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{groupInfo.total_members}</Text>
            <Text style={styles.statLabel}>Members</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>ZMW {groupInfo.total_contributions.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total Contributions</Text>
          </View>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'info' && styles.activeTab]}
          onPress={() => setActiveTab('info')}
        >
          <MaterialIcons 
            name="info-outline" 
            size={20} 
            color={activeTab === 'info' ? Colors.light.primary : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'info' && styles.activeTabText]}>
            Group Info
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'members' && styles.activeTab]}
          onPress={() => setActiveTab('members')}
        >
          <FontAwesome6 
            name="users" 
            size={20} 
            color={activeTab === 'members' ? Colors.light.primary : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'members' && styles.activeTabText]}>
            Members ({members.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'info' ? (
        <View style={styles.tabContent}>
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Group Details</Text>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Tenure Period</Text>
              <Text style={styles.infoValue}>{groupInfo.tenure_months} months</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Minimum Saving Duration</Text>
              <Text style={styles.infoValue}>{groupInfo.min_saving_duration} months</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Maximum Loan Amount</Text>
              <Text style={styles.infoValue}>ZMW {groupInfo.max_borrow_amount}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Contribution Threshold</Text>
              <Text style={styles.infoValue}>ZMW {groupInfo.threshold}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Group Created</Text>
              <Text style={styles.infoValue}>
                {new Date(groupInfo.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Group Rules</Text>
            
            <View style={styles.ruleItem}>
              <MaterialIcons name="check-circle" size={16} color="#28a745" />
              <Text style={styles.ruleText}>Monthly contributions are mandatory</Text>
            </View>
            
            <View style={styles.ruleItem}>
              <MaterialIcons name="check-circle" size={16} color="#28a745" />
              <Text style={styles.ruleText}>Minimum 3 months saving before loan eligibility</Text>
            </View>
            
            <View style={styles.ruleItem}>
              <MaterialIcons name="check-circle" size={16} color="#28a745" />
              <Text style={styles.ruleText}>Loans must be repaid within 12 months</Text>
            </View>
            
            <View style={styles.ruleItem}>
              <MaterialIcons name="check-circle" size={16} color="#28a745" />
              <Text style={styles.ruleText}>Group meetings held monthly</Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.tabContent}>
          <View style={styles.membersSection}>
            <Text style={styles.sectionTitle}>Group Members</Text>
            
            {members.map((member, index) => (
              <View key={member.user_id} style={styles.memberItem}>
                <View style={styles.memberAvatar}>
                  <Text style={styles.avatarText}>
                    {member.username.charAt(0).toUpperCase()}
                  </Text>
                </View>
                
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{member.username}</Text>
                  <Text style={styles.memberEmail}>{member.email}</Text>
                  <Text style={styles.memberJoinDate}>
                    Joined {new Date(member.join_date).toLocaleDateString()}
                  </Text>
                </View>
                
                <View style={styles.memberStatus}>
                  <View style={[styles.statusBadge, member.status === 'active' && styles.activeBadge]}>
                    <Text style={[styles.statusText, member.status === 'active' && styles.activeStatusText]}>
                      {member.status}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: 'grey',
  },
  noGroupContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  noGroupTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  noGroupText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  joinGroupButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  joinGroupButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.primary,
    marginLeft: 10,
  },
  leaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  leaveButtonText: {
    color: '#dc3545',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  overviewCard: {
    backgroundColor: '#f8f9fa',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  groupNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  groupName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.light.primary,
    marginLeft: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e9ecef',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 5,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginLeft: 5,
  },
  activeTabText: {
    color: Colors.light.primary,
  },
  tabContent: {
    paddingHorizontal: 20,
  },
  infoSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ruleText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  membersSection: {
    marginBottom: 30,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  memberEmail: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  memberJoinDate: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  memberStatus: {
    marginLeft: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  activeBadge: {
    backgroundColor: '#d4edda',
  },
  statusText: {
    fontSize: 10,
    color: '#666',
    fontWeight: '600',
  },
  activeStatusText: {
    color: '#155724',
  },
});
