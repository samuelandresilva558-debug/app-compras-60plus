import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, Share } from 'react-native';
import { useCart } from './CartContext';
import { salvarPedido } from './firebaseService';
import { falarTexto } from './speechService';

export default function CheckoutScreen({ navigation }) {
  const { cartItems, calcularTotal, esvaziarCarrinho } = useCart();
  const [metodoPagamento, setMetodoPagamento] = useState(null);

  const subtotal = calcularTotal();
  const taxaEntrega = 5.00; // Taxa de entrega fixa simulada para o CEP 13203830
  const totalGeral = subtotal + taxaEntrega;

  const handleOuvirResumo = () => {
    const texto = `Sua lista tem ${cartItems.length} itens. O valor total com a entrega é de ${Math.floor(totalGeral)} reais e ${Math.round((totalGeral - Math.floor(totalGeral)) * 100)} centavos. Por favor, escolha a forma de pagamento abaixo.`;
    falarTexto(texto);
  };

  const handleCompartilhar = async () => {
    try {
      const mensagem = `Oi! Dá uma olhada na minha lista de compras do mercado.\nValor total: R$ ${totalGeral.toFixed(2).replace('.', ',')}.\nVocê pode finalizar para mim?`;
      
      await Share.share({
        message: mensagem,
      });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível compartilhar a lista.');
    }
  };

  const handleFinalizar = async () => {
    if (!metodoPagamento) {
      Alert.alert('Atenção', 'Por favor, selecione uma forma de pagamento antes de finalizar.');
      return;
    }
    
    // Roteamento inteligente baseado no método de pagamento
    if (metodoPagamento === 'pix') {
      navigation.navigate('Pix');
    } else {
      // Dinheiro ou Cartão: salva o pedido no Firebase e vai para o sucesso
      const idGravado = await salvarPedido({
        itens: cartItems.map(i => ({ title: i.title || i.name, preco: i.preco || i.price })),
        subtotal,
        taxaEntrega,
        totalGeral,
        metodoPagamento,
        data: new Date().toISOString(),
      });
      navigation.navigate('Success', { pedidoId: idGravado });
    }
  };

  const OptionButton = ({ label, icon, value }) => (
    <TouchableOpacity 
      style={[styles.paymentOption, metodoPagamento === value && styles.paymentOptionSelected]}
      onPress={() => setMetodoPagamento(value)}
      accessibilityRole="button"
      accessibilityState={{ selected: metodoPagamento === value }}
    >
      <Text style={styles.paymentIcon}>{icon}</Text>
      <Text style={[styles.paymentText, metodoPagamento === value && styles.paymentTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Resumo do Pedido</Text>
          <TouchableOpacity 
            style={styles.speakButton}
            onPress={handleOuvirResumo}
            accessibilityRole="button"
            accessibilityLabel="Ouvir resumo do pedido"
          >
            <Text style={styles.speakIcon}>🔊 Ler</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.resumoCard}>
          <View style={styles.resumoLinha}>
            <Text style={styles.resumoLabel}>Subtotal ({cartItems.length} itens):</Text>
            <Text style={styles.resumoValor}>R$ {subtotal.toFixed(2).replace('.', ',')}</Text>
          </View>
          <View style={styles.resumoLinha}>
            <Text style={styles.resumoLabel}>Taxa de Entrega:</Text>
            <Text style={styles.resumoValor}>R$ {taxaEntrega.toFixed(2).replace('.', ',')}</Text>
          </View>
          <View style={styles.divisor} />
          <View style={styles.resumoLinha}>
            <Text style={styles.resumoTotalLabel}>Total a Pagar:</Text>
            <Text style={styles.resumoTotalValor}>R$ {totalGeral.toFixed(2).replace('.', ',')}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Endereço de Entrega</Text>
        <View style={styles.enderecoCard}>
          <Text style={styles.enderecoEmoji}>📍</Text>
          <Text style={styles.enderecoText}>Entregar no seu endereço cadastrado (CEP: 13203-830)</Text>
        </View>

        <Text style={styles.sectionTitle}>Forma de Pagamento</Text>
        <OptionButton label="Dinheiro (Pagar na entrega)" icon="💵" value="dinheiro" />
        <OptionButton label="Cartão na Maquininha" icon="💳" value="cartao" />
        <OptionButton label="PIX" icon="📱" value="pix" />

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.shareButton}
          onPress={handleCompartilhar}
          accessibilityRole="button"
          accessibilityLabel="Compartilhar Lista com Familiar"
        >
          <Text style={styles.shareButtonText}>👨‍👩‍👧 Compartilhar Lista (WhatsApp)</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.finalizarButton}
          onPress={handleFinalizar}
          accessibilityRole="button"
          accessibilityLabel="Finalizar e Enviar Pedido"
        >
          <Text style={styles.finalizarButtonText}>Finalizar e Enviar Pedido</Text>
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
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  speakButton: {
    backgroundColor: '#FFFBEA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FBBF24',
  },
  speakIcon: {
    fontSize: 16,
    color: '#B45309',
    fontWeight: 'bold',
  },
  resumoCard: {
    backgroundColor: '#F9F9F9',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    marginBottom: 24,
  },
  resumoLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  resumoLabel: {
    fontSize: 20,
    color: '#666666',
  },
  resumoValor: {
    fontSize: 20,
    color: '#333333',
    fontWeight: '600',
  },
  divisor: {
    height: 1,
    backgroundColor: '#DDDDDD',
    marginVertical: 12,
  },
  resumoTotalLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  resumoTotalValor: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0056B3',
  },
  enderecoCard: {
    flexDirection: 'row',
    backgroundColor: '#E6F4FE',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#0056B3',
  },
  enderecoEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  enderecoText: {
    flex: 1,
    fontSize: 20,
    color: '#0056B3',
    fontWeight: '600',
    lineHeight: 28,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    minHeight: 80, // Botão muito grande
    borderWidth: 3,
    borderColor: 'transparent',
  },
  paymentOptionSelected: {
    backgroundColor: '#E6F4FE',
    borderColor: '#0056B3',
  },
  paymentIcon: {
    fontSize: 36,
    marginRight: 16,
  },
  paymentText: {
    fontSize: 22,
    color: '#333333',
    fontWeight: '600',
  },
  paymentTextSelected: {
    color: '#0056B3',
  },
  footer: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  shareButton: {
    backgroundColor: '#F0F2F5', // Cinza clarinho
    paddingVertical: 16,
    borderRadius: 12,
    minHeight: 72,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  shareButtonText: {
    color: '#333333',
    fontSize: 20,
    fontWeight: 'bold',
  },
  finalizarButton: {
    backgroundColor: '#32CD32', // Verde
    paddingVertical: 16,
    borderRadius: 12,
    minHeight: 72,
    justifyContent: 'center',
    alignItems: 'center',
  },
  finalizarButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  }
});
