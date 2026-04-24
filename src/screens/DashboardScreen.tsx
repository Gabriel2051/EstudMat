"use client"

import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { Dimensions, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import PageLayout from "@/components/PageLayout";
import { getLevelFromXP } from "@/constants/gameConfig";
import { auth } from "@/services/connectionFirebase";
import { showAlert } from "@/utils/platformAlert";
import { THEMES, useStore } from "./Store";

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function DashboardScreen() {
  const navigation = useNavigation<any>();
  const { xp: userXP, reloadXP, temaAtivo } = useStore();
  const theme = THEMES[temaAtivo];

  const level = getLevelFromXP(userXP);
  const nextLevelThreshold = level * 1000;
  const progress = Math.min(1, userXP / nextLevelThreshold);

  useEffect(() => {
    reloadXP();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigation.replace("Login");
    } catch (error) {
      showAlert("Erro", "Não foi possível sair.");
    }
  };

  return (
    <PageLayout title="Dashboard" activeScreen="Dashboard">
      {/* O segredo do Scroll na Web é o flex: 1 e o height */}
      <View style={{ flex: 1, height: SCREEN_HEIGHT }}> 
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          alwaysBounceVertical={true}
        >
          <View style={styles.container}>
            
            {/* CARD DE PERFIL (RESTALRADO) */}
            <View style={styles.headerCard}>
              <View style={styles.headerContent}>
                <Image 
                  source={require("../../assets/images/Midia.png")} 
                  style={styles.logo} 
                  resizeMode="contain" 
                />
                <View style={styles.userInfo}>
                  <Text style={styles.welcome}>Bem-vindo(a),</Text>
                  <Text style={styles.userName}>{auth.currentUser?.email?.split("@")[0] || "Estudante"}</Text>

                  <View style={styles.levelRow}>
                    <LinearGradient
                      colors={[theme.accent, theme.primary]}
                      style={styles.levelBadge}
                    >
                      <Text style={styles.levelText}>Nível {level}</Text>
                    </LinearGradient>

                    <View style={styles.xpInfo}>
                       <Text style={styles.xpValues}>{userXP} / {nextLevelThreshold} XP</Text>
                       <View style={styles.barBackground}>
                          <View style={[styles.barFill, { width: `${progress * 100}%`, backgroundColor: theme.primary }]} />
                       </View>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* GRID DE BOTÕES (VISUAL ORIGINAL) */}
            <View style={styles.grid}>
              <Pressable style={styles.cardSmall} onPress={() => navigation.navigate("SelecaoExercicios")}>
                <LinearGradient colors={[theme.accent, theme.primary]} style={styles.gradient}>
                  <Text style={styles.icon}>📚</Text>
                  <Text style={styles.cardTitle}>Treinar</Text>
                  <Text style={styles.cardSub}>Praticar exercícios</Text>
                </LinearGradient>
              </Pressable>

              <Pressable style={styles.cardSmall} onPress={() => navigation.navigate("Desafios")}>
                <View style={styles.cardDark}>
                  <Text style={styles.icon}>🎯</Text>
                  <Text style={styles.cardTitle}>Desafios</Text>
                  <Text style={styles.cardSub}>Missões especiais</Text>
                </View>
              </Pressable>

              <Pressable style={styles.cardSmall} onPress={() => navigation.navigate("Achievements")}>
                <View style={styles.cardDark}>
                  <Text style={styles.icon}>🏆</Text>
                  <Text style={styles.cardTitle}>Conquistas</Text>
                  <Text style={styles.cardSub}>Suas vitórias</Text>
                </View>
              </Pressable>

              <Pressable style={styles.cardSmall} onPress={() => navigation.navigate("RewardsList")}>
                <View style={styles.cardDark}>
                  <Text style={styles.icon}>🎁</Text>
                  <Text style={styles.cardTitle}>Loja</Text>
                  <Text style={styles.cardSub}>Recompensas</Text>
                </View>
              </Pressable>
            </View>

            <Pressable style={styles.logout} onPress={handleLogout}>
              <Text style={styles.logoutText}>Sair da conta</Text>
            </Pressable>

          </View>
        </ScrollView>
      </View>
    </PageLayout>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 50, flexGrow: 1 },
  container: { padding: 20, maxWidth: 600, width: '100%', alignSelf: 'center' },
  
  headerCard: { backgroundColor: "#1a1a1f", padding: 20, borderRadius: 24, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", marginBottom: 20 },
  headerContent: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 60, height: 60, marginRight: 15 },
  userInfo: { flex: 1 },
  welcome: { color: "rgba(255,255,255,0.5)", fontSize: 13 },
  userName: { color: "#fff", fontSize: 20, fontWeight: "800", marginBottom: 5 },
  
  levelRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  levelBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginRight: 10 },
  levelText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  xpInfo: { flex: 1 },
  xpValues: { color: '#fff', fontSize: 10, fontWeight: '700', marginBottom: 4 },
  barBackground: { height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  cardLarge: { width: '100%', height: 140, borderRadius: 20, overflow: 'hidden', marginBottom: 15 },
  cardSmall: { width: '48%', height: 120, borderRadius: 20, overflow: 'hidden', marginBottom: 15 },
  gradient: { flex: 1, padding: 20, justifyContent: 'center' },
  cardDark: { flex: 1, backgroundColor: '#1a1a1f', padding: 20, justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  icon: { fontSize: 30, marginBottom: 10 },
  cardTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  cardSub: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },

  logout: { marginTop: 20, padding: 18, backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 16, alignItems: 'center' },
  logoutText: { color: '#ef4444', fontWeight: '800' }
});