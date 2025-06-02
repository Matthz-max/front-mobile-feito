import React, { useState, useContext, useRef, useEffect } from 'react';
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
import { getCarImage, saveOrUpdateCar } from '../services/api';
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
  const [editingCarId, setEditingCarId] = useState(null); // Guarda o id do carro para update

  // Buscar imagem e salvar carro simples (ao buscar)
  const handleSearch = async () => {
    if (!carName.trim()) return;

    try {
      const image = await getCarImage(carName);
      setCarImage(image);

      if (image) {
        // Salva no backend - apenas novo (sem id)
        const carData = {
          nome: carName,
          imagem: image,
          descricao: '',
          rating: null,
          isFavorite: isFavorite(carName),
        };
        const savedCar = await saveOrUpdateCar(carData);
        // Atualiza id para o carro salvo
        setEditingCarId(savedCar.id);
      }
    } catch (error) {
      console.error('Erro ao buscar e salvar carro:', error);
    }
  };

  // Abrir modal para editar favoritos
  const handleFavoritePress = () => {
    if (!carName) return;

    if (isFavorite(carName)) {
      // Pega os dados do favorito atual para preencher modal
      const fav = favorites.find((f) => f.carName === carName);
      setFavoriteDescription(fav?.description || '');
      setFavoriteRating(fav?.rating?.toString() || '');
      setEditingCarId(fav?.id || null); // Pega o id para usar no PUT
      setCarImage(fav?.carImage || carImage);
    } else {
      // Novo favorito, limpa campos
      setFavoriteDescription('');
      setFavoriteRating('');
      setEditingCarId(null);
    }
    setModalVisible(true);
  };

  // Salvar favorito com dados detalhados e atualizar contexto
  const saveFavorite = async () => {
    const ratingNumber = parseInt(favoriteRating);
    if (!carName) return;

    const carData = {
      id: editingCarId, // importante para o backend entender que é update
      nome: carName,
      imagem: carImage,
      descricao: favoriteDescription || '',
      rating: isNaN(ratingNumber) ? null : ratingNumber,
      isFavorite: true,
    };

    try {
      // Se tiver id faz PUT, senão POST
      const savedCar = await saveOrUpdateCar(carData);

      // Atualiza o contexto favoritos local
      if (isFavorite(carName)) {
        removeFavorite(carName);
      }
      addFavorite({
        id: savedCar.id,
        carName,
        carImage: savedCar.imagem,
        description: savedCar.descricao,
        rating: savedCar.rating,
      });

      // Atualiza o id local para futuros updates
      setEditingCarId(savedCar.id);

      setModalVisible(false);
    } catch (error) {
      console.error('Erro ao salvar carro no backend:', error);
    }
  };

  // Animação menu
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
        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
              borderColor: colors.primary,
              backgroundColor: isDark ? '#2a2a2a' : '#f0f0f0',
              shadowColor: colors.shadow,
              shadowOpacity: 0.15,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 4 },
              elevation: 5,
              fontSize: 18,
              fontWeight: '600',
              paddingHorizontal: 20,
              paddingVertical: 14,
              borderRadius: 20,
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

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.cardBackground || colors.background }]}>
            <ScrollView
              contentContainerStyle={styles.modalScrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
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
                      else addFavorite({ id: editingCarId, carName, carImage, description: favoriteDescription, rating: parseInt(favoriteRating) || 0 });
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
    padding: 20,
    paddingTop: 10,
  },
  input: {
    marginBottom: 20,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 30,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  carCard: {
    marginTop: 10,
    marginBottom: 30,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: '#000000bb',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 18,
    maxHeight: height * 0.85,
    overflow: 'hidden',
  },
  modalScrollContent: {
    padding: 20,
  },
  modalImageContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  modalImage: {
    width: 280,
    height: 160,
    borderRadius: 12,
  },
  modalBody: {
    marginTop: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  modalInput: {
    borderWidth: 1.4,
    padding: 10,
    borderRadius: 10,
    marginBottom: 18,
    fontSize: 16,
    fontWeight: '500',
  },
  favoriteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 25,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 7,
  },
  modalButtonText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  menuOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  menu: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 200,
    height: '100%',
    padding: 20,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
});

export default HomeScreen;
