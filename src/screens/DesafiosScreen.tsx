"use client"

import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import PageLayout from "@/components/PageLayout";
import { THEMES, useStore } from "./Store";

export default function DesafiosScreen() {
    const navigation = useNavigation<any>();
    const { xp, temaAtivo, challenges, loadChallenges } = useStore();
    const theme = THEMES[temaAtivo];

    useEffect(() => {
        loadChallenges();
    }, []);

    return (
        <PageLayout title="Desafios" activeScreen="Desafios">
            <ScrollView 
                style={{ backgroundColor: theme.bg }} 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.headerContainer}>
                    <Pressable style={styles.backButton} onPress={() => navigation.navigate("Dashboard")}>
                        <Text style={styles.backButtonText}>← Voltar</Text>
                    </Pressable>
                    <Text style={styles.headerTitle}>🎯 Desafios</Text>
                    <View style={[styles.xpBox, { borderColor: theme.primary }]}>
                        <Text style={[styles.xpText, { color: theme.primary }]}>{xp} XP</Text>
                    </View>
                </View>

                {challenges.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>Nenhum desafio carregado</Text>
                    </View>
                ) : (
                    challenges.map((challenge) => {
                        const progressPercent = challenge.progress / challenge.total;
                        return (
                            <View key={challenge.id} style={[styles.card, { backgroundColor: theme.card }]}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.cardTitle}>{challenge.title}</Text>
                                    <Text style={[styles.xpReward, { color: theme.primary }]}>+{challenge.xp} XP</Text>
                                </View>
                                <Text style={styles.description}>{challenge.description}</Text>
                                
                                <View style={styles.progressContainer}>
                                    <View style={styles.progressBar}>
                                        <LinearGradient
                                            colors={challenge.completed ? ["#10b981", "#059669"] : [theme.accent, theme.primary]}
                                            style={[styles.progressFill, { width: `${progressPercent * 100}%` }]}
                                        />
                                    </View>
                                    <Text style={styles.progressText}>{challenge.progress}/{challenge.total}</Text>
                                </View>

                                <Pressable 
                                    style={[styles.button, { backgroundColor: challenge.completed ? "rgba(16,185,129,0.1)" : theme.primary }]}
                                    disabled={challenge.completed}
                                    onPress={() => {
                                        // Navega para a fase correspondente
                                        if (challenge.phase === 1) {
                                            navigation.navigate("Treinar");
                                        } else if (challenge.phase === 2) {
                                            navigation.navigate("TreinarFase2");
                                        } else if (challenge.phase === 3) {
                                            navigation.navigate("TreinarFase3");
                                        }
                                    }}
                                >
                                    <Text style={[styles.buttonText, { color: challenge.completed ? "#10b981" : "#fff" }]}>
                                        {challenge.completed ? "✔ CONCLUÍDO" : "INICIAR"}
                                    </Text>
                                </Pressable>
                            </View>
                        );
                    })
                )}
            </ScrollView>
        </PageLayout>
    );
}

const styles = StyleSheet.create({
    scrollContent: { padding: 20, paddingBottom: 100 },
    headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
    backButton: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 10 },
    backButtonText: { color: "#fff", fontWeight: "700" },
    headerTitle: { color: "#fff", fontSize: 22, fontWeight: "800" },
    xpBox: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
    xpText: { fontWeight: "800" },
    card: { padding: 20, borderRadius: 20, marginBottom: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
    cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
    cardTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },
    xpReward: { fontWeight: "800" },
    description: { color: "rgba(255,255,255,0.5)", marginBottom: 15 },
    progressContainer: { marginBottom: 15 },
    progressBar: { height: 10, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 5, overflow: "hidden" },
    progressFill: { height: "100%" },
    progressText: { color: "rgba(255,255,255,0.4)", textAlign: "right", marginTop: 5, fontSize: 12 },
    button: { padding: 15, borderRadius: 12, alignItems: "center" },
    buttonText: { fontWeight: "800", letterSpacing: 1 },
    emptyState: { paddingVertical: 40, alignItems: "center", justifyContent: "center" },
    emptyText: { color: "rgba(255,255,255,0.5)", fontSize: 16 }
});