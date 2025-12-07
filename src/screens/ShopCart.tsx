"use client"

import { useNavigation } from "@react-navigation/native"
import { LinearGradient } from "expo-linear-gradient"
import { useState } from "react"
import { FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native"
import { useStore } from "../screens/Store"
import { showAlert } from "../utils/platformAlert"

export default function ShopCart() {
  const navigation = useNavigation()

  const { cart, incrementQty, decrementQty, removeFromCart, purchaseCart, xp, inventory } = useStore()

  const [isPurchasing, setIsPurchasing] = useState(false)

  const total = cart.reduce((s, it) => s + it.precoXP * it.quantity, 0)

  const handlePurchase = async () => {
    console.log("[v0] handlePurchase chamado")
    console.log("[v0] Carrinho length:", cart.length)
    console.log("[v0] Total XP necessário:", total)
    console.log("[v0] XP disponível:", xp)

    if (cart.length === 0) {
      showAlert("Carrinho vazio", "Adicione recompensas antes de comprar.")
      return
    }

    if (total > xp) {
      showAlert("XP insuficiente", `Você precisa de ${total} XP, mas tem apenas ${xp} XP.`)
      return
    }

    setIsPurchasing(true)

    try {
      console.log("[v0] Chamando purchaseCart...")
      const result = await purchaseCart()
      console.log("[v0] Resultado:", result)

      showAlert(result.success ? "✓ Sucesso" : "Erro", result.message)

      if (result.success) {
        navigation.navigate("Receipts" as never)
      }
    } catch (error: any) {
      console.error("[v0] Erro no handlePurchase:", error)
      showAlert("Erro", `Erro inesperado: ${error?.message || "Desconhecido"}`)
    } finally {
      setIsPurchasing(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>🛒 Seu Carrinho</Text>
          <Text style={styles.subtitle}>
            {cart.length} {cart.length === 1 ? "item" : "itens"}
          </Text>
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

      <Pressable
        android_ripple={{ color: "rgba(99,102,241,0.2)" }}
        style={styles.receiptsButton}
        onPress={() => navigation.navigate("Receipts" as never)}
      >
        <Text style={styles.receiptsButtonText}>🧾 Ver Comprovantes</Text>
      </Pressable>

      <FlatList
        data={cart}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🛍️</Text>
            <Text style={styles.emptyText}>Seu carrinho está vazio</Text>
            <Text style={styles.emptySubtext}>Adicione recompensas da loja!</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <View style={styles.imageContainer}>
              {item.imagem ? (
                <Image source={{ uri: item.imagem }} style={styles.itemImage} />
              ) : (
                <LinearGradient colors={["#1e1b4b", "#312e81"]} style={styles.imagePlaceholder}>
                  <Text style={styles.placeholderIcon}>🎁</Text>
                </LinearGradient>
              )}
            </View>

            <View style={styles.itemContent}>
              <Text style={styles.itemName}>{item.nome}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.itemPrice}>{item.precoXP} XP</Text>
                <Text style={styles.itemMultiplier}>× {item.quantity}</Text>
                <Text style={styles.itemTotal}>{item.precoXP * item.quantity} XP</Text>
              </View>

              <View style={styles.controls}>
                <View style={styles.quantityControls}>
                  <Pressable
                    onPress={() => decrementQty(item.id)}
                    style={styles.qtyButton}
                    android_ripple={{ color: "rgba(99,102,241,0.2)" }}
                  >
                    <Text style={styles.qtyButtonText}>−</Text>
                  </Pressable>
                  <Text style={styles.quantity}>{item.quantity}</Text>
                  <Pressable
                    onPress={() => incrementQty(item.id)}
                    style={styles.qtyButton}
                    android_ripple={{ color: "rgba(99,102,241,0.2)" }}
                  >
                    <Text style={styles.qtyButtonText}>+</Text>
                  </Pressable>
                </View>

                <Pressable
                  onPress={() => removeFromCart(item.id)}
                  style={styles.removeButton}
                  android_ripple={{ color: "rgba(239,68,68,0.2)" }}
                >
                  <Text style={styles.removeButtonText}>🗑️ Remover</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      />

      {cart.length > 0 && (
        <View style={styles.checkoutSection}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total</Text>
            <View style={styles.totalPriceContainer}>
              <Text style={styles.totalPrice}>{total}</Text>
              <Text style={styles.totalXP}>XP</Text>
            </View>
          </View>

          <Pressable
            style={[styles.purchaseButton, (total > xp || isPurchasing) && { opacity: 0.6 }]}
            android_ripple={{ color: "rgba(99,102,241,0.3)" }}
            onPress={handlePurchase}
            disabled={isPurchasing}
          >
            <LinearGradient
              colors={total > xp ? ["#4b5563", "#6b7280"] : ["#6366f1", "#8b5cf6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.purchaseButtonGradient}
            >
              <Text style={styles.purchaseButtonText}>
                {isPurchasing ? "Processando..." : total > xp ? "XP insuficiente" : "Finalizar Compra"}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
      )}

      {inventory.length > 0 && (
        <View style={styles.inventorySection}>
          <Text style={styles.inventoryTitle}>📦 Inventário ({inventory.length})</Text>
          <View style={styles.inventoryGrid}>
            {inventory.map((it, idx) => (
              <View key={`${it.id}-${idx}`} style={styles.inventoryItem}>
                <Text style={styles.inventoryItemText}>{it.nome}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f14",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
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
  receiptsButton: {
    backgroundColor: "rgba(99,102,241,0.12)",
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.25)",
  },
  receiptsButtonText: {
    color: "#a5b4fc",
    fontWeight: "700",
    fontSize: 14,
    textAlign: "center",
  },
  cartItem: {
    backgroundColor: "#1a1a1f",
    borderRadius: 14,
    marginBottom: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    flexDirection: "row",
  },
  imageContainer: {
    width: 90,
    height: 110,
    backgroundColor: "#16161a",
  },
  itemImage: {
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
    fontSize: 28,
  },
  itemContent: {
    flex: 1,
    padding: 12,
  },
  itemName: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 7,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    marginBottom: 10,
  },
  itemPrice: {
    color: "#a5b4fc",
    fontSize: 13,
    fontWeight: "600",
  },
  itemMultiplier: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
  },
  itemTotal: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(99,102,241,0.08)",
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 8,
  },
  qtyButton: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(99,102,241,0.15)",
    borderRadius: 7,
  },
  qtyButtonText: {
    color: "#a5b4fc",
    fontSize: 16,
    fontWeight: "700",
  },
  quantity: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
    minWidth: 20,
    textAlign: "center",
  },
  removeButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 7,
  },
  removeButtonText: {
    color: "#ef4444",
    fontSize: 12,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 54,
    marginBottom: 14,
  },
  emptyText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 6,
  },
  emptySubtext: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
  },
  checkoutSection: {
    backgroundColor: "#1a1a1f",
    borderRadius: 14,
    padding: 18,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 14,
  },
  totalLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 15,
    fontWeight: "600",
  },
  totalPriceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 5,
  },
  totalPrice: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "800",
  },
  totalXP: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    fontWeight: "600",
  },
  purchaseButton: {
    borderRadius: 10,
    overflow: "hidden",
  },
  purchaseButtonGradient: {
    paddingVertical: 14,
    alignItems: "center",
  },
  purchaseButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  inventorySection: {
    marginTop: 18,
    backgroundColor: "#1a1a1f",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  inventoryTitle: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 10,
  },
  inventoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },
  inventoryItem: {
    backgroundColor: "rgba(99,102,241,0.12)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.25)",
  },
  inventoryItemText: {
    color: "#a5b4fc",
    fontSize: 11,
    fontWeight: "700",
  },
})
