"use client"

import PageLayout from '@/components/PageLayout';
import { showAlert } from '@/utils/platformAlert';
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Reward, THEMES, useStore } from './Store'; // Importando a lógica da Store

const { width } = Dimensions.get('window');

// Definição dos itens disponíveis na loja (além dos que estão no Firebase)
const ITEMS_LOJA: Reward[] = [
  { id: 'tema_esmeralda', nome: 'Tema Esmeralda', precoXP: 500, descricao: 'Visual verde relaxante para focar.', tipo: 'TEMA' },
  { id: 'tema_dracula', nome: 'Tema Drácula', precoXP: 800, descricao: 'O visual sombrio preferido dos programadores.', tipo: 'TEMA' },
  { id: 'tema_oceano', nome: 'Tema Oceano', precoXP: 1000, descricao: 'A profundidade do azul nas tuas lições.', tipo: 'TEMA' },
  { id: 'badge_mestre', nome: 'Ícone Mestre', precoXP: 300, descricao: 'Um ícone dourado exclusivo no perfil.', tipo: 'ICONE' },
];

export default function RewardsList() {
  const navigation = useNavigation<any>();
  const { xp, inventory, addToCart, purchaseCart, temaAtivo, mudarTema } = useStore();
  
  // Pega as cores do tema atual para aplicar na loja
  const theme = THEMES[temaAtivo];

  const handlePress = async (item: Reward) => {
    // Verifica se o item já está no inventário
    const jaComprado = inventory.some(i => i.id === item.id);

    if (jaComprado) {
      if (item.tipo === 'TEMA') {
        const temaKey = item.id.replace('tema_', '') as keyof typeof THEMES;
        await mudarTema(temaKey);
        showAlert("Sucesso", "Tema equipado com sucesso!");
      } else {
        showAlert("Aviso", "Você já possui este item.");
      }
    } else {
      // Se não comprou, tenta comprar
      if (xp >= item.precoXP) {
        // No seu sistema atual, usamos o carrinho. Para ser rápido:
        addToCart(item);
        const result = await purchaseCart("Estudante");
        if (result.success) {
          showAlert("Oba!", `Você adquiriu ${item.nome}!`);
        } else {
          showAlert("Erro", result.message);
        }
      } else {
        showAlert("XP Insuficiente", `Você precisa de mais ${item.precoXP - xp} XP.`);
      }
    }
  };

  return (
    <PageLayout title="Loja de Prêmios" subtitle="Troque seu XP por customização" activeScreen="Loja">
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        
        {/* Banner de Saldo */}
        <LinearGradient colors={[theme.accent, theme.primary]} style={styles.saldoCard}>
          <Text style={styles.saldoLabel}>SEU SALDO ATUAL</Text>
          <Text style={styles.saldoValue}>💰 {xp} XP</Text>
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Temas e Estilos</Text>
          
          <View style={styles.grid}>
            {ITEMS_LOJA.map((item) => {
              const jaComprado = inventory.some(i => i.id === item.id);
              const estaEquipado = temaAtivo === item.id.replace('tema_', '');

              return (
                <Pressable 
                  key={item.id} 
                  style={[styles.card, { backgroundColor: theme.card }]}
                  onPress={() => handlePress(item)}
                >
                  <View style={[styles.previewCircle, { backgroundColor: getCorPreview(item.id) }]}>
                    {jaComprado && <Text style={styles.checkIcon}>✓</Text>}
                  </View>
                  
                  <Text style={styles.itemName}>{item.nome}</Text>
                  <Text style={styles.itemDesc}>{item.descricao}</Text>

                  <View style={[
                    styles.btnAction, 
                    { backgroundColor: estaEquipado ? "#4ade80" : (jaComprado ? "#3f3f46" : theme.primary) }
                  ]}>
                    <Text style={styles.btnText}>
                      {estaEquipado ? 'EQUIPADO' : (jaComprado ? 'USAR' : `${item.precoXP} XP`)}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </PageLayout>
  );
}

// Função auxiliar para as cores da prévia
const getCorPreview = (id: string) => {
  if (id.includes('esmeralda')) return "#10b981";
  if (id.includes('dracula')) return "#bd93f9";
  if (id.includes('oceano')) return "#3b82f6";
  return "#f59e0b";
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  saldoCard: {
    padding: 25,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 30,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10
  },
  saldoLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '800', letterSpacing: 2 },
  saldoValue: { color: '#fff', fontSize: 36, fontWeight: '900', marginTop: 5 },
  sectionTitle: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 20, letterSpacing: 1 },
  scroll: { paddingBottom: 50 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { 
    width: (width / 2) - 30, 
    borderRadius: 24, 
    padding: 16, 
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  previewCircle: { 
    width: 60, height: 60, borderRadius: 30, marginBottom: 12, 
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.1)'
  },
  checkIcon: { color: '#fff', fontSize: 20, fontWeight: '900' },
  itemName: { color: '#fff', fontWeight: '800', fontSize: 16, textAlign: 'center', marginBottom: 6 },
  itemDesc: { color: 'rgba(255,255,255,0.4)', fontSize: 11, textAlign: 'center', marginBottom: 15, lineHeight: 14 },
  btnAction: { width: '100%', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 12, fontWeight: '900', letterSpacing: 1 }
});