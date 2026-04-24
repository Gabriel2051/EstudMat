"use client"

import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { XP_VALUES } from '@/constants/gameConfig';
import { showAlert } from '@/utils/platformAlert';
import { useStore } from './Store';

export default function TreinarFase3() {
  const { addXP, addXPWithMultiplier, updateChallengeProgress, completeChallengeIfEligible, calculateXPMultiplier, checkAndUnlockAchievements } = useStore();
  const navigation = useNavigation<any>();
  
  const [mostrarTeoria, setMostrarTeoria] = useState(true);
  const [finalizado, setFinalizado] = useState(false);
  const [contador, setContador] = useState(1);
  const [acertos, setAcertos] = useState(0);
  const [xpAcumulado, setXpAcumulado] = useState(0);
  const [xpMultiplier, setXpMultiplier] = useState(1.0);
  const [pergunta, setPergunta] = useState({ text: '', x1: 0, x2: 0 });
  const [resposta1, setResposta1] = useState('');
  const [resposta2, setResposta2] = useState('');

  useEffect(() => {
    gerarNovaPergunta();
  }, []);

  const handleSair = () => {
    showAlert("Parar?", "Deseja abandonar este desafio de 2º grau?", [
      { text: "Ficar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: () => navigation.navigate("SelecaoExercicios") }
    ]);
  };

  const gerarNovaPergunta = () => {
    const root1 = Math.floor(Math.random() * 7) + 1;
    const root2 = Math.floor(Math.random() * 7) + 1;
    const soma = root1 + root2;
    const produto = root1 * root2;
    setPergunta({ text: `x² - ${soma}x + ${produto} = 0`, x1: root1, x2: root2 });
    setResposta1('');
    setResposta2('');
  };

  const validarResposta = () => {
    const r1 = parseInt(resposta1);
    const r2 = parseInt(resposta2);
    if (isNaN(r1) || isNaN(r2)) {
      showAlert("Aviso", "Preencha ambas as raízes!");
      return;
    }

    if ((r1 === pergunta.x1 && r2 === pergunta.x2) || (r1 === pergunta.x2 && r2 === pergunta.x1)) {
      const novoAcerto = acertos + 1;
      setAcertos(novoAcerto);
      
      const pontos = XP_VALUES.phase3;
      addXP(pontos);
      setXpAcumulado(prev => prev + pontos);
      
      // Atualizar progresso do desafio associado à Fase 3
      updateChallengeProgress("3", 3);

      if (contador >= 10) {
        // Calcular multiplicador final baseado em % de acertos
        const multiplier = calculateXPMultiplier(novoAcerto, 10);
        setXpMultiplier(multiplier);
        
        // Aplicar multiplicador ao XP acumulado (adiciona o bônus)
        if (multiplier > 1.0) {
          const bonusXP = Math.round(xpAcumulado * (multiplier - 1.0));
          addXP(bonusXP);
          setXpAcumulado(prev => prev + bonusXP);
        }
        
        // Marcar desafio como completo se elegível
        completeChallengeIfEligible("3");
        
        // Verificar achievements
        checkAndUnlockAchievements(novoAcerto, 10, 3);
        
        setFinalizado(true);
      }
      else {
        setContador(prev => prev + 1);
        gerarNovaPergunta();
      }
    } else {
      showAlert("Ops!", "Pense: quais números somados dão o meio (sinal trocado) e multiplicados dão o fim?");
    }
  };

  if (mostrarTeoria) {
    return (
      <View style={styles.containerFinal}>
        <ScrollView contentContainerStyle={styles.centerScroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.iconeFinal}>🕵️‍♂️</Text>
          <Text style={styles.tituloFinal}>Detetive de Números</Text>
          
          <View style={styles.teoriaCard}>
            <Text style={styles.teoriaTexto}>
              Para resolver <Text style={{color: "#ef4444", fontWeight: "800"}}>x² - Sx + P = 0</Text> de cabeça, encontre dois números (x1 e x2) que seguem estas pistas:
            </Text>
            
            <View style={styles.teoriaRegra}>
              <Text style={{color: "#fff", marginBottom: 8}}>1️⃣ <Text style={{color: "#f87171", fontWeight: "800"}}>Soma:</Text> Somados dão o número do meio (S).</Text>
              <Text style={{color: "#fff"}}>2️⃣ <Text style={{color: "#f87171", fontWeight: "800"}}>Produto:</Text> Multiplicados dão o último número (P).</Text>
            </View>

            <View style={styles.exemploBox}>
              <Text style={styles.exemploTitulo}>Pista: x² - 7x + 10 = 0</Text>
              <Text style={styles.exemploPasso}>Quais números somam 7 e multiplicam 10?</Text>
              <Text style={styles.exemploPassoDestaque}>• 2 + 5 = 7 e 2 × 5 = 10 (ACHOU!)</Text>
              <Text style={styles.exemploPassoDestaque}>Resposta: x1=2 e x2=5</Text>
            </View>
          </View>

          <Pressable style={styles.botaoLargo} onPress={() => setMostrarTeoria(false)}>
            <LinearGradient colors={["#7f1d1d", "#ef4444"]} style={styles.gradient}>
              <Text style={styles.botaoText}>ACEITAR DESAFIO</Text>
            </LinearGradient>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  if (finalizado) {
    const xpBonusMultiplier = Math.round(XP_VALUES.phase3 * 10 * (xpMultiplier - 1));
    return (
      <View style={styles.containerFinal}>
        <Text style={styles.iconeFinal}>👑</Text>
        <Text style={styles.tituloFinal}>Mestre do 2º Grau!</Text>
        <View style={styles.xpCardFinal}>
          <Text style={styles.xpCardLabel}>ACERTOS</Text>
          <Text style={styles.xpCardValue}>{acertos}/10</Text>
          <Text style={[styles.xpCardLabel, { marginTop: 10 }]}>MULTIPLICADOR</Text>
          <Text style={[styles.xpCardValue, { color: xpMultiplier >= 2 ? "#10b981" : "#f59e0b" }]}>
            {xpMultiplier.toFixed(1)}x
          </Text>
          <Text style={[styles.xpCardLabel, { marginTop: 10 }]}>XP TOTAL</Text>
          <Text style={styles.xpCardValue}>+{xpAcumulado} XP</Text>
          {xpBonusMultiplier > 0 && (
            <Text style={styles.xpCardBonus}>+{xpBonusMultiplier} XP (bônus)</Text>
          )}
        </View>
        <Pressable style={styles.botaoLargo} onPress={() => navigation.navigate("SelecaoExercicios")}>
          <LinearGradient colors={["#7f1d1d", "#ef4444"]} style={styles.gradient}><Text style={styles.botaoText}>VOLTAR À JORNADA</Text></LinearGradient>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.topBar}>
        <Pressable onPress={handleSair} style={styles.closeButton}><Text style={styles.closeButtonText}>✕</Text></Pressable>
        <View style={styles.progressBarBackground}>
           <View style={[styles.progressBarFill, { width: `${(contador / 10) * 100}%` }]} />
        </View>
        <View style={styles.xpBadge}><Text style={styles.xpBadgeText}>{xpAcumulado} XP</Text></View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.titulo}>Fase 3: Equações de 2º Grau</Text>
          <View style={styles.perguntaContainer}>
            <Text style={styles.perguntaTexto}>{pergunta.text}</Text>
          </View>
          
          <View style={styles.inputsRow}>
            <View style={styles.inputWrapper}>
              <Text style={styles.xPrefix}>x1=</Text>
              <TextInput
                style={styles.input} keyboardType="numeric" value={resposta1}
                onChangeText={setResposta1} placeholder="?" placeholderTextColor="rgba(255,255,255,0.3)"
              />
            </View>
            <View style={styles.inputWrapper}>
              <Text style={styles.xPrefix}>x2=</Text>
              <TextInput
                style={styles.input} keyboardType="numeric" value={resposta2}
                onChangeText={setResposta2} placeholder="?" placeholderTextColor="rgba(255,255,255,0.3)"
              />
            </View>
          </View>

          <Pressable style={styles.botao} onPress={validarResposta}>
            <LinearGradient colors={["#450a0a", "#7f1d1d"]} style={styles.gradient}><Text style={styles.botaoText}>CONFIRMAR</Text></LinearGradient>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0f14" },
  topBar: { 
    flexDirection: 'row', alignItems: 'center', 
    paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 15, gap: 15 
  },
  closeButton: { padding: 5 },
  closeButtonText: { color: "rgba(255,255,255,0.3)", fontSize: 26, fontWeight: "300" },
  progressBarBackground: { flex: 1, height: 14, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 7, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: "#ef4444", borderRadius: 7 },
  xpBadge: { backgroundColor: "rgba(239,68,68,0.15)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  xpBadgeText: { color: "#f87171", fontWeight: "900", fontSize: 13 },
  scroll: { flexGrow: 1, justifyContent: "center", padding: 20 },
  centerScroll: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: "#1a1a1f", padding: 30, borderRadius: 24, alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.05)", width: '100%' },
  titulo: { color: "rgba(255,255,255,0.4)", marginBottom: 15, fontWeight: "700", textTransform: 'uppercase' },
  perguntaContainer: { marginBottom: 20 },
  perguntaTexto: { color: "#fff", fontSize: 40, fontWeight: "800", textAlign: 'center', marginBottom: 20 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  inputsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginBottom: 25 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center' },
  xPrefix: { color: "#ef4444", fontSize: 24, fontWeight: "800", marginRight: 5 },
  input: { backgroundColor: "rgba(255,255,255,0.05)", color: "#fff", width: 80, padding: 15, borderRadius: 16, textAlign: "center", fontSize: 24, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  botao: { width: "100%", borderRadius: 16, overflow: "hidden" },
  botaoLargo: { width: '100%', borderRadius: 16, overflow: 'hidden', marginTop: 20 },
  gradient: { padding: 18, alignItems: "center" },
  botaoText: { color: "#fff", fontWeight: "800", letterSpacing: 1 },
  containerFinal: { flex: 1, backgroundColor: "#0f0f14", padding: 30, justifyContent: 'center', alignItems: 'center' },
  iconeFinal: { fontSize: 80, marginBottom: 10 },
  tituloFinal: { color: "#fff", fontSize: 28, fontWeight: "800", textAlign: 'center', marginBottom: 20 },
  teoriaCard: { backgroundColor: "#1a1a1f", padding: 20, borderRadius: 20, width: '100%', borderWidth: 1, borderColor: "rgba(239,68,68,0.2)" },
  teoriaTexto: { color: "#fff", fontSize: 16, lineHeight: 24, marginBottom: 15 },
  teoriaRegra: { color: "#fff", fontSize: 14, backgroundColor: "rgba(255,255,255,0.05)", padding: 15, borderRadius: 12 },
  exemploBox: { marginTop: 15, padding: 15, backgroundColor: "rgba(239,68,68,0.05)", borderRadius: 12 },
  exemploTitulo: { color: "#f87171", fontWeight: "800", marginBottom: 5 },
  exemploPasso: { color: "rgba(255,255,255,0.6)", fontSize: 14 },
  exemploPassoDestaque: { color: "#fff", fontWeight: "800", marginTop: 5 },
  xpCardFinal: { backgroundColor: "rgba(239,68,68,0.1)", padding: 25, borderRadius: 20, width: '100%', alignItems: 'center' },
  xpCardLabel: { color: "#f87171", fontSize: 12, fontWeight: "800" },
  xpCardValue: { color: "#fff", fontSize: 42, fontWeight: "900" }
});