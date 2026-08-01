<h1 align="center">
  🛒 App Compras 60+
</h1>

<p align="center">
  Um aplicativo de supermercado focado 100% em <strong>acessibilidade e autonomia para o público idoso</strong>. Desenvolvido com React Native e Expo.
</p>

## 💡 Sobre o Projeto

Muitos aplicativos de delivery modernos possuem interfaces complexas, com letras pequenas e fluxos confusos que acabam criando uma barreira tecnológica para idosos. O **App Compras 60+** foi criado para resolver esse problema, oferecendo uma experiência de compra online livre de atritos, com alto contraste, fontes grandes e recursos avançados de acessibilidade.

## 🚀 Principais Funcionalidades

- **📍 Geolocalização Dinâmica (Fórmula de Haversine):** O aplicativo detecta a localização do usuário via satélite e calcula instantaneamente a distância dos mercados mais próximos.
- **🔊 Acessibilidade por Voz (Text-to-Speech):** Um assistente de voz nativo narra a quantidade de itens, detalhes dos mercados e resumos das prateleiras, auxiliando usuários com dificuldades visuais.
- **🎙️ Busca Inteligente por Voz e Texto:** Filtro de produtos em tempo real através de comando de voz ou texto, com teclado de digitação facilitado.
- **🔁 Recompra em 1 Clique:** Histórico inteligente que permite refazer exatamente a mesma compra da semana anterior com um único toque.
- **📦 Rastreamento em Tempo Real:** Conexão direta com o Firebase Firestore para exibir as mudanças de status do pedido em tempo real.
- **🏪 Painel do Lojista Integrado:** Área administrativa simulada para o mercado atualizar catálogos e status de pedidos.

## 🛠️ Tecnologias Utilizadas

- **Frontend:** React Native, Expo
- **Backend & Banco de Dados:** Firebase Firestore (Realtime NoSQL)
- **Bibliotecas:** `expo-location` (GPS), `expo-speech` (Sintetizador de Voz), `expo-document-picker`
- **CI/CD:** EAS Build (Expo Application Services) para geração do APK na nuvem

## 📱 Demonstração e Como Testar

Se quiser testar o aplicativo localmente na sua máquina:

1. Clone o repositório:
   ```bash
   git clone https://github.com/SeuUsuario/app-compras-60plus.git
   ```
2. Instale as dependências:
   ```bash
   cd app-compras-60plus
   npm install
   ```
3. Execute o aplicativo:
   ```bash
   npx expo start
   ```

*(Pressione `a` para abrir no emulador Android ou leia o QR Code com o app Expo Go no celular)*

## 🤝 Aprendizados e Desafios

Neste MVP, o principal desafio não foi apenas o código, mas a **Engenharia de Usabilidade**. Fazer o motor de GPS conversar perfeitamente com o sintetizador de voz, e garantir que a interface ficasse extremamente responsiva sem perder a simplicidade, demonstrou o poder do React Native aliado à serviços nativos da Expo.

---
Feito com 💙 focado no impacto social e na tecnologia inclusiva.
