import useResponsive from "@/hooks/useResponsive"; // ✅ Importação padrão, sem chaves
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { width: responsiveWidth } = useResponsive(); // Agora vai funcionar!

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
  );
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
    paddingVertical: 40,
    paddingHorizontal: 24,
    borderRadius: 24,
    backgroundColor: "#1a1a1f",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    elevation: 10,
  },
  logo: { width: 90, height: 90, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: "800", color: "#ffffff", textAlign: "center", marginBottom: 8 },
  brand: { color: "#ef4444" },
  divider: { height: 4, width: 60, borderRadius: 6, marginVertical: 16, backgroundColor: "rgba(239,68,68,0.5)" },
  description: { fontSize: 16, color: "rgba(255,255,255,0.7)", textAlign: "center", lineHeight: 24, marginBottom: 30 },
  highlight: { color: "#f87171", fontWeight: "700" },
  pressable: { width: "100%", borderRadius: 16, overflow: "hidden", marginBottom: 16 },
  pressablePressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  button: { width: "100%", paddingVertical: 16, alignItems: "center", justifyContent: "center" },
  buttonText: { color: "#ffffff", fontSize: 18, fontWeight: "800", letterSpacing: 1, textTransform: "uppercase" },
  smallText: { marginTop: 4, fontSize: 13, color: "rgba(255,255,255,0.4)", textAlign: "center" },
});