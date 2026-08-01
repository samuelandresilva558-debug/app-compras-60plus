import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { escutarPedidoStatus } from './firebaseService';
import { useCart } from './CartContext';

export default function OrderStatusScreen({ route, navigation }) {
  // Recebe o ID do pedido via navegação
  const { pedidoId } = route.params || {};
  const [pedido, setPedido] = useState(null);
  const { removerPedidoDoHistorico } = useCart();

  useEffect(() => {
    if (!pedidoId) return;
    
    // Inicia a escuta em tempo real do pedido no Firebase
    const unsubscribe = escutarPedidoStatus(pedidoId, (dadosAtualizados) => {
      setPedido(dadosAtualizados);
    });

    // Limpa o ouvinte quando sair da tela
    return () => unsubscribe();
  }, [pedidoId]);

  if (!pedido) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Carregando o seu pedido...</Text>
      </SafeAreaView>
    );
  }

  // Define os blocos de status
  const steps = [
    { id: 1, label: 'Pedido Recebido', emoji: '📝' },
    { id: 2, label: 'Separando no Mercado', emoji: '🛒' },
    { id: 3, label: 'A Caminho da Sua Casa', emoji: '🚚' },
    { id: 4, label: 'Entregue com Sucesso!', emoji: '✅' },
  ];

  const currentStatus = pedido.status || 1;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Acompanhe sua Compra</Text>
      </View>

      <View style={styles.statusContainer}>
        {steps.map((step) => {
          const isActive = currentStatus === step.id;
          const isPast = currentStatus > step.id;

          return (
            <View 
              key={step.id} 
              style={[
                styles.stepBlock,
                isActive && styles.stepActive,
                isPast && styles.stepPast,
              ]}
            >
              <Text style={styles.stepEmoji}>{step.emoji}</Text>
              <Text style={[
                styles.stepText,
                isActive && styles.stepTextActive,
                isPast && styles.stepTextPast,
              ]}>
                {step.label}
              </Text>
            </View>
          );
        })}
      </View>

      <TouchableOpacity 
        style={[styles.homeButton, currentStatus === 4 && styles.homeButtonDone]}
        onPress={() => {
          if (currentStatus === 4) {
            removerPedidoDoHistorico(pedidoId);
          }
          navigation.navigate('Home');
        }}
      >
        <Text style={[styles.homeButtonText, currentStatus === 4 && styles.homeButtonTextDone]}>
          {currentStatus === 4 ? "Concluir e Voltar ao Início" : "Voltar para o Início"}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 20,
  },
  loadingText: {
    fontSize: 24,
    textAlign: 'center',
    marginTop: 50,
    color: '#666',
  },
  header: {
    marginTop: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  statusContainer: {
    flex: 1,
    gap: 16,
  },
  stepBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    opacity: 0.5,
  },
  stepActive: {
    borderColor: '#0056B3',
    backgroundColor: '#E6F4FE',
    opacity: 1,
    transform: [{ scale: 1.02 }],
  },
  stepPast: {
    borderColor: '#32CD32',
    backgroundColor: '#F0FDF4',
    opacity: 0.8,
  },
  stepEmoji: {
    fontSize: 40,
    marginRight: 16,
  },
  stepText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#6B7280',
    flex: 1,
  },
  stepTextActive: {
    color: '#0056B3',
    fontWeight: 'bold',
    fontSize: 24,
  },
  stepTextPast: {
    color: '#166534', // Verde escuro
  },
  homeButton: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  homeButtonDone: {
    backgroundColor: '#0056B3',
  },
  homeButtonText: {
    fontSize: 20,
    color: '#374151',
    fontWeight: 'bold',
  },
  homeButtonTextDone: {
    color: '#FFFFFF',
  }
});
