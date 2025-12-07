import { useNavigation } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import { LinearGradient } from "expo-linear-gradient"
import { Image, Platform, Pressable, StyleSheet, Text, View, Dimensions } from "react-native"
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
          Aprenda matemática de forma <Text style={styles.highlight}>divertida</Text>, interativa e no seu ritmo. Vamos
          jogar e aprender?
        </Text>

        <Pressable
          android_ripple={{ color: "rgba(255,255,255,0.08)" }}
          style={({ pressed }) => [styles.pressable, pressed ? styles.pressablePressed : null]}
          onPress={() => navigation.navigate("Login")}
        >
          <LinearGradient
            colors={["#6366f1", "#8b5cf6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Começar</Text>
          </LinearGradient>
        </Pressable>

        <Text style={styles.smallText}>Comece agora — sem cadastro demorado</Text>
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
    paddingVertical: 36,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor: "#1a1a1f",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: 0.3,
    fontFamily: Platform.OS === "android" ? "sans-serif-medium" : "System",
  },
  brand: {
    color: "#6366f1",
  },
  divider: {
    height: 3,
    width: 50,
    borderRadius: 6,
    marginVertical: 12,
    backgroundColor: "rgba(99,102,241,0.4)",
  },
  description: {
    fontSize: 15,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  highlight: {
    color: "#8b5cf6",
    fontWeight: "600",
  },
  pressable: {
    width: "100%",
    alignItems: "center",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
  },
  pressablePressed: {
    opacity: 0.85,
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
    letterSpacing: 0.8,
    textTransform: "uppercase",
    fontFamily: Platform.OS === "android" ? "sans-serif-medium" : "System",
  },
  smallText: {
    marginTop: 8,
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
    textAlign: "center",
  },
})
