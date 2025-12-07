"use client"

// src/screens/Receipts.tsx
import { onAuthStateChanged, type User } from "firebase/auth"
import { collection, getDocs, orderBy, query } from "firebase/firestore"
import { useEffect, useState } from "react"
import { ActivityIndicator, Dimensions, FlatList, StyleSheet, Text, View } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { auth, db } from "../services/connectionFirebase"

type ReceiptItem = { id: string; nome: string; precoXP: number; quantity: number }
type Receipt = {
  id: string
  items: ReceiptItem[]
  totalXP: number
  totalItens?: number
  createdAt?: any
}

const { width } = Dimensions.get("window")

export default function Receipts() {
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [loading, setLoading] = useState(true)
  const [uid, setUid] = useState<string | null>(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user: User | null) => {
      setUid(user ? user.uid : null)
    })
    return unsub
  }, [])

  useEffect(() => {
    if (!uid) {
      setReceipts([])
      setLoading(false)
      return
    }
    fetchReceipts()
  }, [uid])

  const fetchReceipts = async () => {
    setLoading(true)
    try {
      const receiptsRef = collection(db, "users", uid!, "comprovantes")
      const q = query(receiptsRef, orderBy("createdAt", "desc"))
      const snapshot = await getDocs(q)

      const data = snapshot.docs.map((doc) => {
        const d = doc.data() as any
        return {
          id: doc.id,
          items: d.items || [],
          totalXP: d.totalXP ?? 0,
          totalItens: d.totalItens ?? 0,
          createdAt: d.createdAt ?? null,
        } as Receipt
      })

      setReceipts(data)
    } catch (e) {
      console.error("Erro ao buscar comprovantes", e)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (v: any) => {
    if (!v) return "—"
    try {
      if (typeof v?.toDate === "function") return v.toDate().toLocaleString("pt-BR")
      if (v?.seconds) return new Date(v.seconds * 1000).toLocaleString("pt-BR")
      return new Date(v).toLocaleString("pt-BR")
    } catch {
      return "—"
    }
  }

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🧾 Comprovantes</Text>
        <Text style={styles.subtitle}>Histórico de compras</Text>
      </View>

      <FlatList
        data={receipts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.receiptCard}>
            <LinearGradient
              colors={["#1e1b4b", "#312e81"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.dateHeader}
            >
              <Text style={styles.dateIcon}>📅</Text>
              <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
            </LinearGradient>

            <View style={styles.itemsContainer}>
              {item.items.map((i) => (
                <View key={i.id} style={styles.itemRow}>
                  <View style={styles.itemLeft}>
                    <Text style={styles.itemName}>{i.nome}</Text>
                    <Text style={styles.itemQuantity}>Quantidade: {i.quantity}</Text>
                  </View>
                  <Text style={styles.itemPrice}>{i.precoXP * i.quantity} XP</Text>
                </View>
              ))}
            </View>

            <View style={styles.totalSection}>
              <View style={styles.divider} />
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Gasto</Text>
                <LinearGradient
                  colors={["#6366f1", "#8b5cf6"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.totalBadge}
                >
                  <Text style={styles.totalValue}>{item.totalXP}</Text>
                  <Text style={styles.totalXP}>XP</Text>
                </LinearGradient>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>Nenhum comprovante encontrado</Text>
            <Text style={styles.emptySubtext}>Suas compras aparecerão aqui</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f14",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f0f14",
  },
  header: {
    marginBottom: 20,
  },
  title: {
    color: "#ffffff",
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 3,
  },
  subtitle: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
  },
  receiptCard: {
    backgroundColor: "#1a1a1f",
    borderRadius: 14,
    marginBottom: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  dateHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 8,
  },
  dateIcon: {
    fontSize: 18,
  },
  dateText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  itemsContainer: {
    padding: 14,
    gap: 10,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  itemLeft: {
    flex: 1,
  },
  itemName: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 3,
  },
  itemQuantity: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
  },
  itemPrice: {
    color: "#a5b4fc",
    fontSize: 14,
    fontWeight: "700",
  },
  totalSection: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginBottom: 10,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 15,
    fontWeight: "600",
  },
  totalBadge: {
    flexDirection: "row",
    alignItems: "baseline",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 9,
    gap: 5,
  },
  totalValue: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "800",
  },
  totalXP: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 11,
    fontWeight: "600",
  },
  emptyContainer: {
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
})
