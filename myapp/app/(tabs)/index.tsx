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
  const [filtros, setFiltros] = useState({
    finalidade: '',
    tipo: '',
    bairro: '',
    area_t_min: '', // Filtro local
    area_t_max: '', // Filtro local
    area_c_min: '', // Filtro local
    area_c_max: '', // Filtro local
    valor_p_min: '', // Filtro local
    valor_p_max: '', // Filtro local
    valor_l_min: '', // Filtro local
    valor_l_max: '', // Filtro local
});

const fetchImoveis = async () => {
  if (isLoading || !hasMore) return;

  setIsLoading(true);
  try {
    // Separe os filtros locais
    const { area_t_max, area_t_min, area_c_max, area_c_min, valor_p_max, valor_p_min, valor_l_max, valor_l_min, ...backendFiltros } = filtros;

    // Faça a requisição ao backend com os filtros relevantes
    const response = await axios.get('http://127.0.0.1:8000/imoveis', {
      params: {
        ...backendFiltros,
        offset,
        limit,
      },
    });

    let novosImoveis = response.data;

    // Filtro local de área
    if (area_t_min) {
      novosImoveis = novosImoveis.filter(
        (imovel) => parseFloat(imovel.area_terreno) >= parseFloat(area_t_min)
      );
    }
    if (area_t_max) {
      novosImoveis = novosImoveis.filter(
        (imovel) => parseFloat(imovel.area_terreno) <= parseFloat(area_t_max)
      );
    }
    if (area_c_min) {
      novosImoveis = novosImoveis.filter(
        (imovel) => parseFloat(imovel.area_construida) >= parseFloat(area_c_min)
      );
    }
    if (area_c_max) {
      novosImoveis = novosImoveis.filter(
        (imovel) => parseFloat(imovel.area_construida) <= parseFloat(area_c_max)
      );
    }
    if (valor_p_min) {
      novosImoveis = novosImoveis.filter(
        (imovel) => parseFloat(imovel.valor_venda) >= parseFloat(valor_p_min)
      );
    }
    if (valor_p_max) {
      novosImoveis = novosImoveis.filter(
        (imovel) => parseFloat(imovel.valor_venda) <= parseFloat(valor_p_max)
      );
    }
    if (valor_l_min) {
      novosImoveis = novosImoveis.filter(
        (imovel) => parseFloat(imovel.valor_aluguel) >= parseFloat(valor_l_min)
      );
    }
    if (valor_l_max) {
      novosImoveis = novosImoveis.filter(
        (imovel) => parseFloat(imovel.valor_aluguel) <= parseFloat(valor_l_max)
      );
    }

    // Requisição
    if (novosImoveis.length > 0) {
      setImoveis((prevImoveis) => [...prevImoveis, ...novosImoveis]);
      setOffset(offset + limit);
    } else {
      setHasMore(false); // Marca o fim dos dados
    }
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
  }
  setIsLoading(false);
};

useEffect(() => {
  if (offset === 0) {
    fetchImoveis(); // Apenas busca dados após os estados serem resetados
  }
}, [offset, filtros]); // Monitora mudanças em `offset` e `filtros`

const loadMoreItems = () => {
  if (hasMore && !isLoading) {
    fetchImoveis(); // Chama novamente a API para carregar mais itens
  }
};

