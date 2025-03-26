import { StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import { Redirect } from "expo-router";
import useUser from "@/hooks/useUser";
import Loader from "@/components/button/loader/loader";
export default function index() {
  const { loading, user, error } = useUser();
  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <Redirect href={!user ? "/(routes)/onboarding" : "/(tabs)"} />
      )}
    </>
  );
}
