import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";

// Define color mappings for danger level and type
const dangerLevelColors: Record<string, string> = {
  Low: "#3C9D3C", // Green
  Medium: "#F4B400", // Yellow
  High: "#D9534F", // Red
  Critical: "#C71585", // Dark Red/Purple
};

const typeColors: Record<string, string> = {
  Criminal: "#FF5733", // Orange
  Missing: "#33C1FF", // Light Blue
};

export default function NoticeCard({ item }: { item: NoticeType }) {
  // Get color based on dangerLevel and type
  const dangerColor = dangerLevelColors[item.dangerLevel] || "#808080"; // Default to grey if not found
  const typeColor = typeColors[item.type] || "#808080"; // Default to grey if not found
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() =>
        router.push({
          pathname: "/(routes)/notice-details",
          params: { 
            item: JSON.stringify(item),  // Pass the item as a string
            imageUrl: encodeURIComponent(item.image) // Pass the image URL separately and encode it
          },
        })
      }
    >
      <View style={styles.imageContainer}>
        <Image
          style={styles.image}
          source={{
            uri: item.image
              ? item.image.toString()
              : "https://via.placeholder.com/150",
          }}
          resizeMode="cover"
        />
        {item.type === "Criminal" && item.dangerLevel && (
          <View style={[styles.badge, { backgroundColor: dangerColor }]}>
            <Text style={styles.badgeText}>{item.dangerLevel}</Text>
          </View>
        )}
        {item.type === "Missing" && item.isVerified && (
          <View style={styles.verifiedBadge}>
          <FontAwesome name="check-circle" size={18} color="#4CAF50" />
          <Text style={styles.verifiedBadgeText}>Verified</Text>
        </View>
        )}
        {
          item.type ==="Missing" && !item.isVerified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="close-circle" size={18} color="#D9534F" />
              <Text style={styles.isNotVerifiedBadgeText}>Not Verified</Text>
            </View>
          )
        }
        <View style={[styles.typeBadge, { backgroundColor: typeColor }]}>
          <Text style={styles.typeBadgeText}>{item.type}</Text>
        </View>
      </View>
      <View style={styles.details}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFF",
    marginHorizontal: 6,
    borderRadius: 12,
    width: "95%",
    overflow: "hidden",
    margin: "auto",
    marginVertical: 15,
    padding: 8,
  },
  imageContainer: {
    position: "relative",
    width: wp(86),
    height: 220,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  badge: {
    position: "absolute",
    bottom: 10,
    left: 10,
    padding: 4,
    borderRadius: 5,
    width: 75,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  typeBadge: {
    position: "absolute",
    bottom: 10,
    right: 10,
    padding: 4,
    borderRadius: 5,
    width: 75,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  typeBadgeText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  details: {
    paddingHorizontal: 10,
    marginTop: 10,
  },
  name: {
    fontSize: 14,
    fontFamily: "Raleway_600SemiBold",
  },
  description: {
    fontSize: 12,
    color: "#555",
    marginTop: 5,
  },
  verifiedBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  verifiedBadgeText: {
    marginLeft: 4,
    color: "#4CAF50",
    fontWeight: "bold",
  },
  isNotVerifiedBadgeText:{
    marginLeft: 4,
    color: "#D9534F",
    fontWeight: "bold",
  }
});