const favoritarImovel = async (imovel) => {
  try {
    await axios.post('http://127.0.0.1:8000/favoritos', imovel);
    alert('Imóvel favoritado com sucesso!');
  } catch (error) {
    console.error('Erro ao favoritar imóvel:', error);
    alert('Erro ao favoritar o imóvel.');
  }
};


  return (
    <View style={ styles.main }>
      <View style={styles.sidebar}>
      <View style={styles.header}>
        <Text style={styles.title}>Filtros</Text>
      </View>

      {/* Tipo de Imóvel */}
      <Text style={styles.label}>Tipo de imóvel</Text>
      <Picker
        selectedValue={filtros.tipo}
        onValueChange={(text) => setFiltros({ ...filtros, tipo: text })}
        style={styles.picker}
      >
        <Picker.Item label="Selecione o tipo de imóvel..." value="" />
        <Picker.Item label="Casa" value="casa" />
        <Picker.Item label="Apartamento" value="apartamento" />
        <Picker.Item label="Sala" value="sala" />
        <Picker.Item label="Barracão" value="barracao" />
        <Picker.Item label="Chácara" value="chácara" />
        <Picker.Item label="Terreno" value="terreno" />
        <Picker.Item label="Rancho" value="rancho" />
      </Picker>

      {/* Finalidade de Imóvel */}
      <Text style={styles.label}>Finalidade do imóvel</Text>
      <Picker
        selectedValue={filtros.finalidade}
        onValueChange={(text) => setFiltros({ ...filtros, finalidade: text })}
        style={styles.picker}
      >
        <Picker.Item label="Selecione a finalidade do imóvel..." value="" />
        <Picker.Item label="Venda" value="venda" />
        <Picker.Item label="Locação" value="locacao" />
        <Picker.Item label="Temporada" value="temporada" />
      </Picker>

      {/* Preço de venda */}
      <Text style={styles.label}>Preço de compra</Text>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="Mínimo"
          keyboardType="numeric"
          value={filtros.valor_p_min}
          onChangeText={(text) => setFiltros({ ...filtros, valor_p_min: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Máximo"
          keyboardType="numeric"
          value={filtros.valor_p_max}
          onChangeText={(text) => setFiltros({ ...filtros, valor_p_max: text })}
        />
      </View>

      {/* Preço de aluguel */}
      <Text style={styles.label}>Valor de aluguel</Text>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="Mínimo"
          keyboardType="numeric"
          value={filtros.valor_l_min}
          onChangeText={(text) => setFiltros({ ...filtros, valor_l_min: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Máximo"
          keyboardType="numeric"
          value={filtros.valor_l_max}
          onChangeText={(text) => setFiltros({ ...filtros, valor_l_max: text })}
        />
      </View>

      {/* Área do Imóvel */}
      <Text style={styles.label}>Área do imóvel</Text>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="Mínimo (m²)"
          keyboardType="numeric"
          value={filtros.area_c_min}
          onChangeText={(text) => setFiltros({ ...filtros, area_c_min: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Máximo (m²)"
          keyboardType="numeric"
          value={filtros.area_c_max}
          onChangeText={(text) => setFiltros({ ...filtros, area_c_max: text })}
        />
      </View>

      {/* Área do Terreno */}
      <Text style={styles.label}>Área do terreno</Text>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="Mínimo (m²)"
          keyboardType="numeric"
          value={filtros.area_t_min}
          onChangeText={(text) => setFiltros({ ...filtros, area_t_min: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Máximo (m²)"
          keyboardType="numeric"
          value={filtros.area_t_max}
          onChangeText={(text) => setFiltros({ ...filtros, area_t_max: text })}
        />
      </View>


      <View style={styles.btnAplicar}>
        <Button
          title="Aplicar filtro"
          onPress={() => {
            setImoveis([]);   // Reseta os imóveis
            setOffset(0);     // Reseta o offset
            setHasMore(true); // Permite carregar mais
            setFiltros((prev) => ({ ...prev })); // Atualiza os filtros para forçar o useEffect
          }}
        />
      </View>
    </View>
      <FlatList
        data={imoveis}
        style={styles.imoveisLista}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.divImovel}>
            <View>
              <Image source={require('@/assets/images/home.jpg')} style={{ width: 200, height: 200 }} />
            </View>
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
              <Text><b>Valor de venda</b> R${item.valor_venda}</Text>
              {/* Botão de Favoritar */}
              <TouchableOpacity
                style={styles.favoritarBtn}
                onPress={() => favoritarImovel(item)}
              >
                <Text style={styles.favoritarText}>Favoritar</Text>
              </TouchableOpacity>
            </View>
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
    fontSize: 22,
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
  btnAplicar: {
    marginTop: 20,
  },
  divImovel: {
    padding: 10,
    display: "flex",
    flexDirection: "row",
    gap: 16,
  },
  favoritarBtn: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 5,
    alignItems: 'center',
  },
  favoritarText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});