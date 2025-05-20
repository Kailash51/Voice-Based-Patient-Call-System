import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  List,
  Divider,
  SegmentedButtons,
  IconButton,
  ActivityIndicator,
} from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { Audio } from 'expo-av';
import { useAuth } from '@/contexts/AuthContext';
import { DISEASES } from '@/constants/diseases';
import { requestService } from '@/services/api/requestService';
import Toast from 'react-native-toast-message';

interface RequestDialogProps {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (data: any) => void;
}

export const RequestDialog = ({ visible, onDismiss, onSubmit }: RequestDialogProps) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('new');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const durationInterval = useRef<NodeJS.Timeout | null>(null);

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    contactNumber: user?.contactNumber || '',
    roomNumber: '',
    bedNumber: '',
    disease: '',
  });

  useEffect(() => {
    // Request permissions when component mounts
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Toast.show({
          type: 'error',
          text1: 'Permission Required',
          text2: 'Please grant microphone access to use voice recording',
          position: 'top',
        });
      }
    })();

    // Cleanup function
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
      if (sound) {
        sound.unloadAsync();
      }
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      setRecordingDuration(0);
      setRecordingUri(null);

      // Start duration timer
      durationInterval.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Failed to start recording:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to start recording',
        position: 'top',
      });
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;

      // Stop recording
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordingUri(uri);
      setRecording(null);
      setIsRecording(false);
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }

      // Reset audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: false,
      });
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to stop recording',
        position: 'top',
      });
    }
  };

  const playRecording = async () => {
    try {
      if (!recordingUri) return;

      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: recordingUri },
        { shouldPlay: true }
      );
      setSound(newSound);
      setIsPlaying(true);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && !status.isPlaying) {
          setIsPlaying(false);
        }
      });
    } catch (error) {
      console.error('Failed to play recording:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to play recording',
        position: 'top',
      });
    }
  };

  const stopPlaying = async () => {
    try {
      if (sound) {
        await sound.stopAsync();
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('Failed to stop playing:', error);
    }
  };

  const handleVoiceSubmit = async () => {
    if (!recordingUri) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please record a voice message first',
        position: 'top',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      // Create form data for file upload
      const formData = new FormData();
      formData.append('audio', {
        uri: recordingUri,
        type: 'audio/m4a',
        name: 'voice-message.m4a',
      } as any);
      formData.append('fullName', user?.fullName || '');
      formData.append('contactNumber', user?.contactNumber || '');
      formData.append('roomNumber', user?.roomNumber || '');
      formData.append('requestType', 'voice');

      const response = await requestService.createRequest(formData);
      
      if (response.data.success) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Voice request submitted successfully',
          position: 'top',
        });
        setRecordingUri(null);
        setRecordingDuration(0);
        onSubmit(response.data.data);
        onDismiss();
      }
    } catch (error: any) {
      console.error('Error submitting voice request:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to submit voice request',
        position: 'top',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter your full name',
        position: 'top',
        visibilityTime: 4000,
      });
      return false;
    }
    if (!formData.contactNumber.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter your contact number',
        position: 'top',
        visibilityTime: 4000,
      });
      return false;
    }
    if (!formData.roomNumber.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter your room number',
        position: 'top',
        visibilityTime: 4000,
      });
      return false;
    }
    if (!formData.disease) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please select a disease',
        position: 'top',
        visibilityTime: 4000,
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    try {
      if (!validateForm()) return;
      
      setIsSubmitting(true);
      const response = await requestService.createRequest(formData);
      
      if (response.data.success) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Request submitted successfully',
          position: 'top',
          topOffset: 60,
          visibilityTime: 4000,
        });
        
    setFormData({
      fullName: user?.fullName || '',
      contactNumber: user?.contactNumber || '',
      roomNumber: '',
      bedNumber: '',
      disease: '',
    });
        
        onSubmit(response.data.data);
        onDismiss();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response.data.message || 'Failed to submit request',
          position: 'top',
          visibilityTime: 4000,
        });
      }
    } catch (error: any) {
      console.error('Error submitting request:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to submit request',
        position: 'top',
        visibilityTime: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
    <Modal visible={visible} onDismiss={onDismiss} animationType="slide">
      <View style={styles.container}>
        <SegmentedButtons
          value={activeTab}
          onValueChange={setActiveTab}
          buttons={[
            { value: 'new', label: 'New Request' },
            { value: 'voice', label: 'Voice Request' },
          ]}
          style={styles.tabs}
        />

        {activeTab === 'new' ? (
          <ScrollView style={styles.form}>
            <TextInput
              label="Full Name"
              value={formData.fullName}
              onChangeText={(text) => setFormData({ ...formData, fullName: text })}
              style={styles.input}
            />
            <TextInput
              label="Contact Number"
              value={formData.contactNumber}
              onChangeText={(text) => setFormData({ ...formData, contactNumber: text })}
              style={styles.input}
              keyboardType="phone-pad"
            />
            <TextInput
              label="Room Number"
              value={formData.roomNumber}
              onChangeText={(text) => setFormData({ ...formData, roomNumber: text })}
              style={styles.input}
            />
            <TextInput
              label="Bed Number "
              value={formData.bedNumber}
              onChangeText={(text) => setFormData({ ...formData, bedNumber: text })}
              style={styles.input}
            />
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Disease</Text>
              <Picker
                selectedValue={formData.disease}
                onValueChange={(value) => setFormData({ ...formData, disease: value })}
                style={styles.picker}
              >
                <Picker.Item label="Select Disease" value="" />
                {DISEASES.map((disease, index) => (
                  <Picker.Item 
                    key={index} 
                    label={`${disease.english} / ${disease.hindi}`} 
                    value={disease.english} 
                  />
                ))}
              </Picker>
            </View>
            <Button 
              mode="contained" 
              onPress={handleSubmit}
              style={styles.submitButton}
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </ScrollView>
        ) : (
          <ScrollView style={styles.voiceContainer}>
            <View style={styles.recordingContainer}>
              <Text style={styles.recordingTitle}>Record Voice Message</Text>
              <Text style={styles.recordingSubtitle}>
                Tap the microphone to start recording your request
              </Text>
              
              <View style={styles.recordingControls}>
                {!isRecording && !recordingUri ? (
                  <IconButton
                    icon="microphone"
                    size={40}
                    mode="contained"
                    onPress={startRecording}
                    style={styles.recordButton}
                  />
                ) : isRecording ? (
                  <>
                    <IconButton
                      icon="stop"
                      size={40}
                      mode="contained"
                      onPress={stopRecording}
                      style={[styles.recordButton, styles.stopButton]}
                    />
                    <Text style={styles.duration}>
                      {formatDuration(recordingDuration)}
                    </Text>
                  </>
                ) : (
                  <View style={styles.playbackControls}>
                    <IconButton
                      icon={isPlaying ? 'stop' : 'play'}
                      size={40}
                      mode="contained"
                      onPress={isPlaying ? stopPlaying : playRecording}
                      style={styles.playButton}
                    />
                    <Text style={styles.duration}>
                      {formatDuration(recordingDuration)}
                    </Text>
                    <IconButton
                      icon="delete"
                      size={40}
                      mode="contained"
                      onPress={() => {
                        setRecordingUri(null);
                        setRecordingDuration(0);
                      }}
                      style={styles.deleteButton}
                    />
                  </View>
                )}
              </View>

              <Button
                mode="contained"
                onPress={handleVoiceSubmit}
                style={styles.submitButton}
                loading={isSubmitting}
                disabled={!recordingUri || isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Voice Request'}
              </Button>
            </View>
          </ScrollView>
        )}
        <TouchableOpacity
          onPress={onDismiss}
          style={styles.closeButton}
        >
          <Text style={styles.closeButtonText}>X</Text>
        </TouchableOpacity>
      </View>
    </Modal>
      <Toast position="top" topOffset={60} />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 20,
    position: 'relative',
  },
  tabs: {
    marginBottom: 16,
  },
  form: {
    flex: 1,
  },
  input: {
    marginBottom: 16,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  pickerLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  picker: {
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
  submitButton: {
    marginTop: 16,
    marginBottom: 32,
  },
  closeButton: {
    position: 'absolute',
    top: -8,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 50,
  },
  closeButtonText: {
    fontSize: 20,
    color: 'red',
  },
  voiceContainer: {
    flex: 1,
    padding: 16,
  },
  recordingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  recordingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  recordingSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  recordingControls: {
    alignItems: 'center',
    marginBottom: 32,
  },
  recordButton: {
    backgroundColor: '#4CAF50',
    margin: 16,
  },
  stopButton: {
    backgroundColor: '#F44336',
  },
  playButton: {
    backgroundColor: '#2196F3',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  playbackControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  duration: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 16,
  },
  submitButton: {
    marginTop: 16,
    width: '100%',
  },
});