import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useCart } from './CartContext';

export default function FamilyScreen({ navigation }) {
  const { cartItems, calcularTotal, esvaziarCarrinho } = useCart();
  
  const subtotal = calcularTotal();
  const taxaEntrega = 5.00; // Taxa de entrega fixa simulada
  const totalGeral = subtotal + taxaEntrega;

  const handleAprovar = () => {
    Alert.alert(
      'Aprovado com Sucesso',
      'Sua mãe será notificada de que a compra foi aprovada e está a caminho!',
      [
        {
          text: 'Ok',
          onPress: () => {
            esvaziarCarrinho();
            navigation.navigate('Home');
          }
        }
      ]
    );
  };

  const handlePagarPix = () => {
    Alert.alert(
      'Pagamento PIX',
      'Simulação de pagamento PIX pelo familiar concluída!',
      [
        {
          text: 'Ok',
          onPress: () => {
            esvaziarCarrinho();
            navigation.navigate('Home');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <Text style={styles.title}>Lista da Dona Maria (Sua Mãe)</Text>
          <Text style={styles.subtitle}>
            Confira a lista de produtos que ela montou e aprove a compra.
          </Text>
        </View>

        <View style={styles.cartCard}>
          <Text style={styles.sectionTitle}>Itens Selecionados:</Text>
          
          {cartItems.length === 0 ? (
            <Text style={styles.emptyText}>Nenhum item na lista.</Text>
          ) : (
            cartItems.map((item, index) => (
              <View key={`${item.id}-${index}`} style={styles.itemRow}>
                <Text style={styles.itemEmoji}>{item.emoji}</Text>
                <Text style={styles.itemName}>{item.title}</Text>
                <Text style={styles.itemPrice}>R$ {item.preco.toFixed(2).replace('.', ',')}</Text>
              </View>
            ))
          )}

          <View style={styles.divisor} />
          
          <View style={styles.resumoLinha}>
            <Text style={styles.resumoLabel}>Subtotal:</Text>
            <Text style={styles.resumoValor}>R$ {subtotal.toFixed(2).replace('.', ',')}</Text>
          </View>
          <View style={styles.resumoLinha}>
            <Text style={styles.resumoLabel}>Entrega:</Text>
            <Text style={styles.resumoValor}>R$ {taxaEntrega.toFixed(2).replace('.', ',')}</Text>
          </View>
          
          <View style={styles.divisor} />
          
          <View style={styles.resumoLinha}>
            <Text style={styles.totalLabel}>Total da Compra:</Text>
            <Text style={styles.totalValor}>R$ {totalGeral.toFixed(2).replace('.', ',')}</Text>
          </View>
        </View>

      </ScrollView>

      {cartItems.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.approveButton}
            onPress={handleAprovar}
          >
            <Text style={styles.approveButtonText}>✅ Aprovar Lista</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.pixButton}
            onPress={handlePagarPix}
          >
            <Text style={styles.pixButtonText}>📱 Pagar Agora (PIX)</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5', // Cinza claro mais moderno e limpo
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    marginTop: 10,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  cartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
    fontStyle: 'italic',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  itemName: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  divisor: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 16,
  },
  resumoLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  resumoLabel: {
    fontSize: 16,
    color: '#666666',
  },
  resumoValor: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  totalValor: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0056B3', // Destaque na cor da marca
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    flexDirection: 'column',
    gap: 12, // Espaçamento entre os botões
  },
  approveButton: {
    backgroundColor: '#F0F2F5', // Botão secundário
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  approveButtonText: {
    color: '#333333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pixButton: {
    backgroundColor: '#32CD32', // Verde chamativo para pagamento
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  pixButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
