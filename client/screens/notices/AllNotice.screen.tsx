import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
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
import Loader from "@/components/button/loader/loader";
import NoticeCard from "@/components/cards/notice.card";
import { Picker } from "@react-native-picker/picker";
import { debounce } from "lodash";

interface NoticeType {
  _id: string;
  name: string;
  type: string;
  dangerLevel: string;
  isVerified: boolean;
  // Add other properties as needed
}

export default function AllNoticeScreen() {
  const [notices, setNotices] = useState<NoticeType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [filteredNotices, setFilteredNotices] = useState<NoticeType[]>([]);
  const [noticeType, setNoticeType] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [criminalType, setCriminalType] = useState<string>("all");
  const FlatListRef = useRef<FlatList<NoticeType> | null>(null);
  const pageSize = 10; // Increased page size for better performance

  const fetchNotices = useCallback(
    async (refresh = false) => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${NOTICE_SERVER_URI}/getNotice?page=${
            refresh ? 1 : page
          }&pageSize=${pageSize}`
        );
        const newNotices = res.data.data;
        const verifiedNotices = newNotices.filter(
          (notice: NoticeType) => notice.isVerified
        );

        if (refresh) {
          setNotices(verifiedNotices);
          setPage(1);
        } else {
          setNotices((prev) => [...prev, ...verifiedNotices]);
        }

        setHasMore(verifiedNotices.length === pageSize);
        setError(null);
      } catch (err) {
        setError("Failed to load notices.");
        console.error(err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, pageSize]
  );

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  const debouncedSearch = useCallback(
    debounce((text: string) => {
      setSearchText(text);
    }, 300),
    []
  );

  useEffect(() => {
    let filtered = notices;

    if (searchText) {
      filtered = filtered.filter((notice) =>
        notice.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (noticeType !== "all") {
      if (noticeType === "Criminal") {
        filtered = filtered.filter((notice) => notice.type === noticeType);
      }
      if (noticeType === "Missing") {
        filtered = filtered.filter((notice) => notice.type === noticeType);
      }
    }

    if (criminalType !== "all") {
      if (criminalType === "Critical") {
        filtered = filtered.filter(
          (notice) => notice.dangerLevel === criminalType
        );;
        
      }
      if (criminalType === "High") {
        filtered = filtered.filter(
          (notice) => notice.dangerLevel === criminalType
        );
      }
      if (criminalType === "Medium") {
        filtered = filtered.filter(
          (notice) => notice.dangerLevel === criminalType
        );
      }
      if (criminalType === "Low") {
        filtered = filtered.filter(
          (notice) => notice.dangerLevel === criminalType
        );
      }
    }
    setFilteredNotices(filtered);
  }, [searchText, noticeType, notices, criminalType]);

  const [fontsLoaded] = useFonts({
    Raleway_400Regular,
    Raleway_500Medium,
    Raleway_600SemiBold,
    Raleway_700Bold,
    Nunito_200ExtraLight,
    Nunito_600SemiBold,
    Nunito_500Medium,
  });

  if (!fontsLoaded) {
    return <Loader />;
  }

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotices(true);
  };

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#2467EC" />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>All Notices</Text>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Search notices..."
        onChangeText={debouncedSearch}
      />

      <View style={styles.filterContainer}>
        <Picker
          selectedValue={noticeType}
          onValueChange={(itemValue) => setNoticeType(itemValue)}
          style={styles.filterInput}
        >
          <Picker.Item label="All Types" value="all" />
          <Picker.Item label="Criminal" value="Criminal" />
          <Picker.Item label="Missing" value="Missing" />
        </Picker>
      </View>
      <View style={styles.filterContainer}>
        <Picker
          selectedValue={criminalType}
          onValueChange={(itemValue) => setCriminalType(itemValue)}
          style={styles.filterInput}
        >
          <Picker.Item label="All Types" value="all" />
          <Picker.Item label="Critical" value="Critical" />
          <Picker.Item label="High" value="High" />
          <Picker.Item label="Medium" value="Medium" />
          <Picker.Item label="Low" value="Low" />
        </Picker>
      </View>

      <FlatList
        ref={FlatListRef}
        data={filteredNotices}
        renderItem={({ item }) => <NoticeCard item={item} />}
        keyExtractor={(item) => item._id.toString()}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyListText}>No notices found</Text>
        }
      />
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
    marginBottom: 10,
  },
  headerText: {
    fontSize: 20,
    fontFamily: "Raleway_700Bold",
  },
  searchInput: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    fontFamily: "Nunito_500Medium",
  },
  filterContainer: {
    marginBottom: 10,
  },
  filterInput: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontFamily: "Nunito_500Medium",
  },
  footerLoader: {
    marginVertical: 16,
    alignItems: "center",
  },
  emptyListText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    fontFamily: "Nunito_500Medium",
    color: "#666",
  },
});
