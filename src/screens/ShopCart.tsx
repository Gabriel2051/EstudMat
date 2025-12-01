import { useNavigation } from "@react-navigation/native"
import { LinearGradient } from "expo-linear-gradient"
import { FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native"
import { useStore } from "../screens/Store"
import { showAlert } from "../utils/platformAlert"

export default function ShopCart() {
  const navigation = useNavigation()

  const { cart, incrementQty, decrementQty, removeFromCart, purchaseCart, xp, inventory } = useStore()

  const total = cart.reduce((s, it) => s + it.precoXP * it.quantity, 0)

  const handlePurchase = async () => {
    if (cart.length === 0) {
      showAlert("Carrinho vazio", "Adicione recompensas antes de comprar.")
      return
    }

    if (total > xp) {
      showAlert("XP insuficiente", `Você precisa de ${total} XP, mas tem apenas ${xp} XP.`)
      return
    }

    const result = await purchaseCart()
    showAlert(result.success ? "✓ Sucesso" : "Erro", result.message)

    if (result.success) {
      navigation.navigate("Receipts" as never)
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
  style={[
    styles.purchaseButton,
    total > xp && { opacity: 0.6 }
  ]}
  android_ripple={{ color: "rgba(99,102,241,0.3)" }}
  onPress={total > xp ? null : handlePurchase}
>
  <LinearGradient
    colors={total > xp ? ["#4b5563", "#6b7280"] : ["#6366f1", "#8b5cf6"]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    style={styles.purchaseButtonGradient}
  >
    <Text style={styles.purchaseButtonText}>
      {total > xp ? "XP insuficiente" : "Finalizar Compra"}
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
    backgroundColor: "#0a0a0f",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "800",
  },
  subtitle: {
    color: "#9ca3af",
    fontSize: 14,
    marginTop: 4,
  },
  xpBadge: {
    flexDirection: "row",
    alignItems: "baseline",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  xpText: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "800",
  },
  xpLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    fontWeight: "600",
  },
  receiptsButton: {
    backgroundColor: "rgba(99,102,241,0.15)",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.3)",
  },
  receiptsButtonText: {
    color: "#c7d2fe",
    fontWeight: "700",
    fontSize: 15,
    textAlign: "center",
  },
  cartItem: {
    backgroundColor: "#141419",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.1)",
    flexDirection: "row",
  },
  imageContainer: {
    width: 100,
    height: 120,
    backgroundColor: "#1e1b4b",
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
    fontSize: 32,
  },
  itemContent: {
    flex: 1,
    padding: 12,
  },
  itemName: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginBottom: 12,
  },
  itemPrice: {
    color: "#c7d2fe",
    fontSize: 14,
    fontWeight: "600",
  },
  itemMultiplier: {
    color: "#6b7280",
    fontSize: 13,
  },
  itemTotal: {
    color: "#ffffff",
    fontSize: 16,
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
    gap: 12,
    backgroundColor: "rgba(99,102,241,0.1)",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
  },
  qtyButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(99,102,241,0.2)",
    borderRadius: 8,
  },
  qtyButtonText: {
    color: "#c7d2fe",
    fontSize: 18,
    fontWeight: "700",
  },
  quantity: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    minWidth: 24,
    textAlign: "center",
  },
  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  removeButtonText: {
    color: "#fca5a5",
    fontSize: 13,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  emptySubtext: {
    color: "#9ca3af",
    fontSize: 14,
  },
  checkoutSection: {
    backgroundColor: "#141419",
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.1)",
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 16,
  },
  totalLabel: {
    color: "#9ca3af",
    fontSize: 16,
    fontWeight: "600",
  },
  totalPriceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  totalPrice: {
    color: "#ffffff",
    fontSize: 32,
    fontWeight: "800",
  },
  totalXP: {
    color: "#9ca3af",
    fontSize: 16,
    fontWeight: "600",
  },
  purchaseButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  purchaseButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  purchaseButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
  },
  inventorySection: {
    marginTop: 20,
    backgroundColor: "#141419",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.1)",
  },
  inventoryTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 12,
  },
  inventoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  inventoryItem: {
    backgroundColor: "rgba(99,102,241,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.3)",
  },
  inventoryItemText: {
    color: "#c7d2fe",
    fontSize: 12,
    fontWeight: "700",
  },
})
