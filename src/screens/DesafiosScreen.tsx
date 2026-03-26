"use client"

import { useNavigation } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import { LinearGradient } from "expo-linear-gradient"
import { useEffect, useState } from "react"
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
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
        navigation.navigate("Treinar")
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
            {/* HEADER */}
            <View style={styles.header}>
                <Text style={styles.title}>🎯 Desafios</Text>
                <Text style={styles.subtitle}>Complete missões e ganhe XP</Text>

                <View style={styles.xpBox}>
                    <Text style={styles.xpText}>{xp} XP</Text>
                </View>
            </View>

            {/* LISTA */}
            <ScrollView showsVerticalScrollIndicator={false}>
                {challenges.map((challenge) => {
                    const progressPercent = challenge.progress / challenge.total

                    return (
                        <View key={challenge.id} style={styles.card}>
                            <LinearGradient
                                colors={["#1e1b4b", "#312e81"]}
                                style={styles.gradient}
                            >
                                <View style={styles.cardHeader}>
                                    <Text style={styles.cardTitle}>{challenge.title}</Text>
                                    <Text style={styles.xpReward}>+{challenge.xp} XP</Text>
                                </View>

                                <Text style={styles.description}>
                                    {challenge.description}
                                </Text>

                                {/* PROGRESSO */}
                                <View style={styles.progressContainer}>
                                    <View style={styles.progressBar}>
                                        <LinearGradient
                                            colors={["#6366f1", "#8b5cf6"]}
                                            style={[
                                                styles.progressFill,
                                                { width: `${progressPercent * 100}%` },
                                            ]}
                                        />
                                    </View>

                                    <Text style={styles.progressText}>
                                        {challenge.progress}/{challenge.total}
                                    </Text>
                                </View>

                                {/* BOTÃO */}
                                <Pressable
                                    style={({ pressed }) => [
                                        styles.button,
                                        challenge.completed && styles.buttonDisabled,
                                        pressed && { opacity: 0.8 },
                                    ]}
                                    onPress={() => {
                                        if (!challenge.completed) navigation.navigate("Treinar")
                                    }}
                                >
                                    <Text style={styles.buttonText}>
                                        {challenge.completed ? "✔ Concluído" : "Iniciar"}
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
    },

    header: {
        marginBottom: 20,
    },

    title: {
        color: "#fff",
        fontSize: 26,
        fontWeight: "800",
    },

    subtitle: {
        color: "rgba(255,255,255,0.6)",
        marginBottom: 10,
    },

    xpBox: {
        alignSelf: "flex-start",
        backgroundColor: "rgba(99,102,241,0.15)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
    },

    xpText: {
        color: "#a5b4fc",
        fontWeight: "700",
    },

    card: {
        marginBottom: 14,
        borderRadius: 14,
        overflow: "hidden",
    },

    gradient: {
        padding: 16,
    },

    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 6,
    },

    cardTitle: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "800",
    },

    xpReward: {
        color: "#a5b4fc",
        fontWeight: "700",
    },

    description: {
        color: "rgba(255,255,255,0.7)",
        fontSize: 13,
        marginBottom: 10,
    },

    progressContainer: {
        marginBottom: 12,
    },

    progressBar: {
        height: 8,
        backgroundColor: "rgba(255,255,255,0.1)",
        borderRadius: 6,
        overflow: "hidden",
    },

    progressFill: {
        height: "100%",
        borderRadius: 6,
    },

    progressText: {
        color: "rgba(255,255,255,0.6)",
        fontSize: 11,
        marginTop: 4,
    },

    button: {
        backgroundColor: "rgba(99,102,241,0.2)",
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: "center",
    },

    buttonDisabled: {
        backgroundColor: "rgba(34,197,94,0.2)",
    },

    buttonText: {
        color: "#fff",
        fontWeight: "700",
    },
})