"use client"

import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useStore } from './Store';

export default function TreinarFase2() {
  const { addXP } = useStore();
  const navigation = useNavigation<any>();
  
  // Estados do Jogo
  const [mostrarTeoria, setMostrarTeoria] = useState(true); // Controla a aba educativa
  const [finalizado, setFinalizado] = useState(false);
  const [contador, setContador] = useState(1);
  const [xpAcumulado, setXpAcumulado] = useState(0);
  
  const [pergunta, setPergunta] = useState({ text: '', res: 0 });
  const [resposta, setResposta] = useState('');

  useEffect(() => {
    gerarNovaPergunta();
  }, []);

  // Lógica para gerar contas com resultados INTEIROS sempre
  const gerarNovaPergunta = () => {
    // Para ax + b = c, geramos primeiro o 'x' (resultado), o 'a' e o 'b'
    const a = Math.floor(Math.random() * 4) + 2;  // Multiplicador (2 a 5)
    const x = Math.floor(Math.random() * 10) + 1; // Resposta que o user tem de adivinhar (1 a 10)
    const b = Math.floor(Math.random() * 10) + 1; // Valor somado ou subtraído (1 a 10)
    
    const isSoma = Math.random() > 0.5;
    
    let c = 0;
    let text = '';
    
    if (isSoma) {
      c = (a * x) + b;
      text = `${a}x + ${b} = ${c}`;
    } else {
      c = (a * x) - b;
      text = `${a}x - ${b} = ${c}`;
    }
    
    setPergunta({ text, res: x });
    setResposta('');
  };

  const validarResposta = () => {
    const resDigitada = parseInt(resposta);

    if (isNaN(resDigitada)) {
      Alert.alert("Aviso", "Por favor, insira um número válido.");
      return;
    }

    if (resDigitada === pergunta.res) {
      const pontosPorQuestao = 75; // Fase 2 dá mais XP por ser mais difícil!
      
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
      Alert.alert("Ops!", "Resposta incorreta. Lembra-te: isola o X mudando o sinal!");
    }
  };

  // ------------------------------------------------------------------
  // 1. TELA EDUCATIVA (TEORIA)
  // ------------------------------------------------------------------
  if (mostrarTeoria) {
    return (
      <View style={styles.containerFinal}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }} showsVerticalScrollIndicator={false}>
          <Text style={styles.iconeFinal}>💡</Text>
          <Text style={styles.tituloFinal}>Aprende a Base</Text>
          <Text style={styles.textoFinal}>Bem-vindo às Equações de 1º Grau!</Text>
          
          <View style={styles.teoriaCard}>
            <Text style={styles.teoriaTexto}>
              O teu objetivo é descobrir o valor do <Text style={{ color: "#ef4444", fontWeight: "800" }}>X</Text>. Para isso, tens de o "isolar" sozinho de um dos lados do igual (=).
            </Text>
            
            <Text style={styles.teoriaRegra}>
              <Text style={{ color: "#ef4444" }}>Regra de Ouro:</Text>{"\n"}
              • O que está a somar, passa a subtrair.{"\n"}
              • O que está a multiplicar, passa a dividir.
            </Text>

            <View style={styles.exemploBox}>
              <Text style={styles.exemploTitulo}>Exemplo Prático:</Text>
              <Text style={styles.exemploPasso}>2x + 4 = 10</Text>
              <Text style={styles.exemploPasso}>2x = 10 - 4</Text>
              <Text style={styles.exemploPasso}>2x = 6</Text>
              <Text style={styles.exemploPasso}>x = 6 / 2</Text>
              <Text style={styles.exemploPassoDestaque}>x = 3</Text>
            </View>
          </View>

          <Pressable 
            style={({ pressed }) => [styles.botao, pressed && styles.botaoPressed, { marginTop: 30, width: '100%' }]} 
            onPress={() => setMostrarTeoria(false)}
          >
            <LinearGradient colors={["#7f1d1d", "#ef4444"]} style={styles.gradient}>
              <Text style={styles.botaoText}>COMEÇAR DESAFIO</Text>
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
        <Text style={styles.iconeFinal}>🏆</Text>
        <Text style={styles.tituloFinal}>Fase Concluída!</Text>
        <Text style={styles.textoFinal}>Dominaste as funções de 1º Grau.</Text>
        
        <View style={styles.xpCardFinal}>
          <Text style={styles.xpCardLabel}>XP GANHO NESTA SESSÃO</Text>
          <Text style={styles.xpCardValue}>+{xpAcumulado} XP</Text>
        </View>

        <Pressable 
          style={({ pressed }) => [styles.botao, pressed && styles.botaoPressed, { marginTop: 40 }]} 
          onPress={() => navigation.navigate("SelecaoExercicios")}
        >
          <LinearGradient colors={["#7f1d1d", "#ef4444"]} style={styles.gradient}>
            <Text style={styles.botaoText}>CONTINUAR</Text>
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
          <Text style={styles.titulo}>Fase 2: Funções de 1º Grau</Text>
          
          <View style={styles.perguntaContainer}>
            <Text style={styles.perguntaTexto}>{pergunta.text}</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.xPrefix}>x = </Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={resposta}
              onChangeText={setResposta}
              placeholder="?"
              placeholderTextColor="rgba(255,255,255,0.3)"
              autoFocus={true}
              onSubmitEditing={validarResposta}
            />
          </View>

          <Pressable 
            style={({ pressed }) => [styles.botao, pressed && styles.botaoPressed]} 
            onPress={validarResposta}
          >
            <LinearGradient colors={["#b91c1c", "#ef4444"]} style={styles.gradient}>
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
  perguntaTexto: { color: "#fff", fontSize: 48, fontWeight: "800", textAlign: "center" },
  
  inputContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  xPrefix: { color: "#ef4444", fontSize: 32, fontWeight: "800", marginRight: 10 },
  input: { backgroundColor: "rgba(255,255,255,0.05)", color: "#fff", width: 100, padding: 15, borderRadius: 16, textAlign: "center", fontSize: 28, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  
  botao: { width: "100%", borderRadius: 16, overflow: "hidden" },
  botaoPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  gradient: { padding: 18, alignItems: "center" },
  botaoText: { color: "#fff", fontWeight: "800", fontSize: 16, letterSpacing: 1 },

  // Estilos da Teoria e Vitória
  containerFinal: { flex: 1, backgroundColor: "#0f0f14", padding: 20, paddingTop: Platform.OS === 'ios' ? 60 : 50 },
  iconeFinal: { fontSize: 80, marginBottom: 10, textAlign: 'center' },
  tituloFinal: { color: "#fff", fontSize: 32, fontWeight: "800", marginBottom: 10, textAlign: 'center' },
  textoFinal: { color: "rgba(255,255,255,0.6)", fontSize: 16, marginBottom: 30, textAlign: 'center' },
  
  teoriaCard: { backgroundColor: "#1a1a1f", padding: 25, borderRadius: 24, borderWidth: 1, borderColor: "rgba(239,68,68,0.2)", width: '100%' },
  teoriaTexto: { color: "rgba(255,255,255,0.9)", fontSize: 15, lineHeight: 22, marginBottom: 20 },
  teoriaRegra: { color: "#fff", fontSize: 15, lineHeight: 24, fontWeight: "600", backgroundColor: "rgba(255,255,255,0.05)", padding: 15, borderRadius: 12, marginBottom: 20 },
  
  exemploBox: { backgroundColor: "rgba(239,68,68,0.05)", padding: 15, borderRadius: 12, borderWidth: 1, borderColor: "rgba(239,68,68,0.2)" },
  exemploTitulo: { color: "#f87171", fontWeight: "800", marginBottom: 10, fontSize: 15 },
  exemploPasso: { color: "rgba(255,255,255,0.7)", fontSize: 16, marginBottom: 5, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  exemploPassoDestaque: { color: "#fff", fontSize: 18, fontWeight: "800", marginTop: 5, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },

  xpCardFinal: { backgroundColor: "rgba(239,68,68,0.1)", padding: 30, borderRadius: 24, alignItems: 'center', borderWidth: 1, borderColor: "rgba(239,68,68,0.3)", width: '100%' },
  xpCardLabel: { color: "#f87171", fontSize: 14, fontWeight: "800", letterSpacing: 1, marginBottom: 10 },
  xpCardValue: { color: "#fff", fontSize: 48, fontWeight: "900" }
});