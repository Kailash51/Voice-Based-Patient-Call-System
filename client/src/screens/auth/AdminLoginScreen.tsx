/**
 * AdminLoginScreen.tsx
 * Screen component for administrator authentication.
 * Provides login form with user ID and password inputs.
 * Uses AuthContext for authentication state management.
 */

import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import type { NavigationProp } from '@/types/navigation';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const AdminLoginScreen = () => {
  // Navigation hook for screen transitions
  const navigation = useNavigation<NavigationProp>();
  
  // State management for form inputs
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Auth context hook for login functionality
  const { login } = useAuth();

  /**
   * Handles the login submission
   * Attempts to authenticate using provided credentials
   * Logs any errors to console
   */
  const handleLogin = async () => {
    try {
      await login(userId, password);
    } catch (error) {
      // Handle error (show error message)
      console.error(error);
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <View style={styles.container}>
      {/* Admin logo/avatar image */}
      <Image 
        source={require('@assets/admin.png')}
        style={styles.image}
      />
      
      {/* Screen title */}
      <Text style={styles.heading}>Login</Text>
      
      {/* User ID input field */}
      <TextInput
        style={styles.input}
        placeholder="User ID"
        value={userId}
        onChangeText={setUserId}
        autoCapitalize="none"
      />
      
      {/* Password input field with secure entry */}
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity 
          style={styles.eyeIcon}
          onPress={togglePasswordVisibility}
          activeOpacity={0.7}
        >
          <Icon 
            name={showPassword ? 'eye' : 'eye-off'} 
            size={24} 
            color="#666"
          />
        </TouchableOpacity>
      </View>
      
      {/* Login submission button */}
      <TouchableOpacity 
        style={styles.loginButton}
        onPress={handleLogin}
      >
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
};

// Styles for the AdminLoginScreen component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  image: {
    width: 120,
    height: 120,
    marginBottom: 30,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  passwordContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 15,
  },
  eyeIcon: {
    padding: 10,
  },
  loginButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#4c669f',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 