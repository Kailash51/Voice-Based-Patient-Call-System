import React from 'react';
import { View, StyleSheet, FlatList, Linking } from 'react-native';
import { Card, Title, Paragraph, IconButton, useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';

// Doctor data type
type Doctor = {
  id: string;
  name: string;
  specialization: string;
  phoneNumber: string;
  hospital: string;
};

// Sample doctor data
const doctors: Doctor[] = [
  {
    id: '1',
    name: 'Dr. S.K. Kathariya',
    specialization: 'Dentistry',
    phoneNumber: '9198329925',
    hospital: 'S.N Medical College'
  },
  {
    id: '2',
    name: 'Dr. Richa Singh',
    specialization: 'Gynecology',
    phoneNumber: '9669606235',
    hospital: 'S.N Medical College'
  },
  
  {
    id: '3',
    name: 'Dr. R.K. Patel',
    specialization: 'Cardiology',
    phoneNumber: '9411651776',
    hospital: 'S.N Medical College'
  },
];

export const DoctorConnectScreen = () => {
  const theme = useTheme();

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleSMS = (phoneNumber: string) => {
    Linking.openURL(`sms:${phoneNumber}`);
  };

  const handleWhatsApp = (phoneNumber: string) => {
    Linking.openURL(`whatsapp://send?phone=${phoneNumber}`);
  };

  const renderDoctorCard = ({ item }: { item: Doctor }) => (
    <Card style={styles.card}>
      <LinearGradient
        colors={['#2C6EAB', '#4c669f']}
        style={styles.cardHeader}
      >
        <Title style={styles.cardTitle}>{item.name}</Title>
      </LinearGradient>
      <Card.Content style={styles.cardContent}>
        <Paragraph style={styles.specialization}>
          {item.specialization}
        </Paragraph>
        <Paragraph style={styles.hospital}>
          {item.hospital}
        </Paragraph>
        <View style={styles.buttonContainer}>
          <IconButton
            icon="message"
            size={28}
            onPress={() => handleSMS(item.phoneNumber)}
            style={styles.actionButton}
            iconColor={theme.colors.primary}
          />
          <IconButton
            icon="whatsapp"
            size={28}
            onPress={() => handleWhatsApp(item.phoneNumber)}
            style={styles.actionButton}
            iconColor="#25D366"
          />
          <IconButton
            icon="phone"
            size={28}
            onPress={() => handleCall(item.phoneNumber)}
            style={styles.actionButton}
            iconColor={theme.colors.primary}
          />
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={doctors}
        renderItem={renderDoctorCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
  },
  cardHeader: {
    padding: 16,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  cardContent: {
    padding: 16,
  },
  specialization: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  hospital: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    marginLeft: 0,
  },
  listContainer: {
    paddingBottom: 16,
  },
});
