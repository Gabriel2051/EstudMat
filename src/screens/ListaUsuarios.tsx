"use client"

// screens/ListaUsuarios.tsx
import { auth, database } from "@/services/connectionFirebase"
import { showAlert } from "@/utils/platformAlert"
import { promiseWithTimeout } from "@/utils/promiseWithTimeout"
import { useIsFocused, useNavigation } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import { LinearGradient } from "expo-linear-gradient"
import { get, ref } from "firebase/database"
import { useCallback, useEffect, useState } from "react"
import { ActivityIndicator, Dimensions, Pressable, StyleSheet, Text, View } from "react-native"

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
      const snap = await promiseWithTimeout(get(ref(database, `users/${uid}`)), 7000)
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
            <ActivityIndicator size="large" color="#ef4444" />
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
              android_ripple={{ color: "rgba(239,68,68,0.2)" }}
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
                colors={["#7f1d1d", "#ef4444"]}
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
    backgroundColor: "#0f0f14",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  card: {
    width: Math.min(width - 32, 420),
    maxWidth: "100%",
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderRadius: 24, // Suavizado
    backgroundColor: "#1a1a1f",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)", // Glassmorphism
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 8,
  },
  divider: {
    height: 4,
    width: 60,
    borderRadius: 6,
    alignSelf: "center",
    marginBottom: 24,
    backgroundColor: "rgba(239,68,68,0.5)",
  },
  userCard: {
    backgroundColor: "rgba(255,255,255,0.03)",
    padding: 20,
    borderRadius: 16,
    borderColor: "rgba(239,68,68,0.15)", // Contorno leve avermelhado
    borderWidth: 1,
    alignItems: "center",
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(239,68,68,0.1)",
    borderWidth: 2,
    borderColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "800",
    color: "#ef4444",
  },
  userName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#ffffff",
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
    color: "rgba(255,255,255,0.5)",
    width: 80,
    fontWeight: "700",
  },
  infoValue: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    flex: 1,
    fontWeight: "600",
  },
  pressable: {
    borderRadius: 12,
    overflow: "hidden",
    alignSelf: "center",
    width: "100%",
  },
  pressablePressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  backPressable: {
    marginTop: 20,
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
    fontWeight: "700",
    fontSize: 14,
  },
})