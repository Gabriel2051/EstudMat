"use client"

import { useNavigation } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import { LinearGradient } from "expo-linear-gradient"
import { useEffect, useState } from "react"
import { Image, Pressable, StyleSheet, Text, View } from "react-native"
import type { RootStackParamList } from "../../app/(tabs)/index"
import { useResponsive } from "../hooks/useResponsive"
import { showAlert } from "../utils/platformAlert"
import { auth } from "./../services/connectionFirebase"
import { useStore } from "./Store"

type NavigationProps = StackNavigationProp<RootStackParamList>

export default function DashboardScreen() {
  const navigation = useNavigation<NavigationProps>()
  const [userEmail, setUserEmail] = useState<string>("")
  const { xp: userXP, reloadXP } = useStore()
  const [loading, setLoading] = useState(true)
  const { width } = useResponsive()

  const level = Math.floor(userXP / 500) + 1 // Pequeno ajuste para o nível ser dinâmico com base no XP
  const xpToNext = level * 500
  const progress = Math.min(1, (userXP % 500) / 500)

  useEffect(() => {
    const user = auth.currentUser
    if (!user) {
      showAlert("Não autenticado", "Precisas de iniciar sessão para aceder ao dashboard.", [
        { text: "OK", onPress: () => navigation.replace("Login") },
      ])
      return
    }
    setUserEmail(user.email || "Utilizador")
    loadUserData()
  }, [])

  const loadUserData = async () => {
    setLoading(true)
    try {
      await reloadXP()
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await auth.signOut()
      setUserEmail("")
      navigation.replace("Login")
    } catch (error) {
      console.error("Erro ao terminar sessão:", error)
      showAlert("Erro", "Não foi possível sair da conta. Tenta novamente.")
    }
  }

  return (
    <View style={styles.container}>
      {/* CARTÃO DE PERFIL E XP */}
      <View style={styles.headerCard}>
        <View style={styles.headerContent}>
          <Image source={require("../../assets/images/Midia.png")} style={styles.logo} resizeMode="contain" />
          <View style={styles.userInfo}>
            <Text style={styles.welcome}>Bem-vindo(a),</Text>
            <Text style={styles.userName}>{userEmail.split("@")[0] || "Utilizador"}</Text>

            <View style={styles.levelContainer}>
              <LinearGradient
                colors={["#7f1d1d", "#ef4444"]} // Novo gradiente vermelho
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.levelBadge}
              >
                <Text style={styles.levelText}>Nível {level}</Text>
              </LinearGradient>

              <View style={styles.xpProgressContainer}>
                <View style={styles.xpTextRow}>
                  <Text style={styles.xpCurrent}>{userXP} XP</Text>
                  <Text style={styles.xpTarget}>/ {xpToNext}</Text>
                </View>
                <View style={styles.progressBar}>
                  <LinearGradient
                    colors={["#7f1d1d", "#ef4444"]} // Novo gradiente vermelho
                    style={[styles.progressFill, { width: `${progress * 100}%` }]}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.quickActions}>
          <Pressable
            onPress={() => navigation.navigate("ListaUsuarios")}
            style={({ pressed }) => [styles.actionButton, pressed && styles.buttonPressed]}
          >
            <Text style={styles.actionButtonText}>👤 Perfil</Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate("Perfil")}
            style={({ pressed }) => [styles.actionButtonOutline, pressed && styles.buttonPressed]}
          >
            <Text style={styles.actionButtonOutlineText}>✏️ Editar</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.mainGrid}>
        {/* DESAFIOS */}
        <Pressable
          style={({ pressed }) => [
            styles.gridCard,
            styles.gridCardLarge,
            { width: width - 32 },
            pressed && { opacity: 0.8 },
          ]}
          onPress={() => navigation.navigate("Desafios")}
        >
          <LinearGradient colors={["#4a0404", "#991b1b"]} style={styles.gradientCard}>
            <Text style={styles.cardIcon}>🎯</Text>
            <Text style={styles.gridCardTitle}>Desafios</Text>
            <Text style={styles.gridCardSubtitle}>Completa missões diárias</Text>
          </LinearGradient>
        </Pressable>

        {/* EXERCÍCIOS (Destaque Principal) */}
        <Pressable
          style={({ pressed }) => [
            styles.gridCard,
            { width: (width - 42) / 2 },
            pressed && { opacity: 0.8 },
          ]}
          onPress={() => navigation.navigate("SelecaoExercicios")}
        >
          <LinearGradient colors={["#7f1d1d", "#ef4444"]} style={styles.gradientCard}>
            <Text style={styles.cardIcon}>📚</Text>
            <Text style={styles.gridCardTitle}>Exercícios</Text>
            <Text style={styles.gridCardSubtitle}>Pratica e aprende</Text>
          </LinearGradient>
        </Pressable>

        {/* LOJA */}
        <Pressable
          style={({ pressed }) => [styles.gridCard, { width: (width - 42) / 2 }, pressed && styles.cardPressed]}
          onPress={() => navigation.navigate("RewardsList")}
        >
          <LinearGradient colors={["#2a0808", "#5c0f0f"]} style={styles.gradientCard}>
            <Text style={styles.cardIcon}>🎁</Text>
            <Text style={styles.gridCardTitle}>Loja</Text>
            <Text style={styles.gridCardSubtitle}>Gasta o teu XP</Text>
          </LinearGradient>
        </Pressable>

        {/* CARRINHO */}
        <Pressable
          style={({ pressed }) => [styles.gridCard, { width: (width - 42) / 2 }, pressed && styles.cardPressed]}
          onPress={() => navigation.navigate("ShopCart")}
        >
          <LinearGradient colors={["#2a0808", "#5c0f0f"]} style={styles.gradientCard}>
            <Text style={styles.cardIcon}>🛒</Text>
            <Text style={styles.gridCardTitle}>Carrinho</Text>
          </LinearGradient>
        </Pressable>

        {/* AGENDAMENTO */}
        <Pressable
          style={({ pressed }) => [
            styles.gridCard,
            { width: (width - 42) / 2 },
            pressed && styles.cardPressed,
          ]}
          onPress={() => navigation.navigate("Agendamento")}
        >
          <LinearGradient colors={["#1f1f25", "#2d2d35"]} style={styles.gradientCard}>
            <Text style={styles.cardIcon}>📅</Text>
            <Text style={styles.gridCardTitle}>Agendamento</Text>
            <Text style={styles.gridCardSubtitle}>Marca horários</Text>
          </LinearGradient>
        </Pressable>

        {/* RECIBOS */}
        <Pressable
          style={({ pressed }) => [
            styles.gridCard,
            { width: (width - 42) / 2 },
            pressed && styles.cardPressed,
          ]}
          onPress={() => navigation.navigate("Receipts")}
        >
          <LinearGradient colors={["#1f1f25", "#2d2d35"]} style={styles.gradientCard}>
            <Text style={styles.cardIcon}>🧾</Text>
            <Text style={styles.gridCardTitle}>Recibos</Text>
          </LinearGradient>
        </Pressable>
      </View>

      <Pressable
        style={({ pressed }) => [styles.logoutButton, pressed && styles.buttonPressed]}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>Sair da conta</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#0f0f14", 
    padding: 16,
    paddingTop: 50 // Espaço para a barra de status
  },
  headerCard: { 
    backgroundColor: "#1a1a1f", 
    borderRadius: 24, 
    padding: 20, 
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)", // Glassmorphism
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  headerContent: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  logo: { width: 65, height: 65, marginRight: 16 },
  userInfo: { flex: 1 },
  welcome: { color: "rgba(255,255,255,0.6)", fontSize: 14 },
  userName: { color: "#fff", fontSize: 24, fontWeight: "800", marginBottom: 8 },
  levelContainer: { flexDirection: "row", alignItems: "center", gap: 12 },
  levelBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  levelText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  xpProgressContainer: { flex: 1 },
  xpTextRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  xpCurrent: { color: "#fff", fontSize: 12, fontWeight: "700" },
  xpTarget: { color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: "600" },
  progressBar: { height: 6, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 4 },
  quickActions: { flexDirection: "row", gap: 12 },
  actionButton: { 
    flex: 1, 
    padding: 12, 
    backgroundColor: "rgba(255,255,255,0.05)", 
    borderRadius: 12,
    alignItems: "center"
  },
  actionButtonText: { color: "#fff", fontWeight: "600" },
  actionButtonOutline: { 
    flex: 1, 
    padding: 12, 
    borderWidth: 1, 
    borderColor: "rgba(239,68,68,0.3)", // Borda com leve tom avermelhado
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "rgba(239,68,68,0.05)"
  },
  actionButtonOutlineText: { color: "#f87171", fontWeight: "600" }, // Texto avermelhado
  mainGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  gridCard: { 
    height: 120, 
    borderRadius: 16, 
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)", // Borda de vidro subtil nos cartões
  },
  gridCardLarge: { height: 130 },
  gradientCard: { flex: 1, padding: 16, justifyContent: "center" },
  cardIcon: { fontSize: 32, marginBottom: 8 },
  gridCardTitle: { color: "#fff", fontWeight: "800", fontSize: 16, marginBottom: 4 },
  gridCardSubtitle: { color: "rgba(255,255,255,0.6)", fontSize: 12 },
  logoutButton: { 
    marginTop: 25, 
    padding: 16, 
    alignItems: "center",
    backgroundColor: "rgba(239,68,68,0.1)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.2)",
  },
  logoutText: { color: "#ef4444", fontWeight: "800", fontSize: 16 },
  buttonPressed: { opacity: 0.7, transform: [{ scale: 0.98 }] },
  cardPressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
})