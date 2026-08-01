import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useCart } from './CartContext';

export default function SuccessScreen({ route, navigation }) {
  const { cartItems, esvaziarCarrinho, adicionarPedidoAoHistorico } = useCart();
  const { pedidoId } = route.params || {};

  useEffect(() => {
    if (pedidoId) {
      adicionarPedidoAoHistorico(pedidoId);
    }
  }, [pedidoId]);

  const handleVoltar = () => {
    esvaziarCarrinho(); // Limpa a sacola para a próxima compra
    navigation.navigate('Home'); // Retorna para a tela principal
  };

  const handleAcompanhar = () => {
    esvaziarCarrinho();
    navigation.navigate('OrderStatus', { pedidoId });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        <Text style={styles.icon}>✅</Text>
        
        <Text style={styles.title}>Pedido Realizado com Sucesso!</Text>
        
        <Text style={styles.subtitle}>
          O seu pedido foi enviado para o mercado e será entregue em breve na sua residência.
        </Text>

      </View>

      <View style={styles.footer}>
        {pedidoId && (
          <TouchableOpacity 
            style={styles.trackButton}
            onPress={handleAcompanhar}
            accessibilityRole="button"
            accessibilityLabel="Acompanhar Meu Pedido"
          >
            <Text style={styles.trackButtonText}>📍 Acompanhar Meu Pedido</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={handleVoltar}
          accessibilityRole="button"
          accessibilityLabel="Voltar ao Início"
        >
          <Text style={styles.primaryButtonText}>Voltar ao Início</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 100, // Ícone gigante
    marginBottom: 32,
  },
  title: {
    fontSize: 32, // Letra gigante (28sp+)
    fontWeight: 'bold',
    color: '#32CD32', // Verde sucesso
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 22,
    lineHeight: 32,
    color: '#4A4A4A',
    textAlign: 'center',
  },
  footer: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  trackButton: {
    backgroundColor: '#E6F4FE',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#0056B3',
  },
  trackButtonText: {
    color: '#0056B3',
    fontSize: 20,
    fontWeight: 'bold',
  },
  primaryButton: {
    backgroundColor: '#0056B3', // Azul padrão para retornar
    paddingVertical: 16,
    borderRadius: 12,
    minHeight: 72,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  }
});
