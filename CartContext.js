import React, { createContext, useState, useContext } from 'react';

// Criação do Contexto
const CartContext = createContext();

// Hook personalizado para usar o carrinho facilmente em qualquer tela
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [meusPedidos, setMeusPedidos] = useState([]); // Histórico de pedidos da sessão

  // Adiciona um produto ao carrinho
  const adicionarProduto = (produto) => {
    setCartItems([...cartItems, produto]);
  };

  // Remove um produto do carrinho pelo ID
  const removerProduto = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  // Esvazia o carrinho completamente
  const esvaziarCarrinho = () => {
    setCartItems([]);
  };

  // Adiciona uma lista inteira de produtos ao carrinho (para Recompra Inteligente)
  const adicionarVariosProdutos = (listaProdutos) => {
    setCartItems(prev => [...prev, ...listaProdutos]);
  };

  // Adiciona um ID de pedido ao histórico desta sessão
  const adicionarPedidoAoHistorico = (pedidoId) => {
    setMeusPedidos([...meusPedidos, pedidoId]);
  };

  // Remove um pedido do histórico (ex: quando for concluído/entregue)
  const removerPedidoDoHistorico = (pedidoId) => {
    setMeusPedidos(meusPedidos.filter(id => id !== pedidoId));
  };

  // Calcula o valor total do carrinho
  const calcularTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.price || item.preco || 0);
    }, 0);
  };

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      adicionarProduto, 
      adicionarVariosProdutos,
      removerProduto, 
      esvaziarCarrinho, 
      calcularTotal,
      meusPedidos,
      adicionarPedidoAoHistorico,
      removerPedidoDoHistorico
    }}>
      {children}
    </CartContext.Provider>
  );
};
