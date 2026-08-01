import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Alert } from 'react-native';
import { requestLocationWithFallback, calcularDistanciaKm } from './LocationService';
import { useCart } from './CartContext';
import { escutarProdutos, buscarMercadosProximos, buscarProdutosPorMercado, buscarUltimoPedido } from './firebaseService';
import { falarTexto, falarProduto } from './speechService';

export default function HomeScreen({ navigation }) {
  const [locationMessage, setLocationMessage] = useState('Buscando satélite...');
  const [errorMsg, setErrorMsg] = useState(null);
  const [userCoords, setUserCoords] = useState(null);
  
  const [produtosDb, setProdutosDb] = useState([]);
  const [mercados, setMercados] = useState([]);
  const [mercadoSelecionado, setMercadoSelecionado] = useState(null);
  const [produtosDoMercado, setProdutosDoMercado] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pegando funções do nosso Carrinho Inteligente
  const { cartItems, adicionarProduto, adicionarVariosProdutos, calcularTotal, meusPedidos } = useCart();

  // Estado para Recompra Inteligente
  const [ultimoPedido, setUltimoPedido] = useState(null);
  
  // Estado para a Barra de Busca
  const [textoBusca, setTextoBusca] = useState('');
  const buscaRef = useRef(null);

  useEffect(() => {
    async function loadData() {
      try {
        const result = await requestLocationWithFallback();
        let currentLat = null;
        let currentLon = null;

        if (result.status === 'fallback') {
          setLocationMessage(result.message);
          // Fallback para Jundiaí para testes caso neguem GPS
          currentLat = -23.1857; 
          currentLon = -46.8978; 
          setUserCoords({ latitude: currentLat, longitude: currentLon });
        } else if (result.status === 'success') {
          setLocationMessage(`📍 Você está em: ${result.message.replace('Você está em: ', '')}`);
          currentLat = result.coords.latitude;
          currentLon = result.coords.longitude;
          setUserCoords(result.coords);
        }

        // Buscar mercados
        const listaMercados = await buscarMercadosProximos();
        
        // Calcular distância, filtrar (ex: raio de 15km) e ordenar
        let mercadosPerto = listaMercados.map(m => {
          const dist = calcularDistanciaKm(currentLat, currentLon, m.lat, m.lon);
          return { ...m, distancia: dist };
        }).filter(m => m.distancia <= 15)
          .sort((a, b) => a.distancia - b.distancia);
          
        setMercados(mercadosPerto);

        // TTS Anúncio inicial
        if (mercadosPerto.length > 0) {
          falarTexto(`Localizamos ${mercadosPerto.length} mercados perto da sua casa. Escolha um para ver os produtos.`);
        } else {
          falarTexto(`Infelizmente não encontramos mercados próximos à sua região.`);
        }

      } catch (err) {
        console.error(err);
        setLocationMessage('Não foi possível carregar a localização.');
      }

      try {
        // Inicia a escuta de produtos em tempo real do Firebase
        const unsubscribe = escutarProdutos((dados) => {
          setProdutosDb(dados);
          setLoading(false);
        });
        
        // Salva a função de limpeza na variável global do useEffect
        window.unsubProdutos = unsubscribe; 
      } catch (err) {
        console.error(err);
        setLoading(false);
      }

      // Buscar último pedido para o card de Recompra
      try {
        const pedido = await buscarUltimoPedido();
        setUltimoPedido(pedido);
      } catch (err) {
        console.error('Erro ao buscar último pedido:', err);
      }
    }
    
    loadData();

    // Limpa o ouvinte ao desmontar o componente
    return () => {
      if (window.unsubProdutos) window.unsubProdutos();
    };
  }, []);

  const handleOuvirResumo = () => {
    if (!mercadoSelecionado) {
      if (mercados.length === 0) {
        falarTexto("No momento, não temos mercados disponíveis na sua área.");
      } else {
        falarTexto(`Temos ${mercados.length} mercados próximos. Toque em um deles para abrir.`);
      }
      return;
    }

    const produtosDoMercado2 = produtosDb.filter(p => p.loja === mercadoSelecionado.nome);
    if (produtosDoMercado2.length === 0) {
      falarTexto("Este mercado ainda não cadastrou produtos.");
      return;
    }
    
    falarTexto(`O ${mercadoSelecionado.nome} tem ${produtosDoMercado2.length} produtos disponíveis hoje.`);
  };

  const handleRecompra = () => {
    if (!ultimoPedido || !ultimoPedido.itens || ultimoPedido.itens.length === 0) return;
    const produtosParaReadicionar = ultimoPedido.itens.map((item, index) => ({
      id: `recompra_${index}_${Date.now()}`,
      title: item.title,
      name: item.title,
      price: item.preco || item.price || 0,
      preco: item.preco || item.price || 0,
      emoji: '🔁',
    }));
    adicionarVariosProdutos(produtosParaReadicionar);
    falarTexto(`${produtosParaReadicionar.length} produtos adicionados ao carrinho. Redirecionando para o caixa.`);
    setTimeout(() => navigation.navigate('Checkout'), 1500);
  };

  // Filtro de busca em tempo real
  const produtosFiltrados = textoBusca.trim() === '' ? produtosDoMercado
    : produtosDoMercado.filter(p =>
        (p.title || p.name || '').toLowerCase().includes(textoBusca.toLowerCase())
      );

  const handleTextoBusca = (texto) => {
    setTextoBusca(texto);
    if (texto.trim().length > 2) {
      const qtd = produtosDoMercado.filter(p =>
        (p.title || p.name || '').toLowerCase().includes(texto.toLowerCase())
      ).length;
      falarTexto(`Encontramos ${qtd} produtos para a sua busca`);
    }
  };

  const totalFormatado = calcularTotal().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <SafeAreaView style={styles.container}>
      
      {meusPedidos && meusPedidos.length > 0 && (
        <TouchableOpacity 
          style={styles.activeOrderBanner}
          onPress={() => navigation.navigate('OrderStatus', { pedidoId: meusPedidos[meusPedidos.length - 1] })}
        >
          <Text style={styles.activeOrderBannerText}>📍 Você tem um pedido em andamento! Toque aqui para rastrear.</Text>
        </TouchableOpacity>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.title}>Olá! O que vamos comprar hoje?</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Family')}
              accessibilityRole="button"
              accessibilityLabel="Acessar Visão do Familiar"
              style={styles.headerIcon}
            >
              <Text style={{ fontSize: 24 }}>👤</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Admin')}
              accessibilityRole="button"
              accessibilityLabel="Acessar Painel do Lojista"
              style={styles.headerIcon}
            >
              <Text style={{ fontSize: 24 }}>⚙️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Componente de GPS */}
        <View style={styles.gpsContainer} accessibilityRole="text">
          <Text style={styles.gpsTitle}>Sua Localização 📍</Text>
          <Text style={styles.gpsText}>{locationMessage}</Text>
          {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
        </View>

        {/* Card de Recompra Inteligente */}
        {ultimoPedido && ultimoPedido.itens && ultimoPedido.itens.length > 0 && (
          <View style={styles.recompraCard}>
            <Text style={styles.recompraTitle}>🔁 Fazer a mesma compra da semana passada?</Text>
            <Text style={styles.recompraInfo}>
              {ultimoPedido.itens.length} itens • Valor: R$ {Number(ultimoPedido.totalGeral || 0).toFixed(2).replace('.', ',')}
            </Text>
            <TouchableOpacity 
              style={styles.recompraButton}
              onPress={handleRecompra}
              accessibilityRole="button"
              accessibilityLabel="Refazer o mesmo pedido anterior"
            >
              <Text style={styles.recompraButtonText}>🛒 Adicionar Todos ao Carrinho</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Botão de Acessibilidade: Resumo por Voz */}
        <TouchableOpacity 
          style={styles.voiceSummaryButton}
          onPress={handleOuvirResumo}
          accessibilityRole="button"
          accessibilityLabel={mercadoSelecionado ? "Ouvir resumo do mercado" : "Ouvir resumo dos mercados próximos"}
        >
          <Text style={styles.voiceSummaryIcon}>🔊</Text>
          <Text style={styles.voiceSummaryText}>Ouvir resumo da tela</Text>
        </TouchableOpacity>

        {loading ? (
          <ActivityIndicator size="large" color="#0056B3" style={{ marginTop: 20 }} />
        ) : !mercadoSelecionado ? (
          <>
            <Text style={styles.sectionTitle}>Mercados Próximos 🛒</Text>
            {mercados.length === 0 ? (
              <Text style={styles.emptyText}>Nenhum mercado parceiro na sua região.</Text>
            ) : (
              mercados.map((mercado) => (
                <TouchableOpacity 
                  key={mercado.id}
                  style={styles.marketCard}
                  onPress={async () => {
                    setMercadoSelecionado(mercado);
                    falarTexto(`Você entrou no ${mercado.nome}. Escolha os seus produtos abaixo.`);
                    // Fetch products using the specific function
                    const produtosRetornados = await buscarProdutosPorMercado(mercado.id);
                    setProdutosDoMercado(produtosRetornados || []);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.productEmoji}>{mercado.emoji || '🏪'}</Text>
                  <View style={styles.productInfo}>
                    <Text style={styles.productTitle}>{mercado.nome}</Text>
                    <Text style={styles.marketDistance}>📍 {mercado.distancia.toFixed(1)} km de você</Text>
                  </View>
                  <View style={styles.openMarketButton}>
                    <Text style={styles.openMarketButtonText}>Entrar</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </>
        ) : (
          <>
            <View style={styles.marketBanner}>
              <Text style={styles.marketBannerText}>🛒 Comprando em: {mercadoSelecionado.nome}</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.backToMarketsButton}
              onPress={() => {
                setMercadoSelecionado(null);
                setTextoBusca('');
              }}
            >
              <Text style={styles.backToMarketsText}>⬅️ Escolher Outro Mercado</Text>
            </TouchableOpacity>

            {/* Barra de Busca */}
            <View style={styles.searchRow}>
              <TextInput
                ref={buscaRef}
                style={styles.searchInput}
                value={textoBusca}
                onChangeText={handleTextoBusca}
                placeholder="Buscar produto..."
                placeholderTextColor="#9CA3AF"
                accessibilityLabel="Campo de busca de produtos"
              />
              <TouchableOpacity
                style={styles.micButton}
                onPress={() => {
                  falarTexto("Diga o nome do produto que está procurando.");
                  if (buscaRef.current) buscaRef.current.focus();
                }}
                accessibilityRole="button"
                accessibilityLabel="Ativar busca por voz"
              >
                <Text style={styles.micIcon}>🎙️</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.sectionTitle}>Produtos Disponíveis</Text>
            
            {produtosFiltrados.length === 0 ? (
              <Text style={styles.emptyText}>Nenhum produto encontrado.</Text>
            ) : (
              produtosFiltrados.map((produto) => (
                <TouchableOpacity 
                  key={produto.id}
                  style={styles.productCard}
                  onPress={() => adicionarProduto(produto)}
                  accessibilityRole="button"
                  accessibilityLabel={`Adicionar ${produto.name || produto.title} por ${produto.price || produto.preco} reais`}
                  activeOpacity={0.7}
                >
                  <Text style={styles.productEmoji}>{produto.emoji || '📦'}</Text>
                  <View style={styles.productInfo}>
                    <Text style={styles.productTitle}>{produto.name || produto.title}</Text>
                    <Text style={styles.productPrice}>
                      R$ {Number(produto.price || produto.preco || 0).toFixed(2).replace('.', ',')}
                    </Text>
                  </View>
                  
                  <View style={styles.productActions}>
                    <TouchableOpacity 
                      style={styles.speakButton}
                      onPress={() => falarProduto(produto.name || produto.title, produto.price || produto.preco)}
                      accessibilityRole="button"
                      accessibilityLabel={`Ouvir detalhes de ${produto.name || produto.title}`}
                    >
                      <Text style={styles.speakIcon}>🔊</Text>
                    </TouchableOpacity>
                    <View style={styles.addButton}>
                      <Text style={styles.addButtonText}>+</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </>
        )}
      </ScrollView>

      {/* Carrinho Vivo (Rodapé) - Só aparece se tiver itens */}
      {cartItems.length > 0 && (
        <View style={styles.cartFooter}>
          <View style={styles.cartInfo}>
            <Text style={styles.cartLabel}>Total Atual:</Text>
            <Text style={styles.cartTotal}>{totalFormatado}</Text>
          </View>
          <TouchableOpacity 
            style={styles.checkoutButton}
            onPress={() => navigation.navigate('Checkout')}
            accessibilityRole="button"
            accessibilityLabel="Ir para o Caixa"
          >
            <Text style={styles.checkoutButtonText}>Ir p/ Caixa</Text>
          </TouchableOpacity>
        </View>
      )}

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
    paddingBottom: 120, // Espaço extra para o rodapé flutuante não cobrir o último item
  },
  header: {
    marginTop: 10,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    flex: 1,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    padding: 8,
    marginLeft: 8,
  },
  gpsContainer: {
    backgroundColor: '#E6F4FE',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#0056B3',
  },
  gpsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0056B3',
    marginBottom: 8,
  },
  gpsText: {
    fontSize: 20,
    color: '#333333',
    lineHeight: 28,
  },
  errorText: {
    fontSize: 20,
    color: '#D32F2F',
    marginTop: 8,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    color: '#999999',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
  marketCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF8E7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FDE68A',
    minHeight: 100,
  },
  marketDistance: {
    fontSize: 16,
    color: '#D97706',
    fontWeight: '600',
  },
  openMarketButton: {
    backgroundColor: '#D97706',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  openMarketButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  marketBanner: {
    backgroundColor: '#0056B3',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  marketBannerText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  backToMarketsButton: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  backToMarketsText: {
    fontSize: 18,
    color: '#374151',
    fontWeight: 'bold',
  },
  backToMarketsText: {
    fontSize: 18,
    color: '#374151',
    fontWeight: 'bold',
  },
  // Recompra Inteligente
  recompraCard: {
    backgroundColor: '#FFF3CD',
    borderWidth: 2,
    borderColor: '#F59E0B',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  recompraTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 6,
  },
  recompraInfo: {
    fontSize: 18,
    color: '#78350F',
    marginBottom: 14,
  },
  recompraButton: {
    backgroundColor: '#F59E0B',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  recompraButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Barra de Busca
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 20,
    color: '#1A1A1A',
  },
  micButton: {
    backgroundColor: '#0056B3',
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micIcon: {
    fontSize: 26,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    minHeight: 100, // Garantindo área grande de clique
  },
  productEmoji: {
    fontSize: 40,
    marginRight: 16,
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  productStore: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 8,
  },
  categoryEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0056B3',
    textAlign: 'center',
  },
  activeOrderBanner: {
    backgroundColor: '#FFFBEA',
    padding: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#FBBF24',
    alignItems: 'center',
  },
  activeOrderBannerText: {
    color: '#B45309',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  productPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0056B3',
  },
  addButton: {
    backgroundColor: '#0056B3',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: -4,
  },
  voiceSummaryButton: {
    backgroundColor: '#FFFBEA',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FBBF24',
    marginBottom: 24,
  },
  voiceSummaryIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  voiceSummaryText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#B45309',
    flex: 1,
  },
  productActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  speakButton: {
    backgroundColor: '#E5E7EB',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  speakIcon: {
    fontSize: 22,
  },
  cartFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1A1A1A',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  cartInfo: {
    flex: 1,
  },
  cartLabel: {
    color: '#CCCCCC',
    fontSize: 18,
  },
  cartTotal: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: 'bold',
  },
  checkoutButton: {
    backgroundColor: '#32CD32', // Verde chamativo
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    minHeight: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  }
});
