"use client"

import { useNavigation } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import { LinearGradient } from "expo-linear-gradient"
import { signInWithEmailAndPassword } from "firebase/auth"
import { useRef, useState } from "react"
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native"
import type { RootStackParamList } from "../../app/(tabs)/index"
import { useResponsive } from "../hooks/useResponsive"
import { auth } from "../services/connectionFirebase"

type NavigationProps = StackNavigationProp<RootStackParamList>

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProps>()
  const { width } = useResponsive()

  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [message, setMessage] = useState("")
  const [isError, setIsError] = useState(false)
  const [loading, setLoading] = useState(false)

  const senhaInputRef = useRef<TextInput>(null)

  const isValidEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  const handleLogin = async () => {
    setMessage("")
    setIsError(false)

    if (!email.trim() || !senha.trim()) {
      setMessage("Por favor, preencha todos os campos.")
      setIsError(true)
      return
    }

    if (!isValidEmail(email)) {
      setMessage("Insira um e-mail válido.")
      setIsError(true)
      return
    }

    setLoading(true)

    try {
      await signInWithEmailAndPassword(auth, email, senha)

      setMessage("Login realizado com sucesso!")
      setIsError(false)

      setEmail("")
      setSenha("")

      setTimeout(() => {
        navigation.replace("Dashboard")
      }, 900)
    } catch (error: any) {
      let msg = "Erro ao fazer login."
      if (error.code === "auth/user-not-found") {
        msg = "Usuário não encontrado."
      } else if (error.code === "auth/wrong-password") {
        msg = "Senha incorreta."
      } else if (error.code === "auth/invalid-email") {
        msg = "E-mail inválido."
      }
      setMessage(msg)
      setIsError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={[styles.card, { width: Math.min(width - 40, 420) }]}>
          {message ? <Text style={[styles.message, isError ? styles.error : styles.success]}>{message}</Text> : null}

          <Image source={require("../../assets/images/Midia.png")} style={styles.logo} resizeMode="contain" />

          <Text style={styles.title}>
            Entrar no <Text style={styles.brand}>EstudeMat</Text>
          </Text>

          <View style={styles.divider} />

          <Text style={styles.subtitle}>
            Continue a sua <Text style={styles.highlight}>jornada matemática</Text>!
          </Text>

          <TextInput
            style={styles.input}
            placeholder="E-mail"
            placeholderTextColor="rgba(255,255,255,0.4)"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            returnKeyType="next"
            onSubmitEditing={() => senhaInputRef.current?.focus()}
            blurOnSubmit={false}
          />

          <TextInput
            ref={senhaInputRef}
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor="rgba(255,255,255,0.4)"
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />

          <Pressable
            android_ripple={{ color: "rgba(255,255,255,0.06)" }}
            style={styles.forgotPassword}
            onPress={() => {}}
          >
            <Text style={styles.forgotText}>Esqueceu a senha?</Text>
          </Pressable>

          <Pressable
            android_ripple={{ color: "rgba(239,68,68,0.2)" }}
            style={({ pressed }) => [
              styles.pressable,
              pressed && styles.pressablePressed,
              loading && styles.pressableDisabled,
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            <LinearGradient
              colors={["#7f1d1d", "#ef4444"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>{loading ? "ENTRANDO..." : "ENTRAR"}</Text>
            </LinearGradient>
          </Pressable>

          <Pressable
            style={styles.registerLink}
            onPress={() => navigation.navigate("Register")}
            android_ripple={{ color: "rgba(255,255,255,0.04)" }}
            disabled={loading}
          >
            <Text style={styles.registerText}>
              Não tem uma conta? <Text style={styles.registerTextHighlight}>Cadastre-se</Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f14",
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    maxWidth: "100%",
    paddingVertical: 40,
    paddingHorizontal: 24,
    borderRadius: 24, // Suavizado
    backgroundColor: "#1a1a1f",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)", // Efeito Glassmorphism
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  logo: {
    width: 90,
    height: 90,
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 8,
  },
  brand: {
    color: "#ef4444", // Novo vermelho
  },
  divider: {
    height: 4,
    width: 60,
    borderRadius: 6,
    marginVertical: 16,
    backgroundColor: "rgba(239,68,68,0.5)",
  },
  subtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    marginBottom: 24,
  },
  highlight: {
    color: "#f87171",
    fontWeight: "600",
  },
  input: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 15,
    color: "#ffffff",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 20,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  forgotText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    fontWeight: "600",
  },
  pressable: {
    width: "100%",
    alignItems: "center",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
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
    justifyContent: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 1,
  },
  registerLink: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  registerText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    textAlign: "center",
  },
  registerTextHighlight: {
    color: "#ef4444",
    fontWeight: "700",
  },
  message: {
    marginBottom: 20,
    fontSize: 14,
    textAlign: "center",
    fontWeight: "700",
    padding: 10,
    borderRadius: 8,
    width: "100%",
  },
  error: {
    backgroundColor: "rgba(239,68,68,0.1)",
    color: "#ef4444",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.3)",
  },
  success: {
    backgroundColor: "rgba(16,185,129,0.1)",
    color: "#10b981",
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.3)",
  },
})