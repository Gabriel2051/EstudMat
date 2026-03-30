import { useNavigation } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import { LinearGradient } from "expo-linear-gradient"
import { Dimensions, Image, Platform, Pressable, StyleSheet, Text, View } from "react-native"
import type { RootStackParamList } from "../../app/(tabs)/index"
import { useResponsive } from "../hooks/useResponsive"

const { width } = Dimensions.get("window")

type NavigationProps = StackNavigationProp<RootStackParamList>

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProps>()
  const { width: responsiveWidth } = useResponsive()

  return (
    <View style={styles.container}>
      <View style={[styles.card, { width: Math.min(responsiveWidth - 40, 420) }]}>
        <Image source={require("../../assets/images/Midia.png")} style={styles.logo} resizeMode="contain" />

        <Text style={styles.title}>
          Bem-vindo ao <Text style={styles.brand}>EstudeMat</Text>
        </Text>

        <View style={styles.divider} />

        <Text style={styles.description}>
          Aprende matemática de forma <Text style={styles.highlight}>divertida</Text>, interativa e ao seu ritmo. Vamos
          jogar e aprender?
        </Text>

        <Pressable
          android_ripple={{ color: "rgba(239,68,68,0.2)" }}
          style={({ pressed }) => [styles.pressable, pressed && styles.pressablePressed]}
          onPress={() => navigation.navigate("Login")}
        >
          <LinearGradient
            colors={["#7f1d1d", "#ef4444"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Começar</Text>
          </LinearGradient>
        </Pressable>

        <Text style={styles.smallText}>Começa agora — sem cadastros demorados</Text>
      </View>
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
    maxWidth: "100%",
    paddingVertical: 40,
    paddingHorizontal: 24,
    borderRadius: 24, // Aumentado para um visual mais suave
    backgroundColor: "#1a1a1f",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)", // Efeito "glass" subtil
    shadowColor: "#ef4444", // Sombra levemente avermelhada
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
    fontSize: 28,
    fontWeight: "800",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: 0.3,
    fontFamily: Platform.OS === "android" ? "sans-serif-medium" : "System",
  },
  brand: {
    color: "#ef4444", // Vermelho vibrante
  },
  divider: {
    height: 4,
    width: 60,
    borderRadius: 6,
    marginVertical: 16,
    backgroundColor: "rgba(239,68,68,0.5)", // Vermelho subtil
  },
  description: {
    fontSize: 16,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  highlight: {
    color: "#f87171", // Vermelho mais claro para contraste
    fontWeight: "700",
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
    transform: [{ scale: 0.98 }], // Pequeno efeito de clique (escala)
  },
  button: {
    width: "100%",
    paddingVertical: 16, // Botão um pouco mais espesso e clicável
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
    fontFamily: Platform.OS === "android" ? "sans-serif-medium" : "System",
  },
  smallText: {
    marginTop: 4,
    fontSize: 13,
    color: "rgba(255,255,255,0.4)",
    textAlign: "center",
  },
})