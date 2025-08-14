import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { getApiUrl, API_CONFIG } from '@/constants/ApiConfig';

export default function ApiTest() {
  const [testResult, setTestResult] = useState<string>('');

  const testApi = async () => {
    try {
      setTestResult('Testing...');
      console.log('Testing API URL:', getApiUrl(API_CONFIG.ENDPOINTS.GET_GROUPS));
      
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.GET_GROUPS));
      const data = await response.json();
      
      setTestResult(`Success! Found ${data.groups?.length || 0} groups`);
      console.log('API Test Result:', data);
    } catch (error: any) {
      setTestResult(`Error: ${error.message}`);
      console.error('API Test Error:', error);
      Alert.alert('API Test Failed', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>API Connection Test</Text>
      <Text style={styles.url}>URL: {getApiUrl(API_CONFIG.ENDPOINTS.GET_GROUPS)}</Text>
      
      <TouchableOpacity style={styles.testButton} onPress={testApi}>
        <Text style={styles.testButtonText}>Test API Connection</Text>
      </TouchableOpacity>
      
      <Text style={styles.result}>{testResult}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0f0f0',
    margin: 10,
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: Colors.light.primary,
  },
  url: {
    fontSize: 12,
    color: '#666',
    marginBottom: 15,
    fontFamily: 'monospace',
  },
  testButton: {
    backgroundColor: Colors.light.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  result: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
});
