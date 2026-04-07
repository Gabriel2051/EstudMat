"use client"

import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useStore } from './Store';

export default function TreinarFase3() {
  const { addXP } = useStore();
  const navigation = useNavigation<any>();
  
  // Estados
  const [mostrarTeoria, setMostrarTeoria] = useState(true);
  const [finalizado, setFinalizado] = useState(false);
  const [contador, setContador] = useState(1);
  const [xpAcumulado, setXpAcumulado] = useState(0);
  
  const [pergunta, setPergunta] = useState({ text: '', x1: 0, x2: 0 });
  
  // Precisamos de 2 respostas para as 2 raízes (x1 e x2)
  const [resposta1, setResposta1] = useState('');
  const [resposta2, setResposta2] = useState('');

  useEffect(() => {
    gerarNovaPergunta();
  }, []);

  // Lógica matemática (Raízes positivas e simples para cálculo mental)
  const gerarNovaPergunta = () => {
    // Geramos duas raízes inteiras entre 1 e 7
    const root1 = Math.floor(Math.random() * 7) + 1;
    const root2 = Math.floor(Math.random() * 7) + 1;
    
    // x² - (Soma)x + (Produto) = 0
    const soma = root1 + root2;
    const produto = root1 * root2;
    
    const textoEquacao = `x² - ${soma}x + ${produto} = 0`;
    
    setPergunta({ text: textoEquacao, x1: root1, x2: root2 });
    setResposta1('');
    setResposta2('');
  };

  const validarResposta = () => {
    const r1 = parseInt(resposta1);
    const r2 = parseInt(resposta2);

    if (isNaN(r1) || isNaN(r2)) {
      Alert.alert("Aviso", "Por favor, preenche ambas as raízes (x1 e x2) com números válidos.");
      return;
    }

    // O utilizador pode inserir as raízes por qualquer ordem
    const acertouOrdem1 = r1 === pergunta.x1 && r2 === pergunta.x2;
    const acertouOrdem2 = r1 === pergunta.x2 && r2 === pergunta.x1;

    if (acertouOrdem1 || acertouOrdem2) {
      const pontosPorQuestao = 100; // Máximo de XP!
      
      addXP(pontosPorQuestao); 
      
      const novoTotalSessao = xpAcumulado + pontosPorQuestao;
      setXpAcumulado(novoTotalSessao);

      if (contador >= 10) {
        setFinalizado(true);
        return; 
      }

      setContador(prev => prev + 1);
      gerarNovaPergunta();
    } else {
      Alert.alert("Ops!", "Resposta incorreta. Lembra-te: Pensa em 2 números que somados dão o B (sinal trocado) e multiplicados dão o C.");
    }
  };

  // ------------------------------------------------------------------
  // 1. TELA EDUCATIVA (TEORIA SOMA E PRODUTO)
  // ------------------------------------------------------------------
  if (mostrarTeoria) {
    return (
      <View style={styles.containerFinal}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }} showsVerticalScrollIndicator={false}>
          <Text style={styles.iconeFinal}>🧠</Text>
          <Text style={styles.tituloFinal}>O Truque Mental</Text>
          <Text style={styles.textoFinal}>Equações de 2º Grau (Soma e Produto)</Text>
          
          <View style={styles.teoriaCard}>
            <Text style={styles.teoriaTexto}>
              Em vez de usares a enorme Fórmula de Bhaskara, podes resolver as equações de cabeça usando a regra da <Text style={{ color: "#ef4444", fontWeight: "800" }}>Soma e Produto</Text>.
            </Text>
            
            <Text style={styles.teoriaRegra}>
              Na equação: <Text style={{ color: "#ef4444" }}>x² - Sx + P = 0</Text>{"\n\n"}
              • <Text style={{ color: "#ef4444" }}>Soma (S):</Text> O número do meio (sinal trocado).{"\n"}
              • <Text style={{ color: "#ef4444" }}>Produto (P):</Text> O último número.
            </Text>

            <View style={styles.exemploBox}>
              <Text style={styles.exemploTitulo}>Exemplo: x² - 5x + 6 = 0</Text>
              <Text style={styles.exemploPasso}>Quais são os 2 números que:</Text>
              <Text style={styles.exemploPasso}>Somados dão 5?</Text>
              <Text style={styles.exemploPasso}>Multiplicados dão 6?</Text>
              <Text style={styles.exemploPassoDestaque}>Resposta: 2 e 3!</Text>
            </View>
          </View>

          <Pressable 
            style={({ pressed }) => [styles.botao, pressed && styles.botaoPressed, { marginTop: 30, width: '100%' }]} 
            onPress={() => setMostrarTeoria(false)}
          >
            <LinearGradient colors={["#7f1d1d", "#ef4444"]} style={styles.gradient}>
              <Text style={styles.botaoText}>COMEÇAR O DESAFIO</Text>
            </LinearGradient>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  // ------------------------------------------------------------------
  // 2. TELA DE VITÓRIA
  // ------------------------------------------------------------------
  if (finalizado) {
    return (
      <View style={styles.containerFinal}>
        <Text style={styles.iconeFinal}>👑</Text>
        <Text style={styles.tituloFinal}>Mestre da Matemática!</Text>
        <Text style={styles.textoFinal}>Completaste a fase mais difícil.</Text>
        
        <View style={styles.xpCardFinal}>
          <Text style={styles.xpCardLabel}>XP GANHO NESTA SESSÃO</Text>
          <Text style={styles.xpCardValue}>+{xpAcumulado} XP</Text>
        </View>

        <Pressable 
          style={({ pressed }) => [styles.botao, pressed && styles.botaoPressed, { marginTop: 40 }]} 
          onPress={() => navigation.navigate("SelecaoExercicios")}
        >
          <LinearGradient colors={["#7f1d1d", "#ef4444"]} style={styles.gradient}>
            <Text style={styles.botaoText}>VOLTAR À JORNADA</Text>
          </LinearGradient>
        </Pressable>
      </View>
    );
  }

  // ------------------------------------------------------------------
  // 3. TELA DE EXERCÍCIOS
  // ------------------------------------------------------------------
  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.progresso}>QUESTÃO {contador} DE 10</Text>
          <View style={styles.xpBadge}>
            <Text style={styles.xpBadgeText}>+{xpAcumulado} XP</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.titulo}>Fase 3: Função de 2º Grau</Text>
          
          <View style={styles.perguntaContainer}>
            <Text style={styles.perguntaTexto}>{pergunta.text}</Text>
          </View>

          <View style={styles.inputsRow}>
            <View style={styles.inputWrapper}>
              <Text style={styles.xPrefix}>x1 = </Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={resposta1}
                onChangeText={setResposta1}
                placeholder="?"
                placeholderTextColor="rgba(255,255,255,0.3)"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.xPrefix}>x2 = </Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={resposta2}
                onChangeText={setResposta2}
                placeholder="?"
                placeholderTextColor="rgba(255,255,255,0.3)"
              />
            </View>
          </View>

          <Pressable 
            style={({ pressed }) => [styles.botao, pressed && styles.botaoPressed]} 
            onPress={validarResposta}
          >
            <LinearGradient colors={["#450a0a", "#7f1d1d"]} style={styles.gradient}>
              <Text style={styles.botaoText}>CONFIRMAR</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0f14", paddingTop: Platform.OS === 'ios' ? 50 : 40 },
  scroll: { flexGrow: 1, justifyContent: "center", padding: 20 },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 },
  progresso: { color: "#ef4444", fontSize: 16, fontWeight: "900", letterSpacing: 1 },
  xpBadge: { backgroundColor: "rgba(239,68,68,0.15)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: "rgba(239,68,68,0.3)" },
  xpBadgeText: { color: "#f87171", fontWeight: "800" },
  
  card: { backgroundColor: "#1a1a1f", padding: 30, borderRadius: 24, alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  titulo: { color: "rgba(255,255,255,0.5)", fontSize: 14, fontWeight: "700", marginBottom: 20, textTransform: "uppercase", letterSpacing: 1 },
  
  perguntaContainer: { marginBottom: 30 },
  perguntaTexto: { color: "#fff", fontSize: 40, fontWeight: "800", textAlign: "center" }, // Fonte ligeiramente menor para caber toda a equação
  
  inputsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginBottom: 30 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center' },
  xPrefix: { color: "#ef4444", fontSize: 24, fontWeight: "800", marginRight: 8 },
  input: { backgroundColor: "rgba(255,255,255,0.05)", color: "#fff", width: 70, padding: 15, borderRadius: 16, textAlign: "center", fontSize: 24, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  
  botao: { width: "100%", borderRadius: 16, overflow: "hidden" },
  botaoPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  gradient: { padding: 18, alignItems: "center" },
  botaoText: { color: "#fff", fontWeight: "800", fontSize: 16, letterSpacing: 1 },

  // Estilos da Teoria e Vitória
  containerFinal: { flex: 1, backgroundColor: "#0f0f14", padding: 20, paddingTop: Platform.OS === 'ios' ? 60 : 50 },
  iconeFinal: { fontSize: 80, marginBottom: 10, textAlign: 'center' },
  tituloFinal: { color: "#fff", fontSize: 30, fontWeight: "800", marginBottom: 10, textAlign: 'center' },
  textoFinal: { color: "rgba(255,255,255,0.6)", fontSize: 16, marginBottom: 30, textAlign: 'center' },
  
  teoriaCard: { backgroundColor: "#1a1a1f", padding: 25, borderRadius: 24, borderWidth: 1, borderColor: "rgba(239,68,68,0.2)", width: '100%' },
  teoriaTexto: { color: "rgba(255,255,255,0.9)", fontSize: 15, lineHeight: 22, marginBottom: 20 },
  teoriaRegra: { color: "#fff", fontSize: 15, lineHeight: 24, fontWeight: "600", backgroundColor: "rgba(255,255,255,0.05)", padding: 15, borderRadius: 12, marginBottom: 20 },
  
  exemploBox: { backgroundColor: "rgba(239,68,68,0.05)", padding: 15, borderRadius: 12, borderWidth: 1, borderColor: "rgba(239,68,68,0.2)" },
  exemploTitulo: { color: "#f87171", fontWeight: "800", marginBottom: 10, fontSize: 15 },
  exemploPasso: { color: "rgba(255,255,255,0.7)", fontSize: 15, marginBottom: 5, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  exemploPassoDestaque: { color: "#fff", fontSize: 17, fontWeight: "800", marginTop: 5, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },

  xpCardFinal: { backgroundColor: "rgba(239,68,68,0.1)", padding: 30, borderRadius: 24, alignItems: 'center', borderWidth: 1, borderColor: "rgba(239,68,68,0.3)", width: '100%' },
  xpCardLabel: { color: "#f87171", fontSize: 14, fontWeight: "800", letterSpacing: 1, marginBottom: 10 },
  xpCardValue: { color: "#fff", fontSize: 48, fontWeight: "900" }
});