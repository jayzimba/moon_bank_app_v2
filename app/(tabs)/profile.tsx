import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
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
import { router } from 'expo-router';
import {
  FontAwesome6,
  MaterialIcons,
  MaterialCommunityIcons,
  Ionicons,
} from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

interface UserProfile {
  user_id: number;
  username: string;
  email: string;
  phone_number: string;
  status: string;
  created_at: string;
  total_contribution: string;
  group_name: string;
}

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    phoneNumber: '',
  });
  const [editLoading, setEditLoading] = useState(false);

  const { user, logout, updateLastActivity } = useAuthStore();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.USER_PROFILE), {
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
        setProfile(data.profile);
      } else {
        console.error('Error fetching profile:', data.message);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    updateLastActivity();
    
    try {
      await fetchUserProfile();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/');
          }
        },
      ]
    );
  };

  const handleEditProfile = () => {
    // Pre-fill form with current profile data
    setEditForm({
      username: profile?.username || user?.username || '',
      email: profile?.email || user?.email || '',
      phoneNumber: profile?.phone_number || user?.phone_number || '',
    });
    setEditModalVisible(true);
  };

  const handleEditSubmit = async () => {
    // Validate form
    if (!editForm.username || !editForm.email || !editForm.phoneNumber) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (editForm.username.length < 2) {
      Alert.alert('Error', 'Username must be at least 2 characters long');
      return;
    }

    if (!editForm.email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (editForm.phoneNumber.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    setEditLoading(true);
    try {
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.UPDATE_PROFILE), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          user_id: user?.user_id?.toString() || '',
          username: editForm.username,
          email: editForm.email,
          phone_number: editForm.phoneNumber,
        }).toString(),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert(
          'Success',
          'Profile updated successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                setEditModalVisible(false);
                fetchUserProfile(); // Refresh profile data
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditCancel = () => {
    setEditModalVisible(false);
    setEditForm({ username: '', email: '', phoneNumber: '' });
  };

  const handleChangePassword = () => {
    setPasswordModalVisible(true);
  };

  const handlePasswordSubmit = async () => {
    // Validate form
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters long');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Alert.alert('Error', 'New password and confirm password do not match');
      return;
    }

    setPasswordLoading(true);
    try {
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.CHANGE_PASSWORD), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          user_id: user?.user_id?.toString() || '',
          current_password: passwordForm.currentPassword,
          new_password: passwordForm.newPassword,
          confirm_password: passwordForm.confirmPassword,
        }).toString(),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert(
          'Success',
          'Password changed successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                setPasswordModalVisible(false);
                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', data.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Password change error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handlePasswordCancel = () => {
    setPasswordModalVisible(false);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleAbout = () => {
    Alert.alert('About MoonBank', 'MoonBank v1.0.0\n\nYour trusted financial partner for community banking and group savings.');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
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
          <FontAwesome6 name="user-circle" size={24} color={Colors.light.primary} />
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        <TouchableOpacity onPress={handleEditProfile} style={styles.editButton}>
          <MaterialIcons name="edit" size={20} color={Colors.light.primary} />
        </TouchableOpacity>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <FontAwesome6 name="user" size={40} color="white" />
          </View>
          <View style={styles.statusBadge}>
            <View style={[styles.statusDot, { backgroundColor: profile?.status === 'active' ? '#28a745' : '#dc3545' }]} />
            <Text style={styles.statusText}>{profile?.status || 'Active'}</Text>
          </View>
        </View>

        <View style={styles.profileInfoContainer}>
          <Text style={styles.userName}>{profile?.username || user?.username || 'User'}</Text>
          <Text style={styles.userEmail}>{profile?.email || user?.email || 'user@example.com'}</Text>
          <Text style={styles.userPhone}>{profile?.phone_number || user?.phone_number || 'No phone number'}</Text>
        </View>

        <View style={styles.memberSince}>
          <MaterialIcons name="calendar-today" size={16} color="#666" />
          <Text style={styles.memberSinceText}>
            Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
          </Text>
        </View>
      </View>

      {/* Account Summary */}
      <View style={styles.summarySection}>
        <Text style={styles.sectionTitle}>Account Summary</Text>
        <View style={styles.summaryCards}>
          <View style={styles.summaryCard}>
            <FontAwesome6 name="money-bills" size={24} color={Colors.light.primary} />
            <Text style={styles.summaryValue}>
              ZMW {profile?.total_contribution || '0.00'}
            </Text>
            <Text style={styles.summaryLabel}>Total Contribution</Text>
          </View>
          <View style={styles.summaryCard}>
            <FontAwesome6 name="users" size={24} color={Colors.light.primary} />
            <Text style={styles.summaryValue}>
              {profile?.group_name || 'No Group'}
            </Text>
            <Text style={styles.summaryLabel}>Current Group</Text>
          </View>
        </View>
      </View>

      {/* Settings Menu */}
      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Settings</Text>
        
        <TouchableOpacity style={styles.menuItem} onPress={handleChangePassword}>
          <View style={styles.menuIcon}>
            <MaterialIcons name="lock" size={20} color={Colors.light.primary} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Change Password</Text>
            <Text style={styles.menuSubtitle}>Update your account password</Text>
          </View>
          <MaterialIcons name="chevron-right" size={20} color="#ccc" />
        </TouchableOpacity>

     

      

        <TouchableOpacity style={styles.menuItem} onPress={handleAbout}>
          <View style={styles.menuIcon}>
            <Ionicons name="information-circle" size={20} color={Colors.light.primary} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>About</Text>
            <Text style={styles.menuSubtitle}>App version and information</Text>
          </View>
          <MaterialIcons name="chevron-right" size={20} color="#ccc" />
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <View style={styles.logoutSection}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialIcons name="logout" size={20} color="white" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* App Version */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>MoonBank v1.0.0</Text>
      </View>

      {/* Change Password Modal */}
      <Modal
        visible={passwordModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handlePasswordCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <TouchableOpacity onPress={handlePasswordCancel}>
                <MaterialIcons name="close" size={24} color={Colors.light.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Current Password</Text>
                <TextInput
                  style={styles.input}
                  value={passwordForm.currentPassword}
                  onChangeText={(text) => setPasswordForm({ ...passwordForm, currentPassword: text })}
                  placeholder="Enter current password"
                  secureTextEntry={true}
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>New Password</Text>
                <TextInput
                  style={styles.input}
                  value={passwordForm.newPassword}
                  onChangeText={(text) => setPasswordForm({ ...passwordForm, newPassword: text })}
                  placeholder="Enter new password (min 6 characters)"
                  secureTextEntry={true}
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Confirm New Password</Text>
                <TextInput
                  style={styles.input}
                  value={passwordForm.confirmPassword}
                  onChangeText={(text) => setPasswordForm({ ...passwordForm, confirmPassword: text })}
                  placeholder="Confirm new password"
                  secureTextEntry={true}
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.passwordInfo}>
                <Text style={styles.passwordInfoTitle}>Password Requirements:</Text>
                <Text style={styles.passwordInfoText}>• Minimum 6 characters</Text>
                <Text style={styles.passwordInfoText}>• Passwords must match</Text>
                <Text style={styles.passwordInfoText}>• Current password must be correct</Text>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handlePasswordCancel}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, passwordLoading && styles.submitButtonDisabled]}
                onPress={handlePasswordSubmit}
                disabled={passwordLoading}
              >
                {passwordLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <MaterialIcons name="lock" size={20} color="white" />
                    <Text style={styles.submitButtonText}>Change Password</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleEditCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={handleEditCancel}>
                <MaterialIcons name="close" size={24} color={Colors.light.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Username</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.username}
                  onChangeText={(text) => setEditForm({ ...editForm, username: text })}
                  placeholder="Enter username"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.email}
                  onChangeText={(text) => setEditForm({ ...editForm, email: text })}
                  placeholder="Enter email address"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.phoneNumber}
                  onChangeText={(text) => setEditForm({ ...editForm, phoneNumber: text })}
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.profileInfo}>
                <Text style={styles.profileInfoTitle}>Profile Information:</Text>
                <Text style={styles.profileInfoText}>• Username must be at least 2 characters</Text>
                <Text style={styles.profileInfoText}>• Email must be valid format</Text>
                <Text style={styles.profileInfoText}>• Phone number must be at least 10 digits</Text>
                <Text style={styles.profileInfoText}>• Email must be unique</Text>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleEditCancel}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, editLoading && styles.submitButtonDisabled]}
                onPress={handleEditSubmit}
                disabled={editLoading}
              >
                {editLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <MaterialIcons name="save" size={20} color="white" />
                    <Text style={styles.submitButtonText}>Save Changes</Text>
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
  editButton: {
    padding: 8,
  },
  profileCard: {
    backgroundColor: '#f8f9fa',
    margin: 20,
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  profileInfoContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 3,
  },
  userPhone: {
    fontSize: 14,
    color: '#999',
  },
  memberSince: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberSinceText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  summarySection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  summaryCards: {
    flexDirection: 'row',
    gap: 15,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    marginBottom: 5,
    textAlign: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  settingsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  logoutSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc3545',
    borderRadius: 12,
    paddingVertical: 15,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 12,
    color: '#999',
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
  passwordInfo: {
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    padding: 15,
    marginTop: 10,
  },
  passwordInfoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 8,
  },
  passwordInfoText: {
    fontSize: 12,
    color: '#1976d2',
    marginBottom: 4,
  },
  profileInfo: {
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
    padding: 15,
    marginTop: 10,
  },
  profileInfoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 8,
  },
  profileInfoText: {
    fontSize: 12,
    color: '#2e7d32',
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
