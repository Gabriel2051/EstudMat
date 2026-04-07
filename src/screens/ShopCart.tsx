"use client"

import { useNavigation } from "@react-navigation/native"
import { LinearGradient } from "expo-linear-gradient"
import { useState } from "react"
import { FlatList, Image, Platform, Pressable, StyleSheet, Text, View } from "react-native"
import { useStore } from "../screens/Store"
import { showAlert } from "../utils/platformAlert"

export default function ShopCart() {
  const navigation = useNavigation<any>()

  const { cart, incrementQty, decrementQty, removeFromCart, purchaseCart, xp, inventory } = useStore()

  const [isPurchasing, setIsPurchasing] = useState(false)

  const total = cart.reduce((s, it) => s + it.precoXP * it.quantity, 0)

  const handlePurchase = async () => {
    if (cart.length === 0) {
      showAlert("Carrinho vazio", "Adiciona recompensas antes de comprar.")
      return
    }

    if (total > xp) {
      showAlert("XP insuficiente", `Precisas de ${total} XP, mas tens apenas ${xp} XP.`)
      return
    }

    setIsPurchasing(true)

    try {
      const result = await purchaseCart()
      showAlert(result.success ? "✓ Sucesso" : "Erro", result.message)

      if (result.success) {
        navigation.navigate("Receipts")
      }
    } catch (error: any) {
      showAlert("Erro", `Erro inesperado: ${error?.message || "Desconhecido"}`)
    } finally {
      setIsPurchasing(false)
    }
  }

  return (
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
          <Text style={styles.headerTitle}>🛒 Carrinho</Text>
        </View>
        
        <View style={styles.spacer} />
      </View>

      {/* HEADER DE XP E ITENS */}
      <View style={styles.xpHeader}>
        <Text style={styles.subtitle}>
          {cart.length} {cart.length === 1 ? "item adicionado" : "itens adicionados"}
        </Text>
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

      <Pressable
        android_ripple={{ color: "rgba(239,68,68,0.2)" }}
        style={styles.receiptsButton}
        onPress={() => navigation.navigate("Receipts")}
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
            <Text style={styles.emptyText}>O teu carrinho está vazio</Text>
            <Text style={styles.emptySubtext}>Vai até à loja e adiciona recompensas!</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <View style={styles.imageContainer}>
              {item.imagem ? (
                <Image source={{ uri: item.imagem }} style={styles.itemImage} />
              ) : (
                <LinearGradient colors={["#4a0404", "#991b1b"]} style={styles.imagePlaceholder}>
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
                    android_ripple={{ color: "rgba(239,68,68,0.2)" }}
                  >
                    <Text style={styles.qtyButtonText}>−</Text>
                  </Pressable>
                  <Text style={styles.quantity}>{item.quantity}</Text>
                  <Pressable
                    onPress={() => incrementQty(item.id)}
                    style={styles.qtyButton}
                    android_ripple={{ color: "rgba(239,68,68,0.2)" }}
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
            <Text style={styles.totalLabel}>Total da Compra</Text>
            <View style={styles.totalPriceContainer}>
              <Text style={styles.totalPrice}>{total}</Text>
              <Text style={styles.totalXP}>XP</Text>
            </View>
          </View>

          <Pressable
            style={[styles.purchaseButton, (total > xp || isPurchasing) && { opacity: 0.6 }]}
            onPress={handlePurchase}
            disabled={isPurchasing}
          >
            <LinearGradient
              colors={total > xp ? ["#4b5563", "#6b7280"] : ["#7f1d1d", "#ef4444"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.purchaseButtonGradient}
            >
              <Text style={styles.purchaseButtonText}>
                {isPurchasing ? "A PROCESSAR..." : total > xp ? "XP INSUFICIENTE" : "FINALIZAR COMPRA"}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
      )}

      {inventory.length > 0 && (
        <View style={styles.inventorySection}>
          <Text style={styles.inventoryTitle}>📦 O teu Inventário ({inventory.length})</Text>
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
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
  },
  // Cabeçalho Spacer
  headerContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 24,
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
  headerTitle: { color: "#fff", fontSize: 24, fontWeight: "800" },
  spacer: { width: 85 },

  // Resto do Layout
  xpHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  xpText: { color: "#ffffff", fontSize: 20, fontWeight: "900" },
  xpLabel: { color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: "700" },
  
  receiptsButton: {
    backgroundColor: "rgba(239,68,68,0.1)",
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.3)",
  },
  receiptsButtonText: {
    color: "#f87171",
    fontWeight: "800",
    fontSize: 14,
    textAlign: "center",
  },
  cartItem: {
    backgroundColor: "#1a1a1f",
    borderRadius: 16,
    marginBottom: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    flexDirection: "row",
  },
  imageContainer: { width: 95, height: 120, backgroundColor: "#111" },
  itemImage: { width: "100%", height: "100%" },
  imagePlaceholder: { width: "100%", height: "100%", alignItems: "center", justifyContent: "center" },
  placeholderIcon: { fontSize: 32 },
  itemContent: { flex: 1, padding: 14, justifyContent: "center" },
  itemName: { color: "#ffffff", fontSize: 16, fontWeight: "800", marginBottom: 8 },
  priceRow: { flexDirection: "row", alignItems: "baseline", gap: 8, marginBottom: 12 },
  itemPrice: { color: "#f87171", fontSize: 14, fontWeight: "700" },
  itemMultiplier: { color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: "600" },
  itemTotal: { color: "#ffffff", fontSize: 16, fontWeight: "800" },
  controls: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)"
  },
  qtyButton: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(239,68,68,0.15)",
    borderRadius: 8,
  },
  qtyButtonText: { color: "#f87171", fontSize: 18, fontWeight: "800" },
  quantity: { color: "#ffffff", fontSize: 16, fontWeight: "800", minWidth: 24, textAlign: "center" },
  removeButton: { paddingHorizontal: 10, paddingVertical: 5 },
  removeButtonText: { color: "#ef4444", fontSize: 13, fontWeight: "700" },
  
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 60 },
  emptyIcon: { fontSize: 60, marginBottom: 16 },
  emptyText: { color: "#ffffff", fontSize: 18, fontWeight: "800", marginBottom: 8 },
  emptySubtext: { color: "rgba(255,255,255,0.5)", fontSize: 14, fontWeight: "600" },
  
  checkoutSection: {
    backgroundColor: "#1a1a1f",
    borderRadius: 20,
    padding: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  totalContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 },
  totalLabel: { color: "rgba(255,255,255,0.6)", fontSize: 16, fontWeight: "700" },
  totalPriceContainer: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  totalPrice: { color: "#ffffff", fontSize: 32, fontWeight: "900" },
  totalXP: { color: "#f87171", fontSize: 16, fontWeight: "800" },
  purchaseButton: { borderRadius: 14, overflow: "hidden" },
  purchaseButtonGradient: { paddingVertical: 16, alignItems: "center" },
  purchaseButtonText: { color: "#ffffff", fontSize: 16, fontWeight: "800", letterSpacing: 1 },
  
  inventorySection: {
    marginTop: 20,
    backgroundColor: "#1a1a1f",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  inventoryTitle: { color: "#ffffff", fontSize: 16, fontWeight: "800", marginBottom: 14 },
  inventoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  inventoryItem: {
    backgroundColor: "rgba(239,68,68,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.3)",
  },
  inventoryItemText: { color: "#f87171", fontSize: 13, fontWeight: "800" },
})