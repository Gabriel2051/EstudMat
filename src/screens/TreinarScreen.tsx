"use client"

import { useNavigation } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import { LinearGradient } from "expo-linear-gradient"
import { useEffect, useState } from "react"
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import type { RootStackParamList } from "../../app/(tabs)/index"
import { useResponsive } from "../hooks/useResponsive"
import { showAlert } from "../utils/platformAlert"
import { auth } from "./../services/connectionFirebase"
import { useStore } from "./Store"

type NavigationProps = StackNavigationProp<RootStackParamList>

type Exercise = {
    id: string
    title: string
    description: string
    completed: boolean
}

export default function TreinarScreen() {
    const navigation = useNavigation<NavigationProps>()
    const { xp, reloadXP } = useStore()
    const [exercises, setExercises] = useState<Exercise[]>([])
    const [loading, setLoading] = useState(true)
    const { width } = useResponsive()

    useEffect(() => {
        const user = auth.currentUser
        if (!user) {
            showAlert(
                "Não autenticado",
                "Você precisa estar logado para acessar os treinos.",
                [{ text: "OK", onPress: () => navigation.replace("Login") }]
            )
            return
        }
        loadExercises()
    }, [])

    const loadExercises = async () => {
        setLoading(true)
        try {
            // Simulando dados de exercícios, pode ser substituído por chamada real
            setExercises([
                {
                    id: "1",
                    title: "Exercício 1: Matemática Básica",
                    description: "Resolva 10 operações de adição e subtração.",
                    completed: false,
                },
                {
                    id: "2",
                    title: "Exercício 2: Tabuada",
                    description: "Pratique a tabuada do 5.",
                    completed: true,
                },
                {
                    id: "3",
                    title: "Exercício 3: Sequência Numérica",
                    description: "Complete a sequência de números.",
                    completed: false,
                },
            ])
            await reloadXP()
        } catch (error) {
            console.error("Erro ao carregar exercícios:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleStartExercise = (exercise: Exercise) => {
        if (exercise.completed) {
            showAlert("Já concluído", "Você já completou este exercício.")
            return
        }
        // Navegue para a tela de exercício específico, se existir
        showAlert("Em breve", "Funcionalidade ainda está em desenvolvimento.")
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>📚 Treinar</Text>
                <Text style={styles.subtitle}>Pratique exercícios para ganhar XP</Text>
                <View style={styles.xpBox}>
                    <Text style={styles.xpText}>{xp} XP</Text>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                {exercises.map((exercise) => (
                    <Pressable
                        key={exercise.id}
                        style={({ pressed }) => [
                            styles.card,
                            pressed && { opacity: 0.8 },
                            exercise.completed && styles.cardCompleted,
                            { width: width - 32 },
                        ]}
                        onPress={() => handleStartExercise(exercise)}
                    >
                        <LinearGradient
                            colors={exercise.completed ? ["#22c55e", "#16a34a"] : ["#1e1b4b", "#312e81"]}
                            style={styles.gradient}
                        >
                            <Text style={styles.cardTitle}>{exercise.title}</Text>
                            <Text style={styles.cardDescription}>{exercise.description}</Text>
                            <Text style={styles.statusText}>
                                {exercise.completed ? "✔ Concluído" : "➤ Toque para iniciar"}
                            </Text>
                        </LinearGradient>
                    </Pressable>
                ))}
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

    cardCompleted: {
        opacity: 0.6,
    },

    gradient: {
        padding: 16,
    },

    cardTitle: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "800",
        marginBottom: 6,
    },

    cardDescription: {
        color: "rgba(255,255,255,0.7)",
        fontSize: 14,
        marginBottom: 10,
    },

    statusText: {
        color: "#a5b4fc",
        fontWeight: "700",
        fontSize: 14,
    },
})