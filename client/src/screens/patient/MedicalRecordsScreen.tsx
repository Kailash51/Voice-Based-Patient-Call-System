import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import {
  Text,
  Surface,
  IconButton,
  useTheme,
  Searchbar,
  Chip,
  Modal,
  Button,
  List,
  Divider,
  SegmentedButtons,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { format } from 'date-fns';

const { width, height } = Dimensions.get('window');

interface MedicalRecord {
  id: string;
  date: string;
  type: 'diagnosis' | 'procedure' | 'test' | 'vaccination';
  title: string;
  description: string;
  doctor: string;
  department: string;
  attachments?: {
    id: string;
    name: string;
    type: string;
    url: string;
  }[];
  notes?: string;
  followUp?: {
    date: string;
    instructions: string;
  };
  results?: {
    key: string;
    value: string;
    unit?: string;
    normalRange?: string;
  }[];
}

export const MedicalRecordsScreen: React.FC = () => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<MedicalRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedType, setSelectedType] = useState('all');
  const [timeRange, setTimeRange] = useState('all');
  const theme = useTheme();

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    // Mock data - replace with actual API call
    const mockRecords: MedicalRecord[] = [
      {
        id: '1',
        date: '2024-03-15',
        type: 'diagnosis',
        title: 'Acute Bronchitis',
        description: 'Patient presented with persistent cough and fever...',
        doctor: 'Dr. Sarah Johnson',
        department: 'Pulmonology',
        notes: 'Prescribed antibiotics and recommended rest',
        followUp: {
          date: '2024-03-22',
          instructions: 'Return if symptoms persist',
        },
        attachments: [
          {
            id: 'a1',
            name: 'Chest X-Ray',
            type: 'image/jpeg',
            url: 'https://example.com/xray.jpg',
          },
        ],
        results: [
          {
            key: 'Temperature',
            value: '38.5',
            unit: '°C',
            normalRange: '36.5-37.5',
          },
          {
            key: 'WBC Count',
            value: '11.5',
            unit: 'K/µL',
            normalRange: '4.5-11.0',
          },
        ],
      },
      // Add more mock records...
    ];
    setRecords(mockRecords);
    setFilteredRecords(mockRecords);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterRecords(query, selectedType, timeRange);
  };

  const filterRecords = (query: string, type: string, range: string) => {
    let filtered = records.filter(record => {
      const matchesSearch = (
        record.title.toLowerCase() +
        record.description.toLowerCase() +
        record.doctor.toLowerCase()
      ).includes(query.toLowerCase());

      const matchesType = type === 'all' || record.type === type;

      const recordDate = new Date(record.date);
      const now = new Date();
      let matchesTimeRange = true;

      switch (range) {
        case '3months':
          matchesTimeRange = recordDate >= new Date(now.setMonth(now.getMonth() - 3));
          break;
        case '6months':
          matchesTimeRange = recordDate >= new Date(now.setMonth(now.getMonth() - 6));
          break;
        case '1year':
          matchesTimeRange = recordDate >= new Date(now.setFullYear(now.getFullYear() - 1));
          break;
      }

      return matchesSearch && matchesType && matchesTimeRange;
    });

    setFilteredRecords(filtered);
  };

  const getRecordIcon = (type: MedicalRecord['type']) => {
    switch (type) {
      case 'diagnosis':
        return 'stethoscope';
      case 'procedure':
        return 'medical-bag';
      case 'test':
        return 'test-tube';
      case 'vaccination':
        return 'needle';
      default:
        return 'file-document';
    }
  };

  const renderRecord = (record: MedicalRecord) => (
    <View key={record.id}>
      <Surface style={styles.recordCard}>
        <TouchableOpacity
          onPress={() => {
            setSelectedRecord(record);
            setModalVisible(true);
          }}
          activeOpacity={0.85}
        >
          <View style={styles.cardHeader}>
            <View style={styles.headerLeft}>
              <Icon
                name={getRecordIcon(record.type)}
                size={28}
                color={theme.colors.primary}
                style={{ marginRight: 10 }}
              />
              <View style={styles.recordInfo}>
                <Text style={styles.recordTitle}>{record.title}</Text>
                <Text style={styles.recordDate}>
                  {format(new Date(record.date), 'MMM dd, yyyy')}
                </Text>
              </View>
            </View>
            <Chip
              mode="flat"
              style={[
                styles.chip,
                {
                  backgroundColor:
                    record.type === 'diagnosis'
                      ? '#e3f2fd'
                      : record.type === 'procedure'
                      ? '#e8f5e9'
                      : record.type === 'test'
                      ? '#fff3e0'
                      : '#fce4ec',
                },
              ]}
              textStyle={{
                color:
                  record.type === 'diagnosis'
                    ? '#1976d2'
                    : record.type === 'procedure'
                    ? '#388e3c'
                    : record.type === 'test'
                    ? '#f57c00'
                    : '#c2185b',
                fontWeight: 'bold',
                fontSize: 13,
              }}
            >
              {record.type.charAt(0).toUpperCase() + record.type.slice(1)}
            </Chip>
          </View>

          <View style={styles.cardContent}>
            <Text numberOfLines={2} style={styles.description}>
              {record.description}
            </Text>
            <View style={styles.doctorInfo}>
              <Icon name="doctor" size={18} color="#1976d2" />
              <Text style={styles.doctorText}>{record.doctor}</Text>
              <Text style={styles.departmentText}>• {record.department}</Text>
            </View>
          </View>

          {record.attachments && record.attachments.length > 0 && (
            <View style={styles.attachments}>
              <Icon name="paperclip" size={16} color="#757575" />
              <Text style={styles.attachmentsText}>
                {record.attachments.length} attachment{record.attachments.length !== 1 ? 's' : ''}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </Surface>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#e3f2fd" />
      <LinearGradient
        colors={['#1976d2', '#42a5f5', '#e3f2fd']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <BlurView intensity={30} style={styles.headerBlur}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Medical Records</Text>
            {/* <IconButton
              icon="download"
              iconColor="#1976d2"
              size={26}
              onPress={() => {}}
              style={styles.headerButton}
            /> */}
          </View>
          <Searchbar
            placeholder="Search records..."
            onChangeText={handleSearch}
            value={searchQuery}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
            iconColor="#1976d2"
            placeholderTextColor="#90caf9"
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersContainer}
            contentContainerStyle={{ paddingVertical: 4 }}
          >
            <SegmentedButtons
              value={selectedType}
              onValueChange={value => {
                setSelectedType(value);
                filterRecords(searchQuery, value, timeRange);
              }}
              buttons={[
                { value: 'all', label: 'All' },
                { value: 'diagnosis', label: 'Diagnoses' },
                { value: 'procedure', label: 'Procedures' },
                { value: 'test', label: 'Tests' },
                { value: 'vaccination', label: 'Vaccinations' },
              ]}
              style={styles.segmentedButtons}
            />
          </ScrollView>
          <View style={styles.timeRangeContainer}>
            <Button
              mode={timeRange === 'all' ? 'contained' : 'outlined'}
              onPress={() => {
                setTimeRange('all');
                filterRecords(searchQuery, selectedType, 'all');
              }}
              style={[
                styles.timeRangeButton,
                timeRange === 'all' && styles.timeRangeButtonActive,
              ]}
              labelStyle={timeRange === 'all' ? styles.timeRangeLabelActive : styles.timeRangeLabel}
              buttonColor={timeRange === 'all' ? '#1976d2' : '#fff'}
              textColor={timeRange === 'all' ? '#fff' : '#1976d2'}
            >
              All Time
            </Button>
            <Button
              mode={timeRange === '3months' ? 'contained' : 'outlined'}
              onPress={() => {
                setTimeRange('3months');
                filterRecords(searchQuery, selectedType, '3months');
              }}
              style={[
                styles.timeRangeButton,
                timeRange === '3months' && styles.timeRangeButtonActive,
              ]}
              labelStyle={timeRange === '3months' ? styles.timeRangeLabelActive : styles.timeRangeLabel}
              buttonColor={timeRange === '3months' ? '#1976d2' : '#fff'}
              textColor={timeRange === '3months' ? '#fff' : '#1976d2'}
            >
              3 Months
            </Button>
            <Button
              mode={timeRange === '6months' ? 'contained' : 'outlined'}
              onPress={() => {
                setTimeRange('6months');
                filterRecords(searchQuery, selectedType, '6months');
              }}
              style={[
                styles.timeRangeButton,
                timeRange === '6months' && styles.timeRangeButtonActive,
              ]}
              labelStyle={timeRange === '6months' ? styles.timeRangeLabelActive : styles.timeRangeLabel}
              buttonColor={timeRange === '6months' ? '#1976d2' : '#fff'}
              textColor={timeRange === '6months' ? '#fff' : '#1976d2'}
            >
              6 Months
            </Button>
            <Button
              mode={timeRange === '1year' ? 'contained' : 'outlined'}
              onPress={() => {
                setTimeRange('1year');
                filterRecords(searchQuery, selectedType, '1year');
              }}
              style={[
                styles.timeRangeButton,
                timeRange === '1year' && styles.timeRangeButtonActive,
              ]}
              labelStyle={timeRange === '1year' ? styles.timeRangeLabelActive : styles.timeRangeLabel}
              buttonColor={timeRange === '1year' ? '#1976d2' : '#fff'}
              textColor={timeRange === '1year' ? '#fff' : '#1976d2'}
            >
              1 Year
            </Button>
          </View>
        </BlurView>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 32 }}>
        {filteredRecords.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="file-document-outline" size={60} color="#bdbdbd" />
            <Text style={styles.emptyText}>No records found</Text>
          </View>
        ) : (
          filteredRecords.map(renderRecord)
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        contentContainerStyle={styles.modalContent}
        dismissable
      >
        {selectedRecord && (
          <ScrollView
            style={{ maxHeight: height * 0.8, minHeight: 200 }}
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedRecord.title}</Text>
              <IconButton
                icon="close"
                size={26}
                onPress={() => setModalVisible(false)}
                iconColor="#1976d2"
                style={{ marginLeft: 8 }}
              />
            </View>

            <View style={styles.modalBody}>
              <Surface style={styles.detailsCard}>
                <List.Section>
                  <List.Item
                    title="Date"
                    titleStyle={styles.listTitle}
                    description={format(new Date(selectedRecord.date), 'MMMM dd, yyyy')}
                    descriptionStyle={styles.listDescription}
                    left={props => <List.Icon {...props} icon="calendar" color="#1976d2" />}
                  />
                  <List.Item
                    title="Doctor"
                    titleStyle={styles.listTitle}
                    description={selectedRecord.doctor}
                    descriptionStyle={styles.listDescription}
                    left={props => <List.Icon {...props} icon="doctor" color="#1976d2" />}
                  />
                  <List.Item
                    title="Department"
                    titleStyle={styles.listTitle}
                    description={selectedRecord.department}
                    descriptionStyle={styles.listDescription}
                    left={props => <List.Icon {...props} icon="hospital-building" color="#1976d2" />}
                  />
                </List.Section>

                <Divider style={styles.divider} />

                <View style={styles.descriptionSection}>
                  <Text style={styles.sectionTitle}>Description</Text>
                  <Text style={styles.descriptionText}>
                    {selectedRecord.description}
                  </Text>
                </View>

                {selectedRecord.results && selectedRecord.results.length > 0 && (
                  <>
                    <Divider style={styles.divider} />
                    <View style={styles.resultsSection}>
                      <Text style={styles.sectionTitle}>Results</Text>
                      {selectedRecord.results.map((result, index) => (
                        <View key={index} style={styles.resultItem}>
                          <Text style={styles.resultKey}>{result.key}</Text>
                          <View style={styles.resultValue}>
                            <Text style={styles.valueText}>
                              {result.value} {result.unit}
                            </Text>
                            {result.normalRange && (
                              <Text style={styles.normalRange}>
                                Normal: {result.normalRange}
                              </Text>
                            )}
                          </View>
                        </View>
                      ))}
                    </View>
                  </>
                )}

                {selectedRecord.followUp && (
                  <>
                    <Divider style={styles.divider} />
                    <View style={styles.followUpSection}>
                      <Text style={styles.sectionTitle}>Follow-up</Text>
                      <Surface style={styles.followUpCard}>
                        <View style={styles.followUpHeader}>
                          <Icon name="calendar-clock" size={20} color="#1976d2" />
                          <Text style={styles.followUpDate}>
                            {format(new Date(selectedRecord.followUp.date), 'MMMM dd, yyyy')}
                          </Text>
                        </View>
                        <Text style={styles.followUpInstructions}>
                          {selectedRecord.followUp.instructions}
                        </Text>
                      </Surface>
                    </View>
                  </>
                )}

                {selectedRecord.attachments && selectedRecord.attachments.length > 0 && (
                  <>
                    <Divider style={styles.divider} />
                    <View style={styles.attachmentsSection}>
                      <Text style={styles.sectionTitle}>Attachments</Text>
                      {selectedRecord.attachments.map((attachment, index) => (
                        <Surface key={index} style={styles.attachmentItem}>
                          <View style={styles.attachmentInfo}>
                            <Icon
                              name={attachment.type.includes('image') ? 'image' : 'file-document'}
                              size={24}
                              color="#1976d2"
                            />
                            <Text style={styles.attachmentName}>{attachment.name}</Text>
                          </View>
                          <IconButton
                            icon="download"
                            size={20}
                            onPress={() => {/* Handle download */}}
                            iconColor="#1976d2"
                          />
                        </Surface>
                      ))}
                    </View>
                  </>
                )}
              </Surface>

              <View style={styles.modalActions}>
                <Button
                  mode="contained"
                  onPress={() => {/* Handle share */}}
                  style={styles.actionButton}
                  icon="share-variant"
                  buttonColor="#1976d2"
                  textColor="#fff"
                  labelStyle={{ fontWeight: 'bold' }}
                >
                  Share Record
                </Button>
                <Button
                  mode="contained"
                  onPress={() => {/* Handle download */}}
                  style={styles.actionButton}
                  icon="download"
                  buttonColor="#42a5f5"
                  textColor="#fff"
                  labelStyle={{ fontWeight: 'bold' }}
                >
                  Download
                </Button>
              </View>
            </View>
          </ScrollView>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f8fb',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 48 : 24,
    paddingBottom: 0,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
    elevation: 4,
  },
  headerBlur: {
    padding: 18,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#1976d2',
    textShadowColor: 'rgba(25, 118, 210, 0.08)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 0.5,
  },
  headerButton: {
    backgroundColor: '#e3f2fd',
    borderRadius: 50,
    elevation: 0,
  },
  searchBar: {
    marginBottom: 10,
    elevation: 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bbdefb',
  },
  searchInput: {
    fontSize: 16,
    color: '#1976d2',
    fontWeight: '500',
  },
  filtersContainer: {
    marginBottom: 10,
  },
  segmentedButtons: {
    backgroundColor: 'rgba(25, 118, 210, 0.07)',
    borderRadius: 12,
    marginHorizontal: 0,
    minWidth: width - 32,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    marginBottom: 2,
  },
  timeRangeButton: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1976d2',
    marginHorizontal: 2,
    elevation: 0,
  },
  timeRangeButtonActive: {
    borderColor: '#1976d2',
    elevation: 2,
  },
  timeRangeLabel: {
    color: '#1976d2',
    fontWeight: 'bold',
    fontSize: 13,
  },
  timeRangeLabelActive: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  content: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f4f8fb',
  },
  recordCard: {
    borderRadius: 16,
    marginBottom: 18,
    overflow: 'hidden',
    elevation: 4,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e3f2fd',
    shadowColor: '#1976d2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#e3f2fd',
    backgroundColor: '#f7fbff',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  recordInfo: {
    flex: 1,
  },
  recordTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 2,
  },
  recordDate: {
    fontSize: 14,
    color: '#90caf9',
    fontWeight: '500',
  },
  chip: {
    borderRadius: 8,
    paddingHorizontal: 0,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
    elevation: 0,
  },
  cardContent: {
    padding: 18,
    paddingTop: 10,
    backgroundColor: '#fff',
  },
  description: {
    fontSize: 16,
    marginBottom: 10,
    color: '#263238',
    lineHeight: 22,
    fontWeight: '500',
  },
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  doctorText: {
    fontSize: 15,
    color: '#1976d2',
    fontWeight: 'bold',
  },
  departmentText: {
    fontSize: 14,
    color: '#607d8b',
    fontWeight: '500',
  },
  attachments: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingBottom: 12,
    backgroundColor: '#f7fbff',
  },
  attachmentsText: {
    fontSize: 14,
    color: '#757575',
    fontWeight: '500',
  },
  modalContent: {
    backgroundColor: '#fff',
    marginHorizontal: 0,
    marginVertical: 0,
    borderRadius: 20,
    maxHeight: height * 0.85,
    minHeight: 200,
    width: width - 24,
    alignSelf: 'center',
    elevation: 8,
    shadowColor: '#1976d2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    padding: 0,
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
    fontSize: 25,
    fontWeight: 'bold',
    color: '#1976d2',
    flex: 1,
    marginRight: 8,
    letterSpacing: 0.2,
  },
  modalBody: {
    padding: 18,
    backgroundColor: '#fff',
  },
  detailsCard: {
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
    elevation: 1,
    backgroundColor: '#f7fbff',
    borderWidth: 1,
    borderColor: '#e3f2fd',
  },
  divider: {
    marginVertical: 14,
    backgroundColor: '#e3f2fd',
    height: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1976d2',
    letterSpacing: 0.1,
  },
  descriptionSection: {
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#263238',
    fontWeight: '500',
  },
  resultsSection: {
    marginBottom: 12,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#e3f2fd',
  },
  resultKey: {
    fontSize: 16,
    color: '#1976d2',
    fontWeight: 'bold',
  },
  resultValue: {
    alignItems: 'flex-end',
  },
  valueText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#263238',
  },
  normalRange: {
    fontSize: 12,
    color: '#607d8b',
    fontWeight: '500',
  },
  followUpSection: {
    marginBottom: 12,
  },
  followUpCard: {
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#e3f2fd',
    borderWidth: 1,
    borderColor: '#bbdefb',
  },
  followUpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  followUpDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  followUpInstructions: {
    fontSize: 14,
    color: '#263238',
    lineHeight: 20,
    fontWeight: '500',
  },
  attachmentsSection: {
    marginBottom: 12,
  },
  attachmentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f7fbff',
    borderWidth: 1,
    borderColor: '#e3f2fd',
  },
  attachmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  attachmentName: {
    fontSize: 16,
    color: '#1976d2',
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e3f2fd',
    backgroundColor: '#f7fbff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 8,
    elevation: 0,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#bdbdbd',
    marginTop: 10,
    fontWeight: '500',
  },
  listTitle: {
    color: '#1976d2',
    fontWeight: 'bold',
    fontSize: 15,
  },
  listDescription: {
    color: '#263238',
    fontWeight: '500',
    fontSize: 15,
  },
}); 