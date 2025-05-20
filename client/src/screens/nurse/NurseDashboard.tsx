// Import necessary libraries and components
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import type { NavigationProp } from '@/types/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { requestApi } from '@/services/api';
import { socketService } from '@/services/socketService';
import { RequestResponse } from '@/types/api';
import Toast from 'react-native-toast-message';
import { socket } from '../../services/socketService';
import { RequestDialog } from '../../screens/patient/RequestDialog';

// Define the structure of a NurseUser object
interface NurseUser {
  id: string;
  fullName: string;
  nurseRole: string;
}

// Define the structure of the API response for requests
interface RequestApiResponse {
  success: boolean;
  data: {
    requests: RequestResponse[];
  };
}

// Main component for the Nurse Dashboard
export const NurseDashboard = () => {
  // Navigation and authentication hooks
  const navigation = useNavigation<NavigationProp>();
  const { user, logout } = useAuth();

  // State variables for active requests, assigned patients, completed tasks, and refreshing status
  const [activeRequests, setActiveRequests] = useState<RequestResponse[]>([]);
  const [assignedPatients, setAssignedPatients] = useState<number>(0);
  const [completedTasks, setCompletedTasks] = useState<number>(0);
  const [refreshing, setRefreshing] = useState(false);

  // Function to fetch dashboard data from the API
  const fetchDashboardData = async () => {
    try {
      // Fetch requests and patients data concurrently
      const [requestsResponse, patientsResponse] = await Promise.all([
        requestApi.getRequests(),
        requestApi.getRequests()
      ]);

      // Extract active and completed requests from the responses
      const activeReqs = requestsResponse?.data?.requests || [];
      const completedReqs = patientsResponse?.data?.requests || [];

      // Update state with filtered active requests and completed tasks count
      setActiveRequests(activeReqs.filter(req => req.status === 'pending'));
      setCompletedTasks(completedReqs.filter(req => req.status === 'completed').length);
      
      // Set assigned patients count based on the current user
      setAssignedPatients(activeReqs.filter(req => 
        req.status === 'assigned' && req.nurseId === user?.id
      ).length);

    } catch (error) {
      // Log error and show a toast notification if fetching fails
      console.error('Error fetching dashboard data:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to fetch dashboard data'
      });
    }
  };

  // Effect to fetch data and set up socket listeners
  useEffect(() => {
    fetchDashboardData();

    // Socket listener for new requests
    socket.on('newRequest', (request) => {
      setActiveRequests(prev => [...prev, request]);
      
      // Show notification for new request
      Toast.show({
        type: 'info',
        text1: 'New Request',
        text2: `Priority: ${request.priority} - Patient: ${request.fullName}`,
        position: 'top',
        topOffset: 60,
        visibilityTime: 6000,
      });
    });

    // Socket listener for completed requests
    socket.on('requestCompleted', (requestId) => {
      setActiveRequests(prev => prev.filter(req => req.id !== requestId));
      setCompletedTasks(prev => prev + 1);
    });

    // Cleanup function to remove socket listeners on component unmount
    return () => {
      socket.off('newRequest');
      socket.off('requestCompleted');
    };
  }, []);

  // Function to handle pull-to-refresh action
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  // Function to handle user logout
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              await logout();
              // Navigation will be handled by AuthContext
            } catch (error) {
              // Show error toast if logout fails
              Toast.show({
                type: 'error',
                text1: 'Logout Failed',
                text2: 'Please try again'
              });
            }
          },
          style: 'destructive'
        }
      ]
    );
  };

  // Function to handle marking a request as completed
  const handleRequestComplete = async (requestId: string) => {
    try {
      await requestApi.updateRequestStatus(requestId, 'completed');
      
      // Update local state after completing the request
      setActiveRequests(prev => prev.filter(req => req.id !== requestId));
      setCompletedTasks(prev => prev + 1);
      
      // Show success toast notification
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Request marked as completed',
        position: 'top',
        topOffset: 60,
      });
    } catch (error) {
      // Show error toast if completing the request fails
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to complete request',
        position: 'top',
        topOffset: 60,
      });
    }
  };

  // Render the dashboard UI
  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <LinearGradient
        colors={['#2C6EAB', '#4c669f'] as const}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.welcomeText}>Welcome, {user?.fullName}</Text>
            <Text style={styles.roleText}>{(user as NurseUser)?.nurseRole || 'Nurse'}</Text>
          </View>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Icon name="logout" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Today's Overview</Text>
        <View style={styles.statsGrid}>
          <LinearGradient
            colors={['#6DD5FA', '#2980B9'] as const}
            style={styles.statCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Icon name="people" size={24} color="#fff" />
            <Text style={styles.statNumber}>{assignedPatients}</Text>
            <Text style={styles.statLabel}>Assigned Patients</Text>
          </LinearGradient>

          <LinearGradient
            colors={['#FF6B6B', '#FF8E8E'] as const}
            style={styles.statCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Icon name="notifications-active" size={24} color="#fff" />
            <Text style={styles.statNumber}>{activeRequests.length}</Text>
            <Text style={styles.statLabel}>Active Requests</Text>
          </LinearGradient>

          <LinearGradient
            colors={['#00796B', '#004D40'] as const}
            style={styles.statCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Icon name="check-circle" size={24} color="#fff" />
            <Text style={styles.statNumber}>{completedTasks}</Text>
            <Text style={styles.statLabel}>Completed Tasks</Text>
          </LinearGradient>
        </View>
      </View> */}

      <View style={styles.menuContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.menuGrid}>
          {[
            { name: 'My Patients', icon: 'people', route: 'MyPatients', colors: ['#26C6DA', '#00ACC1'] },
            { name: 'Active Requests', icon: 'notifications-active', route: 'ActiveRequests', colors: ['#FF7043', '#E64A19'] },
            { name: 'Completed Tasks', icon: 'check-circle', route: 'CompletedTasks', colors: ['#FFD700', '#DAA520'] },
            { name: 'My Schedule', icon: 'schedule', route: 'Schedule', colors: ['#7CB342', '#558B2F'] },
            { name: 'Reference Book', icon: 'book', route: 'Reference', colors: ['#00C078', '#008040'] },
            { name: 'Connect Doctors', icon: 'local-hospital', route: 'DoctorConnect', colors: ['#90C0C0', '#90C0C0'] },
            { name: 'My Profile', icon: 'person', route: 'NurseProfile', colors: ['#5C6BC0', '#3949AB'] },
          ].map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => navigation.navigate(item.route)}
            >
              <LinearGradient
                colors={item.colors}
                style={styles.menuItemGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Icon name={item.icon} size={32} color="#fff" />
                <Text style={styles.menuItemText}>{item.name}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

// Define styles for the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 15,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  roleText: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginTop: 4,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#ff4444',
  },
  statsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#fff',
    marginTop: 5,
    textAlign: 'center',
  },
  menuContainer: {
    padding: 20,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  menuItem: {
    width: '47%',
    aspectRatio: 1,
  },
  menuItemGradient: {
    flex: 1,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  menuItemText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
    textAlign: 'center',
  },
});
