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
  Modal,
  TextInput,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { getApiUrl, API_CONFIG } from '@/constants/ApiConfig';
import { useAuthStore } from '@/stores/authStore';
import {
  FontAwesome6,
  MaterialIcons,
} from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Loan {
  loan_id: number;
  user_id: number;
  group_id: number;
  amount: string;
  purpose: string;
  status: string;
  application_date: string;
  monthly_payment: string;
  remaining_balance: string;
}

export default function LoansScreen() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [application, setApplication] = useState({
    amount: '',
    purpose: '',
    duration: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const { user, updateLastActivity } = useAuthStore();

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.LOAN_REQUESTS), {
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
        setLoans(data.loans || []);
      } else {
        console.error('Error fetching loans:', data.message);
      }
    } catch (error) {
      console.error('Error fetching loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    updateLastActivity();
    
    try {
      await fetchLoans();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleApplyLoan = async () => {
    if (!application.amount || !application.purpose || !application.duration) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (parseFloat(application.amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (parseFloat(application.amount) > 5000) {
      Alert.alert('Error', 'Maximum loan amount is ZMW 5,000');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.SUBMIT_LOAN_REQUEST), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          user_id: user?.user_id?.toString() || '',
          group_id: '1',
          amount: application.amount,
          purpose: application.purpose,
          duration: application.duration,
        }).toString(),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert(
          'Success',
          'Loan application submitted successfully! You will be notified once it is reviewed.',
          [
            {
              text: 'OK',
              onPress: () => {
                setModalVisible(false);
                setApplication({ amount: '', purpose: '', duration: '' });
                fetchLoans();
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', data.message || 'Failed to submit loan application');
      }
    } catch (error) {
      console.error('Loan application error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const activeLoans = loans.filter(loan => loan.status === 'active');
  const pendingLoans = loans.filter(loan => loan.status === 'pending');
  const completedLoans = loans.filter(loan => loan.status === 'completed');

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={styles.loadingText}>Loading loan information...</Text>
      </View>
    );
  }

  return (
   <SafeAreaView  style={styles.container}>
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
          <FontAwesome6 name="money-bill-transfer" size={24} color={Colors.light.primary} />
          <Text style={styles.headerTitle}>Loans</Text>
        </View>
        <TouchableOpacity 
          style={styles.applyButton}
          onPress={() => setModalVisible(true)}
        >
          <MaterialIcons name="add" size={20} color="white" />
          <Text style={styles.applyButtonText}>Apply</Text>
        </TouchableOpacity>
      </View>

      {/* Loan Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{activeLoans.length}</Text>
            <Text style={styles.summaryLabel}>Active Loans</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{pendingLoans.length}</Text>
            <Text style={styles.summaryLabel}>Pending</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{completedLoans.length}</Text>
            <Text style={styles.summaryLabel}>Completed</Text>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {loans.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FontAwesome6 name="hand-holding-usd" size={80} color="#ccc" />
            <Text style={styles.emptyTitle}>No Loans Yet</Text>
            <Text style={styles.emptyText}>
              You haven't applied for any loans yet. Apply for a loan to get started.
            </Text>
            
            <TouchableOpacity 
              style={styles.applyNowButton}
              onPress={() => setModalVisible(true)}
            >
              <FontAwesome6 name="hand-holding-usd" size={20} color="white" />
              <Text style={styles.applyNowButtonText}>Apply for Loan</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.loansContainer}>
            <Text style={styles.sectionTitle}>Your Loans</Text>
            {loans.map((loan, index) => (
              <View key={index} style={styles.loanCard}>
                <View style={styles.loanHeader}>
                  <View style={styles.loanAmount}>
                    <Text style={styles.amountText}>ZMW {parseFloat(loan.amount).toFixed(2)}</Text>
                    <Text style={styles.purposeText}>{loan.purpose}</Text>
                  </View>
                  <View style={styles.statusContainer}>
                    <Text style={[
                      styles.statusText,
                      { color: loan.status === 'active' ? '#17a2b8' : loan.status === 'completed' ? '#6c757d' : '#ffc107' }
                    ]}>
                      {loan.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.loanDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Monthly Payment:</Text>
                    <Text style={styles.detailValue}>ZMW {loan.monthly_payment}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Remaining Balance:</Text>
                    <Text style={styles.detailValue}>ZMW {loan.remaining_balance}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Application Date:</Text>
                    <Text style={styles.detailValue}>
                      {new Date(loan.application_date).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Loan Information */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Loan Information</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoSubtitle}>Eligibility Requirements:</Text>
            <View style={styles.requirementItem}>
              <MaterialIcons name="check-circle" size={16} color="#28a745" />
              <Text style={styles.requirementText}>Minimum 3 months of group membership</Text>
            </View>
            <View style={styles.requirementItem}>
              <MaterialIcons name="check-circle" size={16} color="#28a745" />
              <Text style={styles.requirementText}>Regular monthly contributions</Text>
            </View>
            <View style={styles.requirementItem}>
              <MaterialIcons name="check-circle" size={16} color="#28a745" />
              <Text style={styles.requirementText}>Maximum loan amount: ZMW 5,000</Text>
            </View>
            <View style={styles.requirementItem}>
              <MaterialIcons name="check-circle" size={16} color="#28a745" />
              <Text style={styles.requirementText}>Repayment period: 6-12 months</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Loan Application Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Apply for Loan</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={Colors.light.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Loan Amount (ZMW)</Text>
                <TextInput
                  style={styles.input}
                  value={application.amount}
                  onChangeText={(text) => setApplication({ ...application, amount: text })}
                  placeholder="Enter amount"
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Purpose</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={application.purpose}
                  onChangeText={(text) => setApplication({ ...application, purpose: text })}
                  placeholder="e.g., Business expansion, Education, Emergency"
                  multiline={true}
                  numberOfLines={3}
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Duration (months)</Text>
                <TextInput
                  style={styles.input}
                  value={application.duration}
                  onChangeText={(text) => setApplication({ ...application, duration: text })}
                  placeholder="6-12 months"
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.loanInfo}>
                <Text style={styles.loanInfoTitle}>Loan Information:</Text>
                <Text style={styles.loanInfoText}>• Interest Rate: 5% per annum</Text>
                <Text style={styles.loanInfoText}>• Processing Time: 3-5 business days</Text>
                <Text style={styles.loanInfoText}>• Monthly payments will be calculated automatically</Text>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                onPress={handleApplyLoan}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <MaterialIcons name="send" size={20} color="white" />
                    <Text style={styles.submitButtonText}>Submit Application</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
    </View>
      </Modal>
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
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  applyButtonText: {
    color: 'white',
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
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.primary,
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  content: {
    padding: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  applyNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  applyNowButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  loansContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  loanCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  loanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  loanAmount: {
    flex: 1,
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  purposeText: {
    fontSize: 14,
    color: '#666',
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  loanDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  infoSection: {
    marginTop: 20,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
  },
  infoSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  requirementText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.primary,
  },
  modalContent: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 15,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f8f9fa',
  },
  textArea: {
    textAlignVertical: 'top',
    minHeight: 80,
  },
  loanInfo: {
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    padding: 15,
    marginTop: 10,
  },
  loanInfoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 8,
  },
  loanInfoText: {
    fontSize: 12,
    color: '#1976d2',
    marginBottom: 4,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    borderRadius: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
