import useResponsive from "@/hooks/useResponsive";
import { useNavigation } from "@react-navigation/native";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type NavItem = {
  label: string;
  icon: string;
  target: string;
};

type PageLayoutProps = {
  title: string;
  subtitle?: string;
  activeScreen: string;
  children: ReactNode;
};

const menuItems: NavItem[] = [
  { label: "Dashboard", icon: "🏠", target: "Dashboard" },
  { label: "Desafios", icon: "🎯", target: "Desafios" },
  { label: "Exercícios", icon: "📚", target: "SelecaoExercicios" },
  { label: "Loja", icon: "🎁", target: "RewardsList" },
  { label: "Carrinho", icon: "🛒", target: "ShopCart" },
  { label: "Recibos", icon: "🧾", target: "Receipts" },
  { label: "Agendamento", icon: "📅", target: "Agendamento" },
];

export default function PageLayout({ title, subtitle, activeScreen, children }: PageLayoutProps) {
  const navigation = useNavigation<any>();
  const { width } = useResponsive();
  const showSidebar = width >= 900;

  return (
    <View style={styles.root}>
      {showSidebar && (
        <View style={styles.sidebar}>
          <Text style={styles.brand}>EstudMat</Text>
          <Text style={styles.brandSubtitle}>Seu painel de estudos</Text>

          <View style={styles.menuList}>
            {menuItems.map((item) => (
              <Pressable
                key={item.target}
                style={({ pressed }) => [
                  styles.menuItem,
                  activeScreen === item.target && styles.menuItemActive,
                  pressed && styles.menuItemPressed,
                ]}
                onPress={() => navigation.navigate(item.target)}
              >
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text style={[styles.menuLabel, activeScreen === item.target && styles.menuLabelActive]}>
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      <View style={[styles.content, showSidebar && styles.contentWithSidebar]}>
        <View style={styles.pageHeader}>
          <View>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
        </View>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: "row", backgroundColor: "#0f0f14" },
  sidebar: { width: 260, backgroundColor: "#111214", borderRightWidth: 1, borderRightColor: "rgba(255,255,255,0.08)", paddingTop: 50, paddingHorizontal: 16 },
  brand: { color: "#ef4444", fontSize: 22, fontWeight: "900", marginBottom: 6 },
  brandSubtitle: { color: "rgba(255,255,255,0.6)", fontSize: 13, marginBottom: 20 },
  menuList: { gap: 8 },
  menuItem: { flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 12, borderRadius: 12 },
  menuItemActive: { backgroundColor: "rgba(239,68,68,0.14)" },
  menuItemPressed: { opacity: 0.8 },
  menuIcon: { fontSize: 16, marginRight: 10 },
  menuLabel: { color: "rgba(255,255,255,0.8)", fontSize: 15, fontWeight: "700" },
  menuLabelActive: { color: "#fff" },
  content: { flex: 1, paddingVertical: 20, paddingHorizontal: 16 },
  contentWithSidebar: { paddingHorizontal: 32 },
  pageHeader: { marginBottom: 20 },
  title: { color: "#fff", fontSize: 28, fontWeight: "900" },
  subtitle: { color: "rgba(255,255,255,0.7)", marginTop: 6, fontSize: 15 },
});