import * as Location from 'expo-location';
import { Alert } from 'react-native';

// Fórmula de Haversine para calcular a distância em km entre duas coordenadas
export const calcularDistanciaKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const requestLocationWithFallback = async () => {
  try {
    // 1. Pedir permissão ao usuário
    let { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      return { 
        status: 'fallback', 
        message: 'Permissão negada. Ative o GPS para vermos mercados perto de você.',
      };
    }

    // 2. Obter as coordenadas exatas
    let location = await Location.getCurrentPositionAsync({});
    const lat = location.coords.latitude;
    const lon = location.coords.longitude;
    
    // 3. Transformar as coordenadas em nome da rua/bairro
    let addressName = 'Localização Encontrada';
    try {
      const geocode = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
      if (geocode && geocode.length > 0) {
        const place = geocode[0];
        // Tenta pegar o Bairro (district/subregion) ou a Rua (street) ou a Cidade (city)
        addressName = place.district || place.subregion || place.street || place.city || addressName;
      }
    } catch (e) {
      console.log('Erro no geocode reverso:', e);
    }
    
    return {
      status: 'success',
      message: `Você está em: ${addressName}`,
      coords: {
        latitude: lat,
        longitude: lon,
      }
    };
    
  } catch (error) {
    console.log('Erro no hardware GPS:', error);
    return { 
      status: 'fallback', 
      message: 'Não foi possível encontrar o sinal de GPS.',
    };
  }
};
