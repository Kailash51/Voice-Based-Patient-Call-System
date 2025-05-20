/**
 * NurseNavigator.tsx
 * Defines the navigation stack for the nurse section of the application.
 * Uses React Navigation's Stack Navigator to manage screen transitions and routing.
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NurseDashboard } from '@/screens/nurse/NurseDashboard';
import { ActiveRequestsScreen } from '@/screens/nurse/ActiveRequestsScreen';
import { CompletedTaskScreen } from '@/screens/nurse/CompletedTaskScreen';
import { MyPatientsScreen } from '@/screens/nurse/MyPatientsScreen';
import { ScheduleScreen } from '@/screens/nurse/ScheduleScreen';
import { NurseProfileScreen } from '@/screens/nurse/NurseProfileScreen';
import { NavigationBar } from '@/components/NavigationBar';
import { ReferenceScreen } from '@/screens/nurse/ReferenceScreen';
import { DoctorConnectScreen } from '@/screens/nurse/DoctorConnectScreen';

// Initialize stack navigator
const Stack = createStackNavigator();

/**
 * Default screen configuration applied to all screens in the nurse navigation stack
 * - Uses custom NavigationBar component as the header
 * - Sets white background color for all screens
 */
const defaultScreenOptions = {
  header: () => <NavigationBar />,
  cardStyle: { backgroundColor: '#fff' },
};

/**
 * NurseNavigator Component
 * Defines the navigation structure for nurse-specific screens
 * Includes routes for:
 * - Dashboard (main nurse view)
 * - Active patient requests
 * - Completed tasks history
 * - Patient list management
 * - Work schedule view
 * - Nurse profile settings
 */
export const NurseNavigator = () => {
  return (
    <Stack.Navigator screenOptions={defaultScreenOptions}>
      <Stack.Screen 
        name="NurseDashboard" 
        component={NurseDashboard}
      />
      <Stack.Screen 
        name="ActiveRequests" 
        component={ActiveRequestsScreen}
      />
      <Stack.Screen 
        name="CompletedTasks" 
        component={CompletedTaskScreen}
      />
      <Stack.Screen 
        name="MyPatients" 
        component={MyPatientsScreen}
      />
      <Stack.Screen 
        name="Schedule" 
        component={ScheduleScreen}
      />
      <Stack.Screen 
        name="NurseProfile" 
        component={NurseProfileScreen}
      />
      <Stack.Screen 
        name="Reference" 
        component={ReferenceScreen}
        options={{
          title: 'Reference Book',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="DoctorConnect"
        component={DoctorConnectScreen}
        options={{
          title: 'Connect Doctors',
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
};

export default NurseNavigator;