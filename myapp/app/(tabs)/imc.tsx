import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

const IMCCalculator = () => {
  const [weight, setWeight] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [result, setResult] = useState<string | null>(null);
  const [nome, setNome] = useState<string>('');

  const calculateIMC = () => {
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);

    if (!isNaN(weightNum) && !isNaN(heightNum) && heightNum > 0) {
      const imc = weightNum / (heightNum * heightNum);
      setResult(imc.toFixed(2));
    } else {
      setResult('Por favor, insira valores válidos.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calculadora de IMC</Text>

      {nome ? (
        <Text style={styles.result}>{nome}</Text>
      ) : (
        <Text style={styles.result}></Text>
      )}

      <TextInput
        style={styles.input}
        placeholder="Nome"
        value={nome}
        onChangeText={setNome}
      />

      <TextInput
        style={styles.input}
        placeholder="Peso (kg)"
        keyboardType="numeric"
        value={weight}
        onChangeText={setWeight}
      />

      <TextInput
        style={styles.input}
        placeholder="Altura (m)"
        keyboardType="numeric"
        value={height}
        onChangeText={setHeight}
      />

      <Button title="Calcular" onPress={calculateIMC} />

      {result && (
        <Text style={styles.result}>
          {isNaN(parseFloat(result))
            ? result
            : `Seu IMC é: ${result} (${getIMCClassification(parseFloat(result))})`}
        </Text>
      )}
    </View>
  );
};

const getIMCClassification = (imc: number) => {
  if (imc < 18.5) return 'baixo peso';
  if (imc >= 18.5 && imc < 25) return 'peso adequado';
  if (imc >= 25 && imc < 30) return 'sobrepeso';
  return 'obesidade';
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    justifyContent: 'center',
    padding: 50,
    backgroundColor: '#fff',
    height: '100vh',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    width: '30vw',
  },
  result: {
    fontSize: 18,
    textAlign: 'left',
    marginTop: 20,
  },
});

export default IMCCalculator;