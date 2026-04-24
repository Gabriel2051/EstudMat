"use client"

import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { XP_VALUES } from '@/constants/gameConfig';
import { showAlert } from '@/utils/platformAlert';
import { useStore } from './Store';

export default function TreinarFase2() {
  const { addXP } = useStore();
  const navigation = useNavigation<any>();
  
  const [mostrarTeoria, setMostrarTeoria] = useState(true);
  const [finalizado, setFinalizado] = useState(false);
  const [contador, setContador] = useState(1);
  const [xpAcumulado, setXpAcumulado] = useState(0);
  const [pergunta, setPergunta] = useState({ text: '', res: 0 });
  const [resposta, setResposta] = useState('');

  useEffect(() => {
    gerarNovaPergunta();
  }, []);

  const handleSair = () => {
    showAlert(
      "Abandonar lição?", 
      "Se você sair agora, perderá o progresso desta lição.",
      [
        { text: "Continuar", style: "cancel" },
        { text: "Sair", style: "destructive", onPress: () => navigation.navigate("SelecaoExercicios") }
      ]
    );
  };

  const gerarNovaPergunta = () => {
    const a = Math.floor(Math.random() * 4) + 2;
    const x = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    const isSoma = Math.random() > 0.5;
    
    let c = isSoma ? (a * x) + b : (a * x) - b;
    let text = isSoma ? `${a}x + ${b} = ${c}` : `${a}x - ${b} = ${c}`;
    
    setPergunta({ text, res: x });
    setResposta('');
  };

  const validarResposta = () => {
    const resDigitada = parseInt(resposta);
    if (isNaN(resDigitada)) {
      showAlert("Aviso", "Insira um número válido.");
      return;
    }

    if (resDigitada === pergunta.res) {
      const pontos = XP_VALUES.phase2;
      addXP(pontos); 
      setXpAcumulado(prev => prev + pontos);

      if (contador >= 10) setFinalizado(true);
      else {
        setContador(prev => prev + 1);
        gerarNovaPergunta();
      }
    } else {
      showAlert("Ops!", "Incorreto. Isole o X trocando o sinal do número que muda de lado!");
    }
  };

  if (mostrarTeoria) {
    return (
      <View style={styles.containerFinal}>
        <ScrollView contentContainerStyle={styles.centerScroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.iconeFinal}>⚖️</Text>
          <Text style={styles.tituloFinal}>Equilibrando a Balança</Text>
          
          <View style={styles.teoriaCard}>
            <Text style={styles.teoriaTexto}>
              Resolver uma equação é como equilibrar uma balança. Para isolar o <Text style={{color: "#ef4444", fontWeight: "800"}}>x</Text>, mova os números para o outro lado usando a <Text style={{fontWeight: "800"}}>Operação Inversa</Text>:
            </Text>
            
            <View style={styles.teoriaRegra}>
              <Text style={{color: "#fff", marginBottom: 5}}>➕ Somando ➔ Passa <Text style={{color: "#f87171"}}>Subtraindo</Text> ( - )</Text>
              <Text style={{color: "#fff"}}>✖️ Multiplicando ➔ Passa <Text style={{color: "#f87171"}}>Dividindo</Text> ( ÷ )</Text>
            </View>

            <View style={styles.exemploBox}>
              <Text style={styles.exemploTitulo}>Exemplo Rápido: 3x - 2 = 10</Text>
              <Text style={styles.exemploPasso}>1º) O -2 passa somando: 3x = 10 + 2 (12)</Text>
              <Text style={styles.exemploPasso}>2º) O 3 passa dividindo: x = 12 ÷ 3</Text>
              <Text style={styles.exemploPassoDestaque}>Resultado: x = 4</Text>
            </View>
          </View>

          <Pressable style={styles.botaoLargo} onPress={() => setMostrarTeoria(false)}>
            <LinearGradient colors={["#7f1d1d", "#ef4444"]} style={styles.gradient}>
              <Text style={styles.botaoText}>ENTENDI, VAMOS TREINAR!</Text>
            </LinearGradient>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  if (finalizado) {
    return (
      <View style={styles.containerFinal}>
        <Text style={styles.iconeFinal}>🏆</Text>
        <Text style={styles.tituloFinal}>Fase Concluída!</Text>
        <View style={styles.xpCardFinal}>
          <Text style={styles.xpCardLabel}>XP GANHO</Text>
          <Text style={styles.xpCardValue}>+{xpAcumulado} XP</Text>
        </View>
        <Pressable style={styles.botaoLargo} onPress={() => navigation.navigate("SelecaoExercicios")}>
          <LinearGradient colors={["#7f1d1d", "#ef4444"]} style={styles.gradient}><Text style={styles.botaoText}>CONTINUAR</Text></LinearGradient>
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
          <Text style={styles.titulo}>Fase 2: Equações de 1º Grau</Text>
          <View style={styles.perguntaContainer}>
            <Text style={styles.perguntaTexto}>{pergunta.text}</Text>
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.xPrefix}>x = </Text>
            <TextInput
              style={styles.input} keyboardType="numeric" value={resposta}
              onChangeText={setResposta} placeholder="?" placeholderTextColor="rgba(255,255,255,0.3)"
              autoFocus onSubmitEditing={validarResposta}
            />
          </View>
          <Pressable style={styles.botao} onPress={validarResposta}>
            <LinearGradient colors={["#b91c1c", "#ef4444"]} style={styles.gradient}><Text style={styles.botaoText}>CONFIRMAR</Text></LinearGradient>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Estilos compartilhados abaixo...
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