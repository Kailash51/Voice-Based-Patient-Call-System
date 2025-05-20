// Import necessary React and React Native components
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  Button,
  Surface,
  Divider,
  Chip,
  List,
  IconButton,
  TextInput as PaperInput,
  SegmentedButtons,
} from 'react-native-paper';
import { format } from 'date-fns';

// Enhanced Patient type with new fields
type Patient = {
  id: string;
  name: string;
  roomNumber: string;
  bedNumber: string;
  disease: string;
  status: 'stable' | 'critical' | 'recovering';
  contactNumber?: string;
  medicines?: Medicine[];
  appointments?: Appointment[];
  records?: MedicalRecord[];
};

type Medicine = {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  notes?: string;
};

type Appointment = {
  id: string;
  date: string;
  time: string;
  type: string;
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
  notes?: string;
};

type MedicalRecord = {
  id: string;
  date: string;
  type: 'vitals' | 'notes' | 'procedure' | 'test';
  title: string;
  value?: string;
  notes?: string;
};

// Main component for displaying the nurse's patient list
export const MyPatientsScreen = () => {
  // State for search functionality
  const [searchQuery, setSearchQuery] = useState('');
  // State for storing patient data
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('medicines');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New state for forms
  const [medicineForm, setMedicineForm] = useState<Partial<Medicine>>({});
  const [appointmentForm, setAppointmentForm] = useState<Partial<Appointment>>({});
  const [recordForm, setRecordForm] = useState<Partial<MedicalRecord>>({});

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    // TODO: Replace with actual API call
    const mockPatients: Patient[] = [
      {
        id: '1',
        name: 'Kailash Maurya',
        roomNumber: '11',
        bedNumber: '01',
        disease: 'Diabetes',
        status: 'stable',
        contactNumber: '+91 9198329925',
        medicines: [
          {
            id: 'm1',
            name: 'Metformin',
            dosage: '500mg',
            frequency: 'Twice daily',
            startDate: '2024-03-01',
            notes: 'Take with meals',
          },
        ],
        appointments: [
          {
            id: 'a1',
            date: '2024-03-20',
            time: '10:00 AM',
            type: 'Check-up',
            status: 'pending',
          },
        ],
        records: [
          {
            id: 'r1',
            date: '2024-03-15',
            type: 'vitals',
            title: 'Blood Pressure',
            value: '120/80',
          },
        ],
      },
      {
        id: '2',
        name: 'Anuj Kumar',
        roomNumber: '12',
        bedNumber: '02',
        disease: 'Hypertension',
        status: 'recovering',
        contactNumber: '+91 7058489056',
        medicines: [
          {
            id: 'm2',
            name: 'Amlodipine',
            dosage: '5mg',
            frequency: 'Once daily',
            startDate: '2024-03-05',
            notes: 'Take in the morning',
          },
          {
            id: 'm3',
            name: 'Losartan',
            dosage: '50mg',
            frequency: 'Once daily',
            startDate: '2024-03-05',
            notes: 'Take in the evening',
          }
        ],
        appointments: [
          {
            id: 'a2',
            date: '2024-03-22',
            time: '11:00 AM',
            type: 'Follow-up',
            status: 'pending',
          },
          {
            id: 'a3',
            date: '2024-03-25',
            time: '2:00 PM',
            type: 'Blood Test',
            status: 'approved',
          }
        ],
        records: [
          {
            id: 'r2',
            date: '2024-03-16',
            type: 'vitals',
            title: 'Blood Pressure',
            value: '135/85',
            notes: 'Slightly elevated, monitoring required',
          },
          {
            id: 'r3',
            date: '2024-03-16',
            type: 'test',
            title: 'ECG',
            value: 'Normal',
            notes: 'Regular rhythm, no abnormalities',
          }
        ],
      }
    ];
    setPatients(mockPatients);
  };

  const handleUpdatePatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setUpdateModalVisible(true);
  };

  const handleAddMedicine = async () => {
    if (!selectedPatient || !medicineForm.name || !medicineForm.dosage) {
      return;
    }

    try {
      setIsSubmitting(true);
      // TODO: Implement API call to add medicine
      const newMedicine: Medicine = {
        id: Date.now().toString(),
        name: medicineForm.name,
        dosage: medicineForm.dosage,
        frequency: medicineForm.frequency || 'As prescribed',
        startDate: medicineForm.startDate || new Date().toISOString(),
        notes: medicineForm.notes,
      };

      setPatients(prevPatients =>
        prevPatients.map(patient =>
          patient.id === selectedPatient.id
            ? {
                ...patient,
                medicines: [...(patient.medicines || []), newMedicine],
              }
            : patient
        )
      );

      setMedicineForm({});
    } catch (error) {
      console.error('Error adding medicine:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveAppointment = async (appointmentId: string) => {
    if (!selectedPatient) return;

    try {
      setIsSubmitting(true);
      // TODO: Implement API call to approve appointment
      setPatients(prevPatients =>
        prevPatients.map(patient =>
          patient.id === selectedPatient.id
            ? {
                ...patient,
                appointments: patient.appointments?.map(app =>
                  app.id === appointmentId
                    ? { ...app, status: 'approved' }
                    : app
                ),
              }
            : patient
        )
      );
    } catch (error) {
      console.error('Error approving appointment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddRecord = async () => {
    if (!selectedPatient || !recordForm.title || !recordForm.type) {
      return;
    }

    try {
      setIsSubmitting(true);
      // TODO: Implement API call to add record
      const newRecord: MedicalRecord = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        type: recordForm.type as MedicalRecord['type'],
        title: recordForm.title,
        value: recordForm.value,
        notes: recordForm.notes,
      };

      setPatients(prevPatients =>
        prevPatients.map(patient =>
          patient.id === selectedPatient.id
            ? {
                ...patient,
                records: [...(patient.records || []), newRecord],
              }
            : patient
        )
      );

      setRecordForm({});
    } catch (error) {
      console.error('Error adding record:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendMessage = async (patient: Patient) => {
    if (!patient.contactNumber) {
      Alert.alert(
        'Contact Not Available',
        'This patient does not have a contact number registered.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      // Format the phone number (remove any spaces or special characters)
      const phoneNumber = patient.contactNumber.replace(/[^0-9+]/g, '');
      
      // Create the SMS URL
      const smsUrl = Platform.select({
        ios: `sms:${phoneNumber}`,
        android: `sms:${phoneNumber}?body=Hello ${patient.name}, this is your nurse.`,
      });

      // Check if the URL can be opened
      const canOpen = await Linking.canOpenURL(smsUrl!);
      
      if (canOpen) {
        await Linking.openURL(smsUrl!);
      } else {
        Alert.alert(
          'Error',
          'Unable to open messaging app. Please check your device settings.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error opening messaging app:', error);
      Alert.alert(
        'Error',
        'Failed to open messaging app. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleWhatsAppMessage = async (patient: Patient) => {
    if (!patient.contactNumber) {
      Alert.alert(
        'Contact Not Available',
        'This patient does not have a contact number registered.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      // Format the phone number (remove any spaces and special characters)
      const phoneNumber = patient.contactNumber.replace(/[^0-9]/g, '');
      await Linking.openURL(`whatsapp://send?phone=${phoneNumber}`);
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
      Alert.alert(
        'Error',
        'Failed to open WhatsApp. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  // Component to render individual patient cards
  const renderPatientCard = ({ item }: { item: Patient }) => (
    <Surface style={styles.patientCard}>
      {/* Patient header with name and status */}
      <View style={styles.patientHeader}>
        <Text style={styles.patientName}>{item.name}</Text>
        <Chip
          mode="flat"
          style={[
          styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          {item.status}
        </Chip>
      </View>

      {/* Patient details section */}
      <View style={styles.patientInfo}>
        <View style={styles.infoRow}>
          <Icon name="room" size={18} color="#1976d2" />
          <Text style={styles.infoText}>Room {item.roomNumber}, Bed {item.bedNumber}</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="local-hospital" size={18} color="#1976d2" />
          <Text style={styles.infoText}>{item.disease}</Text>
        </View>
      </View>

      {/* Action buttons for patient interaction */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleSendMessage(item)}
        >
          <Icon name="message" size={20} color="#1976d2" />
          <Text style={styles.actionButtonText}>Message</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleWhatsAppMessage(item)}
        >
          <Icon name="chat-bubble" size={20} color="#25D366" />
          <Text style={[styles.actionButtonText, { color: '#25D366' }]}>WhatsApp</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleUpdatePatient(item)}
        >
          <Icon name="edit" size={20} color="#1976d2" />
          <Text style={styles.actionButtonText}>Update</Text>
        </TouchableOpacity>
      </View>
    </Surface>
  );

  // Helper function to determine status color based on patient status
  const getStatusColor = (status: Patient['status']) => {
    switch (status) {
      case 'stable':
        return '#4CAF50';
      case 'critical':
        return '#F44336';
      case 'recovering':
        return '#FFC107';
      default:
        return '#999';
    }
  };

  const renderUpdateModal = () => (
    <Modal
      visible={updateModalVisible}
      onDismiss={() => setUpdateModalVisible(false)}
      animationType="slide"
      transparent
    >
      <View style={styles.modalOverlay}>
        <Surface style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Update {selectedPatient?.name}'s Information
            </Text>
            <IconButton
              icon="close"
              size={24}
              onPress={() => setUpdateModalVisible(false)}
            />
          </View>

          <SegmentedButtons
            value={activeTab}
            onValueChange={setActiveTab}
            buttons={[
              { value: 'medicines', label: 'Medicines' },
              { value: 'appointments', label: 'Appointments' },
              { value: 'records', label: 'Records' },
            ]}
            style={styles.segmentedButtons}
          />

          <ScrollView style={styles.modalBody}>
            {activeTab === 'medicines' && (
              <View style={styles.tabContent}>
                <List.Section>
                  <List.Subheader>Current Medicines</List.Subheader>
                  {selectedPatient?.medicines?.map((medicine) => (
                    <List.Item
                      key={medicine.id}
                      title={medicine.name}
                      description={`${medicine.dosage} - ${medicine.frequency}`}
                      left={props => <List.Icon {...props} icon="pill" />}
                    />
                  ))}
                </List.Section>

                <Divider style={styles.divider} />

                <Text style={styles.sectionTitle}>Add New Medicine</Text>
                <PaperInput
                  label="Medicine Name"
                  value={medicineForm.name}
                  onChangeText={(text) =>
                    setMedicineForm({ ...medicineForm, name: text })
                  }
                  style={styles.input}
                />
                <PaperInput
                  label="Dosage"
                  value={medicineForm.dosage}
                  onChangeText={(text) =>
                    setMedicineForm({ ...medicineForm, dosage: text })
                  }
                  style={styles.input}
                />
                <PaperInput
                  label="Frequency"
                  value={medicineForm.frequency}
                  onChangeText={(text) =>
                    setMedicineForm({ ...medicineForm, frequency: text })
                  }
                  style={styles.input}
                />
                <PaperInput
                  label="Notes"
                  value={medicineForm.notes}
                  onChangeText={(text) =>
                    setMedicineForm({ ...medicineForm, notes: text })
                  }
                  multiline
                  style={styles.input}
                />
                <Button
                  mode="contained"
                  onPress={handleAddMedicine}
                  loading={isSubmitting}
                  style={styles.submitButton}
                >
                  Add Medicine
                </Button>
              </View>
            )}

            {activeTab === 'appointments' && (
              <View style={styles.tabContent}>
                <List.Section>
                  <List.Subheader>Pending Appointments</List.Subheader>
                  {selectedPatient?.appointments
                    ?.filter((app) => app.status === 'pending')
                    .map((appointment) => (
                      <List.Item
                        key={appointment.id}
                        title={`${appointment.type} - ${format(
                          new Date(appointment.date),
                          'MMM dd, yyyy'
                        )}`}
                        description={`Time: ${appointment.time}`}
                        left={props => <List.Icon {...props} icon="calendar" />}
                        right={props => (
                          <Button
                            mode="contained"
                            onPress={() => handleApproveAppointment(appointment.id)}
                            loading={isSubmitting}
                          >
                            Approve
                          </Button>
                        )}
                      />
                    ))}
                </List.Section>

                <Divider style={styles.divider} />

                <List.Section>
                  <List.Subheader>Approved Appointments</List.Subheader>
                  {selectedPatient?.appointments
                    ?.filter((app) => app.status === 'approved')
                    .map((appointment) => (
                      <List.Item
                        key={appointment.id}
                        title={`${appointment.type} - ${format(
                          new Date(appointment.date),
                          'MMM dd, yyyy'
                        )}`}
                        description={`Time: ${appointment.time}`}
                        left={props => <List.Icon {...props} icon="calendar-check" />}
                      />
                    ))}
                </List.Section>
              </View>
            )}

            {activeTab === 'records' && (
              <View style={styles.tabContent}>
                <List.Section>
                  <List.Subheader>Recent Records</List.Subheader>
                  {selectedPatient?.records?.map((record) => (
                    <List.Item
                      key={record.id}
                      title={record.title}
                      description={`${record.type} - ${format(
                        new Date(record.date),
                        'MMM dd, yyyy'
                      )}`}
                      left={props => <List.Icon {...props} icon="file-document" />}
                    />
                  ))}
                </List.Section>

                <Divider style={styles.divider} />

                <Text style={styles.sectionTitle}>Add New Record</Text>
                <PaperInput
                  label="Title"
                  value={recordForm.title}
                  onChangeText={(text) =>
                    setRecordForm({ ...recordForm, title: text })
                  }
                  style={styles.input}
                />
                <PaperInput
                  label="Type"
                  value={recordForm.type}
                  onChangeText={(text) =>
                    setRecordForm({ ...recordForm, type: text as MedicalRecord['type'] })
                  }
                  style={styles.input}
                />
                <PaperInput
                  label="Value"
                  value={recordForm.value}
                  onChangeText={(text) =>
                    setRecordForm({ ...recordForm, value: text })
                  }
                  style={styles.input}
                />
                <PaperInput
                  label="Notes"
                  value={recordForm.notes}
                  onChangeText={(text) =>
                    setRecordForm({ ...recordForm, notes: text })
                  }
                  multiline
                  style={styles.input}
                />
                <Button
                  mode="contained"
                  onPress={handleAddRecord}
                  loading={isSubmitting}
                  style={styles.submitButton}
                >
                  Add Record
                </Button>
              </View>
            )}
          </ScrollView>
        </Surface>
      </View>
    </Modal>
  );

  // Main render method
  return (
    <View style={styles.container}>
      {/* Search bar section */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={24} color="#1976d2" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search patients..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#90caf9"
        />
      </View>

      {/* Patient list section */}
      <FlatList
        data={patients}
        renderItem={renderPatientCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />

      {renderUpdateModal()}
    </View>
  );
};

// Styles for the component
const styles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: '#f4f8fb',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e3f2fd',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#1976d2',
  },
  listContainer: {
    padding: 15,
    gap: 15,
  },
  // Patient card styles
  patientCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    elevation: 4,
    shadowColor: '#1976d2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#e3f2fd',
  },
  patientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  patientName: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  statusBadge: {
    borderRadius: 8,
  },
  patientInfo: {
    gap: 8,
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    color: '#263238',
    fontSize: 15,
    fontWeight: '500',
  },
  // Action button styles
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#e3f2fd',
    paddingTop: 15,
  },
  actionButton: {
    alignItems: 'center',
    gap: 5,
  },
  actionButtonText: {
    color: '#1976d2',
    fontSize: 13,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 20,
    backgroundColor: '#fff',
    elevation: 8,
    shadowColor: '#1976d2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e3f2fd',
    backgroundColor: '#f7fbff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976d2',
    flex: 1,
  },
  segmentedButtons: {
    margin: 16,
    backgroundColor: 'rgba(25, 118, 210, 0.07)',
    borderRadius: 12,
  },
  modalBody: {
    padding: 16,
  },
  tabContent: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 12,
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  divider: {
    marginVertical: 16,
    backgroundColor: '#e3f2fd',
  },
  submitButton: {
    marginTop: 8,
    backgroundColor: '#1976d2',
  },
});
