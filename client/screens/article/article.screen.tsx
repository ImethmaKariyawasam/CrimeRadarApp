import React, { useEffect, useState, useCallback} from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Image,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  SafeAreaView,
  StatusBar,
  RefreshControl,
} from "react-native";
import { fetchAdvertisements, SERVER_IP, SERVER_PORT } from "@/api"; // Adjust the import path as needed
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

interface Advertisement {
  _id: string;
  title: string;
  description: string;
  category: string;
  targetAudience: string;
  startDate: string;
  endDate: string;
  pricingInformation: string;
  imageUrl: string;
  pdfUrl: string;
}

interface MenuProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectOption: (option: string) => void;
}

export default function AllAddScreen() {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [filteredAdvertisements, setFilteredAdvertisements] = useState<
    Advertisement[]
  >([]);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"title" | "pricing" | "date">(
    "title"
  );

  useEffect(() => {
    const loadAdvertisements = async () => {
      try {
        const data = await fetchAdvertisements();
        setAdvertisements(data);
        setFilteredAdvertisements(data);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

    loadAdvertisements();
  }, []);

  useEffect(() => {
    handleSearch(searchQuery);
  }, [searchQuery, searchType]);


  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await fetchAdvertisements();
      setAdvertisements(data);
      setFilteredAdvertisements(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const lowercasedQuery = query.toLowerCase();

    const filtered = advertisements.filter((ad) => {
      switch (searchType) {
        case "title":
          return ad.title.toLowerCase().includes(lowercasedQuery);
        case "pricing":
          return ad.pricingInformation.toLowerCase().includes(lowercasedQuery);
        case "date":
          const startDate = new Date(ad.startDate)
            .toLocaleDateString()
            .toLowerCase();
          const endDate = new Date(ad.endDate)
            .toLocaleDateString()
            .toLowerCase();
          return (
            startDate.includes(lowercasedQuery) ||
            endDate.includes(lowercasedQuery)
          );
        default:
          return false;
      }
    });

    setFilteredAdvertisements(filtered);
  };

  const Menu: React.FC<MenuProps> = ({ isVisible, onClose, onSelectOption }) => (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.menuContainer}>
        <View style={styles.menuContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.menuTitle}>Dashboard</Text>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => onSelectOption("Home")}
          >
            <Ionicons
              name="home-outline"
              size={24}
              color="#333"
              style={styles.menuIcon}
            />
            <Text style={styles.menuItemText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => onSelectOption("Add Advertisement")}
          >
            <Ionicons
              name="add-circle-outline"
              size={24}
              color="#333"
              style={styles.menuIcon}
            />
            <Text style={styles.menuItemText}>Add Advertisement</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => onSelectOption("Settings")}
          >
            <Ionicons
              name="settings-outline"
              size={24}
              color="#333"
              style={styles.menuIcon}
            />
            <Text style={styles.menuItemText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const handleMenuOptionSelect = (option: string) => {
    setIsMenuVisible(false);
    // Handle navigation or action based on the selected option
    switch (option) {
      case "Home":
        // Navigate to Home screen
        break;
      case "Add Advertisement":
        // Navigate to Add Advertisement screen
        router.push("/(routes)/createAd");
        break;
      case "Settings":
        // Navigate to Settings screen
        router.push("/(routes)/Adupdate");
        break;
    }
  };

  const handleRegister = (title: string) => {
    // Implement registration logic
  };

  const handleDescription = (ad: Advertisement) => {
    setSelectedAd(ad);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF6B00" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="chevron-back" size={50} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sponsored Ads</Text>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setIsMenuVisible(true)}
        >
          <Ionicons name="menu" size={50} color="#000" />
        </TouchableOpacity>
      </View>

      <Menu
        isVisible={isMenuVisible}
        onClose={() => setIsMenuVisible(false)}
        onSelectOption={handleMenuOptionSelect}
      />

      <View style={styles.searchBarContainer}>
        <View style={styles.searchBar}>
          <Ionicons
            name="search"
            size={20}
            color="#999"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder={`Search by ${searchType}`}
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
        <View style={styles.searchTypeContainer}>
          <TouchableOpacity
            style={[
              styles.searchTypeButton,
              searchType === "title" && styles.activeSearchType,
            ]}
            onPress={() => setSearchType("title")}
          >
            <Text style={styles.searchTypeText}>Title</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.searchTypeButton,
              searchType === "pricing" && styles.activeSearchType,
            ]}
            onPress={() => setSearchType("pricing")}
          >
            <Text style={styles.searchTypeText}>Pricing</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.searchTypeButton,
              searchType === "date" && styles.activeSearchType,
            ]}
            onPress={() => setSearchType("date")}
          >
            <Text style={styles.searchTypeText}>Date</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredAdvertisements}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.imageUrl ? (
              <Image
                source={{
                  uri: `http://${SERVER_IP}:${SERVER_PORT}/${item.imageUrl.replace(
                    /\\/g,
                    "/"
                  )}`,
                }}
                style={styles.image}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="image-outline" size={40} color="#999" />
              </View>
            )}
            <View style={styles.cardContent}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.category}>{item.category}</Text>
              <Text style={styles.pricing}>{item.pricingInformation}</Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.descriptionButton}
                  onPress={() => handleDescription(item)}
                >
                  <Text style={styles.buttonText}>View Details</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.registerButton}
                  onPress={() => handleRegister(item.title)}
                >
                  <Text style={styles.buttonText2}>Register</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      <Modal
        visible={selectedAd !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedAd(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedAd(null)}
            >
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
            {selectedAd && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.modalTitle}>{selectedAd.title}</Text>
                <Image
                  source={{
                    uri: `http://${SERVER_IP}:${SERVER_PORT}/${selectedAd.imageUrl.replace(
                      /\\/g,
                      "/"
                    )}`,
                  }}
                  style={styles.modalImage}
                  resizeMode="cover"
                />
                <Text style={styles.modalSubtitle}>Description</Text>
                <Text style={styles.modalText}>{selectedAd.description}</Text>
                <Text style={styles.modalSubtitle}>Category</Text>
                <Text style={styles.modalText}>{selectedAd.category}</Text>
                <Text style={styles.modalSubtitle}>Target Audience</Text>
                <Text style={styles.modalText}>
                  {selectedAd.targetAudience}
                </Text>
                <Text style={styles.modalSubtitle}>Date Range</Text>
                <Text style={styles.modalText}>
                  {new Date(selectedAd.startDate).toLocaleDateString()} -{" "}
                  {new Date(selectedAd.endDate).toLocaleDateString()}
                </Text>
                <Text style={styles.modalSubtitle}>Pricing</Text>
                <Text style={styles.modalText}>
                  {selectedAd.pricingInformation}
                </Text>
                <TouchableOpacity
                  style={styles.modalRegisterButton}
                  onPress={() => handleRegister(selectedAd.title)}
                >
                  <Text style={styles.modalRegisterButtonText}>
                    Register Now
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E1E1E1",
  },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#000" },

  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },

  menuContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  menuContent: {
    width: "70%",
    height: "100%",
    backgroundColor: "#FFF",
    marginLeft: "auto",
    padding: 20,
    paddingTop: 40,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 10,
  },
  menuTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E1E1E1",
  },
  menuIcon: {
    marginRight: 10,
  },
  menuItemText: {
    fontSize: 18,
    color: "#333",
  },

  backButton: {
    padding: 8,
  },
  menuButton: {
    padding: 8,
  },

  searchBarContainer: {
    padding: 16,
    backgroundColor: "#FFF",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: "100%",
    height: 200,
  },
  imagePlaceholder: {
    height: 200,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  category: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  pricing: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF6B00",
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  descriptionButton: {
    flex: 1,
    backgroundColor: "#FFF",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FF6B00",
    marginRight: 8,
  },
  registerButton: {
    flex: 1,
    backgroundColor: "#FF6B00",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: "#FF6B00",
    fontWeight: "600",
    textAlign: "center",
  },
  buttonText2: {
    color: "#000",
    fontWeight: "600",
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  modalImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  modalSubtitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 16,
    color: "#666",
  },
  modalRegisterButton: {
    backgroundColor: "#FF6B00",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  modalRegisterButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 16,
    textAlign: "center",
  },
  searchTypeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  searchTypeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 4,
    backgroundColor: "#F0F0F0",
    marginHorizontal: 4,
  },
  activeSearchType: {
    backgroundColor: "#FF6B00",
  },
  searchTypeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
});
