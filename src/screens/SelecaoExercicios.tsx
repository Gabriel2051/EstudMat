import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function SelecaoExercicios() {
  const navigation = useNavigation<any>();

  const fases = [
    { id: 1, titulo: "Fase 1", sub: "Operações Básicas", rota: "TreinarFase1", cores: ["#6366f1", "#4f46e5"] },
    { id: 2, titulo: "Fase 2", sub: "Função de 1º Grau", rota: "TreinarFase2", cores: ["#8b5cf6", "#7c3aed"] },
    { id: 3, titulo: "Fase 3", sub: "Função de 2º Grau", rota: "TreinarFase3", cores: ["#ec4899", "#db2777"] },
  ];

  return (
    <View style={styles.container}>
      
      {/* CABEÇALHO COM SPACER */}
      <View style={styles.headerContainer}>
        
        <Pressable 
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]} 
          onPress={() => navigation.navigate("Dashboard")}
        >
          <Text style={styles.backButtonText}>← Voltar</Text>
        </Pressable>
        
        <View style={styles.titleWrapper}>
          <Text style={styles.headerTitle}>Jornada</Text>
        </View>
        
        <View style={styles.spacer} />

      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {fases.map((fase) => (
          <Pressable key={fase.id} onPress={() => navigation.navigate(fase.rota)} style={styles.cardContainer}>
            
            {/* CORREÇÃO DO TYPESCRIPT APLICADA AQUI ↓ */}
            <LinearGradient colors={fase.cores as [string, string]} style={styles.card}>
              <View style={styles.info}>
                <Text style={styles.faseNum}>0{fase.id}</Text>
                <View>
                  <Text style={styles.faseTitle}>{fase.titulo}</Text>
                  <Text style={styles.faseSub}>{fase.sub}</Text>
                </View>
              </View>
              <Text style={styles.playIcon}>▶</Text>
            </LinearGradient>
            
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#0f0f14", 
    paddingTop: Platform.OS === 'ios' ? 60 : 50 
  },
  headerContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20,
    marginBottom: 30,
    width: '100%',
  },
  backButton: {
    width: 85,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)"
  },
  backButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  titleWrapper: { 
    flex: 1,
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  headerTitle: { 
    color: "#fff", 
    fontSize: 24, 
    fontWeight: "800", 
  },
  spacer: {
    width: 85,
  },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  cardContainer: { marginBottom: 20, borderRadius: 20, overflow: 'hidden' },
  card: { padding: 25, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  info: { flexDirection: 'row', alignItems: 'center' },
  faseNum: { color: 'rgba(255,255,255,0.3)', fontSize: 40, fontWeight: '900', marginRight: 15 },
  faseTitle: { color: "#fff", fontSize: 20, fontWeight: "800" },
  faseSub: { color: "rgba(255,255,255,0.8)", fontSize: 14, fontWeight: "600" },
  playIcon: { color: '#fff', fontSize: 24 }
});