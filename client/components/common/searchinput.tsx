import {
  StyleSheet,
  Text,
  TextInput,
  Touchable,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { Nunito_700Bold } from "@expo-google-fonts/nunito";
import { useFonts } from "expo-font";
import { AntDesign, Ionicons } from "@expo/vector-icons";
export default function SearchInput() {
  let [fontsLoaded, fontError] = useFonts({
    Nunito_700Bold,
  });
  if (!fontsLoaded && !fontError) {
    return null;
  }
  return (
    <View style={styles.filteringContainer}>
      <View style={styles.searchContainer}>
        <TextInput
          style={[styles.input, { fontFamily: "Nunito_700Bold" }]}
          placeholder="Search"
          placeholderTextColor={"#C67CC"}
        />
        <TouchableOpacity style={styles.searchIconContainer}>
          <AntDesign name="search1" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export const styles = StyleSheet.create({
  filteringContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 16,
  },

  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 5,
    paddingHorizontal: 10,
  },

  searchIconContainer: {
    width: 36,
    height: 36,
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
  },

  input: {
    flex: 1,
    fontSize: 14,
    color: "black",
    paddingVertical: 10,
    width: 271,
    height: 48,
  },
});
