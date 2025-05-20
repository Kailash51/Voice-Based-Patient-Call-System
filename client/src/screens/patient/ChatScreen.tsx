import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import axios from "axios";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { useAuth } from '../../contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { debounce } from 'lodash';
import { API_KEY } from '../../config';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'assistant';
}

const ChatScreen: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'Hello! How can I assist you today?',
      sender: 'assistant',
    }
  ]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access microphone is required!');
      }
    })();
  }, []);

  const startRecording = async () => {
    try {
      setIsRecording(true);
      const { recording } = await Audio.Recording.createAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      setRecording(recording);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    if (recording) {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      console.log('Recording stopped and stored at', uri);
    }
  };

  const readAloud = (text: string) => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    } else {
      Speech.speak(text, {
        onDone: () => setIsSpeaking(false)
      });
        setIsSpeaking(true);
    }
  };

  const debouncedSend = useCallback(
    debounce(async (input: string) => {
      if (input.trim()) {
        setIsLoading(true);
        try {
          const response = await axios.post(
            `{API_KEY}`,
            {
              contents: [{ parts: [{ text: input }] }]
            }
          );

          const modelResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
          
          if (modelResponse) {
            setMessages(prev => [
              ...prev,
              {
                id: Date.now() + 1,
                text: modelResponse,
                sender: 'assistant',
              },
            ]);
            readAloud(modelResponse);
          }
        } catch (error) {
          console.error('Error:', error);
          setMessages(prev => [
            ...prev,
            {
              id: Date.now() + 1,
              text: 'Sorry, there was an error while fetching the response.',
              sender: 'assistant',
            },
          ]);
        } finally {
          setIsLoading(false);
        }
      }
    }, 1000),
    []
  );

  const handleSend = () => {
    if (!message.trim()) return;
    
    setMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        text: message,
        sender: 'user',
      },
    ]);
    
    debouncedSend(message);
    setMessage('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient
        colors={['#2C6EAB', '#3b5998', '#192f6a']}
        style={styles.header}
      >
        <Text style={styles.headerText}>Medical Assistant</Text>
      </LinearGradient>

      <ScrollView style={styles.messagesContainer}>
        {messages.map(msg => (
          <View
            key={msg.id}
            style={[
              styles.messageWrapper,
              msg.sender === 'user' ? styles.userMessage : styles.assistantMessage,
            ]}
          >
            <Text style={[
              styles.messageText,
              msg.sender === 'user' ? styles.userMessageText : styles.assistantMessageText
            ]}>
              {msg.text}
            </Text>
            {msg.sender === 'assistant' && (
              <TouchableOpacity 
                style={styles.speakerButton}
                onPress={() => readAloud(msg.text)}
              >
                <Icon name={isSpeaking ? "volume-off" : "volume-up"} size={20} color="#4c669f" />
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Type your message..."
          placeholderTextColor="#aaa"
          multiline
        />
       
        <TouchableOpacity
          style={[styles.speechButton, { marginRight: 10 }]}
          onPress={isRecording ? stopRecording : startRecording}
        >
          <Icon name={isRecording ? "stop" : "mic"} size={20} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSend}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Icon name="send" size={24} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  messagesContainer: {
    flex: 1,
    padding: 15,
  },
  messageWrapper: {
    maxWidth: '80%',
    marginVertical: 5,
    padding: 10,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#4c669f',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
  },
  messageText: {
    fontSize: 16,
    flex: 1,
  },
  userMessageText: {
    color: '#fff',
  },
  assistantMessageText: {
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    maxHeight: 100,
    color: '#333',
  },
  sendButton: {
    backgroundColor: '#4c669f',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  speechButton: {
    backgroundColor: '#4c669f',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  speakerButton: {
    marginLeft: 8,
  },
});

export default ChatScreen;