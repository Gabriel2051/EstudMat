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

  const level = 4
  const xpToNext = 500
  const progress = Math.min(1, userXP / xpToNext)

  useEffect(() => {
    const user = auth.currentUser
    if (!user) {
      showAlert("Não autenticado", "Você precisa estar logado para acessar o dashboard.", [
        { text: "OK", onPress: () => navigation.replace("Login") },
      ])
      return
    }
    setUserEmail(user.email || "Usuário")
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
      console.error("Erro ao fazer logout:", error)
      showAlert("Erro", "Não foi possível sair da conta. Tente novamente.")
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerCard}>
        <View style={styles.headerContent}>
          <Image source={require("../../assets/images/Midia.png")} style={styles.logo} resizeMode="contain" />
          <View style={styles.userInfo}>
            <Text style={styles.welcome}>Bem-vindo(a),</Text>
            <Text style={styles.userName}>{userEmail.split("@")[0] || "Usuário"}</Text>

            <View style={styles.levelContainer}>
              <LinearGradient
                colors={["#6366f1", "#8b5cf6"]}
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
                    colors={["#6366f1", "#8b5cf6"]}
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
          <LinearGradient colors={["#1e1b4b", "#312e81"]} style={styles.gradientCard}>
            <Text style={styles.cardIcon}>🎯</Text>
            <Text style={styles.gridCardTitle}>Desafios</Text>
            <Text style={styles.gridCardSubtitle}>Complete missões diárias</Text>
          </LinearGradient>
        </Pressable>

        {/* TREINAR */}
        <Pressable
          style={({ pressed }) => [
            styles.gridCard,
            { width: (width - 42) / 2 },
            pressed && { opacity: 0.8 },
          ]}
          onPress={() => navigation.navigate("SelecaoExercicios")}
        >
          <LinearGradient colors={["#1e1b4b", "#312e81"]} style={styles.gradientCard}>
            <Text style={styles.cardIcon}>📚</Text>
            <Text style={styles.gridCardTitle}>Exercicios</Text>
            <Text style={styles.gridCardSubtitle}>Pratique exercícios</Text>
          </LinearGradient>
        </Pressable>

        {/* LOJA */}
        <Pressable
          style={({ pressed }) => [styles.gridCard, { width: (width - 42) / 2 }, pressed && styles.cardPressed]}
          onPress={() => navigation.navigate("RewardsList")}
        >
          <LinearGradient colors={["#581c87", "#6b21a8"]} style={styles.gradientCard}>
            <Text style={styles.cardIcon}>🎁</Text>
            <Text style={styles.gridCardTitle}>Loja</Text>
          </LinearGradient>
        </Pressable>

        {/* CARRINHO */}
        <Pressable
          style={({ pressed }) => [styles.gridCard, { width: (width - 42) / 2 }, pressed && styles.cardPressed]}
          onPress={() => navigation.navigate("ShopCart")}
        >
          <LinearGradient colors={["#581c87", "#6b21a8"]} style={styles.gradientCard}>
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
          <LinearGradient colors={["#0f766e", "#14b8a6"]} style={styles.gradientCard}>
            <Text style={styles.cardIcon}>📅</Text>
            <Text style={styles.gridCardTitle}>Agendamento</Text>
            <Text style={styles.gridCardSubtitle}>Marque horários</Text>
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
          <LinearGradient colors={["#92400e", "#f59e0b"]} style={styles.gradientCard}>
            <Text style={styles.cardIcon}>🧾</Text>
            <Text style={styles.gridCardTitle}>Recibos</Text>
            <Text style={styles.gridCardSubtitle}>Veja seus pagamentos</Text>
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
  container: { flex: 1, backgroundColor: "#0f0f14", padding: 16 },
  headerCard: { backgroundColor: "#1a1a1f", borderRadius: 16, padding: 18, marginBottom: 20 },
  headerContent: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  logo: { width: 60, height: 60, marginRight: 14 },
  userInfo: { flex: 1 },
  welcome: { color: "rgba(255,255,255,0.6)" },
  userName: { color: "#fff", fontSize: 22, fontWeight: "800" },
  levelContainer: { flexDirection: "row", alignItems: "center", gap: 10 },
  levelBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  levelText: { color: "#fff", fontSize: 11 },
  xpProgressContainer: { flex: 1 },
  xpTextRow: { flexDirection: "row" },
  xpCurrent: { color: "#fff" },
  xpTarget: { color: "#aaa" },
  progressBar: { height: 7, backgroundColor: "#333", borderRadius: 4 },
  progressFill: { height: "100%" },
  quickActions: { flexDirection: "row", gap: 10 },
  actionButton: { flex: 1, padding: 10, backgroundColor: "#333", borderRadius: 10 },
  actionButtonText: { color: "#fff" },
  actionButtonOutline: { flex: 1, padding: 10, borderWidth: 1, borderColor: "#555", borderRadius: 10 },
  actionButtonOutlineText: { color: "#fff" },
  mainGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  gridCard: { height: 120, borderRadius: 14, overflow: "hidden" },
  gridCardLarge: { height: 140 },
  gradientCard: { flex: 1, padding: 14 },
  cardIcon: { fontSize: 28 },
  gridCardTitle: { color: "#fff", fontWeight: "800" },
  gridCardSubtitle: { color: "#aaa" },
  logoutButton: { marginTop: 20, padding: 14, alignItems: "center" },
  logoutText: { color: "#ef4444" },
  buttonPressed: { opacity: 0.8 },
  cardPressed: { opacity: 0.9 },
})