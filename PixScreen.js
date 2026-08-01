import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useCart } from './CartContext';
import { salvarPedido } from './firebaseService';

export default function PixScreen({ navigation }) {
  const [copiado, setCopiado] = useState(false);
  const { cartItems, calcularTotal } = useCart();

  const subtotal = calcularTotal();
  const taxaEntrega = 5.00;
  const totalGeral = subtotal + taxaEntrega;

  const codigoPix = "0002012658BR.GOV.BCB.PIX0114+55119999999995204000053039865802BR5920MERCADO DO SEU JOAO6009SAO PAULO62070503***6304E2D3";

  const handleCopiar = () => {
    // Em um app real, usaríamos Clipboard.setStringAsync(codigoPix)
    setCopiado(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <Text style={styles.title}>Pagamento via PIX</Text>
          <Text style={styles.subtitle}>
            Copie o código abaixo, abra o aplicativo do seu banco e escolha a opção "PIX Copia e Cola".
          </Text>
        </View>

        <View style={styles.codigoContainer}>
          <Text style={styles.codigoText} selectable={true}>
            {codigoPix}
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.copyButton, copiado && styles.copyButtonSuccess]}
          onPress={handleCopiar}
          accessibilityRole="button"
          accessibilityLabel="Copiar Código PIX"
        >
          <Text style={styles.copyButtonText}>
            {copiado ? "✅ Código Copiado!" : "📋 Copiar Código PIX"}
          </Text>
        </TouchableOpacity>

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={async () => {
            const idGravado = await salvarPedido({
              itens: cartItems.map(i => ({ title: i.title || i.name, preco: i.preco || i.price })),
              subtotal,
              taxaEntrega,
              totalGeral,
              metodoPagamento: 'pix',
              data: new Date().toISOString(),
            });
            navigation.navigate('Success', { pedidoId: idGravado });
          }}
          accessibilityRole="button"
          accessibilityLabel="Confirmar Pagamento e Enviar Pedido"
        >
          <Text style={styles.primaryButtonText}>Confirmar Pagamento</Text>
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
  header: {
    marginTop: 10,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 22,
    lineHeight: 32,
    color: '#333333',
  },
  codigoContainer: {
    backgroundColor: '#F0F0F0',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#CCCCCC',
    marginBottom: 24,
  },
  codigoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  copyButton: {
    backgroundColor: '#0056B3', // Azul padrão
    paddingVertical: 16,
    borderRadius: 12,
    minHeight: 72,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  copyButtonSuccess: {
    backgroundColor: '#32CD32', // Verde sucesso
  },
  copyButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  footer: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  primaryButton: {
    backgroundColor: '#32CD32', // Verde
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
