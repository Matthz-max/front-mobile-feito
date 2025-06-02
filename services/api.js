import axios from 'axios';

const API_BASE_URL = 'http://192.168.1.14:8080/cars';

// Buscar imagem (mantém igual)
export const getCarImage = async (carName) => {
  try {
    const response = await axios.get(`https://carimagery.com/api.asmx/GetImageUrl?searchTerm=${carName}`, {
      responseType: 'text'
    });
    const text = response.data;
    const match = text.match(/<string.*?>(.*?)<\/string>/);
    return match ? match[1] : null;
  } catch (error) {
    console.error("Erro ao buscar imagem:", error);
    return null;
  }
};

// Listar todos
export const getAllCars = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/listar`);
    return response.data;
  } catch (error) {
    console.error('Erro ao listar carros:', error);
    throw error;
  }
};

// Salvar novo ou atualizar existente (se id existir, faz PUT, senão POST)
export const saveOrUpdateCar = async (carData) => {
  try {
    if (carData.id) {
      // Atualizar
      const response = await axios.put(`${API_BASE_URL}/atualizar/${carData.id}`, carData);
      return response.data;
    } else {
      // Salvar novo
      const response = await axios.post(`${API_BASE_URL}/salvar`, carData);
      return response.data;
    }
  } catch (error) {
    console.error('Erro ao salvar ou atualizar carro:', error);
    throw error;
  }
};

// Deletar por id
export const deleteCar = async (id) => {
  try {
    await axios.delete(`${API_BASE_URL}/deletar/${id}`);
  } catch (error) {
    console.error('Erro ao deletar carro:', error);
    throw error;
  }
};
