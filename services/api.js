export const getCarImage = async (carName) => {
  try {
    const response = await fetch(`https://carimagery.com/api.asmx/GetImageUrl?searchTerm=${carName}`);
    const text = await response.text();

    // Extrair a URL do XML
    const match = text.match(/<string.*?>(.*?)<\/string>/);
    const imageUrl = match ? match[1] : null;

    return imageUrl;
  } catch (error) {
    console.error("Erro ao buscar imagem:", error);
    return null;
  }
};
