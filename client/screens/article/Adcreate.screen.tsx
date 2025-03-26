import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import axios from "axios";
import HomeBannerSlider from '@/components/home/home.banner.slider';
import AllNotices from '@/components/Notices/all.notices';
import Header from '@/components/button/header/header';
import {SERVER_IP, SERVER_PORT} from '@/api';


type FormData = {
  title: string;
  description: string;
  category: string;
  targetAudience: string;
  startDate: Date;
  endDate: Date;
  pricingInformation: string;
  currency: string;
  agreeTerms: boolean;
  image: ImagePicker.ImagePickerAsset | null;
  pdf: DocumentPicker.DocumentPickerResult | null;
  email: string;
};

const AdvertisementCreateScreen: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    category: "",
    targetAudience: "",
    startDate: new Date(),
    endDate: new Date(),
    pricingInformation: "",
    currency: "USD",
    agreeTerms: false,
    image: null,
    pdf: null,
    email: "",
  });

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<FormData | null>(
    null
  );

  const handleInputChange = (name: string, value: any) => {
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const categories = ["Workshop", "Emergency Product", "Seminar", "Others"];
  const currencies = [" RS", "USD", "EUR"];

  const openDatePicker = (dateType: "startDate" | "endDate") => {
    if (dateType === "startDate") {
      setShowStartDatePicker(true);
    } else {
      setShowEndDatePicker(true);
    }
  };

  const onDateChange = (
    event: any,
    selectedDate: Date | undefined,
    dateType: "startDate" | "endDate"
  ) => {
    setShowStartDatePicker(false);
    setShowEndDatePicker(false);
    if (selectedDate) {
      handleInputChange(dateType, selectedDate);
    }
  };

  const selectImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("You've refused to allow this app to access your photos!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      handleInputChange("image", result.assets[0]);
    }
  };

  const selectPdf = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
      });

      if (!result.canceled) {
        handleInputChange("pdf", result);
      }
    } catch (err) {
      console.error("Error picking document:", err);
    }
  };

  const handleSubmit = async () => {
    try {
      const formDataToSend = new FormData();

      // Append text fields
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("targetAudience", formData.targetAudience);
      formDataToSend.append("startDate", formData.startDate.toISOString());
      formDataToSend.append("endDate", formData.endDate.toISOString());
      formDataToSend.append("pricingInformation", formData.pricingInformation);
      formDataToSend.append("currency", formData.currency);
      formDataToSend.append("agreeTerms", formData.agreeTerms.toString());
      formDataToSend.append("email", formData.email);

      // Append image file
      if (formData.image) {
        const imageUri = formData.image.uri;
        const imageName = imageUri.split("/").pop();
        const imageType =
          "image/" + (imageName?.split(".").pop()?.toLowerCase() || "jpeg");
        formDataToSend.append("image", {
          uri: imageUri,
          name: imageName,
          type: imageType,
        } as any);
      }

      // Append PDF file
      if (
        formData.pdf &&
        !formData.pdf.canceled &&
        formData.pdf.assets &&
        formData.pdf.assets[0]
      ) {
        const pdfUri =
          Platform.OS === "ios"
            ? formData.pdf.assets[0].uri.replace("file://", "")
            : formData.pdf.assets[0].uri;
        const pdfName = formData.pdf.assets[0].name || "document.pdf";

        formDataToSend.append("pdf", {
          uri: pdfUri,
          name: pdfName,
          type: "application/pdf",
        } as any);
      }

      console.log("FormData to send:", formDataToSend); // Log the FormData

      const response = await axios.post(
        "http://192.168.21.81:8000/api/advertisements/createwithemail",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 201) {
        setSubmissionResult(formData);
        setModalVisible(true);
      }
    } catch (error) {
      console.error("Error submitting advertisement:", error);
      if (axios.isAxiosError(error)) {
        console.error("Axios error details:", {
          message: error.message,
          code: error.code,
          request: error.request,
          response: error.response
            ? {
                data: error.response.data,
                status: error.response.status,
                headers: error.response.headers,
              }
            : "No response received",
        });
      }
      Alert.alert("Error", "Failed to submit advertisement. Please try again.");
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setFormData({
      title: "",
      description: "",
      category: "",
      targetAudience: "",
      startDate: new Date(),
      endDate: new Date(),
      pricingInformation: "",
      currency: "USD",
      agreeTerms: false,
      image: null,
      pdf: null,
      email: "",
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
        
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Create Advertisement</Text>
        </View>
        <Header />

        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            value={formData.title}
            onChangeText={(value) => handleInputChange("title", value)}
            placeholder="Title"
            placeholderTextColor="#999"
          />
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(value) => handleInputChange("email", value)}
            placeholder="Email"
            placeholderTextColor="#999"
            keyboardType="email-address"
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(value) => handleInputChange("description", value)}
            placeholder="Description"
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
          />

          <Text style={styles.sectionTitle}>Category</Text>
          <View style={styles.categoryContainer}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  formData.category === category && styles.categoryButtonSelected,
                ]}
                onPress={() => handleInputChange("category", category)}
              >
                <Text style={[
                  styles.categoryButtonText,
                  formData.category === category && styles.categoryButtonTextSelected,
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.input}
            value={formData.targetAudience}
            onChangeText={(value) => handleInputChange("targetAudience", value)}
            placeholder="Target Audience"
            placeholderTextColor="#999"
          />

          <View style={styles.dateContainer}>
            <View style={styles.dateWrapper}>
              <Text style={styles.dateLabel}>Start Date</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => openDatePicker("startDate")}
              >
                <Text style={styles.dateButtonText}>{formData.startDate.toDateString()}</Text>
                <Ionicons name="calendar-outline" size={20} color="#666" />
              </TouchableOpacity>
            </View>
            <View style={styles.dateWrapper}>
              <Text style={styles.dateLabel}>End Date</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => openDatePicker("endDate")}
              >
                <Text style={styles.dateButtonText}>{formData.endDate.toDateString()}</Text>
                <Ionicons name="calendar-outline" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          {(showStartDatePicker || showEndDatePicker) && (
            <DateTimePicker
              value={showStartDatePicker ? formData.startDate : formData.endDate}
              mode="date"
              display="default"
              onChange={(event, date) => onDateChange(event, date, showStartDatePicker ? "startDate" : "endDate")}
            />
          )}

          <View style={styles.pricingContainer}>
            <TextInput
              style={[styles.input, styles.pricingInput]}
              value={formData.pricingInformation}
              onChangeText={(value) => handleInputChange("pricingInformation", value)}
              placeholder="Price"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
            <View style={styles.currencyPicker}>
              {currencies.map((currency) => (
                <TouchableOpacity
                  key={currency}
                  style={[
                    styles.currencyButton,
                    formData.currency === currency && styles.currencyButtonSelected,
                  ]}
                  onPress={() => handleInputChange("currency", currency)}
                >
                  <Text style={[
                    styles.currencyButtonText,
                    formData.currency === currency && styles.currencyButtonTextSelected,
                  ]}>
                    {currency}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.fileSection}>
            <TouchableOpacity style={styles.fileButton} onPress={selectImage}>
              <Ionicons name="image-outline" size={24} color="#666" />
              <Text style={styles.fileButtonText}>{formData.image ? "Change Image" : "Select Image"}</Text>
            </TouchableOpacity>
            {formData.image && (
              <Text style={styles.fileName}>{formData.image.fileName}</Text>
            )}
          </View>

          <View style={styles.fileSection}>
            <TouchableOpacity style={styles.fileButton} onPress={selectPdf}>
              <Ionicons name="document-outline" size={24} color="#666" />
              <Text style={styles.fileButtonText}>{formData.pdf ? "Change PDF" : "Select PDF"}</Text>
            </TouchableOpacity>
            {formData.pdf && !formData.pdf.canceled && (
              <Text style={styles.fileName}>{formData.pdf.assets[0].name}</Text>
            )}
          </View>

          <View style={styles.termsContainer}>
            <TouchableOpacity
              style={[styles.checkbox, formData.agreeTerms && styles.checkboxChecked]}
              onPress={() => handleInputChange("agreeTerms", !formData.agreeTerms)}
            >
              {formData.agreeTerms && (
                <Ionicons name="checkmark" size={18} color="white" />
              )}
            </TouchableOpacity>
            <Text style={styles.termsText}>I agree to the Terms & Conditions</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, !formData.agreeTerms && styles.submitButtonDisabled]}
          disabled={!formData.agreeTerms}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>Create Advertisement</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkButton} onPress={() => router.push("/(routes)/AllAdds")}>
          <Text style={styles.linkButtonText}>View All Advertisements</Text>
        </TouchableOpacity>
      </ScrollView>

      

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Submission Successful!</Text>
            <Text style={styles.modalTitle}>
              Your code was sent to the email:{submissionResult?.email}
            </Text>
            {submissionResult && (
              <ScrollView>
                <Text style={styles.modalText}>
                  Title: {submissionResult.title}
                </Text>
                <Text style={styles.modalText}>
                  Description: {submissionResult.description}
                </Text>
                <Text style={styles.modalText}>
                  Category: {submissionResult.category}
                </Text>
                <Text style={styles.modalText}>
                  Target Audience: {submissionResult.targetAudience}
                </Text>
                <Text style={styles.modalText}>
                  Start Date: {submissionResult.startDate.toDateString()}
                </Text>
                <Text style={styles.modalText}>
                  End Date: {submissionResult.endDate.toDateString()}
                </Text>
                <Text style={styles.modalText}>
                  Pricing: {submissionResult.pricingInformation}{" "}
                  {submissionResult.currency}
                </Text>
                <Text style={styles.modalText}>
                  Image: {submissionResult.image ? "Uploaded" : "Not provided"}
                </Text>
                <Text style={styles.modalText}>
                  PDF: {submissionResult.pdf ? "Uploaded" : "Not provided"}
                </Text>
              </ScrollView>
            )}
            <TouchableOpacity style={styles.modalButton} onPress={closeModal}>
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({


    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
      },
      scrollContainer: {
        padding: 20,
      },
      headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
      },
      backButton: {
        padding: 10,
      },
      headerText: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
        marginLeft: 10,
      },
      formContainer: {
        backgroundColor: "#fff",
        borderRadius: 15,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      },
      input: {
        borderWidth: 1,
        borderColor: "#e0e0e0",
        borderRadius: 8,
        padding: 12,
        marginBottom: 15,
        fontSize: 16,
        backgroundColor: "#f8f9fa",
      },
      textArea: {
        height: 100,
        textAlignVertical: "top",
      },
      sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 10,
        color: "#333",
      },
      categoryContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginBottom: 15,
      },
      categoryButton: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginRight: 10,
        marginBottom: 10,
      },
      categoryButtonSelected: {
        backgroundColor: "#007bff",
        borderColor: "#007bff",
      },
      categoryButtonText: {
        color: "#333",
        fontWeight: "500",
      },
      categoryButtonTextSelected: {
        color: "#fff",
      },
      dateContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
      },
      dateWrapper: {
        flex: 1,
        marginRight: 10,
      },
      dateLabel: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 5,
        color: "#666",
      },
      dateButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: "#e0e0e0",
        borderRadius: 8,
        padding: 12,
        backgroundColor: "#f8f9fa",
      },
      dateButtonText: {
        fontSize: 14,
        color: "#333",
      },
      pricingContainer: {
        flexDirection: "row",
        marginBottom: 15,
      },
      pricingInput: {
        flex: 1,
        marginRight: 10,
      },
      currencyPicker: {
        flexDirection: "row",
      },
      currencyButton: {
        borderWidth: 1,
        borderColor: "#e0e0e0",
        borderRadius: 8,
        padding: 12,
        marginRight: 5,
      },
      currencyButtonSelected: {
        backgroundColor: "#FFA500",
        borderColor: "#FFA500",
      },
      currencyButtonText: {
        color: "#333",
      },
      currencyButtonTextSelected: {
        color: "#fff",
      },
      fileSection: {
        marginBottom: 15,
      },
      fileButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: "#e0e0e0",
        borderRadius: 8,
        padding: 12,
        backgroundColor: "#f8f9fa",
      },
      fileButtonText: {
        marginLeft: 10,
        fontSize: 16,
        color: "#666",
      },
      fileName: {
        fontSize: 14,
        color: "#666",
        marginTop: 5,
      },
      termsContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
      },
      checkbox: {
        width: 24,
        height: 24,
        borderWidth: 2,
        borderColor: "#FFA500",
        borderRadius: 4,
        marginRight: 10,
        justifyContent: "center",
        alignItems: "center",
      },
      checkboxChecked: {
        backgroundColor: "#FFA500",
      },
      termsText: {
        fontSize: 14,
        color: "#666",
      },
      submitButton: {
        backgroundColor: "#FFA500",
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 20,
      },
      submitButtonDisabled: {
        backgroundColor: "#FFDBBB",
      },
      submitButtonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
      },
      linkButton: {
        alignItems: "center",
        marginTop: 15,
      },
      linkButtonText: {
        fontSize: 16,
        color: "#FFA500",
        fontWeight: "600",
      },
  
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
    color: "#333",
  },
  
  pickerContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "80%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  modalText: {
    marginBottom: 10,
    textAlign: "left",
  },
  modalButton: {
    backgroundColor: "#FFA500",
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 15,
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default AdvertisementCreateScreen;
