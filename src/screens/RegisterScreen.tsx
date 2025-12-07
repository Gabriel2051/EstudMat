"use client"

import { useNavigation } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import { LinearGradient } from "expo-linear-gradient"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { ref, set } from "firebase/database"
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
import { auth, database } from "../services/connectionFirebase"
import { useResponsive } from "../hooks/useResponsive"

export default function RegisterScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()
  const { width } = useResponsive()

  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [confirmarSenha, setConfirmarSenha] = useState("")
  const [loading, setLoading] = useState(false)

  const [message, setMessage] = useState("")
  const [isError, setIsError] = useState(false)

  const emailInputRef = useRef<TextInput>(null)
  const senhaInputRef = useRef<TextInput>(null)
  const confirmarSenhaInputRef = useRef<TextInput>(null)

  const isValidEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  const handleRegister = async () => {
    console.log("Cliquei em cadastrar!")

    setMessage("") // limpa mensagem anterior

    if (!nome.trim() || !email.trim() || !senha || !confirmarSenha) {
      setMessage("Por favor, preencha todos os campos.")
      setIsError(true)
      return
    }

    if (!isValidEmail(email)) {
      setMessage("Por favor, insira um e-mail válido.")
      setIsError(true)
      return
    }

    if (senha !== confirmarSenha) {
      setMessage("As senhas não coincidem.")
      setIsError(true)
      return
    }

    setLoading(true)

    try {
      console.log("Auth:", auth ? "OK" : "NULO")
      console.log("Database:", database ? "OK" : "NULO")

      // Cria usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha)
      console.log("Usuário criado:", userCredential.user.uid)

      const uid = userCredential.user.uid

      // Salva dados adicionais no Realtime Database
      await set(ref(database, `users/${uid}`), {
        nome,
        email,
      })
      console.log("Dados salvos no DB!")

      setMessage("Conta criada com sucesso!")
      setIsError(false)

      // Limpa campos
      setNome("")
      setEmail("")
      setSenha("")
      setConfirmarSenha("")

      // Navega para Login após cadastro
      navigation.replace("Login")
    } catch (error: any) {
      console.log("ERRO AO CADASTRAR:", JSON.stringify(error))
      let msg = "Não foi possível criar a conta."

      if (error.code === "auth/email-already-in-use") {
        msg = "Este e-mail já está em uso."
      } else if (error.code === "auth/invalid-email") {
        msg = "E-mail inválido."
      } else if (error.code === "auth/weak-password") {
        msg = "Senha muito fraca."
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
            Crie sua <Text style={styles.brand}>conta</Text>
          </Text>

          <View style={styles.divider} />

          <Text style={styles.subtitle}>
            Embarque na sua <Text style={styles.highlight}>aventura matemática</Text>!
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Nome completo"
            placeholderTextColor="rgba(255,255,255,0.6)"
            value={nome}
            onChangeText={setNome}
            returnKeyType="next"
            onSubmitEditing={() => emailInputRef.current?.focus()}
            blurOnSubmit={false}
          />
          <TextInput
            ref={emailInputRef}
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
            returnKeyType="next"
            onSubmitEditing={() => confirmarSenhaInputRef.current?.focus()}
            blurOnSubmit={false}
          />
          <TextInput
            ref={confirmarSenhaInputRef}
            style={styles.input}
            placeholder="Confirmar senha"
            placeholderTextColor="rgba(255,255,255,0.6)"
            secureTextEntry
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
            returnKeyType="done"
            onSubmitEditing={handleRegister}
          />

          {/* Botão Cadastrar — Pressable com ripple nativo */}
          <Pressable
            android_ripple={{ color: "rgba(255,255,255,0.06)" }}
            style={({ pressed }) => [
              styles.pressable,
              pressed ? styles.pressablePressed : null,
              loading ? styles.pressableDisabled : null,
            ]}
            onPress={handleRegister}
            disabled={loading}
          >
            <LinearGradient
              colors={["#260000", "#ff2b2b"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>{loading ? "Cadastrando..." : "Cadastrar"}</Text>
            </LinearGradient>
          </Pressable>

          {/* Link Entrar — Pressable simples */}
          <Pressable
            style={styles.HomeLink}
            android_ripple={{ color: "rgba(255,255,255,0.03)" }}
            onPress={() => {
              setLoading(false)
              navigation.replace("Login")
            }}
          >
            <Text style={styles.loginText}>
              Já tem uma conta? <Text style={styles.loginTextHighlight}>Entrar</Text>
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
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor: "#1a1a1f",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  logo: {
    width: 90,
    height: 90,
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 8,
  },
  brand: {
    color: "#6366f1",
  },
  divider: {
    height: 3,
    width: 60,
    borderRadius: 4,
    marginVertical: 12,
    backgroundColor: "rgba(99,102,241,0.4)",
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    marginBottom: 24,
  },
  highlight: {
    color: "#8b5cf6",
    fontWeight: "600",
  },
  input: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    color: "#ffffff",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  pressable: {
    width: "100%",
    alignItems: "center",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 14,
    marginTop: 6,
  },
  pressablePressed: {
    opacity: 0.85,
  },
  pressableDisabled: {
    opacity: 0.6,
  },
  button: {
    width: "100%",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  HomeLink: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  loginText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    textAlign: "center",
  },
  loginTextHighlight: {
    color: "#6366f1",
    fontWeight: "700",
  },
  message: {
    marginBottom: 16,
    fontSize: 14,
    textAlign: "center",
    fontWeight: "600",
  },
  error: {
    color: "#ef4444",
  },
  success: {
    color: "#10b981",
  },
})
