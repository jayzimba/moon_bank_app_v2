import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { getApiUrl, API_CONFIG } from '@/constants/ApiConfig';
import { useAuthStore } from '@/stores/authStore';
import {
  FontAwesome6,
  MaterialIcons,
  MaterialCommunityIcons,
  AntDesign,
} from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Transaction {
  transaction_id: number;
  transaction_type: string;
  amount: string;
  transaction_date: string;
  description?: string;
}

interface TransactionSummary {
  total_deposits: number;
  total_withdrawals: number;
  total_loans: number;
  total_repayments: number;
  net_balance: number;
}

export default function StatementsScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary>({
    total_deposits: 0,
    total_withdrawals: 0,
    total_loans: 0,
    total_repayments: 0,
    net_balance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'deposit' | 'withdrawal' | 'loan' | 'repayment'>('all');

  const { user, updateLastActivity } = useAuthStore();

  useEffect(() => {
    fetchTransactionHistory();
  }, []);

  const fetchTransactionHistory = async () => {
    try {
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.TRANSACTION_HISTORY), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          user_id: user?.user_id?.toString() || '',
        }).toString(),
      });

      const data = await response.json();

      if (data.success) {
        setTransactions(data.transactions || []);
        calculateSummary(data.transactions || []);
      } else {
        console.error('Error fetching transactions:', data.message);
      }
    } catch (error) {
      console.error('Error fetching transaction history:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (transactions: Transaction[]) => {
    const summary = transactions.reduce(
      (acc, transaction) => {
        const amount = parseFloat(transaction.amount);
        switch (transaction.transaction_type) {
          case 'deposit':
            acc.total_deposits += amount;
            break;
          case 'withdrawal':
            acc.total_withdrawals += amount;
            break;
          case 'loan':
            acc.total_loans += amount;
            break;
          case 'repayment':
            acc.total_repayments += amount;
            break;
        }
        return acc;
      },
      {
        total_deposits: 0,
        total_withdrawals: 0,
        total_loans: 0,
        total_repayments: 0,
        net_balance: 0,
      }
    );

    summary.net_balance = summary.total_deposits - summary.total_withdrawals;
    setSummary(summary);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    updateLastActivity();
    
    try {
      await fetchTransactionHistory();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <AntDesign name="arrowright" size={20} color="#28a745" />;
      case 'withdrawal':
        return <AntDesign name="arrowleft" size={20} color="#dc3545" />;
      case 'loan':
        return <FontAwesome6 name="money-bill-transfer" size={20} color="#ffc107" />;
      case 'repayment':
        return <FontAwesome6 name="handshake" size={20} color="#17a2b8" />;
      default:
        return <FontAwesome6 name="wallet" size={20} color="#6c757d" />;
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'deposit':
        return '#28a745';
      case 'withdrawal':
        return '#dc3545';
      case 'loan':
        return '#ffc107';
      case 'repayment':
        return '#17a2b8';
      default:
        return '#6c757d';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.transaction_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (transaction.description && transaction.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = selectedFilter === 'all' || transaction.transaction_type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={styles.loadingText}>Loading transaction history...</Text>
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
          <MaterialCommunityIcons name="file-document" size={24} color={Colors.light.primary} />
          <Text style={styles.headerTitle}>Transaction History</Text>
        </View>
        
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryIconContainer}>
              <AntDesign name="arrowright" size={16} color="#28a745" />
            </View>
            <Text style={styles.summaryValue}>ZMW {summary.total_deposits.toFixed(2)}</Text>
            <Text style={styles.summaryLabel}>Total Deposits</Text>
          </View>
          
          <View style={styles.summaryCard}>
            <View style={styles.summaryIconContainer}>
              <AntDesign name="arrowleft" size={16} color="#dc3545" />
            </View>
            <Text style={styles.summaryValue}>ZMW {summary.total_withdrawals.toFixed(2)}</Text>
            <Text style={styles.summaryLabel}>Total Withdrawals</Text>
          </View>
        </View>
        
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryIconContainer}>
              <FontAwesome6 name="money-bill-transfer" size={16} color="#ffc107" />
            </View>
            <Text style={styles.summaryValue}>ZMW {summary.total_loans.toFixed(2)}</Text>
            <Text style={styles.summaryLabel}>Total Loans</Text>
          </View>
          
          <View style={styles.summaryCard}>
            <View style={styles.summaryIconContainer}>
              <FontAwesome6 name="handshake" size={16} color="#17a2b8" />
            </View>
            <Text style={styles.summaryValue}>ZMW {summary.total_repayments.toFixed(2)}</Text>
            <Text style={styles.summaryLabel}>Total Repayments</Text>
          </View>
        </View>

        {/* Net Balance */}
        <View style={styles.netBalanceCard}>
          <Text style={styles.netBalanceLabel}>Net Balance</Text>
          <Text style={[
            styles.netBalanceValue,
            { color: summary.net_balance >= 0 ? '#28a745' : '#dc3545' }
          ]}>
            ZMW {summary.net_balance.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <MaterialIcons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search transactions..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'all', label: 'All', icon: 'list' },
            { key: 'deposit', label: 'Deposits', icon: 'arrowright' },
            { key: 'withdrawal', label: 'Withdrawals', icon: 'arrowleft' },
            { key: 'loan', label: 'Loans', icon: 'money-bill-transfer' },
            { key: 'repayment', label: 'Repayments', icon: 'handshake' },
          ].map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterTab,
                selectedFilter === filter.key && styles.activeFilterTab
              ]}
              onPress={() => setSelectedFilter(filter.key as any)}
            >
            
              <Text style={[
                styles.filterTabText,
                selectedFilter === filter.key && styles.activeFilterTabText
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Transactions List */}
      <View style={styles.transactionsContainer}>
        <View style={styles.transactionsHeader}>
          <Text style={styles.transactionsTitle}>
            Transactions ({filteredTransactions.length})
          </Text>
        </View>

        {filteredTransactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="file-document-outline" size={60} color="#ccc" />
            <Text style={styles.emptyTitle}>No Transactions Found</Text>
            <Text style={styles.emptyText}>
              {searchQuery || selectedFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Your transaction history will appear here'
              }
            </Text>
          </View>
        ) : (
          filteredTransactions.map((transaction) => (
            <View key={transaction.transaction_id} style={styles.transactionItem}>
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
                {transaction.description && (
                  <Text style={styles.transactionDescription}>
                    {transaction.description}
                  </Text>
                )}
              </View>
              
              <View style={styles.transactionAmount}>
                <Text style={[
                  styles.amountText,
                  { color: getTransactionTypeColor(transaction.transaction_type) }
                ]}>
                  {transaction.transaction_type === 'withdrawal' ? '-' : '+'}
                  ZMW {parseFloat(transaction.amount).toFixed(2)}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>
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
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  exportButtonText: {
    color: Colors.light.primary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  summaryContainer: {
    padding: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  summaryIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  netBalanceCard: {
    backgroundColor: '#edededed',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  netBalanceLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  netBalanceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
  },
  activeFilterTab: {
    backgroundColor: Colors.light.primary,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginLeft: 5,
  },
  activeFilterTabText: {
    color: 'white',
  },
  transactionsContainer: {
    paddingHorizontal: 20,
  },
  transactionsHeader: {
    marginBottom: 15,
  },
  transactionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  transactionIcon: {
    marginRight: 15,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  transactionDescription: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
