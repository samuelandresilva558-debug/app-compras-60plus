import { collection, getDocs, addDoc, doc, setDoc, onSnapshot, updateDoc, query, orderBy, where } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { Alert } from 'react-native';

// Busca a lista de produtos de um mercado específico com Fallback Rico
export const buscarProdutosPorMercado = async (mercadoId) => {
  try {
    const q = query(collection(db, "produtos"), where("mercadoId", "==", mercadoId));
    const querySnapshot = await getDocs(q);
    const produtos = [];
    querySnapshot.forEach((doc) => {
      produtos.push({ id: doc.id, ...doc.data() });
    });
    
    if (produtos.length > 0) {
      return produtos;
    }
  } catch (error) {
    console.error("Erro ao buscar produtos do mercado: ", error);
  }

  // Fallback rico
  return [
    { id: 'f1', title: 'Arroz 5kg', price: 26.90, preco: 26.90, emoji: '🍚', mercadoId },
    { id: 'f2', title: 'Feijão Carioca 1kg', price: 8.50, preco: 8.50, emoji: '🫘', mercadoId },
    { id: 'f3', title: 'Leite Integral 1L', price: 4.90, preco: 4.90, emoji: '🥛', mercadoId },
    { id: 'f4', title: 'Banana Prata 1kg', price: 6.00, preco: 6.00, emoji: '🍌', mercadoId },
    { id: 'f5', title: 'Café Torrado 500g', price: 16.90, preco: 16.90, emoji: '☕', mercadoId },
  ];
};

// NOVO: Escuta produtos em tempo real
export const escutarProdutos = (callback) => {
  const unsubscribe = onSnapshot(collection(db, "produtos"), (snapshot) => {
    const produtos = [];
    snapshot.forEach((doc) => {
      produtos.push({ id: doc.id, ...doc.data() });
    });
    callback(produtos);
  }, (error) => {
    console.error("Erro ao escutar produtos:", error);
  });
  return unsubscribe;
};

// Salva um novo pedido na nuvem
export const salvarPedido = async (dadosPedido) => {
  try {
    // Por padrão, todo pedido nasce com status 1 (Recebido)
    const pedidoCompleto = {
      ...dadosPedido,
      status: 1, 
      createdAt: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, "pedidos"), pedidoCompleto);
    console.log("Pedido salvo com ID: ", docRef.id);
    return docRef.id; // Retorna o ID para a tela de Sucesso
  } catch (error) {
    console.error("Erro ao salvar pedido: ", error);
    Alert.alert("Erro", "Não foi possível conectar ao banco de dados.");
    return null;
  }
};

// Busca o último pedido finalizado no banco (para Recompra Inteligente)
export const buscarUltimoPedido = async () => {
  try {
    const q = query(collection(db, "pedidos"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const primeiro = querySnapshot.docs[0];
      return { id: primeiro.id, ...primeiro.data() };
    }
    return null;
  } catch (error) {
    console.error("Erro ao buscar último pedido:", error);
    return null;
  }
};

// NOVO: Escutar UM pedido específico em tempo real (Tela do Idoso)
export const escutarPedidoStatus = (pedidoId, callback) => {
  if (!pedidoId) return;
  const unsubscribe = onSnapshot(doc(db, "pedidos", pedidoId), (docSnap) => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...docSnap.data() });
    }
  });
  return unsubscribe;
};

// NOVO: Escutar TODOS os pedidos (Painel do Lojista)
export const escutarTodosPedidos = (callback) => {
  const q = query(collection(db, "pedidos"), orderBy("createdAt", "desc"));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const pedidos = [];
    snapshot.forEach((doc) => {
      pedidos.push({ id: doc.id, ...doc.data() });
    });
    callback(pedidos);
  });
  return unsubscribe;
};

// NOVO: Lojista atualiza a etapa do pedido
export const atualizarStatusPedido = async (pedidoId, novoStatus) => {
  try {
    const pedidoRef = doc(db, "pedidos", pedidoId);
    await updateDoc(pedidoRef, { status: novoStatus });
    return true;
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    return false;
  }
};

// O Painel Admin chama essa função para simular o envio da planilha para a nuvem
export const atualizarProdutosLojista = async (listaProdutos) => {
  try {
    // Para cada produto na planilha, criamos ou atualizamos o documento na coleção "produtos"
    for (const produto of listaProdutos) {
      await setDoc(doc(db, "produtos", produto.id), produto);
    }
    return true;
  } catch (error) {
    console.error("Erro ao atualizar produtos: ", error);
    return false;
  }
};

// NOVO: Busca mercados no banco
export const buscarMercadosProximos = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "mercados"));
    const mercados = [];
    querySnapshot.forEach((doc) => {
      mercados.push({ id: doc.id, ...doc.data() });
    });
    return mercados;
  } catch (error) {
    console.error("Erro ao buscar mercados: ", error);
    return [];
  }
};

// NOVO: Função para o Admin injetar os mercados de teste no banco
export const injetarMercadosTeste = async () => {
  try {
    const mercadosTeste = [
      { id: 'm1', nome: 'Mercado Perto', lat: -23.1857, lon: -46.8978, emoji: '🟢' },
      { id: 'm2', nome: 'Padaria da Esquina', lat: -23.1950, lon: -46.8870, emoji: '🍞' },
      { id: 'm3', nome: 'Quitanda do Seu Zé', lat: -23.2500, lon: -46.8000, emoji: '🍎' },
    ];
    
    for (const m of mercadosTeste) {
      await setDoc(doc(db, "mercados", m.id), m);
    }
    return true;
  } catch (error) {
    console.error("Erro ao injetar mercados:", error);
    return false;
  }
};
