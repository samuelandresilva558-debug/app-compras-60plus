import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import OnboardingScreen from './OnboardingScreen';
import HomeScreen from './HomeScreen';
import CheckoutScreen from './CheckoutScreen';
import PixScreen from './PixScreen';
import SuccessScreen from './SuccessScreen';
import AdminScreen from './AdminScreen';
import FamilyScreen from './FamilyScreen';
import OrderStatusScreen from './OrderStatusScreen';
import { CartProvider } from './CartContext';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <CartProvider>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#0056B3',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
              fontSize: 24, 
            },
            headerBackTitleVisible: false,
          }}
        >
          <Stack.Screen 
            name="Onboarding" 
            component={OnboardingScreen} 
            options={{ title: 'Bem-Vindo' }} 
          />
          <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ 
              title: 'Início',
              headerBackVisible: false 
            }} 
          />
          <Stack.Screen 
            name="Checkout" 
            component={CheckoutScreen} 
            options={{ title: 'Finalizar Pedido' }} 
          />
          <Stack.Screen 
            name="Pix" 
            component={PixScreen} 
            options={{ title: 'Pagamento PIX' }} 
          />
          <Stack.Screen 
            name="Success" 
            component={SuccessScreen} 
            options={{ 
              title: 'Sucesso',
              headerBackVisible: false 
            }} 
          />
          <Stack.Screen 
            name="Admin" 
            component={AdminScreen} 
            options={{ title: 'Painel do Lojista' }} 
          />
          <Stack.Screen 
            name="Family" 
            component={FamilyScreen} 
            options={{ title: 'Acesso do Acompanhante' }} 
          />
          <Stack.Screen 
            name="OrderStatus" 
            component={OrderStatusScreen} 
            options={{ title: 'Rastreio do Pedido' }} 
          />
        </Stack.Navigator>
      </NavigationContainer>
    </CartProvider>
  );
}
