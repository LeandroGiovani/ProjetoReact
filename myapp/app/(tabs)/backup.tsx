import React, { useEffect, useState } from 'react';
import { FlatList, Image, Text, View, ActivityIndicator } from 'react-native';
import axios from 'axios';

export default function HomeScreen() {
  const [imoveis, setImoveis] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const limit = 50; // Número de itens por requisição

  const fetchImoveis = async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const response = await axios.get(`http://127.0.0.1:8000/imoveis?offset=${offset}&limit=${limit}`);
      if (response.data.length > 0) {
        setImoveis((prevImoveis) => [...prevImoveis, ...response.data]);
        setOffset(offset + limit);
      } else {
        setHasMore(false); // Marca o fim dos dados
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchImoveis(); // Carrega os primeiros dados
  }, []);

  const loadMoreItems = () => {
    if (hasMore && !isLoading) {
      fetchImoveis(); // Chama novamente a API para carregar mais itens
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={imoveis}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ padding: 10 }}>
            <Image source={{ uri: item.imagem }} style={{ width: 200, height: 200 }} />
            <Text>{item.nome}</Text>
          </View>
        )}
        onEndReached={loadMoreItems}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isLoading ? <ActivityIndicator size="large" color="#0000ff" /> : null
        }
      />
    </View>
  );
}