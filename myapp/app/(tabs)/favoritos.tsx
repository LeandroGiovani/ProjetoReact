import React, { useEffect, useState, useCallback } from 'react';
import { FlatList, Image, Text, View, ActivityIndicator, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';

export default function FavScreen() {
  const [imoveis, setImoveis] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [removendoId, setRemovendoId] = useState(null); // ID do item em remoção

  const fetchImoveis = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://127.0.0.1:8000/favoritos');
      setImoveis(response.data);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
    setIsLoading(false);
  };

  const removerFavorito = async (id) => {
    setRemovendoId(id); // Indica que estamos removendo este item
    try {
      console.log(`Tentando remover o favorito com ID: ${id}`);
      const response = await axios.delete(`http://127.0.0.1:8000/favoritos/${id}`);
      
      if (response.status === 200) {
        console.log(`Favorito com ID ${id} removido com sucesso.`);
        setImoveis((prevImoveis) => prevImoveis.filter((imovel) => imovel.id !== id));
        Alert.alert('Sucesso', 'Imóvel removido dos favoritos!');
      } else {
        console.error(`Erro ao remover favorito com ID ${id}. Status: ${response.status}`);
        Alert.alert('Erro', 'Não foi possível remover o favorito.');
      }
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
      Alert.alert('Erro', 'Ocorreu um problema ao tentar remover o favorito.');
    } finally {
      setRemovendoId(null); // Limpa o estado após o processo
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchImoveis();
    }, [])
  );

  return (
    <View style={styles.container}>
        <Text style={styles.tituloFav}>Imóveis favoritados</Text>
        {isLoading ? (
            <ActivityIndicator size="large" color="#0000ff" />
        ) : (
        <FlatList
          data={imoveis}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.divImovel}>
              <Image source={require('@/assets/images/home.jpg')} style={styles.imagem} />
              <View>
                <Text><b>Nome:</b> {item.nome}</Text>
                <Text><b>Bairro:</b> {item.bairro}</Text>
                <Text><b>Descrição:</b> {item.descricao}</Text>
                <Text><b>Tipo:</b> {item.tipo}</Text>
                <Text><b>Finalidade:</b> {item.finalidade}</Text>
                <Text><b>Status:</b> {item.status}</Text>
                <Text><b>Área do terreno:</b> {item.area_terreno}m²</Text>
                <Text><b>Área construída:</b> {item.area_construida}m²</Text>
                <Text><b>Valor aluguel:</b> R${item.valor_aluguel}</Text>
                <Text><b>Valor de venda:</b> R${item.valor_venda}</Text>
                <TouchableOpacity
                  style={[styles.btnRemover, removendoId === item.id && styles.btnRemovendo]}
                  onPress={() => removerFavorito(item.id)}
                  disabled={removendoId === item.id} // Desabilita se já estiver em processo
                >
                  <Text style={styles.btnRemoverText}>
                    {removendoId === item.id ? 'Removendo...' : 'Remover dos Favoritos'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  divImovel: {
    flexDirection: 'row',
    marginBottom: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  imagem: {
    width: 100,
    height: 100,
    marginRight: 16,
  },
  btnRemover: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#ff4d4d',
    borderRadius: 5,
  },
  btnRemovendo: {
    backgroundColor: '#ff9999', // Cor diferente durante a remoção
  },
  btnRemoverText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tituloFav: {
    fontSize: 32,
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 16,
  },
});