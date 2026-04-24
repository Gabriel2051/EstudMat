"use client"

import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { XP_VALUES } from '@/constants/gameConfig';
import { showAlert } from '@/utils/platformAlert';
import { useStore } from './Store';

export default function TreinarScreen() {
  const { 
    addXP, 
    updateChallengeProgress, 
    completeChallengeIfEligible, 
    calculateXPMultiplier, 
    checkAndUnlockAchievements 
  } = useStore();
  
  const navigation = useNavigation<any>();
  
  const [contador, setContador] = useState(1);
  const [acertos, setAcertos] = useState(0);
  const [xpAcumulado, setXpAcumulado] = useState(0);
  const [xpMultiplier, setXpMultiplier] = useState(1.0);
  const [pergunta, setPergunta] = useState({ a: 0, b: 0, op: '', res: 0 });
  const [resposta, setResposta] = useState('');
  const [finalizado, setFinalizado] = useState(false);

  useEffect(() => {
    gerarNovaPergunta();
  }, []);

  const handleSair = () => {
    showAlert(
      "Parar exercício?", 
      "Se você sair agora, perderá o progresso desta lição.",
      [
        { text: "Continuar Treinando", style: "cancel" },
        { text: "Sair", style: "destructive", onPress: () => navigation.navigate("SelecaoExercicios") }
      ]
    );
  };

  const gerarNovaPergunta = () => {
    const ops = ['+', '-', '*'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    
    let res = 0;
    if (op === '+') res = a + b;
    else if (op === '-') res = a - b;
    else res = a * b;
    
    setPergunta({ a, b, op, res });
    setResposta('');
  };

  const validarResposta = () => {
    const resDigitada = parseInt(resposta);

    if (isNaN(resDigitada)) {
      showAlert("Atenção", "Por favor, digite um número.");
      return;
    }

    if (resDigitada === pergunta.res) {
      const novoAcerto = acertos + 1;
      setAcertos(novoAcerto);
      
      const pontos = XP_VALUES.phase1;
      addXP(pontos);
      setXpAcumulado(prev => prev + pontos);
      
      updateChallengeProgress("1", 1);

      if (contador >= 10) {
        const multiplier = calculateXPMultiplier(novoAcerto, 10);
        setXpMultiplier(multiplier);
        
        if (multiplier > 1.0) {
          const bonusXP = Math.round((pontos * 10) * (multiplier - 1.0));
          addXP(bonusXP);
          setXpAcumulado(prev => prev + bonusXP);
        }
        
        completeChallengeIfEligible("1");
        checkAndUnlockAchievements(novoAcerto, 10, 1);
        setFinalizado(true);
      } else {
        setContador(prev => prev + 1);
        gerarNovaPergunta();
      }
    } else {
      showAlert("Ops!", "Resposta errada. Tente novamente!");
    }
  };

  if (finalizado) {
    return (
      <View style={styles.containerFinal}>
        <Text style={styles.iconeFinal}>🏆</Text>
        <Text style={styles.tituloFinal}>Fase Concluída!</Text>
        <View style={styles.xpCardFinal}>
          <Text style={styles.xpCardLabel}>ACERTOS</Text>
          <Text style={styles.xpCardValue}>{acertos}/10</Text>
          <Text style={[styles.xpCardLabel, { marginTop: 10 }]}>MULTIPLICADOR</Text>
          <Text style={[styles.xpCardValue, { color: xpMultiplier >= 2 ? "#10b981" : "#f59e0b" }]}>
            {xpMultiplier.toFixed(1)}x
          </Text>
          <Text style={[styles.xpCardLabel, { marginTop: 10 }]}>XP TOTAL</Text>
          <Text style={styles.xpCardValue}>+{xpAcumulado} XP</Text>
          {xpMultiplier > 1.0 && (
            <Text style={styles.xpCardBonus}>Bônus de desempenho aplicado! ✨</Text>
          )}
        </View>
        <Pressable style={styles.botaoFinal} onPress={() => navigation.navigate("SelecaoExercicios")}>
          <LinearGradient colors={["#7f1d1d", "#ef4444"]} style={styles.gradient}>
            <Text style={styles.botaoText}>VOLTAR À JORNADA</Text>
          </LinearGradient>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.topBar}>
        <Pressable onPress={handleSair} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </Pressable>
        <View style={styles.progressBarBackground}>
           <View style={[styles.progressBarFill, { width: `${(contador / 10) * 100}%` }]} />
        </View>
        <View style={styles.xpBadge}>
          <Text style={styles.xpBadgeText}>{xpAcumulado} XP</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.titulo}>Operações Básicas</Text>
          <View style={styles.perguntaContainer}>
            <Text style={styles.perguntaTexto}>
              {pergunta.a} {pergunta.op === '*' ? '×' : pergunta.op} {pergunta.b} = ?
            </Text>
          </View>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={resposta}
            onChangeText={setResposta}
            placeholder="?"
            placeholderTextColor="rgba(255,255,255,0.2)"
            autoFocus
            onSubmitEditing={validarResposta}
          />
          <Pressable style={styles.botao} onPress={validarResposta}>
            <LinearGradient colors={["#7f1d1d", "#ef4444"]} style={styles.gradient}>
              <Text style={styles.botaoText}>CONFIRMAR</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0f14" },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 10, gap: 15 },
  closeButton: { padding: 5 },
  closeButtonText: { color: "rgba(255,255,255,0.4)", fontSize: 24, fontWeight: "600" },
  progressBarBackground: { flex: 1, height: 12, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 6, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: "#ef4444", borderRadius: 6 },
  scroll: { flexGrow: 1, justifyContent: "center", padding: 20 },
  xpBadge: { backgroundColor: "rgba(239,68,68,0.15)", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  xpBadgeText: { color: "#f87171", fontWeight: "800", fontSize: 12 },
  card: { backgroundColor: "#1a1a1f", padding: 30, borderRadius: 24, alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  titulo: { color: "rgba(255,255,255,0.4)", marginBottom: 20, fontWeight: "700", textTransform: 'uppercase', letterSpacing: 1 },
  perguntaContainer: { marginBottom: 30 },
  perguntaTexto: { color: "#fff", fontSize: 56, fontWeight: "800" },
  input: { backgroundColor: "rgba(255,255,255,0.05)", color: "#fff", width: "100%", padding: 20, borderRadius: 16, textAlign: "center", fontSize: 32, marginBottom: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  botao: { width: "100%", borderRadius: 16, overflow: "hidden" },
  gradient: { padding: 18, alignItems: "center" },
  botaoText: { color: "#fff", fontWeight: "800", letterSpacing: 1 },
  containerFinal: { flex: 1, backgroundColor: "#0f0f14", justifyContent: 'center', alignItems: 'center', padding: 30 },
  iconeFinal: { fontSize: 80, marginBottom: 20 },
  tituloFinal: { color: "#fff", fontSize: 28, fontWeight: "800", marginBottom: 20 },
  xpCardFinal: { backgroundColor: "#1a1a1f", padding: 30, borderRadius: 24, width: '100%', alignItems: 'center', textAlign: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  xpCardLabel: { color: "#f87171", fontSize: 12, fontWeight: "800" },
  xpCardValue: { color: "#fff", fontSize: 42, fontWeight: "900" },
  xpCardBonus: { color: "#10b981", fontSize: 14, fontWeight: "800", marginTop: 8 },
  botaoFinal: { width: "100%", borderRadius: 16, overflow: "hidden", marginTop: 30 }
});