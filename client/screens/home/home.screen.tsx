import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { commonStyles } from '@/styles/common/common.styles';
import Header from '@/components/button/header/header';
import SearchInput from '@/components/common/searchinput';
import HomeBannerSlider from '@/components/home/home.banner.slider';
import AllNotices from '@/components/Notices/all.notices';
import { useNavigation } from '@react-navigation/native'; // Hook for navigation
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Importing the icon

export default function HomeScreen() {
  const navigation = useNavigation(); // Get the navigation object

  const handleChatNavigation = () => {
    navigation.navigate('(routes)/ChatJusticeBot/index');
  };

  return (
    <LinearGradient
      colors={["#E5ECF9", "#F6F7F9"]}
      style={{ flex: 1, paddingTop: 50 }}
    >
      <Header />
      <HomeBannerSlider />
      <AllNotices />

      <TouchableOpacity
        style={styles.fab}
        onPress={handleChatNavigation}
      >
        <Icon name="robot" size={24} color="white" /> 
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: "red",
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5, // For shadow on Android
  },
});
