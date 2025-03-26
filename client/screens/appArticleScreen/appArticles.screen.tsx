import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  Image,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { ARTICLE_URI } from '@/utils/uri';

// Define TypeScript interfaces
interface Article {
  _id: string;
  title: string;
  content: string;
  image: string;
  category: string;
  isVerified: boolean;
  createdAt: string;
}

export default function AppArticleScreen() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch articles
  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      // Replace with your actual API endpoint
      const response = await fetch(`${ARTICLE_URI}/posts`);
      const posts = await response.json();
      setArticles(posts);
      setFilteredArticles(posts);
    } catch (err) {
      setError('Failed to fetch articles');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchArticles();
  };

  // Filter articles based on search query and category
  useEffect(() => {
    let filtered = articles;
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(article =>
        article.category === selectedCategory
      );
    }
    
    setFilteredArticles(filtered);
  }, [searchQuery, selectedCategory, articles]);

  const ArticleCard = ({ article }: { article: Article }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => {
        setSelectedArticle(article);
        setModalVisible(true);
      }}
    >
      <Image 
        source={{ uri: article.image }}
        style={styles.cardImage}
      />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{article.title}</Text>
        <Text style={styles.cardCategory}>{article.category}</Text>
        {article.isVerified && (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const ArticleModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {selectedArticle && (
            <>
              <Image 
                source={{ uri: selectedArticle.image }}
                style={styles.modalImage}
              />
              <Text style={styles.modalTitle}>{selectedArticle.title}</Text>
              <Text style={styles.modalCategory}>{selectedArticle.category}</Text>
              <Text style={styles.modalText}>{selectedArticle.content}</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <Text>Loading articles...</Text>
      </View>
    );
  }

  if (error && !refreshing) {
    return (
      <View style={styles.centered}>
        <Text>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchArticles}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search articles..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Picker
          selectedValue={selectedCategory}
          style={styles.categoryPicker}
          onValueChange={(itemValue) => setSelectedCategory(itemValue)}
        >
          <Picker.Item label="All Categories" value="all" />
          <Picker.Item label="Crime Reports" value="Crime Reports" />
          <Picker.Item label="Crime prevention" value="Crime Prevention" />
          <Picker.Item label="Cybercrime" value="Cybercrime" />
        </Picker>
      </View>

      <FlatList
        data={filteredArticles}
        renderItem={({ item }) => <ArticleCard article={item} />}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      <ArticleModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    padding: 10,
    backgroundColor: 'white',
  },
  searchInput: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  categoryPicker: {
    height: 40,
  },
  listContainer: {
    padding: 10,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardImage: {
    height: 200,
    width: '100%',
  },
  cardContent: {
    padding: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardCategory: {
    fontSize: 14,
    color: '#666',
  },
  verifiedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  verifiedText: {
    color: 'white',
    fontSize: 12,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalImage: {
    height: 200,
    width: '100%',
    borderRadius: 10,
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalCategory: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  modalText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#FF0000',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  retryButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
  },
});