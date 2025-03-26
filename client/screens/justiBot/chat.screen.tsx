import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator, // Import ActivityIndicator for loading spinner
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import Icon from "react-native-vector-icons/MaterialCommunityIcons"; // Importing the icon library
import { DIALOGUEFLOW_URI } from "@/utils/uri";
import { Audio } from "expo-av";
import { recordSpeech } from "@/functions/recordSpeech";
import { transcribeSpeech } from "@/functions/transcribeSpeech";
import { Toast } from "react-native-toast-notifications";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false); // Track loading state
  const audioRecordingRef = useRef<Audio.Recording>(new Audio.Recording());
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [transcribedSpeech, setTranscribedSpeech] = useState<string>("");

  // Load initial messages (optional)
  useEffect(() => {
    const initialMessages: Message[] = [
      {
        id: 1,
        text: "Hello! How can I assist you today?",
        sender: "bot",
      },
    ];
    setMessages(initialMessages);
  }, []);

  const playBase64Audio = async (base64Audio: string) => {
    try {
      const soundObject = new Audio.Sound();
      await soundObject.loadAsync(
        { uri: `data:audio/mp3;base64,${base64Audio}` },
        { shouldPlay: true }
      );
      setSound(soundObject);
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  };

  // Minimum recording duration (in milliseconds)
  const MINIMUM_RECORDING_DURATION = 1000;

  // Define the startRecording function
  const startRecording = async (): Promise<void> => {
    setIsRecording(true);
    try {
      await recordSpeech(audioRecordingRef);
    } catch (error) {
      console.error("Error starting recording:", error);
      Toast.show("Error starting recording", { type: "danger" });
      setIsRecording(false);
    }
  };

  // Define the stopRecording function
  const stopRecording = async (): Promise<void> => {
    setIsRecording(false);

    try {
      // Check if the audioRecordingRef exists and has a valid duration
      if (!audioRecordingRef.current || !audioRecordingRef.current.getStatusAsync().then(status => status.durationMillis)) {
        Toast.show("No audio recording found", { type: "danger" });
        return;
      }

      // Ensure the recording duration is sufficient
      const status = await audioRecordingRef.current.getStatusAsync();
      if (status.durationMillis < MINIMUM_RECORDING_DURATION) {
        Toast.show("Recording is too short. Please record at least 1 second.", {
          type: "danger",
        });
        return;
      }

      // Transcribe the recorded speech
      const speechTranscript: string | null = await transcribeSpeech(
        audioRecordingRef
      );
      if (!speechTranscript) {
        Toast.show("Unable to transcribe speech. Please try again.", {
          type: "danger",
        });
        return;
      }

      setTranscribedSpeech(speechTranscript);

      // Send the transcribed speech to the backend
      const responseText: string | null = await sendMessageToBackend(
        speechTranscript
      );
      if (!responseText) {
        Toast.show("No response from backend. Please try again.", {
          type: "danger",
        });
        return;
      }

      // Request to play the backend's response text
      const response = await axios.post<{ audioContent: string }>(
        `${DIALOGUEFLOW_URI}/play-text`,
        {
          text: responseText,
        }
      );
      const { audioContent } = response.data;

      // Check if audio content was received
      if (!audioContent) {
        Toast.show("No audio content received from the backend.", {
          type: "danger",
        });
        return;
      }

      // Play the audio content
      await playBase64Audio(audioContent);
    } catch (error: unknown) {
      // Handle different error scenarios
      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error("Error from backend:", error.response.data);
          Toast.show(`Error from server: ${error.response.data.message}`, {
            type: "danger",
          });
        } else if (error.request) {
          console.error("No response from server:", error.request);
          Toast.show("Server not responding. Please check your connection.", {
            type: "danger",
          });
        }
      } else if (error instanceof Error) {
        // Handle any non-axios errors
        console.error("Error during processing:", error.message);
        Toast.show("Something went wrong. Please try again.", {
          type: "danger",
        });
      } else {
        console.error("Unknown error occurred:", error);
        Toast.show("An unknown error occurred. Please try again.", {
          type: "danger",
        });
      }
    } finally {
      setIsRecording(false);
    }
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() === "") return;

    const userMessage: Message = {
      id: Date.now(), // Use Date.now() for unique ID
      text: inputMessage,
      sender: "user",
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputMessage("");

    setLoading(true); // Start loading when sending a message

    // Send message to your backend
    await sendMessageToBackend(inputMessage);
  };

  const sendMessageToBackend = async (message: string) => {
    try {
      const response = await axios.post(`${DIALOGUEFLOW_URI}/getdialogflow`, {
        text: message,
      });

      const botResponse = response.data.response; // Adjust according to your backend's response structure

      // Add bot response to messages
      const botMessage: Message = {
        id: Date.now() + 1, // Use a unique value for bot message as well
        text: botResponse,
        sender: "bot",
      };

      setMessages((prevMessages) => [...prevMessages, botMessage]);
      return botResponse;
    } catch (error) {
      console.error("Error sending message to backend:", error);
    } finally {
      setLoading(false); // Stop loading after message is sent
    }
  };

  return (
    <LinearGradient
      colors={["#FFEBEE", "#FFCCBC"]} // Light orange gradient
      style={{ flex: 1, paddingTop: 50 }}
    >
      <ScrollView contentContainerStyle={styles.scrollView}>
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageContainer,
              message.sender === "user"
                ? styles.userMessage
                : styles.botMessage,
            ]}
          >
            <Text style={styles.messageText}>{message.text}</Text>
          </View>
        ))}
        {/* Loading Indicator */}
        {loading && (
          <View style={styles.messageContainer}>
            <ActivityIndicator size="small" color="#FFA726" />
            <Text style={styles.messageText}>Bot is typing...</Text>
          </View>
        )}
      </ScrollView>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputMessage}
            onChangeText={setInputMessage}
            placeholder="Type a message..."
            onSubmitEditing={handleSendMessage}
          />
          {/* Send Button */}
          <TouchableOpacity
            onPress={handleSendMessage}
            style={styles.sendButton} // Disable send button when loading
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
          {/* Microphone Button */}
          <TouchableOpacity
            onPressIn={startRecording}
            onPressOut={stopRecording}
            disabled={isRecording}
            style={styles.micButton}
          >
            {isRecording ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Icon name="microphone" size={24} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 1,
    padding: 10,
  },
  messageContainer: {
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
    maxWidth: "80%",
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#FFA726", // Orange color for user messages
  },
  botMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#FFE0B2", // Light orange for bot messages
  },
  messageText: {
    color: "#000", // Black text for better contrast
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#FFA726", // Border color matching the user message
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#FFA726", // Orange border for the input
    borderRadius: 20,
    padding: 10,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: "red", // Red send button
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  sendButtonText: {
    color: "#fff", // White text on send button
    fontWeight: "bold",
  },
  micButton: {
    backgroundColor: "red", // Orange mic button
    borderRadius: 20,
    padding: 10,
    marginLeft: 10,
  },
});
