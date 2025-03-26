import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  Button,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import MapView, { Marker } from "react-native-maps";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { getDownloadURL, ref } from "firebase/storage";
import { storage } from "./firebaseConfig";
import { useRouter } from "expo-router";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { Toast } from "react-native-toast-notifications";
import axios, { AxiosHeaders } from "axios";
import useUser from "@/hooks/useUser";
import { REPORT_URI } from "@/utils/uri";
import { AntDesign } from "@expo/vector-icons";
// Define color mappings for danger level and type
const dangerLevelColors: Record<string, string> = {
  Low: "#3C9D3C", // Green
  Medium: "#F4B400", // Yellow
  High: "#D9534F", // Red
  Critical: "#C71585", // Dark Red/Purple
};

const typeColors: Record<string, string> = {
  Criminal: "#FF5733", // Orange
  Missing: "#33C1FF", // Light Blue
};

export default function NoticeDetail() {
  const router = useRouter();
  const { item } = useLocalSearchParams();
  const { imageUrl } = useLocalSearchParams();
  const notice = typeof item === "string" ? JSON.parse(item) : item;
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
  const [noOfReports, setNoOfReports] = useState(0);
  const [location, setLocation] = useState<{
    type: string;
    coordinates: number[];
  } | null>(null);
  const [description, setDescription] = useState("");
  // Get color based on dangerLevel and type
  const dangerColor = dangerLevelColors[notice.dangerLevel] || "#808080"; // Default to grey if not found
  const typeColor = typeColors[notice.type] || "#808080"; // Default to grey if not found
  const handleReportSubmit = () => {
    // Send report to server
    if (noOfReports >= 10) {
      Toast.show("You can only submit 10 reports per day", { type: "danger" });
      setModalVisible(false);
      setLocation(null);
      setDescription("");
      return;
    }
    if (!location && !description) {
      Toast.show("Please enter a location and description", { type: "danger" });
      return;
    }
    setIsLoading(true);
    axios
      .post(`${REPORT_URI}/createReport`, {
        userId: user?._id, // Replace with actual user ID
        noticeId: notice._id,
        location,
        description,
      })
      .then(() => {
        Toast.show("Report submitted successfully", { type: "success" });
        setModalVisible(false);
        setLocation(null);
        setDescription("");
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
        Toast.show("Failed to submit report", { type: "danger" });
      });
  };

  interface Location {
    type: string;
    coordinates: number[];
  }

  const formatDate = (date: string | null): string => {
    if (!date) return "Not available";
    const parsedDate = new Date(date);
    return parsedDate.toLocaleDateString('en-US'); // Adjust 'en-US' for different formats if needed
  };
  useEffect(() => {
    const fetchNoOfNotices = async () => {
      try {
        const res = await axios.get(
          `${REPORT_URI}/noOfReports/${user?._id}`,
          {}
        );
        setNoOfReports(res.data.reportsToday);
      } catch (error) {
        console.log("Failed to get number of reports");
      }
    };
    fetchNoOfNotices();
  }, [user?._id]);
  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        {notice.image && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: imageUrl || notice.image }}
              style={styles.image}
            />
            {notice.type === "Criminal" && notice.dangerLevel && (
              <View style={[styles.badge, { backgroundColor: dangerColor }]}>
                <Text style={styles.badgeText}>{notice.dangerLevel}</Text>
              </View>
            )}
            <View style={[styles.typeBadge, { backgroundColor: typeColor }]}>
              <Text style={styles.typeBadgeText}>{notice.type}</Text>
            </View>
          </View>
        )}
        <Text style={styles.title}>{notice.name}</Text>
        <Text style={styles.description}>{notice.description}</Text>

        <View style={styles.table}>
          <View style={styles.row}>
            <Text style={styles.cell}>Date:</Text>
            <Text style={styles.cellValue}>
              {formatDate(notice.missingDate)}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.cell}>Height:</Text>
            <Text style={styles.cellValue}>{notice.height} cm</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.cell}>Weight:</Text>
            <Text style={styles.cellValue}>{notice.weight} kg</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.cell}>Age:</Text>
            <Text style={styles.cellValue}>{notice.age}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.cell}>Eye Color:</Text>
            <Text style={styles.cellValue}>{notice.eye_color}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.cell}>Hair Color:</Text>
            <Text style={styles.cellValue}>{notice.hair_color}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.cell}>Distinctive Marks:</Text>
            <Text style={styles.cellValue}>{notice.distinctive_marks}</Text>
          </View>
          {notice.type === "Criminal" && (
            <>
              <View style={styles.row}>
                <Text style={styles.cell}>Alias:</Text>
                <Text style={styles.cellValue}>{notice.alias.join(", ")}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.cell}>Danger Level:</Text>
                <Text style={[styles.cellValue, { color: dangerColor }]}>
                  {notice.dangerLevel}
                </Text>
              </View>
            </>
          )}
          {notice.dangerLevel === "Medium" && notice.type == "Criminal" && (
            <View style={styles.row}>
              <Text style={styles.cell}>Warning:</Text>
              <Text style={[styles.cellValue, { color: dangerColor }]}>
                Approach with Caution
              </Text>
            </View>
          )}
          {notice.dangerLevel === "Low" && notice.type == "Criminal" && (
            <View style={styles.row}>
              <Text style={styles.cell}>Warning:</Text>
              <Text style={[styles.cellValue, { color: dangerColor }]}>
                No Immediate Threat
              </Text>
            </View>
          )}
          {notice.dangerLevel === "Critical" && notice.type == "Criminal" && (
            <View style={styles.row}>
              <Text style={styles.cell}>Warning:</Text>
              <Text style={[styles.cellValue, { color: dangerColor }]}>
                Do Not Approach. Alert Authorities Immediately
              </Text>
            </View>
          )}
          {notice.dangerLevel === "High" && notice.type == "Criminal" && (
            <View style={styles.row}>
              <Text style={styles.cell}>Warning:</Text>
              <Text style={[styles.cellValue, { color: dangerColor }]}>
                Armed and Dangerous
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.title1}>Last Seen Location</Text>
        <View style={styles.mapContainer}>
          {notice.location && (
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: notice.location.coordinates[1],
                longitude: notice.location.coordinates[0],
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
            >
              <Marker
                coordinate={{
                  latitude: notice.location.coordinates[1],
                  longitude: notice.location.coordinates[0],
                }}
                title={notice.name}
                description={notice.description}
              />
            </MapView>
          )}
        </View>
        <View style={styles.modalContainer1}>
          {/* Report Button */}
          <Button
            title="Report"
            onPress={() => setModalVisible(true)}
            color="#FF5733"
          />

          {/* Modal for Reporting */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Submit Report</Text>
                <GooglePlacesAutocomplete
                  placeholder="Search for a location"
                  isRowScrollable
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
                    },
                    textInput: { height: 40, paddingHorizontal: 10 },
                  }}
                  fetchDetails={true}
                />

                {/* Display selected location on map */}
                {location && (
                  <MapView
                    style={styles.map1}
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

                <TextInput
                  style={styles.input}
                  placeholder="Enter description"
                  value={description}
                  onChangeText={setDescription}
                />

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleReportSubmit}
                    disabled={isLoading} // Disable button when loading
                  >
                    <Text style={styles.submitButtonText}>
                      {isLoading ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        "Submit"
                      )}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setModalVisible(false),
                        setLocation(null),
                        setDescription("");
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: wp(50),
    marginTop: 16,
    marginBottom: 16,
  },
  modalContainer1: {
    marginTop: 20,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
    resizeMode: "cover",
  },
  badge: {
    position: "absolute",
    bottom: 10,
    left: 10,
    padding: 4,
    borderRadius: 5,
    width: 100,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  typeBadge: {
    position: "absolute",
    bottom: 10,
    right: 10,
    padding: 4,
    borderRadius: 5,
    width: 100,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  typeBadgeText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  title1: {
    fontSize: 20,
    marginTop: 10,
    fontWeight: "bold",
  },
  description: {
    fontSize: 16,
    marginBottom: 16,
  },
  table: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    padding: 8,
  },
  cell: {
    flex: 1,
    fontWeight: "bold",
    color: "#333",
  },
  cellValue: {
    flex: 2,
    fontSize: 16,
    color: "#666",
  },
  mapContainer: {
    height: wp(70),
    marginTop: 20,
    borderRadius: 8,
    overflow: "hidden",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
  },
  modalContainer: {
    width: "90%",
    height: "90%",
    padding: 20,
    backgroundColor: "#fff", // White background for the modal
    borderRadius: 10,
    elevation: 10, // Shadow for Android
    shadowColor: "#000", // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center", // Center title
    color: "#333", // Darker text color
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
    color: "#333", // Darker text color
    backgroundColor: "#f9f9f9", // Light background for input
  },
  map1: {
    height: "60%",
    width: "100%",
    borderRadius: 10,
    marginBottom: 35,
    borderColor: "#ccc", // Add border to the map view
    borderWidth: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  submitButton: {
    flex: 1,
    backgroundColor: "#e80940", // Red button
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: "center",
    marginRight: 10,
  },
  submitButtonText: {
    color: "#fff", // White text
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#ccc", // Grey button
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#333", // Darker text color
    fontSize: 16,
    fontWeight: "bold",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 10,
  },
});
