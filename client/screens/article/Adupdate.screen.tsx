import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
  SafeAreaView,
  StatusBar,
  Alert,
  Dimensions,
  RefreshControl,
  
} from 'react-native';
import { fetchAdvertisements, updateAdvertisement, deleteAdvertisement, SERVER_IP, SERVER_PORT } from '@/api';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { BlurView } from 'expo-blur';
import Animated, {FadeInDown, FadeOutUp} from 'react-native-reanimated';
const { width } = Dimensions.get('window');
import { debounce } from 'lodash';

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
  uniqueCode: string;
}

interface MenuProps {
    isVisible: boolean;
    onClose: () => void;
    onSelectOption: (option: string) => void;
  }

  const AnimatedCard = Animated.createAnimatedComponent(View);


export default function AdupdateScreen() {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [filteredAdvertisements, setFilteredAdvertisements] = useState<Advertisement[]>([]);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'title' | 'pricing' | 'date'>('title');

  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null);
  const [uniqueCode, setUniqueCode] = useState('');
  const [updatedAdData, setUpdatedAdData] = useState<Partial<Advertisement>>({});
  const [refreshing, setRefreshing] = useState(false);

  

  useEffect(() => {
    handleSearch(searchQuery);
  }, [searchQuery, searchType]);

  const loadAdvertisements = useCallback(async () => {
    try {
      const data = await fetchAdvertisements();
      setAdvertisements(data);
      setFilteredAdvertisements(data);
      setError(null);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdvertisements();
  }, [loadAdvertisements]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    const lowercasedQuery = query.toLowerCase();

    const filtered = advertisements.filter((ad) => {
      switch (searchType) {
        case 'title':
          return ad.title.toLowerCase().includes(lowercasedQuery);
        case 'pricing':
          return ad.pricingInformation.toLowerCase().includes(lowercasedQuery);
        case 'date':
          const startDate = new Date(ad.startDate).toLocaleDateString().toLowerCase();
          const endDate = new Date(ad.endDate).toLocaleDateString().toLowerCase();
          return startDate.includes(lowercasedQuery) || endDate.includes(lowercasedQuery);
        default:
          return false;
      }
    });

    setFilteredAdvertisements(filtered);
  }, [advertisements, searchType]);

  const debouncedHandleSearch = useMemo(
    () => debounce(handleSearch, 300),
    [handleSearch]
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAdvertisements().then(() => setRefreshing(false));
  }, [loadAdvertisements]);

  useEffect(() => {
    debouncedHandleSearch(searchQuery);
    return () => {
      debouncedHandleSearch.cancel();
    };
  }, [searchQuery, debouncedHandleSearch]);

  const handleUpdate = useCallback((ad: Advertisement) => {
    setSelectedAd(ad);
    setUpdatedAdData(ad);
    setIsUpdateModalVisible(true);
  }, []);

  const handleDelete = useCallback((ad: Advertisement) => {
    setSelectedAd(ad);
    setIsDeleteModalVisible(true);
  }, []);

  const handleUpdateSubmit = useCallback(async () => {
    if (selectedAd) {
      try {
        const response = await updateAdvertisement(selectedAd._id, {
          ...updatedAdData,
          uniqueCode
        });
        if (response.message === 'Advertisement updated successfully') {
          Alert.alert('Success', 'Advertisement updated successfully');
           await loadAdvertisements();
          setIsUpdateModalVisible(false);
        } else {
          setError('Failed to update advertisement');
          Alert.alert('Fail', 'Advertisement failed to update');
        }
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'Invalid unique code') {
            Alert.alert('Fail', 'Invalid unique code');
            setError('Invalid unique code');
          } else {
            setError('Failed to update advertisement');
          }
        } else {
          setError('An unknown error occurred');
        }
      }
    }
  }, [selectedAd, updatedAdData, uniqueCode, loadAdvertisements]);

  const handleDeleteSubmit = useCallback(async () => {
    if (selectedAd) {
      try {
        const response = await deleteAdvertisement(selectedAd._id, uniqueCode);
        if (response.message === 'Advertisement deleted successfully') {
          Alert.alert('Success', 'Advertisement deleted successfully');
          await loadAdvertisements();
          setIsDeleteModalVisible(false);
        } else {
          setError('Failed to delete advertisement');
        }
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'Invalid unique code') {
            setError('Invalid unique code');
          } else {
            setError('Failed to delete advertisement');
          }
        } else {
          setError('An unknown error occurred');
        }
      }
    }
  }, [selectedAd, uniqueCode, loadAdvertisements]);

  const renderItem = useCallback(({ item, index }: { item: Advertisement; index: number }) => (
    <AnimatedCard
      entering={FadeInDown.delay(index * 100)}
      exiting={FadeOutUp}
      style={styles.card}
    >
      {item.imageUrl ? (
        <Image
          source={{ uri: `http://${SERVER_IP}:${SERVER_PORT}/${item.imageUrl.replace(/\\/g, '/')}` }}
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
          <TouchableOpacity style={styles.updateButton} onPress={() => handleUpdate(item)}>
            <Text style={styles.buttonText}>Update</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item)}>
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </AnimatedCard>
  ), []);


  const Menu: React.FC<MenuProps> = ({ isVisible, onClose, onSelectOption }) => (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView intensity={15} style={StyleSheet.absoluteFill} />
      <Animated.View 
        entering={FadeInDown} 
        exiting={FadeOutUp} 
        style={styles.menuContainer}
      >
        <View style={styles.menuContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.menuTitle}>Dashboard</Text>
          <TouchableOpacity style={styles.menuItem} onPress={() => onSelectOption('Home')}>
            <Ionicons name="home-outline" size={24} color="#333" style={styles.menuIcon} />
            <Text style={styles.menuItemText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => onSelectOption('Add Advertisement')}>
            <Ionicons name="add-circle-outline" size={24} color="#333" style={styles.menuIcon} />
            <Text style={styles.menuItemText}>Add Advertisement</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => onSelectOption('Settings')}>
            <Ionicons name="settings-outline" size={24} color="#333" style={styles.menuIcon} />
            <Text style={styles.menuItemText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );



  const handleMenuOptionSelect = (option: string) => {
    setIsMenuVisible(false);
    switch (option) {
      case 'Home':
        // Navigate to Home screen
        break;
      case 'Add Advertisement':
        router.push('/(routes)/createAd')
        break;
      case 'Settings':
        router.push('/(routes)/Adupdate')
        break;
    }
  };

  const UpdateModal = () => (
    <Modal
      visible={isUpdateModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setIsUpdateModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Update Advertisement</Text>
          <TextInput
            style={styles.input}
            placeholder="Unique Code"
            value={uniqueCode}
            onChangeText={setUniqueCode}
          />
          <TextInput
            style={styles.input}
            placeholder="Title"
            value={updatedAdData.title}
            onChangeText={(text) => setUpdatedAdData({ ...updatedAdData, title: text })}
          />
          <TextInput
        style={styles.input}
        placeholder="Description"
        value={updatedAdData.description}
        onChangeText={(text) => setUpdatedAdData({ ...updatedAdData, description: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Category"
        value={updatedAdData.category}
        onChangeText={(text) => setUpdatedAdData({ ...updatedAdData, category: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Target Audience"
        value={updatedAdData.targetAudience}
        onChangeText={(text) => setUpdatedAdData({ ...updatedAdData, targetAudience: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Start Date (YYYY-MM-DD)"
        value={updatedAdData.startDate}
        onChangeText={(text) => setUpdatedAdData({ ...updatedAdData, startDate: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="End Date (YYYY-MM-DD)"
        value={updatedAdData.endDate}
        onChangeText={(text) => setUpdatedAdData({ ...updatedAdData, endDate: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Pricing Information"
        value={updatedAdData.pricingInformation}
        onChangeText={(text) => setUpdatedAdData({ ...updatedAdData, pricingInformation: text })}
      />
          {/* Add more input fields for other advertisement properties */}
          <TouchableOpacity style={styles.submitButton} onPress={handleUpdateSubmit}>
            <Text style={styles.buttonText}>Update</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => setIsUpdateModalVisible(false)}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const DeleteModal = () => (
    <Modal
      visible={isDeleteModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setIsDeleteModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Delete Advertisement</Text>
          <TextInput
            style={styles.input}
            placeholder="Unique Code"
            value={uniqueCode}
            onChangeText={setUniqueCode}
          />
          <TouchableOpacity style={styles.modalDeleteButton} onPress={handleDeleteSubmit}>
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalCancelButton} onPress={() => setIsDeleteModalVisible(false)}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

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
        <TouchableOpacity style={styles.retryButton} onPress={loadAdvertisements}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }






  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff"  />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} >
          <Ionicons name="chevron-back" size={50} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Update Adds Here!</Text>
        <TouchableOpacity style={styles.menuButton} onPress={() => setIsMenuVisible(true)}>
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
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
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
            style={[styles.searchTypeButton, searchType === 'title' && styles.activeSearchType]}
            onPress={() => setSearchType('title')}
          >
            <Text style={styles.searchTypeText}>Title</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.searchTypeButton, searchType === 'pricing' && styles.activeSearchType]}
            onPress={() => setSearchType('pricing')}
          >
            <Text style={styles.searchTypeText}>Pricing</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.searchTypeButton, searchType === 'date' && styles.activeSearchType]}
            onPress={() => setSearchType('date')}
          >
            <Text style={styles.searchTypeText}>Date</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredAdvertisements}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF6B00']} />
        }
      />

      <UpdateModal />
      <DeleteModal />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },

    menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },

    menuContainer: {
      flex: 1,
      flexDirection: 'row',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    menuContent: {
      width: '70%',
      height: '100%',
      backgroundColor: '#FFF',
      marginLeft: 'auto',
      padding: 20,
      paddingTop: 40,
    },
    closeButton: {
      position: 'absolute',
      top: 10,
      right: 10,
      padding: 10,
    },
    menuTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
      color: '#333',
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#E1E1E1',
    },
    menuIcon: {
      marginRight: 10,
    },
    menuItemText: {
      fontSize: 18,
      color: '#333',
    },
    modalDeleteButton: {
        padding: 10,
        backgroundColor: '#F44336', // Red color for delete
        borderRadius: 5,
        marginTop: 10,
      },
      modalCancelButton: {
        padding: 10,
        backgroundColor: '#9E9E9E', // Grey color for cancel
        borderRadius: 5,
        marginTop: 10,
      },
      modalButtonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
      },
  
  menuButton: {
    padding: 8,
  },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorText: {
      fontSize: 18,
      color: 'red',
    },
    retryButton: {
      marginTop: 20,
      padding: 10,
      backgroundColor: '#FF6B00',
      borderRadius: 5,
    },
    retryButtonText: {
      color: '#fff',
      fontSize: 16,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 15,
      paddingTop: 10,
      backgroundColor: '#fff',
    },
    backButton: {
      padding: 10,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#000',
    },
    
    searchBarContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      marginVertical: 10,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      backgroundColor: '#f0f0f0',
      padding: 10,
      borderRadius: 15,
    },
    searchIcon: {
      marginRight: 10,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
    },
    searchTypeContainer: {
      flexDirection: 'row',
      marginLeft: 10,
    },
    searchTypeButton: {
      padding: 10,
      backgroundColor: '#ddd',
      borderRadius: 15,
      marginLeft: 5,
    },
    activeSearchType: {
      backgroundColor: '#FF6B00',
    },
    searchTypeText: {
      color: '#fff',
      fontSize: 14,
    },
    card: {
      flexDirection: 'row',
      margin: 10,
      backgroundColor: '#fff',
      borderRadius: 20,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
      elevation: 8,
    },
    image: {
      width: 100,
      height: 100,
      borderRadius: 10,
    },
    imagePlaceholder: {
      width: 100,
      height: 100,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f0f0f0',
    },
    cardContent: {
      flex: 1,
      padding: 10,
    },
    title: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    category: {
      fontSize: 14,
      color: '#999',
    },
    pricing: {
      fontSize: 14,
      color: '#333',
    },
    buttonContainer: {
      flexDirection: 'row',
      marginTop: 10,
    },
    updateButton: {
      flex: 1,
      padding: 10,
      backgroundColor: '#4CAF50',
      borderRadius: 20,
      marginRight: 5,
    },
    deleteButton: {
        flex: 1,
        padding: 10,
        backgroundColor: '#4CAF50',
        borderRadius: 20,
        marginRight: 5,
      
    },
    buttonText: {
      color: '#fff',
      textAlign: 'center',
      fontWeight: 'bold',
    },
    
    
   
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
      width: '90%',
      padding: 20,
      backgroundColor: '#fff',
      borderRadius: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
      elevation: 5,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 20,
    },
    input: {
      width: '100%',
      padding: 10,
      borderColor: '#ccc',
      borderWidth: 1,
      borderRadius: 5,
      marginBottom: 10,
    },
    submitButton: {
      padding: 10,
      backgroundColor: '#4CAF50',
      borderRadius: 5,
    },
    cancelButton: {
      padding: 10,
      backgroundColor: '#F44336',
      borderRadius: 5,
      marginTop: 10,
    },
    listContainer: {
        paddingBottom: 20,

    }
    });