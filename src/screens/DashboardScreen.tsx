"use client"

import { useNavigation } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import { LinearGradient } from "expo-linear-gradient"
import { Dimensions, Image, Pressable, StyleSheet, Text, View } from "react-native"
import { useEffect, useState } from "react"
import type { RootStackParamList } from "../../app/(tabs)/index"
import { auth } from "./../services/connectionFirebase"
import { showAlert } from "../utils/platformAlert"

const { width } = Dimensions.get("window")

type NavigationProps = StackNavigationProp<RootStackParamList>

export default function DashboardScreen() {
  const navigation = useNavigation<NavigationProps>()
  const [userEmail, setUserEmail] = useState<string>("")

  const level = 4
  const currentXP = 320
  const xpToNext = 500
  const progress = Math.min(1, currentXP / xpToNext)

  useEffect(() => {
    const user = auth.currentUser
    if (!user) {
      showAlert("Não autenticado", "Você precisa estar logado para acessar o dashboard.", [
        { text: "OK", onPress: () => navigation.replace("Login") },
      ])
      return
    }
    setUserEmail(user.email || "Usuário")
  }, [])

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
                  <Text style={styles.xpCurrent}>{currentXP} XP</Text>
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
          style={({ pressed }) => [styles.gridCard, styles.gridCardLarge, pressed && styles.cardPressed]}
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
          style={({ pressed }) => [styles.gridCard, pressed && styles.cardPressed]}
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
          style={({ pressed }) => [styles.gridCard, pressed && styles.cardPressed]}
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
          style={({ pressed }) => [styles.gridCard, pressed && styles.cardPressed]}
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
          style={({ pressed }) => [styles.gridCard, pressed && styles.cardPressed]}
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
          style={({ pressed }) => [styles.gridCard, pressed && styles.cardPressed]}
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
    backgroundColor: "#0a0a0f",
    padding: 20,
  },
  headerCard: {
    backgroundColor: "#141419",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.1)",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  logo: {
    width: 70,
    height: 70,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  welcome: {
    color: "#9ca3af",
    fontSize: 14,
    marginBottom: 4,
  },
  userName: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 12,
  },
  levelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  levelText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
  xpProgressContainer: {
    flex: 1,
  },
  xpTextRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 6,
  },
  xpCurrent: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  xpTarget: {
    color: "#6b7280",
    fontSize: 12,
    marginLeft: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: "rgba(99,102,241,0.1)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  quickActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "rgba(99,102,241,0.15)",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.3)",
  },
  actionButtonText: {
    color: "#c7d2fe",
    fontSize: 14,
    fontWeight: "700",
  },
  actionButtonOutline: {
    flex: 1,
    backgroundColor: "transparent",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  actionButtonOutlineText: {
    color: "#e5e7eb",
    fontSize: 14,
    fontWeight: "700",
  },
  mainGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  gridCard: {
    width: (width - 52) / 2,
    height: 140,
    borderRadius: 16,
    overflow: "hidden",
  },
  gridCardLarge: {
    width: width - 40,
    height: 160,
  },
  gradientCard: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
  },
  cardIcon: {
    fontSize: 32,
  },
  gridCardTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 4,
  },
  gridCardSubtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
  },
  achievementsCard: {
    backgroundColor: "#141419",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.1)",
  },
  achievementsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  achievementsTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "800",
  },
  achievementsBadge: {
    backgroundColor: "rgba(99,102,241,0.2)",
    color: "#c7d2fe",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: "700",
  },
  achievementsGrid: {
    flexDirection: "row",
    gap: 16,
  },
  achievementItem: {
    alignItems: "center",
  },
  achievementBadge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  achievementEmoji: {
    fontSize: 28,
  },
  achievementLabel: {
    color: "#9ca3af",
    fontSize: 11,
    fontWeight: "600",
  },
  logoutButton: {
    backgroundColor: "rgba(239,68,68,0.1)",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.3)",
  },
  logoutText: {
    color: "#fca5a5",
    fontSize: 16,
    fontWeight: "700",
  },
  buttonPressed: {
    opacity: 0.8,
  },
  cardPressed: {
    opacity: 0.9,
  },
})
