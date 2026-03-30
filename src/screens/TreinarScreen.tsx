import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useStore } from './Store';

export default function TreinarScreen() {
  const { addXP } = useStore();
  const navigation = useNavigation<any>();
  
  const [contador, setContador] = useState(1);
  const [xpAcumulado, setXpAcumulado] = useState(0);
  const [pergunta, setPergunta] = useState({ a: 0, b: 0, op: '', res: 0 });
  const [resposta, setResposta] = useState('');
  
  // NOVO ESTADO: Controla se a fase acabou
  const [finalizado, setFinalizado] = useState(false);

  useEffect(() => {
    gerarNovaPergunta();
  }, []);

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
      Alert.alert("Aviso", "Por favor, insira um número válido.");
      return;
    }

    if (resDigitada === pergunta.res) {
      const pontosPorQuestao = 50;
      
      // Removemos o 'await' para que o Firebase não congele a tela enquanto salva
      addXP(pontosPorQuestao); 
      
      const novoTotalSessao = xpAcumulado + pontosPorQuestao;
      setXpAcumulado(novoTotalSessao);

      // VERIFICAÇÃO DEFINITIVA
      if (contador >= 10) {
        setFinalizado(true); // Muda a tela inteira para a "Tela de Vitória"
        return; 
      }

      setContador(prev => prev + 1);
      gerarNovaPergunta();
    } else {
      Alert.alert("Ops!", "Resposta incorreta. Tente novamente!");
    }
  };

  // ------------------------------------------------------------------
  // TELA DE VITÓRIA (Renderizada apenas quando finalizado === true)
  // ------------------------------------------------------------------
  if (finalizado) {
    return (
      <View style={styles.containerFinal}>
        <Text style={styles.iconeFinal}>🏆</Text>
        <Text style={styles.tituloFinal}>Fase Concluída!</Text>
        <Text style={styles.textoFinal}>O teu desempenho foi excelente.</Text>
        
        <View style={styles.xpCardFinal}>
          <Text style={styles.xpCardLabel}>XP GANHO NESTA SESSÃO</Text>
          <Text style={styles.xpCardValue}>+{xpAcumulado} XP</Text>
        </View>

        <Pressable 
          style={({ pressed }) => [styles.botao, pressed && styles.botaoPressed, { marginTop: 40 }]} 
          onPress={() => navigation.navigate("SelecaoExercicios")}
        >
          <LinearGradient colors={["#6366f1", "#8b5cf6"]} style={styles.gradient}>
            <Text style={styles.botaoText}>CONTINUAR</Text>
          </LinearGradient>
        </Pressable>
      </View>
    );
  }

  // ------------------------------------------------------------------
  // TELA DE EXERCÍCIOS NORMAL
  // ------------------------------------------------------------------
  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.progresso}>QUESTÃO {contador} DE 10</Text>
          <View style={styles.xpBadge}>
            <Text style={styles.xpBadgeText}>+{xpAcumulado} XP</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.titulo}>Fase 1: Operações Básicas</Text>
          
          <View style={styles.perguntaContainer}>
            <Text style={styles.perguntaTexto}>
              {pergunta.a} {pergunta.op} {pergunta.b} = ?
            </Text>
          </View>

          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={resposta}
            onChangeText={setResposta}
            placeholder="Sua resposta"
            placeholderTextColor="rgba(255,255,255,0.3)"
            autoFocus={true}
            onSubmitEditing={validarResposta}
          />

          <Pressable 
            style={({ pressed }) => [styles.botao, pressed && styles.botaoPressed]} 
            onPress={validarResposta}
          >
            <LinearGradient colors={["#6366f1", "#8b5cf6"]} style={styles.gradient}>
              <Text style={styles.botaoText}>CONFIRMAR</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  // Estilos da Tela Normal
  container: { flex: 1, backgroundColor: "#0f0f14" },
  scroll: { flexGrow: 1, justifyContent: "center", padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 },
  progresso: { color: "#6366f1", fontSize: 16, fontWeight: "900", letterSpacing: 1 },
  xpBadge: { backgroundColor: "rgba(99,102,241,0.2)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  xpBadgeText: { color: "#8b5cf6", fontWeight: "700" },
  card: { backgroundColor: "#1a1a1f", padding: 30, borderRadius: 25, alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  titulo: { color: "rgba(255,255,255,0.5)", fontSize: 14, fontWeight: "600", marginBottom: 20, textTransform: "uppercase" },
  perguntaContainer: { marginBottom: 30 },
  perguntaTexto: { color: "#fff", fontSize: 56, fontWeight: "800" },
  input: { backgroundColor: "rgba(255,255,255,0.05)", color: "#fff", width: "100%", padding: 20, borderRadius: 15, textAlign: "center", fontSize: 24, marginBottom: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  botao: { width: "100%", borderRadius: 15, overflow: "hidden" },
  botaoPressed: { opacity: 0.8 },
  gradient: { padding: 18, alignItems: "center" },
  botaoText: { color: "#fff", fontWeight: "800", fontSize: 18, letterSpacing: 1 },

  // Estilos da Tela Final (Vitória)
  containerFinal: { flex: 1, backgroundColor: "#0f0f14", justifyContent: 'center', alignItems: 'center', padding: 20 },
  iconeFinal: { fontSize: 80, marginBottom: 20 },
  tituloFinal: { color: "#fff", fontSize: 32, fontWeight: "800", marginBottom: 10 },
  textoFinal: { color: "rgba(255,255,255,0.6)", fontSize: 16, marginBottom: 40 },
  xpCardFinal: { backgroundColor: "rgba(99,102,241,0.1)", padding: 30, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: "rgba(99,102,241,0.3)", width: '100%' },
  xpCardLabel: { color: "#a5b4fc", fontSize: 14, fontWeight: "700", letterSpacing: 1, marginBottom: 10 },
  xpCardValue: { color: "#fff", fontSize: 48, fontWeight: "900" }
});