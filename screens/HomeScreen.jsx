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
import { getCarImage, saveCar, saveOrUpdateCar } from '../services/api';
import { ThemeContext } from '../contexts/ThemeContext';
import { FavoritesContext } from '../contexts/FavoritesContext';
import Header from '../components/Header';
import { Ionicons } from '@expo/vector-icons';

const { height } = Dimensions.get('window');

const HomeScreen = () => {
  const [carName, setCarName] = useState('');
  const [carImage, setCarImage] = useState(null);
  const { colors, isDark, toggleTheme } = useContext(ThemeContext);
  const { favorites, addFavorite, removeFavorite, isFavorite, updateFavorite } = useContext(FavoritesContext);

  const [menuVisible, setMenuVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(200)).current;

  const [modalVisible, setModalVisible] = useState(false);
  const [favoriteDescription, setFavoriteDescription] = useState('');
  const [favoriteRating, setFavoriteRating] = useState('');
  const [editingCarId, setEditingCarId] = useState(null); // Guarda o id do carro para update
const handleSearch = async () => {
  console.log('handleSearch: Iniciando busca para carro:', carName);

  if (!carName.trim()) {
    console.warn('handleSearch: Nome do carro vazio, abortando busca');
    return;
  }

  try {
    const image = await getCarImage(carName);
    console.log('handleSearch: URL da imagem obtida:', image);
    setCarImage(image);

    setEditingCarId(null); // **Limpa o ID para indicar que ainda não salvou no backend**

  } catch (error) {
    console.error('handleSearch: Erro ao buscar imagem do carro:', error);
  }
};

  const saveFavorite = async () => {
    console.log('saveFavorite: Salvando favorito para carro:', carName);

    const ratingNumber = parseInt(favoriteRating);
    console.log('saveFavorite: Rating convertido para número:', ratingNumber);

    if (!carName.trim()) {
      console.warn('saveFavorite: Nome do carro vazio, abortando');
      return;
    }

    const carData = {
      id: editingCarId || null,
      nome: carName,
      imagem: carImage,
      descricao: favoriteDescription || '',
      rating: isNaN(ratingNumber) ? null : ratingNumber,
      isFavorite: true,
    };

    console.log('saveFavorite: Dados do carro a salvar ou atualizar:', carData);

    try {
      const savedCar = await saveOrUpdateCar(carData);
      console.log('saveFavorite: Resposta do backend:', savedCar);

      if (isFavorite(carName)) {
        console.log('saveFavorite: Carro já está favoritado, atualizando favorito');
        updateFavorite({
          id: savedCar.id,
          carName,
          carImage: savedCar.imagem,
          description: savedCar.descricao,
          rating: savedCar.rating,
        });
      } else {
        addFavorite({
          id: savedCar.id,
          carName,
          carImage: savedCar.imagem,
          description: savedCar.descricao,
          rating: savedCar.rating,
        });
      }

      setEditingCarId(savedCar.id);
      setModalVisible(false);
    } catch (error) {
      console.error('saveFavorite: Erro ao salvar carro no backend:', error);
    }
  };

  const handleFavoritePress = () => {
    console.log('handleFavoritePress: Abrindo modal de favorito para carro:', carName);

    if (!carName) {
      console.warn('handleFavoritePress: Nome do carro vazio, abortando');
      return;
    }

    if (isFavorite(carName)) {
      const fav = favorites.find((f) => f.carName === carName);
      console.log('handleFavoritePress: Carro é favorito, carregando dados:', fav);

      setFavoriteDescription(fav?.description || '');
      setFavoriteRating(fav?.rating?.toString() || '');
      setEditingCarId(fav?.id || null);
      setCarImage(fav?.carImage || carImage);
    } else {
      console.log('handleFavoritePress: Novo favorito, limpando campos');
      setFavoriteDescription('');
      setFavoriteRating('');
      setEditingCarId(null);
    }

    setModalVisible(true);
    console.log('handleFavoritePress: Modal visível setado para true');
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
                />

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    style={[styles.modalButton, { backgroundColor: '#ccc' }]}
                    activeOpacity={0.7}
                  >
                    <Text style={{ color: '#000' }}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={saveFavorite}
                    style={[styles.modalButton, { backgroundColor: colors.primary }]}
                    activeOpacity={0.7}
                  >
                    <Text style={{ color: colors.buttonText }}>Salvar</Text>
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
              styles.menuContainer,
              {
                backgroundColor: colors.cardBackground || colors.background,
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            <TouchableOpacity onPress={handleToggleTheme} style={styles.menuItem}>
              <Text style={[styles.menuText, { color: colors.text }]}>
                Alternar Tema {isDark ? '(Claro)' : '(Escuro)'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={closeMenu} style={styles.menuItem}>
              <Text style={[styles.menuText, { color: colors.text }]}>Fechar Menu</Text>
            </TouchableOpacity>
          </Animated.View>
        </Pressable>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 60,
  },
  input: {
    marginBottom: 20,
  },
  buttonsContainer: {
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  carCard: {
    marginBottom: 30,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: '#00000099',
  },
  modalContent: {
    maxHeight: height * 0.75,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  modalScrollContent: {
    paddingBottom: 20,
  },
  modalImageContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  modalImage: {
    width: '100%',
    height: 200,
  },
  modalBody: {
    flex: 1,
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
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  favoriteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 20,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  menuOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#00000099',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  menuContainer: {
    width: 200,
    paddingVertical: 20,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: -3, height: 0 },
    elevation: 8,
  },
  menuItem: {
    paddingVertical: 12,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;
