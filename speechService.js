import * as Speech from 'expo-speech';

// Função base para falar qualquer texto com configurações otimizadas para idosos
export const falarTexto = (texto) => {
  // Sempre interrompe a fala anterior antes de começar uma nova
  Speech.stop();
  
  Speech.speak(texto, {
    language: 'pt-BR',
    rate: 0.85, // Um pouco mais lento para clareza
    pitch: 1.0,
  });
};

// Função específica para ler as informações de um produto na Home
export const falarProduto = (nome, preco) => {
  // Prepara o preço para a leitura (ex: "4 reais e 50 centavos")
  const precoNumerico = Number(preco);
  const reais = Math.floor(precoNumerico);
  const centavos = Math.round((precoNumerico - reais) * 100);
  
  let textoPreco = `${reais} reais`;
  if (centavos > 0) {
    textoPreco += ` e ${centavos} centavos`;
  } else if (reais === 1) {
    textoPreco = `1 real`; // Ajuste de plural
  }

  const textoFinal = `Produto: ${nome}. Valor: ${textoPreco}.`;
  falarTexto(textoFinal);
};
