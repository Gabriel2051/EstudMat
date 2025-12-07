"use client"

import { useState } from "react"

import { useNavigation } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import { LinearGradient } from "expo-linear-gradient"
import { Image, Pressable, StyleSheet, Text, View } from "react-native"
import { useEffect } from "react"
import type { RootStackParamList } from "../../app/(tabs)/index"
import { auth } from "./../services/connectionFirebase"
import { showAlert } from "../utils/platformAlert"
import { useStore } from "./Store"
import { useResponsive } from "../hooks/useResponsive"

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

  const handleComingSoon = (feature: string) => {
    showAlert("Em breve", `A funcionalidade "${feature}" estará disponível em breve!`)
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
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.progressFill, { width: `${progress * 100}%` }]}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.quickActions}>
          <Pressable
            android_ripple={{ color: "rgba(99,102,241,0.1)" }}
            onPress={() => navigation.navigate("ListaUsuarios")}
            style={({ pressed }) => [styles.actionButton, pressed && styles.buttonPressed]}
          >
            <Text style={styles.actionButtonText}>👤 Perfil</Text>
          </Pressable>

          <Pressable
            android_ripple={{ color: "rgba(99,102,241,0.1)" }}
            onPress={() => navigation.navigate("Perfil")}
            style={({ pressed }) => [styles.actionButtonOutline, pressed && styles.buttonPressed]}
          >
            <Text style={styles.actionButtonOutlineText}>✏️ Editar</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.mainGrid}>
        <Pressable
          android_ripple={{ color: "rgba(99,102,241,0.05)" }}
          style={({ pressed }) => [
            styles.gridCard,
            styles.gridCardLarge,
            { width: width - 32 },
            pressed && styles.cardPressed,
          ]}
          onPress={() => handleComingSoon("Desafios")}
        >
          <LinearGradient
            colors={["#1e1b4b", "#312e81"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientCard}
          >
            <Text style={styles.cardIcon}>🎯</Text>
            <Text style={styles.gridCardTitle}>Desafios</Text>
            <Text style={styles.gridCardSubtitle}>Complete missões diárias</Text>
          </LinearGradient>
        </Pressable>

        <Pressable
          android_ripple={{ color: "rgba(99,102,241,0.05)" }}
          style={({ pressed }) => [styles.gridCard, { width: (width - 42) / 2 }, pressed && styles.cardPressed]}
          onPress={() => handleComingSoon("Treinar")}
        >
          <LinearGradient
            colors={["#1e1b4b", "#312e81"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientCard}
          >
            <Text style={styles.cardIcon}>📚</Text>
            <Text style={styles.gridCardTitle}>Treinar</Text>
            <Text style={styles.gridCardSubtitle}>Pratique exercícios</Text>
          </LinearGradient>
        </Pressable>

        <Pressable
          android_ripple={{ color: "rgba(99,102,241,0.05)" }}
          style={({ pressed }) => [styles.gridCard, { width: (width - 42) / 2 }, pressed && styles.cardPressed]}
          onPress={() => navigation.navigate("RewardsList")}
        >
          <LinearGradient
            colors={["#581c87", "#6b21a8"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientCard}
          >
            <Text style={styles.cardIcon}>🎁</Text>
            <Text style={styles.gridCardTitle}>Loja</Text>
            <Text style={styles.gridCardSubtitle}>Resgatar prêmios</Text>
          </LinearGradient>
        </Pressable>

        <Pressable
          android_ripple={{ color: "rgba(99,102,241,0.05)" }}
          style={({ pressed }) => [styles.gridCard, { width: (width - 42) / 2 }, pressed && styles.cardPressed]}
          onPress={() => navigation.navigate("ShopCart")}
        >
          <LinearGradient
            colors={["#581c87", "#6b21a8"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientCard}
          >
            <Text style={styles.cardIcon}>🛒</Text>
            <Text style={styles.gridCardTitle}>Carrinho</Text>
            <Text style={styles.gridCardSubtitle}>Ver itens</Text>
          </LinearGradient>
        </Pressable>

        <Pressable
          android_ripple={{ color: "rgba(99,102,241,0.05)" }}
          style={({ pressed }) => [styles.gridCard, { width: (width - 42) / 2 }, pressed && styles.cardPressed]}
          onPress={() => navigation.navigate("Agendamento")}
        >
          <LinearGradient
            colors={["#065f46", "#047857"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientCard}
          >
            <Text style={styles.cardIcon}>📅</Text>
            <Text style={styles.gridCardTitle}>Agendar</Text>
            <Text style={styles.gridCardSubtitle}>Marcar horário</Text>
          </LinearGradient>
        </Pressable>

        <Pressable
          android_ripple={{ color: "rgba(99,102,241,0.05)" }}
          style={({ pressed }) => [styles.gridCard, { width: (width - 42) / 2 }, pressed && styles.cardPressed]}
          onPress={() => navigation.navigate("Receipts")}
        >
          <LinearGradient
            colors={["#065f46", "#047857"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientCard}
          >
            <Text style={styles.cardIcon}>🧾</Text>
            <Text style={styles.gridCardTitle}>Comprovantes</Text>
            <Text style={styles.gridCardSubtitle}>Ver histórico</Text>
          </LinearGradient>
        </Pressable>
      </View>

      <View style={styles.achievementsCard}>
        <View style={styles.achievementsHeader}>
          <Text style={styles.achievementsTitle}>🏆 Conquistas Recentes</Text>
          <Text style={styles.achievementsBadge}>3</Text>
        </View>
        <View style={styles.achievementsGrid}>
          <View style={styles.achievementItem}>
            <LinearGradient colors={["#fbbf24", "#f59e0b"]} style={styles.achievementBadge}>
              <Text style={styles.achievementEmoji}>⭐</Text>
            </LinearGradient>
            <Text style={styles.achievementLabel}>Iniciante</Text>
          </View>
          <View style={styles.achievementItem}>
            <LinearGradient colors={["#6366f1", "#8b5cf6"]} style={styles.achievementBadge}>
              <Text style={styles.achievementEmoji}>⚡</Text>
            </LinearGradient>
            <Text style={styles.achievementLabel}>Rápido</Text>
          </View>
          <View style={styles.achievementItem}>
            <LinearGradient colors={["#ec4899", "#f43f5e"]} style={styles.achievementBadge}>
              <Text style={styles.achievementEmoji}>🔥</Text>
            </LinearGradient>
            <Text style={styles.achievementLabel}>Sequência</Text>
          </View>
        </View>
      </View>

      <Pressable
        android_ripple={{ color: "rgba(239,68,68,0.2)" }}
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
  },
  headerCard: {
    backgroundColor: "#1a1a1f",
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  logo: {
    width: 60,
    height: 60,
    marginRight: 14,
  },
  userInfo: {
    flex: 1,
  },
  welcome: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    marginBottom: 4,
  },
  userName: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 10,
  },
  levelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  levelText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
  },
  xpProgressContainer: {
    flex: 1,
  },
  xpTextRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 5,
  },
  xpCurrent: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
  xpTarget: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 11,
    marginLeft: 3,
  },
  progressBar: {
    height: 7,
    backgroundColor: "rgba(99,102,241,0.15)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  quickActions: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "rgba(99,102,241,0.12)",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.25)",
  },
  actionButtonText: {
    color: "#a5b4fc",
    fontSize: 13,
    fontWeight: "700",
  },
  actionButtonOutline: {
    flex: 1,
    backgroundColor: "transparent",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  actionButtonOutlineText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    fontWeight: "700",
  },
  mainGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  gridCard: {
    height: 120,
    borderRadius: 14,
    overflow: "hidden",
  },
  gridCardLarge: {
    height: 140,
  },
  gradientCard: {
    flex: 1,
    padding: 14,
    justifyContent: "space-between",
  },
  cardIcon: {
    fontSize: 28,
  },
  gridCardTitle: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 3,
  },
  gridCardSubtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
  },
  achievementsCard: {
    backgroundColor: "#1a1a1f",
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  achievementsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  achievementsTitle: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "800",
  },
  achievementsBadge: {
    backgroundColor: "rgba(99,102,241,0.15)",
    color: "#a5b4fc",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    fontSize: 11,
    fontWeight: "700",
  },
  achievementsGrid: {
    flexDirection: "row",
    gap: 14,
  },
  achievementItem: {
    alignItems: "center",
  },
  achievementBadge: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  achievementEmoji: {
    fontSize: 24,
  },
  achievementLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
    fontWeight: "600",
  },
  logoutButton: {
    backgroundColor: "rgba(239,68,68,0.08)",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.25)",
  },
  logoutText: {
    color: "#ef4444",
    fontSize: 15,
    fontWeight: "700",
  },
  buttonPressed: {
    opacity: 0.8,
  },
  cardPressed: {
    opacity: 0.9,
  },
})
