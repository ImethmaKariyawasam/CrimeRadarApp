import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { AntDesign, FontAwesome, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import { Toast } from "react-native-toast-notifications";
import { router } from "expo-router"; // For navigation
import { SERVER_URI } from "@/utils/uri"; // Adjust the URI for your backend
import useUser from "@/hooks/useUser";

export default function UpdatePasswordScreen() {
  const { user, setRefetch } = useUser();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [buttonSpinner, setButtonSpinner] = useState(false);
  const [isPasswordVisible, setPasswordVisible] = useState(false);

  const handleUpdatePassword = async () => {
    setButtonSpinner(true);

    if (oldPassword === "" || newPassword === "") {
      Toast.show("Please fill all fields", {
        type: "danger",
      });
      setButtonSpinner(false);
      return;
    }

    try {
      const response = await axios.put(`${SERVER_URI}/update-password`, {
        userId: user?._id, // Pass user ID to backend
        oldPassword,
        newPassword,
      });

      if (response.data.success) {
        setRefetch(true); // Refetch user data after updating
        Toast.show("Password updated successfully!", { type: "success" });
        router.push("/(tabs)/profile");
      } else {
        Toast.show(response.data.error, { type: "danger" });
      }
    } catch (error) {
      Toast.show("Error updating password", { type: "danger" });
    } finally {
      setButtonSpinner(false);
    }
  };

  return (
    <LinearGradient
      colors={["#E5ECF9", "#F6F7F9"]}
      style={{ flex: 1, paddingTop: 20 }}
    >
      <ScrollView>
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <AntDesign name="arrowleft" size={24} color="black" />
        </TouchableOpacity>

        <Image
          style={styles.profileImage}
          source={require("@/assets/images/updatepassword.png")}
        />
        <Text
          style={[
            styles.headingText,
            {
              fontFamily: "Raleway_700Bold",
              textAlign: "center",
              fontSize: 24,
            },
          ]}
        >
          Update Your Password
        </Text>
        <Text style={styles.subText}>Modify your password below</Text>

        <View style={styles.inputContainer}>
          <View>
            <TextInput
              style={[styles.input, { paddingLeft: 40 }]}
              value={oldPassword}
              placeholder="Old Password"
              secureTextEntry={!isPasswordVisible}
              onChangeText={setOldPassword}
            />
            <TouchableOpacity
              style={styles.visibleIcon}
              onPress={() => setPasswordVisible(!isPasswordVisible)}
            >
              {isPasswordVisible ? (
                <Ionicons name="eye-off-outline" size={23} color={"#747474"} />
              ) : (
                <Ionicons name="eye-outline" size={23} color={"#747474"} />
              )}
            </TouchableOpacity>
            <FontAwesome
              style={styles.icon}
              name="lock"
              size={20}
              color="#A1A1A1"
            />
          </View>

          <View>
            <TextInput
              style={[styles.input, { paddingLeft: 40 }]}
              value={newPassword}
              placeholder="New Password"
              secureTextEntry={!isPasswordVisible}
              onChangeText={setNewPassword}
            />
            <TouchableOpacity
              style={styles.visibleIcon}
              onPress={() => setPasswordVisible(!isPasswordVisible)}
            >
              {isPasswordVisible ? (
                <Ionicons name="eye-off-outline" size={23} color={"#747474"} />
              ) : (
                <Ionicons name="eye-outline" size={23} color={"#747474"} />
              )}
            </TouchableOpacity>
            <FontAwesome
              style={styles.icon}
              name="lock"
              size={20}
              color="#A1A1A1"
            />
          </View>

          <TouchableOpacity
            style={styles.updateButton}
            onPress={handleUpdatePassword}
            disabled={buttonSpinner}
          >
            {buttonSpinner ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.buttonText}>Update Password</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  headingText: {
    textAlign: "center",
    fontSize: 24,
  },
  subText: {
    textAlign: "center",
    color: "#575757",
    fontSize: 15,
    marginTop: 5,
  },
  inputContainer: {
    marginHorizontal: 16,
    marginTop: 30,
    rowGap: 30,
  },
  input: {
    height: 55,
    marginHorizontal: 16,
    borderRadius: 8,
    paddingLeft: 35,
    fontSize: 16,
    backgroundColor: "white",
    color: "#A1A1A1",
  },
  icon: {
    position: "absolute",
    left: 26,
    top: 17,
  },
  updateButton: {
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    backgroundColor: "#f23534",
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    fontFamily: "Raleway_700Bold",
  },
  profileImage: {
    width: "60%",
    height: 250,
    alignSelf: "center",
    marginTop: 50,
  },
  visibleIcon: {
    position: "absolute",
    right: 30,
    top: 15,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
  },
});
