/**
 * CompletedTaskScreen.tsx
 * Screen component for nurses to view completed patient requests.
 * Features real-time updates via socket connection and pull-to-refresh functionality.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Text,
  Button,
} from 'react-native-paper';
import { requestService } from '@/services/api/requestService';
import Toast from 'react-native-toast-message';
import { RequestResponse } from '@/types/api';
import { socket } from '@/services/socketService';
import { useFocusEffect } from '@react-navigation/native';

export const CompletedTaskScreen = () => {
  const [completedRequests, setCompletedRequests] = useState<RequestResponse[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCompletedRequests = async () => {
    try {
      const response = await requestService.getRequests();
      const completed = response.data.requests.filter(
        (req: RequestResponse) => req.status === 'completed'
      );
      // Sort by completion time, most recent first
      const sortedCompleted = completed.sort((a: RequestResponse, b: RequestResponse) => 
        new Date(b.completedAt || b.createdAt).getTime() - 
        new Date(a.completedAt || a.createdAt).getTime()
      );
      setCompletedRequests(sortedCompleted);
    } catch (error) {
      console.error('Error fetching completed requests:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to fetch completed requests',
        position: 'top',
        topOffset: 60,
      });
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchCompletedRequests().finally(() => setRefreshing(false));
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchCompletedRequests();

      const handleRequestCompleted = (request: RequestResponse) => {
        if (request.status === 'completed') {
          setCompletedRequests(prev => {
            // Check if request already exists
            const exists = prev.some(req => req._id === request._id);
            if (!exists) {
              return [request, ...prev];
            }
            return prev;
          });
        }
      };

      socket.on('requestCompleted', handleRequestCompleted);
      socket.on('request_status_updated', handleRequestCompleted);

      return () => {
        socket.off('requestCompleted', handleRequestCompleted);
        socket.off('request_status_updated', handleRequestCompleted);
      };
    }, [])
  );

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {completedRequests.length === 0 ? (
          <Text style={styles.emptyText}>No completed requests</Text>
        ) : (
          completedRequests.map((request) => (
            <Card key={request._id} style={styles.card}>
              <Card.Content>
                <View style={styles.headerRow}>
                  <Title>{request.fullName}</Title>
                  <Text style={styles.completedBadge}>Completed</Text>
                </View>
                <Paragraph>Room: {request.roomNumber}</Paragraph>
                <Paragraph>Disease: {request.disease}</Paragraph>
                <Paragraph>Description: {request.description}</Paragraph>
                <Text style={styles.completionTime}>
                  Completed at: {new Date(request.completedAt || request.createdAt).toLocaleString()}
                </Text>
              </Card.Content>
              <Card.Actions>
                <Button mode="contained" disabled>
                  Completed
                </Button>
              </Card.Actions>
            </Card>
          ))
        )}
      </ScrollView>
      <Toast position="top" topOffset={60} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  card: {
    marginBottom: 16,
    elevation: 4,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  completedBadge: {
    backgroundColor: '#4CAF50',
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: 'hidden',
  },
  completionTime: {
    marginTop: 8,
    color: '#666',
    fontSize: 12,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
});
