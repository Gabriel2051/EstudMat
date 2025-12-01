"use client"

// screens/ListaUsuarios.tsx
import { useEffect, useCallback, useState } from "react"
import { View, Text, StyleSheet, Dimensions, Pressable, ActivityIndicator } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useNavigation, useIsFocused } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import { ref, get } from "firebase/database"
import { database, auth } from "../services/connectionFirebase"
import type { RootStackParamList } from "../../app/(tabs)/index"
import { showAlert } from "../utils/platformAlert"

const { width } = Dimensions.get("window")

type ListaUsuariosNavigationProp = StackNavigationProp<RootStackParamList, "ListaUsuarios">

type UserData = {
  uid: string
  nome: string
  email: string
  phone?: string
  telefone?: string
  city?: string
  cidade?: string
  raw?: unknown
}

export default function ListaUsuarios() {
  const navigation = useNavigation<ListaUsuariosNavigationProp>()
  const isFocused = useIsFocused()

  const [loading, setLoading] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)

  const carregarUsuarioConectado = useCallback(async () => {
    const currentUser = auth.currentUser
    if (!currentUser) {
      showAlert("Não autenticado", "Nenhum usuário autenticado. Faça login para ver seu perfil.", [{ text: "OK" }])
      setUserData(null)
      return
    }

    const uid = currentUser.uid
    console.log("[ListaUsuarios] uid atual:", uid)
    setLoading(true)

    try {
      const snap = await get(ref(database, `users/${uid}`))
      if (snap.exists()) {
        const data = snap.val()
        console.log("[ListaUsuarios] dados do usuário conectado:", data)

        const nome = data.nome ?? data.name ?? "(sem nome)"
        const email = data.email ?? data.mail ?? "(sem email)"
        const phone = data.phone ?? data.telefone ?? ""
        const city = data.city ?? data.cidade ?? ""

        setUserData({ uid, nome, email, phone, city, raw: data })
      } else {
        console.log("[ListaUsuarios] usuário não encontrado em users/{uid}")
        showAlert("Nenhum perfil", "Perfil não encontrado no banco (users/{uid}).")
        setUserData(null)
      }
    } catch (err: unknown) {
      const error = err as Error
      console.error("[ListaUsuarios] erro ao ler usuário:", error)
      showAlert("Erro", `Não foi possível carregar o perfil: ${error?.message || "Erro desconhecido"}`)
      setUserData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isFocused) carregarUsuarioConectado()
  }, [isFocused, carregarUsuarioConectado])

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Meu Perfil</Text>
        <View style={styles.divider} />

        {loading ? (
          <View style={{ alignItems: "center", marginTop: 24 }}>
            <ActivityIndicator size="large" color="#8b5cf6" />
            <Text style={{ color: "rgba(255,255,255,0.7)", marginTop: 8 }}>Carregando...</Text>
          </View>
        ) : userData ? (
          <View style={styles.userCard}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{userData.nome.charAt(0).toUpperCase()}</Text>
            </View>
            <Text style={styles.userName}>{userData.nome}</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{userData.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Telefone:</Text>
              <Text style={styles.infoValue}>{userData.phone || "—"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Cidade:</Text>
              <Text style={styles.infoValue}>{userData.city || "—"}</Text>
            </View>

            <Pressable
              android_ripple={{ color: "rgba(255,255,255,0.06)" }}
              style={({ pressed }) => [styles.pressable, pressed && styles.pressablePressed]}
              onPress={() => {
                if (!userData?.uid) {
                  showAlert("Erro", "UID do usuário inválido.")
                  return
                }
                navigation.navigate("Perfil", { userId: userData.uid })
              }}
            >
              <LinearGradient
                colors={["#6366f1", "#8b5cf6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.button, { marginTop: 20 }]}
              >
                <Text style={styles.buttonText}>✏️ Editar Perfil</Text>
              </LinearGradient>
            </Pressable>
          </View>
        ) : (
          <View style={{ padding: 12 }}>
            <Text style={{ color: "rgba(255,255,255,0.8)", textAlign: "center", marginBottom: 8 }}>
              Não há informações do perfil carregadas.
            </Text>

            <Pressable
              android_ripple={{ color: "rgba(255,255,255,0.06)" }}
              style={({ pressed }) => [styles.pressable, pressed && styles.pressablePressed]}
              onPress={carregarUsuarioConectado}
            >
              <LinearGradient
                colors={["#222", "#444"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.button}
              >
                <Text style={[styles.buttonText, { textTransform: "none" }]}>Recarregar / Testar</Text>
              </LinearGradient>
            </Pressable>
          </View>
        )}

        <Pressable
          android_ripple={{ color: "rgba(255,255,255,0.06)" }}
          style={({ pressed }) => [styles.backPressable, pressed && styles.pressablePressed]}
          onPress={() => navigation.navigate("Dashboard")}
        >
          <View style={styles.backButton}>
            <Text style={styles.backButtonText}>← Voltar para Dashboard</Text>
          </View>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  card: {
    width: width * 0.94,
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.2)",
    elevation: 12,
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
  },
  divider: {
    height: 4,
    width: 60,
    borderRadius: 6,
    alignSelf: "center",
    marginBottom: 24,
    backgroundColor: "rgba(139,92,246,0.3)",
  },
  userCard: {
    backgroundColor: "rgba(255,255,255,0.03)",
    padding: 20,
    borderRadius: 16,
    borderColor: "rgba(99,102,241,0.15)",
    borderWidth: 1,
    alignItems: "center",
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(139,92,246,0.2)",
    borderWidth: 3,
    borderColor: "#8b5cf6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "800",
    color: "#8b5cf6",
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 16,
    textAlign: "center",
  },
  infoRow: {
    flexDirection: "row",
    width: "100%",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    width: 80,
    fontWeight: "600",
  },
  infoValue: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    flex: 1,
  },
  pressable: {
    borderRadius: 12,
    overflow: "hidden",
    alignSelf: "center",
  },
  pressablePressed: {
    opacity: 0.9,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  backPressable: {
    marginTop: 24,
  },
  backButton: {
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  backButtonText: {
    color: "rgba(255,255,255,0.8)",
    fontWeight: "600",
    fontSize: 14,
  },
})
