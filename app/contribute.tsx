import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { getApiUrl, API_CONFIG } from '@/constants/ApiConfig';
import { useAuthStore } from '@/stores/authStore';
import {
  FontAwesome6,
  MaterialIcons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ContributeScreen() {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { user, updateLastActivity } = useAuthStore();

  const handleContribute = async () => {
    // Update last activity
    updateLastActivity();

    // Validate input
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (parseFloat(amount) > 100000) {
      Alert.alert('Error', 'Amount cannot exceed ZMW 100,000');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.ADD_TRANSACTION), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          user_id: user?.user_id?.toString() || '',
          group_id: '1', // Default group ID - you might want to get this from user's group
          transaction_type: 'deposit',
          amount: amount,
          description: description || 'Contribution',
        }).toString(),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert(
          'Success',
          `Contribution of ZMW ${parseFloat(amount).toFixed(2)} has been recorded successfully!`,
          [
            {
              text: 'OK',
              onPress: () => {
                setAmount('');
                setDescription('');
                router.back();
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', data.message || 'Failed to record contribution');
      }
    } catch (error) {
      console.error('Contribution error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (text: string) => {
    // Remove any non-numeric characters except decimal point
    const cleaned = text.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limit to 2 decimal places
    if (parts.length === 2 && parts[1].length > 2) {
      return parts[0] + '.' + parts[1].substring(0, 2);
    }
    
    return cleaned;
  };

  const handleAmountChange = (text: string) => {
    const formatted = formatAmount(text);
    setAmount(formatted);
  };

  return (
   <SafeAreaView style={styles.container}>
     <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={Colors.light.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Make Contribution</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Contribution Form */}
        <View style={styles.formContainer}>
          <View style={styles.iconContainer}>
            <FontAwesome6 name="money-bills" size={60} color={Colors.light.primary} />
          </View>

          <Text style={styles.title}>Contribute to Your Group</Text>
          <Text style={styles.subtitle}>
            Enter the amount you want to contribute to your group savings
          </Text>

          {/* Amount Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Amount (ZMW)</Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>ZMW</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={handleAmountChange}
                placeholder="0.00"
                keyboardType="numeric"
                placeholderTextColor="#999"
                autoFocus={true}
              />
            </View>
          </View>

          {/* Description Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Description (Optional)</Text>
            <TextInput
              style={styles.descriptionInput}
              value={description}
              onChangeText={setDescription}
              placeholder="e.g., Monthly contribution, Emergency fund"
              placeholderTextColor="#999"
              multiline={true}
              numberOfLines={3}
            />
          </View>

          {/* Contribution Summary */}
          {amount && parseFloat(amount) > 0 && (
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>Contribution Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Amount:</Text>
                <Text style={styles.summaryValue}>ZMW {parseFloat(amount).toFixed(2)}</Text>
              </View>
              {description && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Description:</Text>
                  <Text style={styles.summaryValue}>{description}</Text>
                </View>
              )}
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Type:</Text>
                <Text style={styles.summaryValue}>Deposit</Text>
              </View>
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!amount || parseFloat(amount) <= 0 || loading) && styles.submitButtonDisabled
            ]}
            onPress={handleContribute}
            disabled={!amount || parseFloat(amount) <= 0 || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <MaterialCommunityIcons name="check-circle" size={20} color="white" />
                <Text style={styles.submitButtonText}>Submit Contribution</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Info Section */}
          <View style={styles.infoContainer}>
            <MaterialIcons name="info-outline" size={20} color="#666" />
            <Text style={styles.infoText}>
              Your contribution will be added to your group savings and reflected in your transaction history.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
   </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.primary,
  },
  placeholder: {
    width: 34,
  },
  formContainer: {
    flex: 1,
    padding: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
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
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.light.primary,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#f8f9fa',
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.primary,
    marginRight: 10,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
  },
  descriptionInput: {
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 15,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f8f9fa',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  summaryContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  submitButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    padding: 15,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1976d2',
    marginLeft: 10,
    lineHeight: 20,
  },
});
