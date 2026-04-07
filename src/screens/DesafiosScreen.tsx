"use client"

import { useNavigation } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import { LinearGradient } from "expo-linear-gradient"
import { useEffect, useState } from "react"
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import type { RootStackParamList } from "../../app/(tabs)/index"
import { useStore } from "./Store"

type NavigationProps = StackNavigationProp<RootStackParamList>

type Challenge = {
    id: string
    title: string
    description: string
    xp: number
    progress: number
    total: number
    completed: boolean
}

export default function DesafiosScreen() {
    const navigation = useNavigation<NavigationProps>()
    const { xp } = useStore()

    const [challenges, setChallenges] = useState<Challenge[]>([])

    const handleStart = (challenge: Challenge) => {
        if (challenge.completed) return
        navigation.navigate("TreinarFase1" as never) // Ajustado para ir para a fase
    }

    useEffect(() => {
        loadChallenges()
    }, [])

    const loadChallenges = () => {
        setChallenges([
            {
                id: "1",
                title: "Resolva 5 contas",
                description: "Complete 5 exercícios básicos",
                xp: 50,
                progress: 3,
                total: 5,
                completed: false,
            },
            {
                id: "2",
                title: "Sequência diária",
                description: "Estude por 3 dias seguidos",
                xp: 100,
                progress: 3,
                total: 3,
                completed: true,
            },
            {
                id: "3",
                title: "Desafio relâmpago",
                description: "Acerte 10 questões seguidas",
                xp: 150,
                progress: 6,
                total: 10,
                completed: false,
            },
        ])
    }

    return (
        <View style={styles.container}>
            {/* NOVO CABEÇALHO COM BOTÃO VOLTAR (Spacer Layout) */}
            <View style={styles.headerContainer}>
                <Pressable 
                    style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]} 
                    onPress={() => navigation.navigate("Dashboard")}
                >
                    <Text style={styles.backButtonText}>← Voltar</Text>
                </Pressable>
                
                <View style={styles.titleWrapper}>
                    <Text style={styles.headerTitle}>🎯 Desafios</Text>
                </View>
                
                <View style={styles.spacer} />
            </View>

            {/* SUBTÍTULO E XP */}
            <View style={styles.subHeader}>
                <Text style={styles.subtitle}>Complete missões e ganhe XP</Text>
                <View style={styles.xpBox}>
                    <Text style={styles.xpText}>{xp} XP</Text>
                </View>
            </View>

            {/* LISTA */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
                {challenges.map((challenge) => {
                    const progressPercent = challenge.progress / challenge.total

                    return (
                        <View key={challenge.id} style={styles.card}>
                            <LinearGradient
                                colors={["#1a1a1f", "#1a1a1f"]} // Fundo escuro do cartão
                                style={styles.gradient}
                            >
                                <View style={styles.cardHeader}>
                                    <Text style={styles.cardTitle}>{challenge.title}</Text>
                                    <View style={styles.xpBadgeCard}>
                                        <Text style={styles.xpReward}>+{challenge.xp} XP</Text>
                                    </View>
                                </View>

                                <Text style={styles.description}>
                                    {challenge.description}
                                </Text>

                                {/* PROGRESSO */}
                                <View style={styles.progressContainer}>
                                    <View style={styles.progressBar}>
                                        <LinearGradient
                                            colors={challenge.completed ? ["#10b981", "#059669"] : ["#7f1d1d", "#ef4444"]}
                                            style={[
                                                styles.progressFill,
                                                { width: `${progressPercent * 100}%` },
                                            ]}
                                        />
                                    </View>

                                    <Text style={styles.progressText}>
                                        {challenge.progress} / {challenge.total}
                                    </Text>
                                </View>

                                {/* BOTÃO */}
                                <Pressable
                                    style={({ pressed }) => [
                                        styles.button,
                                        challenge.completed ? styles.buttonCompleted : styles.buttonActive,
                                        pressed && { opacity: 0.8 },
                                    ]}
                                    onPress={() => handleStart(challenge)}
                                >
                                    <Text style={[
                                        styles.buttonText, 
                                        challenge.completed ? styles.buttonTextCompleted : styles.buttonTextActive
                                    ]}>
                                        {challenge.completed ? "✔ CONCLUÍDO" : "INICIAR"}
                                    </Text>
                                </Pressable>
                            </LinearGradient>
                        </View>
                    )
                })}
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0f0f14",
        padding: 16,
        paddingTop: Platform.OS === 'ios' ? 60 : 50,
    },
    
    // Cabeçalho Spacer
    headerContainer: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginBottom: 16,
        width: '100%',
    },
    backButton: {
        width: 85,
        paddingVertical: 8,
        alignItems: 'center',
        backgroundColor: "rgba(255,255,255,0.1)",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.15)"
    },
    backButtonText: { color: "#fff", fontWeight: "700", fontSize: 14 },
    titleWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { color: "#ffffff", fontSize: 24, fontWeight: "800" },
    spacer: { width: 85 },

    subHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        paddingHorizontal: 4,
    },
    subtitle: {
        color: "rgba(255,255,255,0.6)",
        fontSize: 13,
        fontWeight: "600",
        flex: 1,
    },
    xpBox: {
        backgroundColor: "rgba(239,68,68,0.15)", // Fundo avermelhado
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "rgba(239,68,68,0.3)",
    },
    xpText: {
        color: "#f87171",
        fontWeight: "800",
        fontSize: 13,
    },

    card: {
        marginBottom: 16,
        borderRadius: 16,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)", // Efeito Glassmorphism
    },
    gradient: {
        padding: 20,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    cardTitle: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "800",
        flex: 1,
    },
    xpBadgeCard: {
        backgroundColor: "rgba(255,255,255,0.05)",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    xpReward: {
        color: "#f87171", // Vermelho destaque
        fontWeight: "800",
        fontSize: 12,
    },
    description: {
        color: "rgba(255,255,255,0.6)",
        fontSize: 14,
        marginBottom: 16,
    },
    progressContainer: {
        marginBottom: 16,
    },
    progressBar: {
        height: 8,
        backgroundColor: "rgba(255,255,255,0.05)",
        borderRadius: 6,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.05)",
    },
    progressFill: {
        height: "100%",
        borderRadius: 6,
    },
    progressText: {
        color: "rgba(255,255,255,0.5)",
        fontSize: 12,
        fontWeight: "700",
        marginTop: 6,
        textAlign: "right",
    },

    button: {
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: "center",
        borderWidth: 1,
    },
    buttonActive: {
        backgroundColor: "rgba(239,68,68,0.15)",
        borderColor: "rgba(239,68,68,0.3)",
    },
    buttonCompleted: {
        backgroundColor: "rgba(16,185,129,0.1)",
        borderColor: "rgba(16,185,129,0.2)",
    },
    buttonText: {
        fontWeight: "800",
        letterSpacing: 1,
        fontSize: 14,
    },
    buttonTextActive: {
        color: "#f87171",
    },
    buttonTextCompleted: {
        color: "#10b981", // Verde sucesso
    },
})