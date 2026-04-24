"use client"

import { showAlert } from '@/utils/platformAlert';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { THEMES, useStore } from './Store';

const { width } = Dimensions.get('window');

const LOJA_ITENS = [
  { id: 'esmeralda', title: 'Tema Esmeralda', desc: 'Visual verde relaxante', preco: 400, tipo: 'TEMA', cor: '#10b981' },
  { id: 'dracula', title: 'Tema Drácula', desc: 'O preferido dos devs', preco: 600, tipo: 'TEMA', cor: '#bd93f9' },
  { id: 'oceano', title: 'Tema Oceano', desc: 'Profundidade azul', preco: 800, tipo: 'TEMA', cor: '#3b82f6' },
  { id: 'badge_mestre', title: 'Ícone: Mestre', desc: 'Exibe uma coroa no perfil', preco: 200, tipo: 'ICONE', cor: '#f59e0b' },
  { id: 'xp_boost', title: 'Super Boost', desc: 'Dobra XP por 24h', preco: 1500, tipo: 'BOOST', cor: '#ef4444' },
];

export default function RewardsStore() {
  const { xp, comprarItem, itemsComprados, temaAtivo, setTema } = useStore();
  const theme = THEMES[temaAtivo];

  const handleAction = (item: any) => {
    const jaComprado = itemsComprados.includes(item.id);

    if (jaComprado) {
      if (item.tipo === 'TEMA') {
        setTema(item.id);
        showAlert("Sucesso", "Tema aplicado!");
      }
    } else {
      const conseguiuComprar = comprarItem(item.id, item.preco);
      if (conseguiuComprar) {
        showAlert("Oba!", `Você adquiriu ${item.title}`);
      } else {
        showAlert("XP Insuficiente", "Continue treinando para ganhar mais pontos!");
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Header com Saldo */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Loja</Text>
          <Text style={styles.headerSub}>Troque seu esforço por prêmios</Text>
        </View>
        <LinearGradient colors={[theme.accent, theme.primary]} style={styles.xpCard}>
          <Text style={styles.xpText}>💰 {xp} XP</Text>
        </LinearGradient>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Customização</Text>
        
        <View style={styles.grid}>
          {LOJA_ITENS.map((item) => {
            const jaComprado = itemsComprados.includes(item.id);
            const equipado = temaAtivo === item.id;

            return (
              <Pressable 
                key={item.id} 
                style={[styles.card, { backgroundColor: theme.card }]} 
                onPress={() => handleAction(item)}
              >
                <View style={[styles.colorPreview, { backgroundColor: item.cor }]}>
                  {jaComprado && <Text style={styles.checkIcon}>✓</Text>}
                </View>
                
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDesc}>{item.desc}</Text>

                <View style={[styles.btnAction, { backgroundColor: jaComprado ? (equipado ? "#4ade80" : "#3f3f46") : theme.primary }]}>
                  <Text style={styles.btnText}>
                    {jaComprado ? (equipado ? 'EQUIPADO' : 'USAR') : `${item.preco} XP`}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: Platform.OS === 'ios' ? 60 : 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 30 },
  headerTitle: { color: '#fff', fontSize: 32, fontWeight: '900' },
  headerSub: { color: 'rgba(255,255,255,0.5)', fontSize: 14 },
  xpCard: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 12 },
  xpText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  scroll: { paddingHorizontal: 20, paddingBottom: 100 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 20, letterSpacing: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { 
    width: (width / 2) - 30, 
    borderRadius: 24, 
    padding: 15, 
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center'
  },
  colorPreview: { width: 60, height: 60, borderRadius: 30, marginBottom: 12, justifyContent: 'center', alignItems: 'center', elevation: 10, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 5 },
  checkIcon: { color: '#fff', fontSize: 20, fontWeight: '900' },
  itemTitle: { color: '#fff', fontWeight: '800', fontSize: 15, textAlign: 'center', marginBottom: 4 },
  itemDesc: { color: 'rgba(255,255,255,0.4)', fontSize: 11, textAlign: 'center', marginBottom: 15, height: 30 },
  btnAction: { width: '100%', paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 12, fontWeight: '900' }
});