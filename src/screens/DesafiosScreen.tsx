"use client"

import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import PageLayout from "@/components/PageLayout";
import { THEMES, useStore } from "./Store";

export default function DesafiosScreen() {
    const navigation = useNavigation<any>();
    const { xp, temaAtivo } = useStore();
    const theme = THEMES[temaAtivo];

    const challenges = [
        { id: "1", title: "Resolva 5 contas", description: "Complete 5 exercícios básicos", xp: 50, progress: 3, total: 5, completed: false },
        { id: "2", title: "Sequência diária", description: "Estude por 3 dias seguidos", xp: 100, progress: 3, total: 3, completed: true },
        { id: "3", title: "Desafio relâmpago", description: "Acerte 10 questões seguidas", xp: 150, progress: 6, total: 10, completed: false },
    ];

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

                {challenges.map((challenge) => {
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
                                onPress={() => !challenge.completed && navigation.navigate("SelecaoExercicios")}
                            >
                                <Text style={[styles.buttonText, { color: challenge.completed ? "#10b981" : "#fff" }]}>
                                    {challenge.completed ? "✔ CONCLUÍDO" : "INICIAR"}
                                </Text>
                            </Pressable>
                        </View>
                    );
                })}
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
    buttonText: { fontWeight: "800", letterSpacing: 1 }
});