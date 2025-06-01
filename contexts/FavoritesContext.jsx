// src/contexts/FavoritesContext.js
import React, { createContext, useState } from 'react';

export const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);

  const addFavorite = (car) => {
    setFavorites((prev) => [...prev, car]);
  };

  const removeFavorite = (carName) => {
    setFavorites((prev) => prev.filter((f) => f.carName !== carName));
  };

  const isFavorite = (carName) => {
    return favorites.some((f) => f.carName === carName);
  };

  return (
    <FavoritesContext.Provider
      value={{ favorites, addFavorite, removeFavorite, isFavorite }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};
