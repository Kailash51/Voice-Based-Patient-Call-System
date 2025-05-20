import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Text, Surface, IconButton, useTheme } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { appointmentApi } from '../../services/api/appointmentApi';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { format } from 'date-fns';
import Toast from 'react-native-toast-message';

interface Appointment {
  id: string;
  date: string;
  time: string;
  department: string;
  status: string;
  doctorName: string;
  type: string;
}

export const AppointmentScreen: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const { user } = useAuth();
  const theme = useTheme();

  const fetchAppointments = async () => {
    try {
      if (!user?.id) {
        console.error('No user ID available');
        setAppointments([]);
        return;
      }
      const fetchedAppointments = await appointmentApi.fetchAppointments(user.id);
      setAppointments(fetchedAppointments || []);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      setAppointments([]);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to fetch appointments'
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAppointments();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchAppointments();
  }, [user?.id]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return ['#4CAF50', '#45B7AF'];
      case 'pending':
        return ['#FF9800', '#F57C00'];
      case 'cancelled':
        return ['#F44336', '#D32F2F'];
      default:
        return ['#9E9E9E', '#757575'];
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size={36} color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#2C6EAB', '#3b5998', '#192f6a']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <BlurView intensity={20} style={styles.headerBlur}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>My Appointments</Text>
            <IconButton
              icon="plus"
              iconColor="#fff"
              size={24}
              onPress={() => {}}
              style={styles.headerButton}
            />
          </View>
        </BlurView>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
        }
      >
        {appointments.length === 0 ? (
          <Surface style={styles.emptyContainer}>
            <Icon name="calendar-blank" size={48} color={theme.colors.primary} />
            <Text style={styles.emptyText}>No upcoming appointments</Text>
            <Text style={styles.emptySubtext}>
              Schedule a new appointment to get started
            </Text>
          </Surface>
        ) : (
          appointments.map((appointment) => (
            <Surface key={appointment.id} style={styles.appointmentCard}>
              <LinearGradient
                colors={getStatusColor(appointment.status) as [string, string]}
                style={styles.statusBadge}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.statusText}>
                  {appointment.status.toUpperCase()}
                </Text>
              </LinearGradient>

              <View style={styles.appointmentHeader}>
                <View style={styles.appointmentType}>
                  <Icon
                    name="stethoscope"
                    size={24}
                    color={theme.colors.primary}
                  />
                  <Text style={styles.typeText}>{appointment.type}</Text>
                </View>
                <Text style={styles.departmentText}>
                  {appointment.department}
                </Text>
              </View>

              <View style={styles.appointmentDetails}>
                <View style={styles.detailRow}>
                  <Icon name="calendar" size={20} color="#666" />
                  <Text style={styles.detailText}>
                    {format(new Date(appointment.date), 'MMMM dd, yyyy')}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Icon name="clock-outline" size={20} color="#666" />
                  <Text style={styles.detailText}>{appointment.time}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Icon name="doctor" size={20} color="#666" />
                  <Text style={styles.detailText}>
                    Dr. {appointment.doctorName}
                  </Text>
                </View>
              </View>

              <View style={styles.actionButtons}>
                <IconButton
                  icon="pencil"
                  mode="contained"
                  size={20}
                  onPress={() => {}}
                />
                <IconButton
                  icon="cancel"
                  mode="contained"
                  size={20}
                  onPress={() => {}}
                  containerColor={theme.colors.error}
                />
              </View>
            </Surface>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 48,
    paddingBottom: 16,
  },
  headerBlur: {
    padding: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    borderRadius: 16,
    marginTop: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    color: '#333',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  appointmentCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderTopLeftRadius: 16,
    borderBottomRightRadius: 16,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  appointmentHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  appointmentType: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  departmentText: {
    fontSize: 14,
    color: '#666',
  },
  appointmentDetails: {
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
});
