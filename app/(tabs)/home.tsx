import React, { useState, useEffect } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Colors } from "@/constants/Colors";
import { getApiUrl, API_CONFIG } from "@/constants/ApiConfig";
import GroupModal from "@/components/GroupModal";
import { useAuthStore } from "@/stores/authStore";
import {
  FontAwesome,
  FontAwesome5,
  FontAwesome6,
  MaterialCommunityIcons,
  MaterialIcons,
  Ionicons,
  AntDesign,
} from "@expo/vector-icons";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

interface UserGroup {
  group_id: number;
  group_name: string;
  status: string;
  created_at: string;
}

interface ContributionData {
  total_deposits: number;
  total_withdrawals: number;
  total_contribution: number;
  formatted_contribution: string;
}

interface RecentTransaction {
  transaction_type: string;
  amount: string;
  transaction_date: string;
}

export default function HomeScreen() {
  const [isGroupMember, setIsGroupMember] = useState(false);
  const [userGroup, setUserGroup] = useState<UserGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [contributionData, setContributionData] = useState<ContributionData>({
    total_deposits: 0,
    total_withdrawals: 0,
    total_contribution: 0,
    formatted_contribution: "0.00"
  });
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [contributionLoading, setContributionLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { user, isAuthenticated, logout, updateLastActivity } = useAuthStore();

  // Use authenticated user's ID
  const userId = user?.user_id || 7; // Fallback to 7 for demo purposes

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      router.replace("/login");
      return;
    }

    checkUserGroupMembership();
    fetchUserContribution();
  }, [isAuthenticated, user]);

  const checkUserGroupMembership = async () => {
    try {
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.CHECK_USER_GROUP), {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          user_id: userId.toString(),
        }).toString(),
      });

      const data = await response.json();

      if (data.success) {
        setIsGroupMember(data.is_member);
        setUserGroup(data.group);
      } else {
        console.error("Error checking group membership:", data.message);
      }
    } catch (error) {
      console.error("Error checking group membership:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserContribution = async () => {
    setContributionLoading(true);
    try {
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.GET_USER_CONTRIBUTION), {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          user_id: userId.toString(),
        }).toString(),
      });

      const data = await response.json();

      if (data.success) {
        setContributionData(data.contribution);
        setRecentTransactions(data.recent_transactions || []);
      } else {
        console.error("Error fetching contribution:", data.message);
        // Set default values if there's an error
        setContributionData({
          total_deposits: 0,
          total_withdrawals: 0,
          total_contribution: 0,
          formatted_contribution: "0.00"
        });
      }
    } catch (error) {
      console.error("Error fetching contribution:", error);
      // Set default values if there's an error
      setContributionData({
        total_deposits: 0,
        total_withdrawals: 0,
        total_contribution: 0,
        formatted_contribution: "0.00"
      });
    } finally {
      setContributionLoading(false);
    }
  };

  const handleJoinGroupSuccess = () => {
    checkUserGroupMembership();
    // Refresh contribution data after joining a group
    fetchUserContribution();
    // Update last activity
    updateLastActivity();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    updateLastActivity();

    try {
      // Refresh both group membership and contribution data
      await Promise.all([
        checkUserGroupMembership(),
        fetchUserContribution()
      ]);

      // Show brief success feedback
      setTimeout(() => {
        // Optional: You could add a toast notification here
        console.log('Refresh completed successfully');
      }, 500);

    } catch (error) {
      console.error('Refresh error:', error);
      // Show error feedback if needed
      Alert.alert('Refresh Error', 'Failed to refresh data. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleCardPress = (cardName: string) => {
    // Update last activity on any user interaction
    updateLastActivity();

    if (!isGroupMember) {
      Alert.alert(
        "Join a Group First",
        "You need to join a group before you can use this feature.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Join Group", onPress: () => setModalVisible(true) },
        ]
      );
      return;
    }

    // Handle card actions when user is a group member
    switch (cardName) {
      case "Contribute":
        router.navigate("/contribute");
        break;
      case "Get Loan":
        router.navigate("/(tabs)/loans");
        break;
      case "Statements":
        router.navigate("/(tabs)/statements");
        break;
      case "Group":
        router.navigate("/(tabs)/groups");
        break;
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: () => {
            logout();
            router.replace("/");
          }
        },
      ]
    );
  };

  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <AntDesign name="arrowright" size={18} color="#28a745" />;
      case 'withdrawal':
        return <AntDesign name="arrowleft" size={18} color="#dc3545" />;
      case 'loan':
        return <FontAwesome6 name="money-bill-transfer" size={18} color="#ffc107" />;
      case 'repayment':
        return <FontAwesome6 name="handshake" size={18} color="#17a2b8" />;
      default:
        return <AntDesign name="wallet" size={18} color="#6c757d" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
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
        {/* User Info Header */}
        <View style={styles.userHeader}>
          <View style={styles.userInfo}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.username || 'User'}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <FontAwesome6 name="right-from-bracket" size={20} color={'red'} />
          </TouchableOpacity>
        </View>

        {/* Group Banner Notification */}
        {!isGroupMember && (
          <View style={styles.bannerContainer}>
            <View style={styles.bannerContent}>
              <FontAwesome6 name="exclamation-triangle" size={20} color="#fff" />
              <Text style={styles.bannerText}>
                Join a group to access all features
              </Text>
            </View>
            <TouchableOpacity
              style={styles.bannerButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.bannerButtonText}>Join Now</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Group Member Status */}
        {isGroupMember && userGroup && (
          <View style={styles.groupStatusContainer}>
            <View style={styles.groupStatusContent}>
              <FontAwesome6 name="check-circle" size={20} color="#28a745" />
              <Text style={styles.groupStatusText}>
                Member of {userGroup.group_name}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.mainContent}>
          <View style={styles.contributionSection}>
            <View style={styles.contributionHeader}>
              <Text style={styles.contributionLabel}>Contribution</Text>
              <TouchableOpacity onPress={fetchUserContribution} disabled={contributionLoading || refreshing}>
                <FontAwesome6
                  name="rotate-right"
                  size={16}
                  color={Colors.light.primary}
                  style={contributionLoading || refreshing ? styles.rotating : undefined}
                />
              </TouchableOpacity>
            </View>

            {(contributionLoading || refreshing) ? (
              <View style={styles.contributionLoading}>
                <ActivityIndicator size="small" color={Colors.light.primary} />
                <Text style={styles.loadingText}>
                  {refreshing ? "Refreshing..." : "Updating..."}
                </Text>
              </View>
            ) : (
              <View style={styles.contributionAmount}>
                <Text style={styles.currency}>ZMW</Text>
                <Text style={styles.amount}>{contributionData.formatted_contribution}</Text>
              </View>
            )}

            {/* Contribution Breakdown */}
            <View style={styles.contributionBreakdown}>
              <View style={styles.breakdownItem}>
                <FontAwesome6 name="arrow-down" size={12} color="#28a745" />
                <Text style={styles.breakdownLabel}>Deposits:</Text>
                <Text style={styles.breakdownValue}>ZMW {contributionData.total_deposits.toFixed(2)}</Text>
              </View>
              <View style={styles.breakdownItem}>
                <FontAwesome6 name="arrow-up" size={12} color="#dc3545" />
                <Text style={styles.breakdownLabel}>Withdrawals:</Text>
                <Text style={styles.breakdownValue}>ZMW {contributionData.total_withdrawals.toFixed(2)}</Text>
              </View>
            </View>
          </View>
          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsRow}>
              <TouchableOpacity
                style={[
                  styles.quickActionCard,
                  !isGroupMember && styles.quickActionDisabled
                ]}
                onPress={() => handleCardPress("Contribute")}
                disabled={!isGroupMember}
              >
                <FontAwesome6
                  name="money-bills"
                  size={16}
                  color={isGroupMember ? Colors.light.primary : "#ccc"}
                />
                <Text style={[
                  styles.quickActionText,
                  !isGroupMember && styles.quickActionTextDisabled
                ]}>
                  Contribute
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.quickActionCard,
                  !isGroupMember && styles.quickActionDisabled
                ]}
                onPress={() => handleCardPress("Get Loan")}
                disabled={!isGroupMember}
              >
                <FontAwesome5
                  name="hand-holding-usd"
                  size={16}
                  color={isGroupMember ? Colors.light.primary : "#ccc"}
                />
                <Text style={[
                  styles.quickActionText,
                  !isGroupMember && styles.quickActionTextDisabled
                ]}>
                  Get Loan
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.quickActionCard,
                  !isGroupMember && styles.quickActionDisabled
                ]}
                onPress={() => handleCardPress("Statements")}
                disabled={!isGroupMember}
              >
                <FontAwesome
                  name="clipboard"
                  size={16}
                  color={isGroupMember ? Colors.light.primary : "#ccc"}
                />
                <Text style={[
                  styles.quickActionText,
                  !isGroupMember && styles.quickActionTextDisabled
                ]}>
                  Statements
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.quickActionCard,
                  !isGroupMember && styles.quickActionDisabled
                ]}
                onPress={() => handleCardPress("Group")}
                disabled={!isGroupMember}
              >
                <MaterialCommunityIcons
                  name="account-group"
                  size={18}
                  color={isGroupMember ? Colors.light.primary : "#ccc"}
                />
                <Text style={[
                  styles.quickActionText,
                  !isGroupMember && styles.quickActionTextDisabled
                ]}>
                  Group
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          {/* Recent Transactions */}
          {recentTransactions.length > 0 && (
            <View style={styles.recentTransactionsSection}>
              <Text style={styles.sectionTitle}>Recent Transactions</Text>
              <View style={styles.transactionsList}>
                {recentTransactions.slice(0, 3).map((transaction, index) => (
                  <View key={index} style={styles.transactionItem}>
                    <View style={styles.transactionIcon}>
                      {getTransactionTypeIcon(transaction.transaction_type)}
                    </View>
                    <View style={styles.transactionDetails}>
                      <Text style={styles.transactionType}>
                        {transaction.transaction_type.charAt(0).toUpperCase() +
                          transaction.transaction_type.slice(1)}
                      </Text>
                      <Text style={styles.transactionDate}>
                        {formatDate(transaction.transaction_date)}
                      </Text>
                    </View>
                    <Text style={[
                      styles.transactionAmount,
                      transaction.transaction_type === 'deposit' ? styles.positiveAmount : styles.negativeAmount
                    ]}>
                      ZMW {parseFloat(transaction.amount).toFixed(2)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}


        </View>

        {/* Group Modal */}
        <GroupModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onJoinSuccess={handleJoinGroupSuccess}
          userId={userId}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "grey",
  },
  userHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  userInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    color: "#666",
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.light.primary,
  },
  logoutButton: {
    padding: 10,
  },
  bannerContainer: {
    backgroundColor: "#ff6b35",
    padding: 15,
    margin: 10,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bannerContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  bannerText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 10,
  },
  bannerButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  bannerButtonText: {
    color: "#ff6b35",
    fontSize: 12,
    fontWeight: "bold",
  },
  groupStatusContainer: {
    backgroundColor: "#d4edda",
    padding: 15,
    margin: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#c3e6cb",
  },
  groupStatusContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  groupStatusText: {
    color: "#155724",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 10,
  },
  mainContent: {
    padding: 10,
  },
  contributionSection: {
    marginBottom: 20,
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 10,
  },
  contributionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  contributionLabel: {
    fontSize: 18,
    color: "#666",
    fontWeight: "600",
  },
  contributionLoading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  contributionAmount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 15,
  },
  currency: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  amount: {
    fontSize: 16,
    fontWeight: "400",
    color: "#333",
  },
  contributionBreakdown: {
    gap: 8,
  },
  breakdownItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  breakdownLabel: {
    fontSize: 12,
    color: "#666",
    flex: 1,
  },
  breakdownValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
  recentTransactionsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
    paddingTop: 20,
    marginStart: 10
  },
  transactionsList: {
    gap: 8,
    marginStart: 20
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  transactionIcon: {
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionType: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  transactionDate: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: "bold",
  },
  positiveAmount: {
    color: "#28a745",
  },
  negativeAmount: {
    color: "#dc3545",
  },
  rotating: {
    transform: [{ rotate: '360deg' }],
  },
  quickActionsContainer: {
    paddingHorizontal: 10,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
    minHeight: 80,
  },
  quickActionDisabled: {
    backgroundColor: '#f5f5f5',
    opacity: 0.6,
  },
  quickActionText: {
    marginTop: 8,
    fontSize: 10,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  quickActionTextDisabled: {
    color: '#ccc',
  },
});
