"use client"

// src/screens/RewardsList.tsx
import { useNavigation } from "@react-navigation/native"
import { useEffect, useState } from "react"
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { type Reward, useStore } from "../screens/Store"
import { showAlert } from "../utils/platformAlert"
import useResponsive from "../hooks/useResponsive"

export default function RewardsList() {
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loading, setLoading] = useState(false)
  const navigation = useNavigation()
  const { addToCart, xp } = useStore()
  const { width } = useResponsive()

  useEffect(() => {
    fetchRewards()
  }, [])

  const fetchRewards = async () => {
    setLoading(true)
    try {
      const BIN_ID = "69243e2543b1c97be9c1d174"
      const API_KEY = "$2a$10$TebTD95aYE0tZmZoHHV3EOVwvl.LKjutEgi2.IatoC0cLw7xEJqki"
      const url = `https://api.jsonbin.io/v3/b/${BIN_ID}/latest`
      const res = await fetch(url, {
        headers: {
          "X-Master-Key": API_KEY,
        },
      })

      const json = await res.json()

      setRewards(json.record?.recompensas || [])
    } catch (e) {
      console.warn("Erro ao buscar recompensas", e)
      showAlert("Erro", "Não foi possível carregar recompensas. Verifique a URL.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>🎁 Loja de Recompensas</Text>
          <Text style={styles.subtitle}>Resgate itens com seu XP</Text>
        </View>
        <LinearGradient
          colors={["#6366f1", "#8b5cf6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.xpBadge}
        >
          <Text style={styles.xpText}>{xp}</Text>
          <Text style={styles.xpLabel}>XP</Text>
        </LinearGradient>
      </View>

      <FlatList
        data={rewards}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <View style={styles.rewardCard}>
            <View style={styles.imageContainer}>
              {item.imagem ? (
                <Image source={{ uri: item.imagem }} style={styles.rewardImage} resizeMode="cover" />
              ) : (
                <LinearGradient colors={["#1e1b4b", "#312e81"]} style={styles.imagePlaceholder}>
                  <Text style={styles.placeholderIcon}>🎁</Text>
                </LinearGradient>
              )}
            </View>

            <View style={styles.rewardContent}>
              <Text style={styles.rewardName}>{item.nome}</Text>
              <Text style={styles.rewardDesc} numberOfLines={2}>
                {item.descricao}
              </Text>

              <View style={styles.rewardFooter}>
                <View style={styles.priceContainer}>
                  <Text style={styles.priceValue}>{item.precoXP}</Text>
                  <Text style={styles.priceLabel}>XP</Text>
                </View>

                <Pressable
                  android_ripple={{ color: "rgba(99,102,241,0.3)" }}
                  style={({ pressed }) => [styles.addButton, pressed && styles.buttonPressed]}
                  onPress={() => {
                    addToCart(item)
                    showAlert("✓ Adicionado", `${item.nome} foi adicionado ao carrinho!`)
                  }}
                >
                  <LinearGradient
                    colors={["#6366f1", "#8b5cf6"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.addButtonGradient}
                  >
                    <Text style={styles.addButtonText}>Adicionar</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      />

      <Pressable
        android_ripple={{ color: "rgba(99,102,241,0.3)" }}
        style={styles.cartButton}
        onPress={() => navigation.navigate("ShopCart" as never)}
      >
        <LinearGradient
          colors={["#8b5cf6", "#6366f1"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.cartButtonGradient}
        >
          <Text style={styles.cartButtonIcon}>🛒</Text>
          <Text style={styles.cartButtonText}>Carrinho</Text>
        </LinearGradient>
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
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    color: "#ffffff",
    fontSize: 26,
    fontWeight: "800",
  },
  subtitle: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    marginTop: 3,
  },
  xpBadge: {
    flexDirection: "row",
    alignItems: "baseline",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 5,
  },
  xpText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "800",
  },
  xpLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 11,
    fontWeight: "600",
  },
  rewardCard: {
    backgroundColor: "#1a1a1f",
    borderRadius: 14,
    marginBottom: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  imageContainer: {
    width: "100%",
    height: 150,
    backgroundColor: "#16161a",
  },
  rewardImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderIcon: {
    fontSize: 40,
  },
  rewardContent: {
    padding: 14,
  },
  rewardName: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 6,
  },
  rewardDesc: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 14,
  },
  rewardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 5,
  },
  priceValue: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "800",
  },
  priceLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    fontWeight: "600",
  },
  addButton: {
    borderRadius: 10,
    overflow: "hidden",
  },
  addButtonGradient: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  addButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  cartButton: {
    position: "absolute",
    right: 16,
    bottom: 16,
    borderRadius: 14,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cartButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 12,
    gap: 7,
  },
  cartButtonIcon: {
    fontSize: 18,
  },
  cartButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  buttonPressed: {
    opacity: 0.85,
  },
})
