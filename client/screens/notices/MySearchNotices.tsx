import React, { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, TextInput, StyleSheet, RefreshControl } from "react-native";
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
import axios from "axios";
import { NOTICE_SERVER_URI } from "@/utils/uri";
import Loader from "@/components/button/loader/loader";
import NoticeCard from "@/components/cards/notice.card";
import useUser from "@/hooks/useUser";
import { debounce } from 'lodash';

export default function MySearchNoticeScreen() {
  const [notices, setNotices] = useState<NoticeType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [filteredNotices, setFilteredNotices] = useState<NoticeType[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const pageSize = 10;

  const { user } = useUser();

  let [fontsLoaded] = useFonts({
    Raleway_400Regular,
    Raleway_500Medium,
    Raleway_600SemiBold,
    Raleway_700Bold,
    Nunito_200ExtraLight,
    Nunito_600SemiBold,
    Nunito_500Medium,
  });

  const fetchNotices = useCallback(async (pageNum: number, refresh: boolean = false) => {
    try {
      setLoading(true);
      const response = await axios.get(`${NOTICE_SERVER_URI}/getNotice`, {
        params: { page: pageNum, pageSize },
      });
      const allNotices = response.data.data;
      const userNotices = allNotices.filter(
        (notice: NoticeType) => notice.userId === user?._id
      );

      if (refresh) {
        setNotices(userNotices);
      } else {
        setNotices((prevNotices) => [
          ...prevNotices,
          ...userNotices.filter(
            (newNotice: NoticeType) =>
              !prevNotices.some((existingNotice) => existingNotice._id === newNotice._id)
          ),
        ]);
      }

      setHasMore(userNotices.length === pageSize);
      setError(null);
    } catch (err) {
      setError("Failed to load notices.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchNotices(page);
    }
  }, [fetchNotices, page, user]);

  const debouncedSearch = useCallback(
    debounce((text: string) => {
      const filtered = notices.filter((notice) =>
        notice.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredNotices(filtered);
    }, 300),
    [notices]
  );

  useEffect(() => {
    debouncedSearch(searchText);
  }, [debouncedSearch, searchText]);

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    fetchNotices(1, true);
  }, [fetchNotices]);

  const renderNoticeItem = useCallback(({ item }: { item: NoticeType }) => (
    <NoticeCard item={item} />
  ), []);

  const keyExtractor = useCallback((item: NoticeType) => item._id.toString(), []);

  if (!fontsLoaded) {
    return <Loader />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>My Notices</Text>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Search notices..."
        value={searchText}
        onChangeText={setSearchText}
      />

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={searchText ? filteredNotices : notices}
          renderItem={renderNoticeItem}
          keyExtractor={keyExtractor}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loading && hasMore ? <Loader /> : null}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No notices found</Text>
          }
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  errorText: {
    textAlign: "center",
    color: "red",
    fontSize: 16,
    fontFamily: "Nunito_500Medium",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    fontFamily: "Nunito_500Medium",
    marginTop: 20,
  },
});