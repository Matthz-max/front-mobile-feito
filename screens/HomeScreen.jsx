import React, { useState, useContext, useRef } from 'react';
import {
  SafeAreaView,
  View,
  TextInput,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Animated,
  Modal,
  Image,
  Dimensions,
} from 'react-native';
import CarCard from '../components/CarCard';
import { getCarImage } from '../services/api';
import { ThemeContext } from '../contexts/ThemeContext';
import { FavoritesContext } from '../contexts/FavoritesContext';
import Header from '../components/Header';
import { Ionicons } from '@expo/vector-icons';

const { height } = Dimensions.get('window');

const HomeScreen = () => {
  const [carName, setCarName] = useState('');
  const [carImage, setCarImage] = useState(null);
  const { colors, isDark, toggleTheme } = useContext(ThemeContext);
  const { favorites, addFavorite, removeFavorite, isFavorite } = useContext(FavoritesContext);

  const [menuVisible, setMenuVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(200)).current;

  const [modalVisible, setModalVisible] = useState(false);
  const [favoriteDescription, setFavoriteDescription] = useState('');
  const [favoriteRating, setFavoriteRating] = useState('');

  const handleSearch = async () => {
    if (!carName.trim()) return;
    const image = await getCarImage(carName);
    setCarImage(image);
  };

  const handleFavoritePress = () => {
    if (!carName) return;
    if (isFavorite(carName)) {
      const fav = favorites.find((f) => f.carName === carName);
      setFavoriteDescription(fav?.description || '');
      setFavoriteRating(fav?.rating?.toString() || '');
    } else {
      setFavoriteDescription('');
      setFavoriteRating('');
    }
    setModalVisible(true);
  };

  const saveFavorite = () => {
    const ratingNumber = parseInt(favoriteRating);
    if (!carName) return;

    if (isFavorite(carName)) {
      removeFavorite(carName);
    }
    addFavorite({
      carName,
      carImage,
      description: favoriteDescription,
      rating: ratingNumber,
    });
    setModalVisible(false);
  };

  const openMenu = () => {
    setMenuVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeMenu = () => {
    Animated.timing(slideAnim, {
      toValue: 200,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setMenuVisible(false));
  };

  const handleToggleTheme = () => {
    toggleTheme();
    closeMenu();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header onFavorite={handleFavoritePress} onOpenMenu={openMenu} />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: colors.text }]}>Buscar Carro</Text>

        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
              borderColor: colors.primary,
              backgroundColor: isDark ? '#333' : '#f9f9f9',
              shadowColor: colors.shadow,
              shadowOpacity: 0.1,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 2 },
              elevation: 3,
            },
          ]}
          placeholder="Digite o nome do carro"
          placeholderTextColor={colors.text + '88'}
          value={carName}
          onChangeText={setCarName}
          autoCapitalize="words"
        />

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
            onPress={handleSearch}
            activeOpacity={0.85}
          >
            <Text style={[styles.buttonText, { color: colors.buttonText }]}>Buscar</Text>
          </TouchableOpacity>
        </View>

        {carImage && (
          <TouchableOpacity onPress={handleFavoritePress} activeOpacity={0.9}>
            <CarCard carName={carName} carImage={carImage} style={styles.carCard} />
          </TouchableOpacity>
        )}
      </ScrollView>
// só alterei o modal (parte dentro do HomeScreen, e styles relacionados)
<Modal
  visible={modalVisible}
  animationType="slide"
  transparent={true}
  onRequestClose={() => setModalVisible(false)}
