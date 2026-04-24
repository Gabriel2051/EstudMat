"use client"

import PageLayout from "@/components/PageLayout"
import useResponsive from "@/hooks/useResponsive"
import { type Reward, useStore } from "@/screens/Store"
import { showAlert } from "@/utils/platformAlert"
import { useNavigation } from "@react-navigation/native"
import { LinearGradient } from "expo-linear-gradient"
import { useEffect, useState } from "react"
import { ActivityIndicator, FlatList, Image, Platform, Pressable, StyleSheet, Text, View } from "react-native"

const fallbackRewards: Reward[] = [
  { id: "default-1", nome: "Caderno Premium", precoXP: 120, descricao: "Caderno exclusivo para anotações", imagem: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80" },
  { id: "default-2", nome: "Curso de Matemática", precoXP: 220, descricao: "Acesso a um curso rápido de revisão", imagem: "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=800&q=80" },
  { id: "default-3", nome: "Caneta Neon", precoXP: 60, descricao: "Caneta para marcar seus estudos", imagem: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80" },
]

export default function RewardsList() {
  const [rewards, setRewards] = useState<Reward[]>(fallbackRewards)
  const [loading, setLoading] = useState(false)
  const navigation = useNavigation<any>()
  const { addToCart, xp } = useStore()
  const { width } = useResponsive()

  useEffect(() => {
    fetchRewards()
  }, [])

  const fetchRewards = async () => {
    setLoading(true)
    try {
      const BIN_ID = "69243e2543b1c97be9c1d174"
      const API_KEY = process.env.EXPO_PUBLIC_JSONBIN_API_KEY
      const url = `https://api.jsonbin.io/v3/b/${BIN_ID}/latest`
      const res = await fetch(url, {
        headers: {
          "X-Master-Key": API_KEY,
        },
      })

      const json = await res.json()
      const remoteRewards: Reward[] = json.record?.recompensas || []

      if (remoteRewards.length === 0) {
        console.warn("Nenhuma recompensa retornada da API, usando valores padrão")
        setRewards(fallbackRewards)
      } else {
        setRewards(remoteRewards)
      }
    } catch (e) {
      console.warn("Erro ao buscar recompensas", e)
      showAlert("Erro", "Não foi possível carregar recompensas. Verifique a URL.")
      setRewards(fallbackRewards)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#ef4444" />
      </View>
    )
  }

  return (
    <PageLayout title="Loja" subtitle="Resgate itens com o seu XP" activeScreen="RewardsList">
      <View style={styles.container}>
        
        {/* NOVO CABEÇALHO COM BOTÃO VOLTAR (Spacer Layout) */}
        <View style={styles.headerContainer}>
        <Pressable 
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]} 
          onPress={() => navigation.navigate("Dashboard")}
        >
          <Text style={styles.backButtonText}>← Voltar</Text>
        </Pressable>
        
        <View style={styles.titleWrapper}>
          <Text style={styles.headerTitle}>🎁 Loja</Text>
        </View>
        
        <View style={styles.spacer} />
      </View>

      {/* HEADER DE XP E SUBTÍTULO */}
      <View style={styles.xpHeader}>
        <Text style={styles.subtitle}>Resgate itens com o seu XP</Text>
        <LinearGradient
          colors={["#7f1d1d", "#ef4444"]}
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
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.rewardCard}>
            <View style={styles.imageContainer}>
              {item.imagem ? (
                <Image source={{ uri: item.imagem }} style={styles.rewardImage} resizeMode="cover" />
              ) : (
                <LinearGradient colors={["#4a0404", "#991b1b"]} style={styles.imagePlaceholder}>
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
                  android_ripple={{ color: "rgba(239,68,68,0.3)" }}
                  style={({ pressed }) => [styles.addButton, pressed && styles.buttonPressed]}
                  onPress={() => {
                    addToCart(item)
                    showAlert("✓ Adicionado", `${item.nome} foi adicionado ao carrinho!`)
                  }}
                >
                  <LinearGradient
                    colors={["#7f1d1d", "#ef4444"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.addButtonGradient}
                  >
                    <Text style={styles.addButtonText}>ADICIONAR</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      />

      <Pressable
        android_ripple={{ color: "rgba(239,68,68,0.3)" }}
        style={styles.cartButton}
        onPress={() => navigation.navigate("ShopCart")}
      >
        <LinearGradient
          colors={["#ef4444", "#7f1d1d"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.cartButtonGradient}
        >
          <Text style={styles.cartButtonIcon}>🛒</Text>
          <Text style={styles.cartButtonText}>Ver Carrinho</Text>
        </LinearGradient>
      </Pressable>
      </View>
    </PageLayout>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f14",
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  
  // Cabeçalho com Spacer
  headerContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 20,
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
  backButtonText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  titleWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: "#ffffff", fontSize: 24, fontWeight: "800" },
  spacer: { width: 85 },

  // Header do XP
  xpHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  subtitle: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    fontWeight: "600",
  },
  xpBadge: {
    flexDirection: "row",
    alignItems: "baseline",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 5,
  },
  xpText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "900",
  },
  xpLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    fontWeight: "700",
  },

  // Cartões de Recompensa
  rewardCard: {
    backgroundColor: "#1a1a1f",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  imageContainer: {
    width: "100%",
    height: 150,
    backgroundColor: "#111",
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
    padding: 16,
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
    marginBottom: 16,
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
    color: "#f87171",
    fontSize: 24,
    fontWeight: "900",
  },
  priceLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    fontWeight: "700",
  },
  addButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  addButtonGradient: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  addButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  
  // Botão Flutuante do Carrinho
  cartButton: {
    position: "absolute",
    right: 20,
    bottom: 30,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  cartButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 8,
  },
  cartButtonIcon: {
    fontSize: 20,
  },
  cartButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }]
  },
})