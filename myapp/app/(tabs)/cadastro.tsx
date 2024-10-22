import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import axios from 'axios';

const CadastroUsuario = () => {
    const [usuario, setUsuario] = useState({
        nome: '',
        idade: '',
    });
    const [mensagem, setMensagem] = useState('');
    const handleChange = (name: string, value: string) => {
        setUsuario({ ...usuario, [name]: value });
    };
      const handleSubmit = async () => {
        try {
          const response = await axios.post('http://127.0.0.1:8000/usuarios/', usuario);
          console.log(response.data);
          setMensagem('Usuário cadastrado com sucesso!');
        } catch (error) {
          console.error('Erro ao cadastrar usuário:', error);
          setMensagem('Erro ao cadastrar o usuário. Tente novamente.');
        }
      };

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Cadastro de Usuário</Text>
           <TextInput
          style={styles.input}
          placeholder="Nome"
          value={usuario.nome}
          onChangeText={(value) => handleChange('nome', value)}
        />
           <TextInput
          style={styles.input}
          placeholder="Idade"
          keyboardType="numeric"
          value={usuario.idade}
          onChangeText={(value) => handleChange('idade', value)}
        />
        <Button title="Cadastrar" onPress={handleSubmit} />
        {mensagem ? <Text style={styles.mensagem}>{mensagem}</Text> : null}
      </View>
    )
};
    
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 20,
        paddingHorizontal: 10,
        borderRadius: 5,
        backgroundColor: '#fff',
    },
    mensagem: {
        marginTop: 20,
        textAlign: 'center',
        fontSize: 16,
        color: 'green', // Mensagem de sucesso será verde
    },
});

export default CadastroUsuario;