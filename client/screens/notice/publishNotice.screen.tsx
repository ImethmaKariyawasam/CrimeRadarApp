import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import MapView, { Marker } from "react-native-maps";
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "./firebaseConfig"; // Make sure this path is correct
import { NOTICE_SERVER_URI } from "@/utils/uri"; // Make sure this path is correct
import DateTimePickerModal from "react-native-modal-datetime-picker";
import useUser from "@/hooks/useUser";
import { Toast } from "react-native-toast-notifications";
import Icon from "react-native-vector-icons/FontAwesome"; // Import icons
import Modal from "react-native-modal"; // Import the Modal component
import { LogBox } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { router } from "expo-router";

LogBox.ignoreLogs(["VirtualizedLists"]);
export default function PublishNotice() {
  const { user } = useUser();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [description, setDescription] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [eyeColor, setEyeColor] = useState("");
  const [hairColor, setHairColor] = useState("");
  const [distinctiveMarks, setDistinctiveMarks] = useState("");
  const [location, setLocation] = useState<{
    type: string;
    coordinates: number[];
  } | null>(null);
  const [buttonSpinner, setButtonSpinner] = useState(false);
  const [imageUri, setImageUri] = useState("");
  const [missingDate, setMissingDate] = useState<Date | null>(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isLocationModalVisible, setLocationModalVisible] = useState(false);
  const handleDateConfirm = (date: Date) => {
    setMissingDate(date);
    setDatePickerVisibility(false);
  };

  const validateInputs = () => {
    if (
      !name ||
      !age ||
      !description ||
      !height ||
      !weight ||
      !eyeColor ||
      !hairColor ||
      !distinctiveMarks ||
      !location
    ) {
      Toast.show("Please fill all required fields", { type: "danger" });
      return false;
    }
    if (!imageUri) {
      Toast.show("Please pick an image", { type: "danger" });
      return false;
    }
    if (!missingDate) {
      Toast.show("Please select the missing date", { type: "danger" });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateInputs()) return;

    setButtonSpinner(true);
    let imageUrl = "";

    if (imageUri) {
      try {
        // Convert the image to a blob
        const response = await fetch(imageUri);
        const blob = await response.blob();

        // Create a reference to the storage location
        const storageRef = ref(storage, `images/${Date.now()}`);

        // Upload the image
        const uploadTask = uploadBytesResumable(storageRef, blob);

        // Wait for the upload to complete
        await new Promise<void>((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            null,
            (error) => {
              console.error("Error uploading image:", error);
              reject(error);
            },
            async () => {
              // Get the download URL after the upload completes
              imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve();
            }
          );
        });
      } catch (error) {
        console.error("Image upload failed:", error);
        Toast.show("Image upload failed", { type: "danger" });
        setButtonSpinner(false);
        return;
      }
    }

    // Create the notice data
    const noticeData = {
      userId: user?._id,
      type: "Missing",
      name,
      age,
      description,
      height,
      weight,
      eye_color: eyeColor,
      hair_color: hairColor,
      distinctive_marks: distinctiveMarks,
      location,
      imageUrl, // Add the image URL to your data
      missingdate: missingDate?.toISOString(), // Add the missing date to your data
    };

    // Send the notice data
    try {
      const response = await axios.post(
        `${NOTICE_SERVER_URI}/publishNotice`,
        noticeData
      );
      Toast.show("Notice published successfully", { type: "success" });
    } catch (error) {
      console.error("Error publishing notice:", error);
      Toast.show("Error publishing notice", { type: "danger" });
    } finally {
      setButtonSpinner(false);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  return (
    <LinearGradient colors={["#E5ECF9", "#F6F7F9"]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <AntDesign name="arrowleft" size={24} color="black" />
        </TouchableOpacity>
        <Text style={[styles.welcomeText, { fontFamily: "Raleway_700Bold" }]}>
          Publish Search Notice
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Age"
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
        />
        <TextInput
          style={styles.input}
          placeholder="Height (cm)"
          value={height}
          onChangeText={setHeight}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Weight (kg)"
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Eye Color"
          value={eyeColor}
          onChangeText={setEyeColor}
        />
        <TextInput
          style={styles.input}
          placeholder="Hair Color"
          value={hairColor}
          onChangeText={setHairColor}
        />
        <TextInput
          style={styles.input}
          placeholder="Distinctive Marks"
          value={distinctiveMarks}
          onChangeText={setDistinctiveMarks}
        />
        <View>
          <GooglePlacesAutocomplete
            placeholder="Search for a location"
            onPress={(data, details) => {
              if (details) {
                const { lat, lng } = details.geometry.location;
                setLocation({
                  type: "Point",
                  coordinates: [lng, lat],
                });
              }
            }}
            query={{
              key: "AIzaSyCms2-r4afPJIKiStBZUNuRx_4BdU2p9ps",
              language: "en",
              components: "country:LK", // Restrict results to Sri Lanka
            }}
            styles={{
              container: { flex: 1, zIndex: 2 },
              textInputContainer: {
                borderWidth: 1,
                borderColor: "#ccc",
                zIndex: 2,
              },
              textInput: { height: 40, paddingHorizontal: 10 },
            }}
            fetchDetails={true}
          />
        </View>

        {/* Button to open location modal */}
        <TouchableOpacity
          onPress={() => setLocationModalVisible(true)}
          style={styles.datePicker}
        >
          <Icon name="map-marker" size={20} color="white" />
          <Text style={styles.buttonText}>
            {location ? "Location Selected" : "Select Location"}
          </Text>
        </TouchableOpacity>

        {/* Image Picker */}
        <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
          <Icon name="image" size={20} color="white" />
          <Text style={styles.buttonText}>Pick an image</Text>
        </TouchableOpacity>

        {/* Display the selected image */}
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : null}

        {/* Date Picker */}
        <TouchableOpacity
          onPress={() => setDatePickerVisibility(true)}
          style={styles.datePicker}
        >
          <Icon name="calendar" size={20} color="white" />
          <Text style={styles.buttonText}>
            {missingDate
              ? `Missing Date: ${missingDate.toDateString()}`
              : "Select Missing Date"}
          </Text>
        </TouchableOpacity>
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleDateConfirm}
          onCancel={() => setDatePickerVisibility(false)}
        />

        <TouchableOpacity
          style={styles.updateButton}
          onPress={handleSubmit}
          disabled={buttonSpinner}
        >
          {buttonSpinner ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.buttonText}>Publish Notice</Text>
          )}
        </TouchableOpacity>
        {/* Location Modal */}
        <Modal isVisible={isLocationModalVisible} style={styles.modal}>
          <View style={styles.modalContent}>
            {/* Display selected location on map */}
            {location && (
              <MapView
                style={styles.map}
                region={{
                  latitude: location.coordinates[1],
                  longitude: location.coordinates[0],
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
              >
                <Marker
                  coordinate={{
                    latitude: location.coordinates[1],
                    longitude: location.coordinates[0],
                  }}
                  title="Selected Location"
                />
              </MapView>
            )}
            <TouchableOpacity
              onPress={() => setLocationModalVisible(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: "#f9fafc",
    flexGrow: 1,
  },
  welcomeText: {
    fontSize: 24,
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    height: 55,
    marginBottom: 20,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: "white",
    color: "#555",
    borderColor: "#d1d5db",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  updateButton: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#ff4d4d",
    marginTop: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  imagePicker: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#007BFF",
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  datePicker: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#28a745",
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  map: {
    width: "100%",
    height: 250,
    marginVertical: 20,
    borderRadius: 12,
    borderColor: "#ccc",
    borderWidth: 1,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginVertical: 20,
    borderColor: "#d1d5db",
    borderWidth: 1,
  },
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    height: "60%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  closeButton: {
    padding: 12,
    backgroundColor: "#f44336",
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  closeButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 10,
  },
});
