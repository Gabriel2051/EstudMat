"use client"

import { useNavigation } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import { LinearGradient } from "expo-linear-gradient"
import { signInWithEmailAndPassword } from "firebase/auth"
import { useRef, useState } from "react"
import {
  Dimensions,
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
import { auth } from "../services/connectionFirebase"

const { width } = Dimensions.get("window")

type NavigationProps = StackNavigationProp<RootStackParamList>

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProps>()

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

      // Mantive o replace para não empilhar telas
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
        <View style={styles.card}>
          {message ? <Text style={[styles.message, isError ? styles.error : styles.success]}>{message}</Text> : null}

          <Image source={require("../../assets/images/Midia.png")} style={styles.logo} resizeMode="contain" />

          <Text style={styles.title}>
            Entrar no <Text style={styles.brand}>EstudeMat</Text>
          </Text>

          <View style={styles.divider} />

          <Text style={styles.subtitle}>
            Continue sua <Text style={styles.highlight}>jornada matemática</Text>!
          </Text>

          <TextInput
            style={styles.input}
            placeholder="E-mail"
            placeholderTextColor="rgba(255,255,255,0.6)"
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
            placeholderTextColor="rgba(255,255,255,0.6)"
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />

          <Pressable
            android_ripple={{ color: "rgba(255,255,255,0.06)" }}
            style={styles.forgotPassword}
            // Mantive sem onPress porque você não tinha rota definida; troque se quiser funcionalidade
            onPress={() => {}}
          >
            <Text style={styles.forgotText}>Esqueceu a senha?</Text>
          </Pressable>

          {/* Botão principal — Pressable para ripple + LinearGradient */}
          <Pressable
            android_ripple={{ color: "rgba(255,255,255,0.06)" }}
            style={({ pressed }) => [
              styles.pressable,
              pressed ? styles.pressablePressed : null,
              loading ? styles.pressableDisabled : null,
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            <LinearGradient
              colors={["#260000", "#ff2b2b"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>{loading ? "Entrando..." : "Entrar"}</Text>
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
    backgroundColor: "#0a0a0f",
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: width * 0.94,
    paddingVertical: 40,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor: "#141419",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.2)",
  },
  logo: {
    width: width * 0.25,
    height: width * 0.25,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 8,
  },
  brand: {
    color: "#8b5cf6",
  },
  divider: {
    height: 4,
    width: 80,
    borderRadius: 4,
    marginVertical: 12,
    backgroundColor: "rgba(99,102,241,0.3)",
  },
  subtitle: {
    fontSize: 15,
    color: "#9ca3af",
    textAlign: "center",
    marginBottom: 24,
  },
  highlight: {
    color: "#c7d2fe",
    fontWeight: "700",
  },
  input: {
    width: "100%",
    backgroundColor: "rgba(99,102,241,0.05)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#ffffff",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.2)",
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 20,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  forgotText: {
    color: "#c7d2fe",
    fontSize: 13,
    fontWeight: "600",
  },
  pressable: {
    width: "100%",
    alignItems: "center",
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 16,
  },
  pressablePressed: {
    opacity: 0.9,
  },
  pressableDisabled: {
    opacity: 0.6,
  },
  button: {
    width: "100%",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  registerLink: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  registerText: {
    color: "#9ca3af",
    fontSize: 14,
    textAlign: "center",
  },
  registerTextHighlight: {
    color: "#8b5cf6",
    fontWeight: "700",
  },
  message: {
    marginBottom: 16,
    fontSize: 14,
    textAlign: "center",
    fontWeight: "600",
  },
  error: {
    color: "#fca5a5",
  },
  success: {
    color: "#86efac",
  },
})
