import React, { useEffect, useState } from "react";
import axios from "axios";
import { SERVER_URI } from "@/utils/uri";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function useUser() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User>();
  const [error, setError] = useState("");
  const [refetch, setRefetch] = useState(false);

  useEffect(() => {
    const subscription = async () => {
      const accessToken = await AsyncStorage.getItem("accessToken");
      const refreshToken = await AsyncStorage.getItem("refreshToken");
      await axios
        .get(`${SERVER_URI}/userinfo`, {
          headers: {
            "accessToken":accessToken,
            "refreshToken":refreshToken,
          },
        })
        .then((res: any) => {
          setUser(res.data.user);
          setLoading(false);
        })
        .catch((error: any) => {
          setError(error?.message);
          setLoading(false);
        });
    };
    subscription();
  }, [refetch]);

  return { loading, user, error, setRefetch, refetch };
}
