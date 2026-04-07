"use client"

import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { onAuthStateChanged, type User } from "firebase/auth";
import { get, ref } from "firebase/database"; // Realtime DB
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { auth, database } from "../services/connectionFirebase";

type ReceiptItem = { id: string; nome: string; precoXP: number; quantity: number }
type Receipt = {
  id: string
  items: ReceiptItem[]
  totalXP: number
  totalItens?: number
  createdAt?: string
}

export default function Receipts() {
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [loading, setLoading] = useState(true)
  const [uid, setUid] = useState<string | null>(null)
  const navigation = useNavigation<any>()

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
      const receiptsRef = ref(database, `users/${uid}/comprovantes`)
      const snapshot = await get(receiptsRef)

      if (snapshot.exists()) {
        const data = snapshot.val()
        const list: Receipt[] = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }))

        list.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA;
        })

        setReceipts(list)
      } else {
        setReceipts([])
      }
    } catch (e) {
      console.error("Erro ao buscar comprovantes", e)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "—"
    try {
      return new Date(dateString).toLocaleString("pt-BR")
    } catch {
      return "—"
    }
  }

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ef4444" />
      </View>
    )

  return (
    <View style={styles.container}>
      
      {/* CABEÇALHO COM SPACER */}
      <View style={styles.headerContainer}>
        <Pressable 
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]} 
          onPress={() => navigation.navigate("Dashboard")}
        >
          <Text style={styles.backButtonText}>← Voltar</Text>
        </Pressable>
        
        <View style={styles.titleWrapper}>
          <Text style={styles.headerTitle}>🧾 Recibos</Text>
        </View>
        
        <View style={styles.spacer} />
      </View>

      <FlatList
        data={receipts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.receiptCard}>
            <LinearGradient
              colors={["#4a0404", "#991b1b"]} // Gradiente Bordô/Vermelho
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.dateHeader}
            >
              <Text style={styles.dateIcon}>📅</Text>
              <Text style={styles.dateText}>{formatDate(item.createdAt || "")}</Text>
            </LinearGradient>

            <View style={styles.itemsContainer}>
              {item.items && item.items.map((i, index) => (
                <View key={`${i.id}-${index}`} style={styles.itemRow}>
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
                  colors={["#7f1d1d", "#ef4444"]} // Gradiente Rubi Vivo
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
            <Text style={styles.emptySubtext}>As tuas compras aparecerão aqui</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f14",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f0f14",
  },
  
  // Header Spacer Layout
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
  headerTitle: { color: "#ffffff", fontSize: 24, fontWeight: "800" },
  spacer: { width: 85 },

  receiptCard: {
    backgroundColor: "#1a1a1f",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  dateHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 10,
  },
  dateIcon: { fontSize: 18 },
  dateText: { color: "#ffffff", fontSize: 15, fontWeight: "800" },
  itemsContainer: { padding: 16, gap: 12 },
  itemRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  itemLeft: { flex: 1 },
  itemName: { color: "#ffffff", fontSize: 15, fontWeight: "700", marginBottom: 4 },
  itemQuantity: { color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: "600" },
  itemPrice: { color: "#f87171", fontSize: 15, fontWeight: "800" }, // Vermelho claro para o preço
  totalSection: { paddingHorizontal: 16, paddingBottom: 16 },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.08)", marginBottom: 14 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  totalLabel: { color: "rgba(255,255,255,0.6)", fontSize: 15, fontWeight: "700" },
  totalBadge: { flexDirection: "row", alignItems: "baseline", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, gap: 5 },
  totalValue: { color: "#ffffff", fontSize: 18, fontWeight: "900" },
  totalXP: { color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: "700" },
  emptyContainer: { alignItems: "center", paddingVertical: 80 },
  emptyIcon: { fontSize: 60, marginBottom: 16 },
  emptyText: { color: "#ffffff", fontSize: 18, fontWeight: "800", marginBottom: 8 },
  emptySubtext: { color: "rgba(255,255,255,0.5)", fontSize: 14, fontWeight: "600" },
})