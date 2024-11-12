import React, { useEffect, useState } from 'react';
import { FlatList, Image, Text, ScrollView, View, ActivityIndicator, TextInput, Switch, TouchableOpacity, StyleSheet, Button } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';

export default function HomeScreen() {
  const [imoveis, setImoveis] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const limit = 50; // Número de itens por requisição
  const [tipoImovel, setTipoImovel] = useState('');
  const [precoMin, setPrecoMin] = useState('');
  const [precoMax, setPrecoMax] = useState('');
  const [areaMin, setAreaMin] = useState('');
  const [areaMax, setAreaMax] = useState('');
  const [escola, setEscola] = useState(false);
  const [metro, setMetro] = useState(false);
  const [churrasqueira, setChurrasqueira] = useState(false);
  const [piscina, setPiscina] = useState(false);
  const [mobiliado, setMobiliado] = useState(false);
  const buscarImoveis = async () => {
    const query = new URLSearchParams(filtros).toString();
    const response = await fetch(`http://127.0.0.1:8000/imoveis?${query}`);
    const dados = await response.json();
    return dados.resultados;
  };
  
  // Usando os filtros coletados da sidebar
  const filtros = {
    tipo: 'CASA',
  };
  
  buscarImoveis(filtros).then((dados) => {
    console.log(dados);
  });
  

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
    <View style={ styles.main }>
      <View style={styles.sidebar}>
      <View style={styles.header}>
        <Text style={styles.title}>Comprar</Text>
        <Text style={styles.title}>Alugar</Text>
      </View>

      {/* Tipo de Imóvel */}
      <Text style={styles.label}>Tipo de imóvel</Text>
      <Picker
        selectedValue={tipoImovel}
        onValueChange={(itemValue) => setTipoImovel(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Casa" value="casa" />
        <Picker.Item label="Apartamento" value="apartamento" />
        <Picker.Item label="Comercial" value="comercial" />
      </Picker>

      {/* Preço */}
      <Text style={styles.label}>Preço</Text>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="Mínimo"
          keyboardType="numeric"
          value={precoMin}
          onChangeText={setPrecoMin}
        />
        <TextInput
          style={styles.input}
          placeholder="Máximo"
          keyboardType="numeric"
          value={precoMax}
          onChangeText={setPrecoMax}
        />
      </View>

      {/* Área do Imóvel */}
      <Text style={styles.label}>Área do imóvel</Text>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="Mínimo (m²)"
          keyboardType="numeric"
          value={areaMin}
          onChangeText={setAreaMin}
        />
        <TextInput
          style={styles.input}
          placeholder="Máximo (m²)"
          keyboardType="numeric"
          value={areaMax}
          onChangeText={setAreaMax}
        />
      </View>

      {/* Filtros */}
      <View style={styles.filterRow}>
        <Text>Próximo a escolas</Text>
        <Switch value={escola} onValueChange={setEscola} />
      </View>
      <View style={styles.filterRow}>
        <Text>Próximo ao metrô</Text>
        <Switch value={metro} onValueChange={setMetro} />
      </View>
      <View style={styles.filterRow}>
        <Text>Churrasqueira</Text>
        <Switch value={churrasqueira} onValueChange={setChurrasqueira} />
      </View>
      <View style={styles.filterRow}>
        <Text>Piscina</Text>
        <Switch value={piscina} onValueChange={setPiscina} />
      </View>
      <View style={styles.filterRow}>
        <Text>Mobiliado</Text>
        <Switch value={mobiliado} onValueChange={setMobiliado} />
      </View>
      <View>
        <Button title="Buscar" onPress={() => {buscarImoveis(filtros)}}/>
      </View>
    </View>
      <FlatList
        data={imoveis}
        style={styles.imoveisLista}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ padding: 10 }}>
            <Image source={{ uri: item.imagem }} style={{ width: 200, height: 200 }} />
            <Text>{item.nome}</Text>
            <Text>{item.bairro}</Text>
            <Text>{item.descricao}</Text>
            <Text>{item.tipo}</Text>
            <Text>{item.finalidade}</Text>
            <Text>{item.status}</Text>
            <Text>{item.area_terreno}</Text>
            <Text>{item.area_construida}</Text>
            <Text>{item.valor_aluguel}</Text>
            <Text>{item.valor_venda}</Text>
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

const styles = StyleSheet.create({
  main: {
    display: 'flex',
    flexDirection: 'row',
    flex: '1',
  },
  imoveisLista: {
  },
  sidebar: {
    padding: 20,
    backgroundColor: '#fff',
    width: 300,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  label: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: 'bold',
  },
  picker: {
    height: 40,
    backgroundColor: '#f0f0f0',
    marginVertical: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  input: {
    width: '48%',
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
});