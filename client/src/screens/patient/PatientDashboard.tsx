// Import necessary dependencies from React and React Native
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { Surface, IconButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../../types/navigation';
import Toast from 'react-native-toast-message';
import { RequestDialog } from './RequestDialog';

/**
 * PatientDashboard Component
 * Main dashboard screen for patients showing various healthcare options and services
 */
export const PatientDashboard: React.FC = () => {
  // Navigation and authentication hooks
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user, logout } = useAuth();
  const { width } = useWindowDimensions();
  
  // State for managing nurse request dialog visibility
  const [requestDialogVisible, setRequestDialogVisible] = useState(false);

  /**
   * Handles the submission of a nurse request
   * @param data - The request data submitted through the dialog
   */
  const handleRequestSubmit = (data: any) => {
    console.log('Request data:', data);
    setRequestDialogVisible(false);
    
    // Show success message using Toast
    Toast.show({
      type: 'success',
      text1: 'Request Submitted Successfully',
      text2: 'A nurse will arrive shortly to assist you.',
      visibilityTime: 4000,
      position: 'top',
      topOffset: 60,
    });
  };

  // Define menu items for the dashboard grid
  // Each item represents a different service or feature available to patients
  const menuItems = [
    {
      title: 'Medical Assistant',
      description: 'Chat with our AI medical assistant',
      icon: 'robot',
      screen: 'ChatScreen',
      gradient: ['#6DD5FA', '#2980B9'] as const,
    },
    {
      title: 'Request a Nurse',
      description: 'Request a nurse to help you',
      icon: 'hospital-box',
      onPress: () => setRequestDialogVisible(true),
      gradient: ['#7CB342', '#558B2F'] as const,
    },
    {
      title: 'My Appointments',
      description: 'View and manage your appointments',
      icon: 'calendar-clock',
      screen: 'AppointmentScreen',
      gradient: ['#FF6B6B', '#FF8E8E'] as const,
    },
    
    {
      title: 'Medical Records',
      description: 'Access your medical history',
      icon: 'file-document',
      screen: 'MedicalRecordsScreen',
      gradient: ['#6C63FF', '#5A52E5'] as const,
    },
    {
      title: 'Medications',
      description: 'View your prescribed medications',
      icon: 'pill',
      screen: 'MedicationsScreen',
      gradient: ['#FFD93D', '#F4C430'] as const,
    },
    
    {
      title: 'My Requests',
      description: 'View your nurse requests',
      icon: 'history',
      screen: 'MyRequestsScreen',
      gradient: ['#A8E6CF', '#7DBE9B'] as const,
    },
    {
      title: 'Emergency',
      description: 'Quick access to emergency services',
      icon: 'alert',
      screen: 'EmergencyScreen',
      gradient: ['#FF416C', '#FF4B2B'] as const,
    },
    {
      title: 'My Profile',
      description: 'View and update your profile',
      icon: 'account-circle',
      screen: 'PatientProfileScreen',
      gradient: ['#4ECDC4', '#45B7AF'] as const,
    },
  ] as const;

  // Render the dashboard UI
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {/* Header section with gradient background */}
      <LinearGradient
       colors={['#2C6EAB', '#4c669f']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={[styles.headerContent, styles.headerBlur]}>
          <View>
            <Text style={styles.welcomeText}>
              Welcome <Text style={styles.boldText}>{user?.fullName}</Text>
            </Text>
          </View>
          <IconButton
            icon="logout"
            iconColor="red"
            size={24}
            onPress={logout}
            style={styles.logoutButton}
          />
        </View>
      </LinearGradient>

      {/* Scrollable grid of menu items */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.gridContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.gridItem, { width: width / 2 - 24 }]}
              onPress={() => {
                if (item.onPress) {
                  item.onPress();
                } else if (item.screen) {
                  navigation.navigate(item.screen as never);
                }
              }}
            >
              <Surface style={styles.surface}>
                <LinearGradient
                  colors={item.gradient}
                  style={styles.cardGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.iconContainer}>
                    <Icon name={item.icon} size={32} color="#fff" />
                  </View>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardDescription} numberOfLines={2}>
                    {item.description}
                  </Text>
                </LinearGradient>
              </Surface>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Nurse request dialog and Toast components */}
      <RequestDialog
        visible={requestDialogVisible}
        onDismiss={() => setRequestDialogVisible(false)}
        onSubmit={handleRequestSubmit}
      />
      <Toast />
    </View>
  );
}

// Styles for the dashboard components
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 1,
    paddingBottom: 1,
  },
  headerBlur: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    color: 'rgba(255,255,255,0.9)',
  },
  boldText: {
    fontWeight: 'bold',
    color: '#fff',
  },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  gridItem: {
    marginBottom: 16,
  },
  surface: {
    borderRadius: 16,
    elevation: 4,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  cardGradient: {
    padding: 16,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
    marginTop: 4,
  },
});
