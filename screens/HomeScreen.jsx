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
} from 'react-native';
import CarCard from '../components/CarCard';
import { getCarImage } from '../services/api';
import { ThemeContext } from '../contexts/ThemeContext';
import Header from '../components/Header';

const HomeScreen = () => {
  const [carName, setCarName] = useState('');
  const [carImage, setCarImage] = useState(null);
  const { colors, isDark, toggleTheme } = useContext(ThemeContext);

  const [menuVisible, setMenuVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(200)).current;

  const handleSearch = async () => {
    if (!carName.trim()) return;
    const image = await getCarImage(carName);
    setCarImage(image);
  };

  const handleFavorite = (fav) => {
    console.log('Favorito mudou:', fav);
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
      <Header onFavorite={handleFavorite} onOpenMenu={openMenu} />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Buscar Carro</Text>

        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
              borderColor: colors.text,
              backgroundColor: isDark ? '#222' : '#f5f5f5',
            },
          ]}
          placeholder="Digite o nome do carro"
          placeholderTextColor={colors.text + '99'}
          value={carName}
          onChangeText={setCarName}
          autoCapitalize="words"
        />

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleSearch}
            activeOpacity={0.8}
          >
            <Text style={[styles.buttonText, { color: colors.text }]}>Buscar</Text>
          </TouchableOpacity>
        </View>

        {carImage && (
          <CarCard
            carName={carName}
            carImage={carImage}
            style={{
              marginTop: 20,
              shadowColor: '#000',
              shadowOpacity: 0.2,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 2 },
              elevation: 5,
            }}
          />
        )}
      </ScrollView>

      {/* Menu deslizante */}
      {menuVisible && (
        <>
          <Pressable style={styles.overlay} onPress={closeMenu} />

          <Animated.View
            style={[
              styles.menuContainer,
              {
                backgroundColor: colors.menuBackground || '#fff',
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleToggleTheme}
              activeOpacity={0.7}
            >
              <Text style={[styles.menuItemText, { color: colors.menuText || '#000' }]}>
                {isDark ? 'Modo Claro' : 'Modo Escuro'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 15,
  },
  title: {
    fontSize: 28,
    marginBottom: 20,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  button: {
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#00000066',
    zIndex: 5,
  },
  menuContainer: {
    position: 'absolute',
    left: 0, right: 0,
    bottom: 0,
    height: 200,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    elevation: 10,
    zIndex: 10,
  },
  menuItem: {
    backgroundColor: '#eee',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;
