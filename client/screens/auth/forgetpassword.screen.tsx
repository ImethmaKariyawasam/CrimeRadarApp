import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  useFonts,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_400Regular,
} from "@expo-google-fonts/nunito";
import { router } from "expo-router";
import { useState } from "react";
import { Toast } from "react-native-toast-notifications";
import { SERVER_URI } from "@/utils/uri";
import axios from "axios";

export default function ForgotPasswordScreen() {
  let [fontsLoaded, fontError] = useFonts({
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_400Regular,
  });
  const [buttonLoading, setButtonLoading] = useState(false);

  const [email, setEmail] = useState("");
  if (!fontsLoaded && !fontError) {
    return null;
  }

  const handleReset = async () => {
    setButtonLoading(true);
    if (!email) {
      Toast.show("Please enter your email", { type: "danger" });
      setButtonLoading(false);
      return;
    }
    try {
      const response = await axios.post(`${SERVER_URI}/forgot-password`, {
        email,
      });
      if (response.data.success) {
        Toast.show(response.data.message, { type: "success" });
        setButtonLoading(false);
      } else {
        Toast.show(response.data.message, { type: "danger" });
        setButtonLoading(false);
      }
    } catch (error) {
      Toast.show("An error occurred", { type: "danger" });
      setButtonLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#E5ECF9", "#F6F7F9"]} style={styles.container}>
      <Text style={[styles.headerText, { fontFamily: "Nunito_600SemiBold" }]}>
        Reset Email Password
      </Text>
      <TextInput
        style={[styles.input, { fontFamily: "Nunito_400Regular" }]}
        placeholder="Username@gmail.com"
        keyboardType="email-address"
        onChangeText={(text) => setEmail(text)}
      />
      <TouchableOpacity style={styles.button} onPress={handleReset}>
        {buttonLoading ? (
          <ActivityIndicator size="small" color={"white"} />
        ) : (
          <Text
            style={[styles.buttonText, { fontFamily: "Nunito_600SemiBold" }]}
          >
            Send
          </Text>
        )}
      </TouchableOpacity>
      <View style={styles.loginLink}>
        <Text style={[styles.backText, { fontFamily: "Nunito_700Bold" }]}>
          Back To?
        </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.loginText, { fontFamily: "Nunito_700Bold" }]}>
            Sign In
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  headerText: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#f23534",
    width: "100%",
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  loginLink: {
    flexDirection: "row",
    marginTop: 30,
  },
  loginText: {
    color: "#f23534",
    marginLeft: 5,
    fontSize: 16,
  },

  backText: { fontSize: 16 },
});
