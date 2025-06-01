import React, { useContext } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../contexts/ThemeContext';

const Header = ({ onOpenMenu, onFavorite }) => {
  const { colors } = useContext(ThemeContext);

  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
      <TouchableOpacity onPress={onOpenMenu} style={styles.menuButton}>
        <Ionicons name="menu" size={28} color={colors.text} />
      </TouchableOpacity>

      {/* Pode manter logo ou título aqui */}

      <TouchableOpacity onPress={() => onFavorite(true)} style={styles.favoriteButton}>
        <Ionicons name="heart-outline" size={28} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuButton: {
    padding: 5,
  },
  favoriteButton: {
    padding: 5,
  },
});

export default Header;
