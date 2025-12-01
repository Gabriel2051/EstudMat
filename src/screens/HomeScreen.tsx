import { useNavigation } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import { LinearGradient } from "expo-linear-gradient"
import { Dimensions, Image, Platform, Pressable, StyleSheet, Text, View } from "react-native"
import type { RootStackParamList } from "../../app/(tabs)/index"

const { width } = Dimensions.get("window")

type NavigationProps = StackNavigationProp<RootStackParamList>

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProps>()

  return (
    <View style={styles.container}>
      <View style={styles.card}>
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
    backgroundColor: "#0a0a0a",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: width * 0.94,
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderRadius: 18,
    backgroundColor: "#1a1a1a",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.2)",
    elevation: 12,
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  logo: {
    width: width * 0.15,
    height: width * 0.15,
    marginBottom: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    marginBottom: 6,
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
    marginVertical: 12,
    backgroundColor: "rgba(139,92,246,0.3)",
  },
  description: {
    fontSize: 15,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 22,
    paddingHorizontal: 6,
  },
  highlight: {
    color: "#a78bfa",
    fontWeight: "600",
  },
  pressable: {
    width: "100%",
    alignItems: "center",
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 10,
  },
  pressablePressed: {
    opacity: 0.9,
  },
  button: {
    width: 220,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
  },
  buttonText: {
    color: "#fff",
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
  },
})
