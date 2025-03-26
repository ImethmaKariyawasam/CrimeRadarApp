import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  useFonts,
  Raleway_400Regular,
  Raleway_500Medium,
  Raleway_600SemiBold,
  Raleway_700Bold,
} from "@expo-google-fonts/raleway";
import {
  Nunito_200ExtraLight,
  Nunito_600SemiBold,
  Nunito_500Medium,
} from "@expo-google-fonts/nunito";
import { router } from "expo-router";
import axios from "axios";
import { NOTICE_SERVER_URI } from "@/utils/uri";
import NoticeCard from "../cards/notice.card";
import Loader from "../button/loader/loader";

export default function AllNotices() {
  const [notices, setNotices] = useState<NoticeType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const FlatListRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${NOTICE_SERVER_URI}/getNotice`)
      .then((res: any) => {
        const verifiedNotices = res.data.data.filter(
          (notice: NoticeType) => notice.isVerified
        );
        setNotices(verifiedNotices.slice(0, 5)); // Limit to the latest 5 notices
        setLoading(false);
      })
      .catch((error) => {
        setError("Failed to load notices.");
        setLoading(false);
      });
  }, []);

  let [fontsLoaded, fontError] = useFonts({
    Raleway_400Regular,
    Raleway_500Medium,
    Raleway_600SemiBold,
    Raleway_700Bold,
    Nunito_200ExtraLight,
    Nunito_600SemiBold,
    Nunito_500Medium,
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Latest Notices</Text>
        <TouchableOpacity onPress={() => router.push("/(routes)/AllNotices")}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <View style={styles.loaderContainer}>
          <Loader />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          ref={FlatListRef}
          data={notices}
          renderItem={({ item }) => <NoticeCard item={item} />}
          keyExtractor={(item) => item._id.toString()}
          horizontal={false}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false} // Optional: hides vertical scroll indicator
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 16,
    marginTop: 30,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10, // Added margin to separate from FlatList
  },
  headerText: {
    fontSize: 20,
    fontFamily: "Raleway_700Bold",
  },
  seeAllText: {
    fontSize: 15,
    color: "#2467EC",
    fontFamily: "Nunito_600SemiBold",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20, // Optional: Add some margin if needed
  },
  errorText: {
    textAlign: "center",
    color: "red",
    fontSize: 16,
    fontFamily: "Nunito_500Medium", // Use a consistent font style
  },
});
