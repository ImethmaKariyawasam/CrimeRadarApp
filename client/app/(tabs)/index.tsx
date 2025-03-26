import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Redirect } from "expo-router";
import useUser from "@/hooks/useUser";
import HomeScreen from "@/screens/home/home.screen";
export default function index() {
  return <HomeScreen/>;
}