>
  <View style={styles.modalOverlay}>
    <View style={[styles.modalContent, { backgroundColor: colors.cardBackground || colors.background }]}>
      <ScrollView contentContainerStyle={styles.modalScrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {carImage && (
          <View style={styles.modalImageContainer}>
            <Image source={{ uri: carImage }} style={styles.modalImage} resizeMode="contain" />
          </View>
        )}

        <View style={styles.modalBody}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Favoritar Carro</Text>

          <View style={styles.favoriteRow}>
            <Text style={[styles.modalLabel, { color: colors.text }]}>Favorito:</Text>
            <TouchableOpacity
              onPress={() => {
                if (isFavorite(carName)) removeFavorite(carName);
                else addFavorite({ carName, carImage, description: favoriteDescription, rating: parseInt(favoriteRating) || 0 });
              }}
              style={{ marginLeft: 10 }}
            >
              <Ionicons
                name={isFavorite(carName) ? 'star' : 'star-outline'}
                size={24}
                color={isFavorite(carName) ? '#ffd700' : colors.text}
              />
            </TouchableOpacity>
          </View>

          <Text style={[styles.modalLabel, { color: colors.text }]}>Descrição:</Text>
          <TextInput
            style={[styles.modalInput, { color: colors.text, borderColor: colors.primary, backgroundColor: isDark ? '#222' : '#fff' }]}
            multiline
            numberOfLines={2}
            value={favoriteDescription}
            onChangeText={setFavoriteDescription}
            placeholder="Escreva uma descrição"
            placeholderTextColor={colors.text + '88'}
          />

          <Text style={[styles.modalLabel, { color: colors.text }]}>Nota (1 a 5):</Text>
          <TextInput
            style={[styles.modalInput, { color: colors.text, borderColor: colors.primary, backgroundColor: isDark ? '#222' : '#fff' }]}
            keyboardType="numeric"
            value={favoriteRating}
            onChangeText={(val) => {
              if (/^[1-5]?$/.test(val)) setFavoriteRating(val);
            }}
            placeholder="Digite uma nota"
            placeholderTextColor={colors.text + '88'}
            maxLength={1}
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
              onPress={saveFavorite}
            >
              <Text style={[styles.modalButtonText, { color: colors.buttonText }]}>Salvar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: '#999', shadowColor: '#999' }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[styles.modalButtonText, { color: '#fff' }]}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  </View>
</Modal>

      {/* Menu Lateral */}
      {menuVisible && (
        <Pressable style={styles.menuOverlay} onPress={closeMenu}>
          <Animated.View
            style={[
              styles.menu,
              {
                backgroundColor: colors.cardBackground || colors.background,
                transform: [{ translateX: slideAnim }],
                shadowColor: colors.shadow,
                shadowOpacity: 0.25,
                shadowRadius: 10,
                shadowOffset: { width: -5, height: 0 },
                elevation: 8,
              },
            ]}
          >
            <TouchableOpacity onPress={handleToggleTheme} style={styles.menuButton}>
              <Ionicons
                name={isDark ? 'sunny' : 'moon'}
                size={24}
                color={colors.text}
                style={{ marginRight: 10 }}
              />
              <Text style={{ color: colors.text, fontWeight: '600', fontSize: 18 }}>
                Alternar Tema
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </Pressable>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 18,
    fontWeight: '500',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
  },
  button: {
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 50,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  buttonText: {
    fontSize: 22,
    fontWeight: '700',
  },
  carCard: {
    marginTop: 36,
    marginBottom: 100,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000066',
    justifyContent: 'flex-end',
  },
modalContent: {
  maxHeight: height * 0.75,
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  overflow: 'hidden',
  paddingHorizontal: 20,
  paddingVertical: 15,
  shadowColor: '#000',
  shadowOpacity: 0.2,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: -5 },
  elevation: 10,
},
modalImageContainer: {
  height: 160,
  overflow: 'hidden',
  backgroundColor: 'transparent',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 15,
},

modalImage: {
  width: '100%',
  height: '100%',
  borderRadius: 16,
  shadowColor: '#000',
  shadowOpacity: 0.15,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 3 },
  
},


modalBody: {
  flex: 1,
 
},

modalBody: {
  flex: 1,
  paddingHorizontal: 20,
  paddingTop: 12,
},
modalTitle: {
  fontSize: 22,
  fontWeight: '700',
  marginBottom: 10,
  textAlign: 'center',
},
favoriteRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 10,
  justifyContent: 'center',
},
modalLabel: {
  fontWeight: '600',
  fontSize: 14,
  marginBottom: 4,
},
modalInput: {
  borderWidth: 1,
  borderRadius: 12,
  paddingHorizontal: 12,
  paddingVertical: 8,
  fontSize: 14,
  marginBottom: 10,
  shadowColor: '#000',
  shadowOpacity: 0.07,
  shadowRadius: 4,
  shadowOffset: { width: 0, height: 1 },
  elevation: 2,
},
modalButtons: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 8,
},
modalButton: {
  flex: 1,
  paddingVertical: 12,
  borderRadius: 30,
  marginHorizontal: 5,
  shadowOpacity: 0.25,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 3 },
  elevation: 5,
},
modalButtonText: {
  fontWeight: '600',
  fontSize: 16,
  textAlign: 'center',
},

});

export default HomeScreen;
