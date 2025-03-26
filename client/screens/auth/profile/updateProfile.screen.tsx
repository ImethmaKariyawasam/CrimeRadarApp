import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import {
  AntDesign,
  Entypo,
  FontAwesome,
  Fontisto,
  Ionicons,
  SimpleLineIcons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import { Toast } from "react-native-toast-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import your hook
import { router } from "expo-router"; // For navigation
import { SERVER_URI } from "@/utils/uri"; // Adjust the URI for your backend
import useUser from "@/hooks/useUser";
import Loader from "@/components/button/loader/loader";

export default function UpdateUserProfileScreen() {
  const { user, loading, setRefetch } = useUser();
  const [userInfo, setUserInfo] = useState({
    userId: "",
    name: "",
    phoneNo: "",
    NIC: "",
  });
  const [buttonSpinner, setButtonSpinner] = useState(false);

  useEffect(() => {
    if (user) {
      setUserInfo({
        userId: user._id || "",
        name: user.name || "",
        phoneNo: user.phoneNo || "",
        NIC: user.NIC || "",
      });
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    setButtonSpinner(true);
    if (
      userInfo.name === "" ||
      userInfo.phoneNo === "" ||
      userInfo.NIC === ""
    ) {
      Toast.show("Please fill all the fields", {
        type: "danger",
      });
      setButtonSpinner(false);
      return;
    }
    if (userInfo.phoneNo.length != 10) {
      Toast.show("Enter valid phone number", {
        type: "danger",
      });
      setButtonSpinner(false);
      return;
    }
    if (userInfo.NIC.length != 12) {
      Toast.show("Enter valid NIC number", {
        type: "danger",
      });
      setButtonSpinner(false);
      return;
    }
    try {
      const response = await axios.put(`${SERVER_URI}/update-profile`, {
        userId: userInfo.userId,
        name: userInfo.name,
        phoneNo: userInfo.phoneNo,
        NIC: userInfo.NIC,
      });
      if (response.data.success) {
        setRefetch(true); // Refetch user data after updating
        Toast.show("Profile updated successfully!", { type: "success" });
        router.push("/(tabs)/profile");
      } else {
        Toast.show(response.data.error, { type: "danger" });
      }
    } catch (error) {
      Toast.show("Error updating profile", { type: "danger" });
    } finally {
      setButtonSpinner(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <LinearGradient
      colors={["#E5ECF9", "#F6F7F9"]}
      style={{ flex: 1, paddingTop: 20 }}
    >
      <ScrollView>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <AntDesign name="arrowleft" size={24} color="black" />
        </TouchableOpacity>
        <Image
          style={styles.profileImage}
          source={require("@/assets/images/updateNew.png")}
        />
        <Text style={[styles.headingText, { fontFamily: "Raleway_700Bold" }]}>
          Update Your Profile
        </Text>
        <Text style={styles.subText}>
          Modify your personal information below
        </Text>

        <View style={styles.inputContainer}>
          <View>
            <TextInput
              style={[styles.input, { paddingLeft: 40 }]}
              value={userInfo.name}
              placeholder="Your Name"
              onChangeText={(value) =>
                setUserInfo({ ...userInfo, name: value })
              }
            />
            <AntDesign
              style={styles.icon}
              name="user"
              size={20}
              color="#A1A1A1"
            />
          </View>

          <View>
            <TextInput
              style={[styles.input, { paddingLeft: 40 }]}
              value={userInfo.phoneNo}
              placeholder="Your Phone Number"
              keyboardType="phone-pad"
              onChangeText={(value) =>
                setUserInfo({ ...userInfo, phoneNo: value })
              }
            />
            <FontAwesome
              style={styles.icon}
              name="phone"
              size={20}
              color="#A1A1A1"
            />
          </View>

          <View>
            <TextInput
              style={[styles.input, { paddingLeft: 40 }]}
              value={userInfo.NIC}
              placeholder="Your NIC"
              onChangeText={(value) => setUserInfo({ ...userInfo, NIC: value })}
            />
            <FontAwesome
              style={styles.icon}
              name="id-card"
              size={20}
              color="#A1A1A1"
            />
          </View>

          <TouchableOpacity
            style={styles.updateButton}
            onPress={handleUpdateProfile}
            disabled={buttonSpinner}
          >
            {buttonSpinner ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.buttonText}>Update Profile</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  profileImage: {
    width: "60%",
    height: 250,
    alignSelf: "center",
    marginTop: 50,
  },
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
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
  },
});
