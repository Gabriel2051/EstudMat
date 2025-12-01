"use client"

// screens/Perfil.tsx
import { useEffect, useState } from "react"
import { View, Text, TextInput, ScrollView, StyleSheet, Pressable, Platform } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import { ref, get, update, set } from "firebase/database"
import { database, auth } from "../services/connectionFirebase"
import { promiseWithTimeout } from "../utils/promiseWithTimeout" // Import promiseWithTimeout
import type { RootStackParamList } from "../../app/(tabs)/index"
import { showAlert } from "../utils/platformAlert"

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
          placeholderTextColor="rgba(255,255,255,0.5)"
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
          placeholderTextColor="rgba(255,255,255,0.5)"
          editable={!loading}
          returnKeyType="next"
        />

        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="Telefone"
          keyboardType="phone-pad"
          placeholderTextColor="rgba(255,255,255,0.5)"
          editable={!loading}
          returnKeyType="next"
        />

        <TextInput
          style={styles.input}
          value={city}
          onChangeText={setCity}
          placeholder="Cidade"
          placeholderTextColor="rgba(255,255,255,0.5)"
          editable={!loading}
          returnKeyType="done"
        />

        <Pressable
          android_ripple={{ color: "rgba(255,255,255,0.08)" }}
          style={({ pressed }) => [
            styles.pressable,
            pressed ? styles.pressablePressed : null,
            loading ? styles.pressableDisabled : null,
          ]}
          onPress={salvarAlteracoes}
          disabled={loading}
        >
          <LinearGradient
            colors={["#6366f1", "#8b5cf6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>{loading ? "Salvando..." : "✓ Salvar Alterações"}</Text>
          </LinearGradient>
        </Pressable>

        <Pressable
          android_ripple={{ color: "rgba(255,255,255,0.06)" }}
          style={({ pressed }) => [styles.secondaryPressable, pressed && styles.pressablePressed]}
          onPress={() => navigation.navigate("ListaUsuarios")}
          disabled={loading}
        >
          <View style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>👤 Dados do Usuario</Text>
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
          android_ripple={{ color: "rgba(255,255,255,0.06)" }}
          style={({ pressed }) => [styles.secondaryPressable, pressed && styles.pressablePressed]}
          onPress={testarConexao}
          disabled={loading}
        >
          <View style={[styles.secondaryButton, { borderColor: "rgba(139,92,246,0.3)" }]}>
            <Text style={[styles.secondaryButtonText, { color: "#a78bfa" }]}>🔧 Testar Conexão</Text>
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
    backgroundColor: "#0a0a0a",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    backgroundColor: "#1a1a1a",
    borderRadius: 18,
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: "center",
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
    letterSpacing: 0.3,
    fontFamily: Platform.OS === "android" ? "sans-serif-medium" : "System",
  },
  brand: {
    color: "#8b5cf6",
  },
  divider: {
    height: 4,
    width: 60,
    borderRadius: 6,
    alignSelf: "center",
    marginBottom: 24,
    backgroundColor: "rgba(139,92,246,0.3)",
  },
  input: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.05)",
    color: "#fff",
    paddingHorizontal: 18,
    paddingVertical: Platform.OS === "ios" ? 14 : 12,
    borderRadius: 14,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    fontFamily: Platform.OS === "android" ? "sans-serif-medium" : "System",
  },
  pressable: {
    width: "100%",
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 8,
    alignItems: "center",
  },
  pressablePressed: {
    opacity: 0.85,
  },
  pressableDisabled: {
    opacity: 0.5,
  },
  button: {
    width: "100%",
    paddingVertical: 16,
    alignItems: "center",
    borderRadius: 14,
    elevation: 8,
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.6,
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
    fontWeight: "600",
    fontSize: 14,
  },
  smallText: {
    marginTop: 18,
    color: "rgba(255,255,255,0.5)",
    textAlign: "center",
    fontSize: 13,
  },
})
