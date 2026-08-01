import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';

const CATEGORIES = [
  { id: '1', title: 'Frutas', emoji: '🍎' },
  { id: '2', title: 'Legumes', emoji: '🥦' },
  { id: '3', title: 'Carnes', emoji: '🥩' },
  { id: '4', title: 'Laticínios', emoji: '🥛' },
  { id: '5', title: 'Pães', emoji: '🍞' },
  { id: '6', title: 'Limpeza', emoji: '🧹' },
];

export default function OnboardingScreen({ navigation }) {
  const [selectedCategories, setSelectedCategories] = useState([]);

  const toggleCategory = (id) => {
    setSelectedCategories((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <Text style={styles.title}>Bem-vindo(a)!</Text>
          <Text style={styles.subtitle}>
            Para começarmos, toque nas categorias que você mais costuma comprar:
          </Text>
        </View>

        <View style={styles.gridContainer}>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategories.includes(cat.id);
            return (
              <TouchableOpacity 
                key={cat.id} 
                style={[styles.card, isSelected && styles.cardSelected]}
                onPress={() => toggleCategory(cat.id)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={`${cat.title}, ${isSelected ? 'Selecionado' : 'Não selecionado'}`}
              >
                <Text style={styles.emoji}>{cat.emoji}</Text>
                <Text style={[styles.cardText, isSelected && styles.cardTextSelected]}>
                  {cat.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Home')}
          accessibilityRole="button"
          accessibilityLabel="Continuar para a tela principal"
        >
          <Text style={styles.primaryButtonText}>Continuar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Fundo branco puro para altíssimo contraste
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    marginTop: 20,
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 22,
    lineHeight: 32,
    color: '#4A4A4A',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '47%', // Dois cartões por linha, com bom espaçamento
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120, // Área de toque bem superior a 64dp
    borderWidth: 3,
    borderColor: 'transparent',
  },
  cardSelected: {
    backgroundColor: '#E6F4FE', // Azul clarinho
    borderColor: '#0056B3', // Borda de destaque
  },
  emoji: {
    fontSize: 48, // Emoji gigante
    marginBottom: 12,
  },
  cardText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
  },
  cardTextSelected: {
    color: '#0056B3',
  },
  footer: {
    padding: 24,
    paddingBottom: 32,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  primaryButton: {
    backgroundColor: '#0056B3', // Azul forte para contraste
    borderRadius: 12,
    minHeight: 72, // Exigência de botão muito grande (mínimo 64dp)
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 24, // Exigência de texto grande em botões
    fontWeight: 'bold',
  }
});
