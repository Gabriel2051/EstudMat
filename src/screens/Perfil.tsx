"use client"

// screens/Perfil.tsx
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import { LinearGradient } from "expo-linear-gradient"
import { get, ref, set, update } from "firebase/database"
import { useEffect, useState } from "react"
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native"
import type { RootStackParamList } from "../../app/(tabs)/index"
import { auth, database } from "../services/connectionFirebase"
import { showAlert } from "../utils/platformAlert"
import { promiseWithTimeout } from "../utils/promiseWithTimeout"

type PerfilRouteProp = RouteProp<RootStackParamList, "Perfil">
type PerfilNavigationProp = StackNavigationProp<RootStackParamList, "Perfil">

type UserData = {
  nome: string
  email: string
  phone?: string
  telefone?: string
  city?: string
  cidade?: string
}

export default function Perfil() {
  const navigation = useNavigation<PerfilNavigationProp>()
  const route = useRoute<PerfilRouteProp>()

  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [city, setCity] = useState("")
  const [loading, setLoading] = useState(false)

  const paramUserId = route?.params?.userId

  function getUserIdFromAuth(): string | null {
    try {
      const uid = auth?.currentUser?.uid
      return uid || null
    } catch (e) {
      console.error("Error getting user ID:", e)
      return null
    }
  }

  const activeUserId = paramUserId ?? getUserIdFromAuth()

  useEffect(() => {
    if (!activeUserId) {
      showAlert("Não autenticado", "Você precisa estar logado para acessar o perfil.", [
        { text: "OK", onPress: () => navigation.navigate("Login") },
      ])
      return
    }

    let mounted = true

    async function carregarDados() {
      try {
        setLoading(true)
        const userRef = ref(database, `users/${activeUserId}`)
        const snapshot = await promiseWithTimeout(get(userRef), 7000)

        if (!mounted) return

        if (snapshot && snapshot.exists()) {
          const data = snapshot.val() as UserData
          setNome(data.nome || "")
          setEmail(data.email || "")
          setPhone(data.phone || data.telefone || "")
          setCity(data.city || data.cidade || "")
        } else {
          setNome("")
          setEmail("")
          setPhone("")
          setCity("")
        }
      } catch (error: unknown) {
        const err = error as Error
        if (err?.message === "timeout") {
          showAlert("Tempo esgotado", "Não foi possível carregar os dados. Verifique sua conexão.")
        } else {
          showAlert("Erro ao carregar", `Mensagem: ${err?.message || "Erro desconhecido"}`)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    carregarDados()
    return () => {
      mounted = false
    }
  }, [activeUserId])

  async function salvarAlteracoes() {
    if (!activeUserId) {
      showAlert("Erro", "Usuário não autenticado.")
      return
    }

    if (!nome.trim() || !email.trim()) {
      showAlert("Atenção", "Nome e email são obrigatórios.")
      return
    }

    setLoading(true)
    const userRef = ref(database, `users/${activeUserId}`)
    const updatedData = { nome, email, phone, city }

    try {
      await promiseWithTimeout(update(userRef, updatedData), 7000)
      showAlert("Sucesso", "Dados atualizados com sucesso!", [
        { text: "OK", onPress: () => navigation.navigate("ListaUsuarios") },
      ])
    } catch {
      try {
        await promiseWithTimeout(set(userRef, updatedData), 7000)
        showAlert("Sucesso (fallback)", "Dados salvos com set() (fallback).", [
          { text: "OK", onPress: () => navigation.navigate("ListaUsuarios") },
        ])
      } catch (err) {
        console.warn("Erro salvar:", err)
        showAlert("Erro ao salvar", "Verifique regras do Realtime DB, autenticação e path.")
      }
    } finally {
      setLoading(false)
    }
  }

  async function testarConexao() {
    if (!activeUserId) {
      showAlert("Erro", "Usuário não autenticado.")
      return
    }

    setLoading(true)
    const debugRef = ref(database, `debug/pings/${activeUserId}/${Date.now()}`)
    try {
      await promiseWithTimeout(set(debugRef, { ts: Date.now(), ok: true }), 7000)
      showAlert("Teste OK", "Escrita e leitura realizadas com sucesso.")
    } catch (err: unknown) {
      const error = err as Error
      if (error?.message === "timeout") {
        showAlert("Teste Falhou", "Timeout: verifique sua conexão.")
      } else {
        showAlert("Teste Falhou", `Erro: ${error?.message || "Erro desconhecido"}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.card}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>
          Editar <Text style={styles.brand}>Perfil</Text>
        </Text>
        <View style={styles.divider} />

        <TextInput
          style={styles.input}
          value={nome}
          onChangeText={setNome}
          placeholder="Nome"
          placeholderTextColor="rgba(255,255,255,0.4)"
          editable={!loading}
          returnKeyType="next"
        />

        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="rgba(255,255,255,0.4)"
          editable={!loading}
          returnKeyType="next"
        />

        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="Telefone"
          keyboardType="phone-pad"
          placeholderTextColor="rgba(255,255,255,0.4)"
          editable={!loading}
          returnKeyType="next"
        />

        <TextInput
          style={styles.input}
          value={city}
          onChangeText={setCity}
          placeholder="Cidade"
          placeholderTextColor="rgba(255,255,255,0.4)"
          editable={!loading}
          returnKeyType="done"
        />

        <Pressable
          android_ripple={{ color: "rgba(239,68,68,0.2)" }}
          style={({ pressed }) => [
            styles.pressable,
            pressed ? styles.pressablePressed : null,
            loading ? styles.pressableDisabled : null,
          ]}
          onPress={salvarAlteracoes}
          disabled={loading}
        >
          <LinearGradient
            colors={["#7f1d1d", "#ef4444"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>{loading ? "SALVANDO..." : "✓ SALVAR ALTERAÇÕES"}</Text>
          </LinearGradient>
        </Pressable>

        <Pressable
          android_ripple={{ color: "rgba(255,255,255,0.06)" }}
          style={({ pressed }) => [styles.secondaryPressable, pressed && styles.pressablePressed]}
          onPress={() => navigation.navigate("ListaUsuarios")}
          disabled={loading}
        >
          <View style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>👤 Dados do Usuário</Text>
          </View>
        </Pressable>

        <Pressable
          android_ripple={{ color: "rgba(255,255,255,0.06)" }}
          style={({ pressed }) => [styles.secondaryPressable, pressed && styles.pressablePressed]}
          onPress={() => navigation.navigate("Dashboard")}
          disabled={loading}
        >
          <View style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>← Voltar para o Dashboard</Text>
          </View>
        </Pressable>

        <Pressable
          android_ripple={{ color: "rgba(239,68,68,0.1)" }}
          style={({ pressed }) => [styles.secondaryPressable, pressed && styles.pressablePressed]}
          onPress={testarConexao}
          disabled={loading}
        >
          <View style={[styles.secondaryButton, { borderColor: "rgba(239,68,68,0.3)", backgroundColor: "rgba(239,68,68,0.05)" }]}>
            <Text style={[styles.secondaryButtonText, { color: "#f87171" }]}>🔧 Testar Conexão</Text>
          </View>
        </Pressable>

        <Text style={styles.smallText}>Mantenha seus dados atualizados</Text>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f14",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#1a1a1f",
    borderRadius: 24, // Suavizado
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)", // Glassmorphism
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: 0.3,
    fontFamily: Platform.OS === "android" ? "sans-serif-medium" : "System",
  },
  brand: {
    color: "#ef4444", // Novo vermelho
  },
  divider: {
    height: 4,
    width: 60,
    borderRadius: 6,
    alignSelf: "center",
    marginBottom: 24,
    backgroundColor: "rgba(239,68,68,0.5)",
  },
  input: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.05)",
    color: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 16 : 14,
    borderRadius: 16, // Mais arredondado
    marginBottom: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    fontFamily: Platform.OS === "android" ? "sans-serif-medium" : "System",
  },
  pressable: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 8,
    alignItems: "center",
  },
  pressablePressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  pressableDisabled: {
    opacity: 0.6,
  },
  button: {
    width: "100%",
    paddingVertical: 16,
    alignItems: "center",
    borderRadius: 16,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 15,
    letterSpacing: 1,
    fontFamily: Platform.OS === "android" ? "sans-serif-medium" : "System",
  },
  secondaryPressable: {
    width: "100%",
    marginTop: 12,
    borderRadius: 12,
    overflow: "hidden",
  },
  secondaryButton: {
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  secondaryButtonText: {
    color: "rgba(255,255,255,0.8)",
    fontWeight: "700",
    fontSize: 14,
  },
  smallText: {
    marginTop: 20,
    color: "rgba(255,255,255,0.4)",
    textAlign: "center",
    fontSize: 13,
  },
})