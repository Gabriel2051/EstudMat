"use client"

import { useNavigation } from "@react-navigation/native";
import React, { useEffect } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useStore } from './Store';

export default function AchievementsScreen() {
  const { achievements, loadAchievements } = useStore();
  const navigation = useNavigation<any>();

  useEffect(() => {
    loadAchievements();
  }, []);

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);

  const renderAchievement = (achievement: any, isUnlocked: boolean) => (
    <View key={achievement.id} style={[styles.achievementCard, isUnlocked ? styles.unlockedCard : styles.lockedCard]}>
      <View style={styles.achievementHeader}>
        <Text style={styles.achievementIcon}>{achievement.icon}</Text>
        <View style={styles.achievementContent}>
          <Text style={[styles.achievementTitle, isUnlocked ? styles.unlockedText : styles.lockedText]}>
            {achievement.title}
          </Text>
          <Text style={[styles.achievementDescription, isUnlocked ? styles.unlockedText : styles.lockedText]}>
            {achievement.description}
          </Text>
          {isUnlocked && achievement.unlockedAt && (
            <Text style={styles.unlockedDate}>
              Desbloqueado em {new Date(achievement.unlockedAt).toLocaleDateString('pt-BR')}
            </Text>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Conquistas</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Desbloqueadas ({unlockedAchievements.length})</Text>
          {unlockedAchievements.length > 0 ? (
            unlockedAchievements.map(achievement => renderAchievement(achievement, true))
          ) : (
            <Text style={styles.emptyText}>Nenhuma conquista desbloqueada ainda</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔒 Bloqueadas ({lockedAchievements.length})</Text>
          {lockedAchievements.map(achievement => renderAchievement(achievement, false))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f14",
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 24,
    fontWeight: "600",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    textAlign: 'center',
    flex: 1,
  },
  spacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
  },
  achievementCard: {
    backgroundColor: "#1a1a1f",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
  },
  unlockedCard: {
    borderColor: "#10b981",
    backgroundColor: "rgba(16, 185, 129, 0.1)",
  },
  lockedCard: {
    borderColor: "rgba(255,255,255,0.1)",
    opacity: 0.6,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    opacity: 0.8,
  },
  unlockedText: {
    color: "#fff",
  },
  lockedText: {
    color: "rgba(255,255,255,0.4)",
  },
  unlockedDate: {
    fontSize: 12,
    color: "#10b981",
    marginTop: 8,
    fontWeight: "500",
  },
  emptyText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 40,
  },
});