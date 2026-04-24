import useResponsive from "@/hooks/useResponsive";
import { useNavigation } from "@react-navigation/native";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View, ScrollView, Dimensions } from "react-native";
import { useStore, THEMES } from "@/screens/Store";

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type NavItem = { label: string; icon: string; target: string; };

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
  const { temaAtivo } = useStore();
  const theme = THEMES[temaAtivo];
  const showSidebar = width >= 900;

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      {showSidebar && (
        <View style={[styles.sidebar, { backgroundColor: theme.card }]}>
          <Text style={[styles.brand, { color: theme.primary }]}>EstudMat</Text>
          <Text style={styles.brandSubtitle}>Seu painel de estudos</Text>
          <View style={styles.menuList}>
            {menuItems.map((item) => (
              <Pressable
                key={item.target}
                style={[styles.menuItem, activeScreen === item.target && { backgroundColor: `${theme.primary}22` }]}
                onPress={() => navigation.navigate(item.target)}
              >
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text style={[styles.menuLabel, activeScreen === item.target && { color: theme.primary }]}>
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* ScrollView corrigido para funcionar na Web e Mobile */}
      <View style={styles.contentWrapper}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { minHeight: SCREEN_HEIGHT }]}
          showsVerticalScrollIndicator={true}
        >
          <View style={styles.pageHeader}>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          
          <View style={styles.childrenContainer}>
            {children}
          </View>

          <View style={{ height: 100 }} /> 
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: "row" },
  sidebar: { width: 260, borderRightWidth: 1, borderRightColor: "rgba(255,255,255,0.08)", paddingTop: 50, paddingHorizontal: 16 },
  brand: { fontSize: 24, fontWeight: "900", marginBottom: 6 },
  brandSubtitle: { color: "rgba(255,255,255,0.5)", fontSize: 13, marginBottom: 30 },
  menuList: { gap: 10 },
  menuItem: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 14 },
  menuIcon: { fontSize: 18, marginRight: 12 },
  menuLabel: { color: "rgba(255,255,255,0.7)", fontSize: 15, fontWeight: "700" },
  
  contentWrapper: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingVertical: 40, paddingHorizontal: 24 },
  pageHeader: { marginBottom: 30 },
  title: { color: "#fff", fontSize: 34, fontWeight: "900" },
  subtitle: { color: "rgba(255,255,255,0.5)", marginTop: 8, fontSize: 16 },
  childrenContainer: { flex: 1 }
});