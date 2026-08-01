import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, FlatList, Switch, Alert, ScrollView } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { atualizarProdutosLojista, escutarTodosPedidos, atualizarStatusPedido, injetarMercadosTeste } from './firebaseService';

// Mock do Estoque Inicial
const INITIAL_STOCK = [
  { id: 'p1', name: 'Leite Integral Parmalat 1L', title: 'Leite Integral Parmalat 1L', price: 4.50, preco: 4.50, emoji: '🥛', isPromo: false, loja: 'Mercado Perto' },
  { id: 'p2', name: 'Pão de Forma Pullman', title: 'Pão de Forma Pullman', price: 8.90, preco: 8.90, emoji: '🍞', isPromo: true, loja: 'Padaria da Esquina' },
  { id: 'p3', name: 'Maçã Fuji (1kg)', title: 'Maçã Fuji (1kg)', price: 7.20, preco: 7.20, emoji: '🍎', isPromo: false, loja: 'Quitanda do Seu Zé' },
];

export default function AdminScreen() {
  const [activeTab, setActiveTab] = useState('estoque'); // 'estoque' ou 'pedidos'
  
  // Estados do Estoque
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [stock, setStock] = useState(INITIAL_STOCK);

  // Estados dos Pedidos
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    // Começa a escutar todos os pedidos do Firestore quando a tela abrir
    const unsubscribe = escutarTodosPedidos((pedidosAtualizados) => {
      setPedidos(pedidosAtualizados);
    });
    return () => unsubscribe();
  }, []);

  const handleUploadExcel = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        setUploadSuccess(false);
        setIsProcessing(true);
        
        setTimeout(async () => {
          const sucesso = await atualizarProdutosLojista(stock);
          
          setIsProcessing(false);
          setUploadSuccess(true);
          
          if (sucesso) {
            Alert.alert('Sucesso', 'Produtos atualizados na nuvem em tempo real!');
          }
          
          setTimeout(() => setUploadSuccess(false), 5000);
        }, 3000);
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao acessar o arquivo.');
    }
  };

  const handleInjetarMercados = async () => {
    const sucesso = await injetarMercadosTeste();
    if (sucesso) {
      Alert.alert('Sucesso', '3 Mercados de teste foram injetados no Firebase com coordenadas de GPS.');
    }
  };

  const togglePromo = (id) => {
    setStock((prev) => 
      prev.map(item => item.id === id ? { ...item, isPromo: !item.isPromo } : item)
    );
  };

  const renderStockItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.stockInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>R$ {item.price.toFixed(2).replace('.', ',')}</Text>
      </View>
      <View style={styles.stockActions}>
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Promo</Text>
          <Switch
            value={item.isPromo}
            onValueChange={() => togglePromo(item.id)}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={item.isPromo ? '#0056B3' : '#f4f3f4'}
          />
        </View>
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>Editar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const getStatusText = (statusId) => {
    switch(statusId) {
      case 1: return 'Recebido';
      case 2: return 'Em Separação';
      case 3: return 'A Caminho';
      case 4: return 'Entregue';
      default: return 'Desconhecido';
    }
  };

  const renderPedidoItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.pedidoHeader}>
        <Text style={styles.pedidoId}>Pedido: {item.id.slice(-6).toUpperCase()}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{getStatusText(item.status || 1)}</Text>
        </View>
      </View>
      
      <Text style={styles.pedidoTotal}>
        Total: R$ {Number(item.totalGeral || 0).toFixed(2).replace('.', ',')} ({item.metodoPagamento})
      </Text>
      <Text style={styles.pedidoData}>
        Em: {new Date(item.createdAt).toLocaleString()}
      </Text>

      <View style={styles.actionButtonsRow}>
        {(item.status || 1) < 4 && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => atualizarStatusPedido(item.id, (item.status || 1) + 1)}
          >
            <Text style={styles.actionButtonText}>
              {item.status === 1 && "Avançar p/ Separação"}
              {item.status === 2 && "Avançar p/ Entrega"}
              {item.status === 3 && "Concluir Entrega"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Painel do Lojista</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'estoque' && styles.tabActive]}
          onPress={() => setActiveTab('estoque')}
        >
          <Text style={[styles.tabText, activeTab === 'estoque' && styles.tabTextActive]}>Estoque</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'pedidos' && styles.tabActive]}
          onPress={() => setActiveTab('pedidos')}
        >
          <Text style={[styles.tabText, activeTab === 'pedidos' && styles.tabTextActive]}>📦 Pedidos</Text>
        </TouchableOpacity>
      </View>

      {/* Conteúdo Aba Estoque */}
      {activeTab === 'estoque' && (
        <View style={styles.contentArea}>
          <View style={styles.uploadSection}>
            <TouchableOpacity 
              style={styles.uploadButton}
              onPress={handleUploadExcel}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <View style={styles.processingContainer}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.processingText}>Processando IA...</Text>
                </View>
              ) : (
                <Text style={styles.uploadButtonText}>📄 Upload de Planilha</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.injectButton}
              onPress={handleInjetarMercados}
            >
              <Text style={styles.injectButtonText}>🛠️ Injetar Mercados de Teste</Text>
            </TouchableOpacity>

            {uploadSuccess && <Text style={styles.successText}>✅ Atualizado na Nuvem!</Text>}
          </View>
          
          <FlatList
            data={stock}
            keyExtractor={(item) => item.id}
            renderItem={renderStockItem}
            contentContainerStyle={styles.listContainer}
          />
        </View>
      )}

      {/* Conteúdo Aba Pedidos */}
      {activeTab === 'pedidos' && (
        <View style={styles.contentArea}>
          {pedidos.length === 0 ? (
            <Text style={styles.emptyPedidos}>Nenhum pedido recebido ainda.</Text>
          ) : (
            <FlatList
              data={pedidos}
              keyExtractor={(item) => item.id}
              renderItem={renderPedidoItem}
              contentContainerStyle={styles.listContainer}
            />
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#0056B3',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#0056B3',
    fontWeight: 'bold',
  },
  contentArea: {
    flex: 1,
    paddingTop: 16,
  },
  uploadSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  uploadButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  injectButton: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  injectButtonText: {
    color: '#666666',
    fontSize: 14,
    fontWeight: 'bold',
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  processingText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: '500',
  },
  successText: {
    color: '#2E7D32',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  stockInfo: {
    marginBottom: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemPrice: {
    fontSize: 15,
    color: '#0056B3',
    fontWeight: 'bold',
  },
  stockActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchContainer: {
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 12,
    color: '#666',
  },
  editButton: {
    backgroundColor: '#F0F0F0',
    padding: 8,
    borderRadius: 6,
  },
  editButtonText: {
    fontWeight: '500',
  },
  pedidoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pedidoId: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  badge: {
    backgroundColor: '#E6F4FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#0056B3',
    fontSize: 12,
    fontWeight: 'bold',
  },
  pedidoTotal: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  pedidoData: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  actionButtonsRow: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    backgroundColor: '#0056B3',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  emptyPedidos: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
  }
});
