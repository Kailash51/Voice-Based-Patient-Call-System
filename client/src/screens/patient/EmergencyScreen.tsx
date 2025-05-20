import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Text,
  Surface,
  IconButton,
  useTheme,
  Button,
  Modal,
  ProgressBar,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { 
  FadeInDown, 
  useAnimatedStyle, 
  withSpring,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { useAuth } from '@/contexts/AuthContext';
import { requestApi } from '@/services/api';
import Toast from 'react-native-toast-message';

export const EmergencyScreen: React.FC = () => {
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [helpOnWay, setHelpOnWay] = useState(false);
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const theme = useTheme();
  const { user } = useAuth();

  const pulseStyle = useAnimatedStyle(() => {
    if (!emergencyActive) return {};
    return {
      transform: [
        {
          scale: withRepeat(
            withSequence(
              withSpring(1.2),
              withSpring(1)
            ),
            -1,
            true
          ),
        },
      ],
    };
  });

  const handleEmergency = () => {
    setConfirmationVisible(true);
  };

  const confirmEmergency = async () => {
    try {
      setConfirmationVisible(false);
      setEmergencyActive(true);
      setEstimatedTime(3);

      const response = await requestApi.createEmergencyRequest({
        patientId: user?.id,
        priority: 'high',
        description: 'Emergency alert triggered',
        department: 'Emergency',
      });

      if (response.success) {
        setHelpOnWay(true);
        Toast.show({
          type: 'success',
          text1: 'Emergency Alert Sent',
          text2: 'Help is on the way!',
          position: 'top',
          topOffset: 60,
        });
      } else {
        throw new Error('Failed to create emergency request');
      }
    } catch (error) {
      console.error('Emergency request error:', error);
      setEmergencyActive(false);
      Alert.alert(
        'Error',
        'Failed to send emergency alert. Please try again or contact the front desk.',
        [{ text: 'OK' }]
      );
    }
  };

  const cancelEmergency = () => {
    Alert.alert(
      'Cancel Emergency',
      'Are you sure you want to cancel the emergency alert?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: () => {
            setEmergencyActive(false);
            setHelpOnWay(false);
            Toast.show({
              type: 'info',
              text1: 'Emergency Alert Cancelled',
              position: 'top',
              topOffset: 60,
            });
          },
        },
      ]
    );
  };

  const EmergencyButton = () => (
    <Animated.View style={[styles.emergencyButtonContainer, pulseStyle]}>
      <TouchableOpacity
        style={[
          styles.emergencyButton,
          emergencyActive && styles.emergencyButtonActive,
        ]}
        onPress={handleEmergency}
        disabled={emergencyActive}
      >
        <Icon
          name="alert-octagon"
          size={64}
          color={emergencyActive ? '#fff' : '#f44336'}
        />
        <Text style={[
          styles.emergencyButtonText,
          emergencyActive && styles.emergencyButtonTextActive,
        ]}>
          {emergencyActive ? 'EMERGENCY ACTIVE' : 'PRESS FOR EMERGENCY'}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const QuickActions = () => (
    <View style={styles.quickActions}>
      <Surface style={styles.actionCard}>
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="phone" size={32} color={theme.colors.primary} />
          <Text style={styles.actionText}>Call Nurse</Text>
        </TouchableOpacity>
      </Surface>

      <Surface style={styles.actionCard}>
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="medical-bag" size={32} color={theme.colors.primary} />
          <Text style={styles.actionText}>Medical Help</Text>
        </TouchableOpacity>
      </Surface>

      <Surface style={styles.actionCard}>
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="pill" size={32} color={theme.colors.primary} />
          <Text style={styles.actionText}>Medicine</Text>
        </TouchableOpacity>
      </Surface>

      <Surface style={styles.actionCard}>
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="doctor" size={32} color={theme.colors.primary} />
          <Text style={styles.actionText}>Assistance</Text>
        </TouchableOpacity>
      </Surface>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={emergencyActive ? ['#f44336', '#d32f2f'] : ['#2C6EAB', '#3b5998', '#192f6a']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <BlurView intensity={20} style={styles.headerBlur}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Emergency</Text>
            {emergencyActive && (
              <IconButton
                icon="close"
                iconColor="#fff"
                size={24}
                onPress={cancelEmergency}
                style={styles.headerButton}
              />
            )}
          </View>
        </BlurView>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <Animated.View entering={FadeInDown}>
          {emergencyActive ? (
            <Surface style={styles.statusCard}>
              <View style={styles.statusHeader}>
                <Icon name="alert-circle" size={32} color="#f44336" />
                <Text style={styles.statusTitle}>Emergency Alert Active</Text>
              </View>
              
              {helpOnWay && (
                <React.Fragment>
                  <Text style={styles.statusText}>Help is on the way!</Text>
                  <View style={styles.estimatedTime}>
                    <Text style={styles.estimatedTimeText}>
                      Estimated arrival in {estimatedTime} minutes
                    </Text>
                    <ProgressBar
                      progress={0.3}
                      color={theme.colors.primary}
                      style={styles.progressBar}
                    />
                  </View>
                </React.Fragment>
              )}
            </Surface>
          ) : (
            <EmergencyButton />
          )}

          <QuickActions />
        </Animated.View>
      </ScrollView>

      <Modal
        visible={confirmationVisible}
        onDismiss={() => setConfirmationVisible(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <Icon name="alert" size={48} color="#f44336" />
          <Text style={styles.modalTitle}>Confirm Emergency</Text>
          <Text style={styles.modalText}>
            Are you sure you want to trigger an emergency alert?
          </Text>
          <View style={styles.modalButtons}>
            <Button
              mode="outlined"
              onPress={() => setConfirmationVisible(false)}
              style={styles.modalButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={confirmEmergency}
              style={[styles.modalButton, styles.confirmButton]}
              buttonColor="#f44336"
            >
              Confirm
            </Button>
          </View>
        </View>
      </Modal>
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    height: 120,
    justifyContent: 'flex-end',
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
    margin: 0,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emergencyButtonContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  emergencyButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  emergencyButtonActive: {
    backgroundColor: '#f44336',
  },
  emergencyButtonText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f44336',
    textAlign: 'center',
  },
  emergencyButtonTextActive: {
    color: '#fff',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  actionCard: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  actionButton: {
    padding: 16,
    alignItems: 'center',
  },
  actionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  statusCard: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 24,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    marginLeft: 12,
    fontSize: 20,
    fontWeight: 'bold',
  },
  statusText: {
    fontSize: 16,
    marginBottom: 16,
  },
  estimatedTime: {
    marginTop: 8,
  },
  estimatedTimeText: {
    fontSize: 14,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  modalContainer: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 12,
    padding: 20,
  },
  modalContent: {
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 16,
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  modalButton: {
    minWidth: 120,
  },
  confirmButton: {
    backgroundColor: '#f44336',
  },
});