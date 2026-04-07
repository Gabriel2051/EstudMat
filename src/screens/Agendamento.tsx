"use client"

import { useNavigation } from "@react-navigation/native"
import { LinearGradient } from "expo-linear-gradient"
import { get, push, ref, remove, set } from "firebase/database"
import { useEffect, useState } from "react"
import { FlatList, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native"
import { auth, database } from "../services/connectionFirebase"
import { showAlert } from "../utils/platformAlert"

type Agendamento = {
  id?: string
  nomeAgendamento: string
  nomeCliente: string
  servico: string
  data: string
  hora: string
}

export default function AgendamentoScreen() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [nomeAgendamento, setNomeAgendamento] = useState("")
  const [nomeCliente, setNomeCliente] = useState("")
  const [servico, setServico] = useState("")
  const [data, setData] = useState("")
  const [hora, setHora] = useState("")
  const [editandoIndex, setEditandoIndex] = useState<number | null>(null)

  const navigation = useNavigation<any>()

  const limparCampos = () => {
    setNomeAgendamento("")
    setNomeCliente("")
    setServico("")
    setData("")
    setHora("")
    setEditandoIndex(null)
  }

  const validarCampos = () => {
    if (!nomeAgendamento || !nomeCliente || !servico || !data || !hora) {
      showAlert("Erro", "Todos os campos são obrigatórios!")
      return false
    }
    return true
  }

  const salvarAgendamento = async () => {
    if (!validarCampos()) return

    const user = auth.currentUser
    if (!user) {
      showAlert("Erro", "Usuário não autenticado.")
      return
    }

    const uid = user.uid

    const novo: Agendamento = {
      nomeAgendamento,
      nomeCliente,
      servico,
      data,
      hora,
    }

    const userAgRef = ref(database, `agendamentos/${uid}`)

    if (editandoIndex !== null) {
      const agendamentoId = agendamentos[editandoIndex].id
      if (!agendamentoId) return

      const agendamentoRef = ref(database, `agendamentos/${uid}/${agendamentoId}`)
      await set(agendamentoRef, novo)

      const listaAtualizada = [...agendamentos]
      listaAtualizada[editandoIndex] = { ...novo, id: agendamentoId }
      setAgendamentos(listaAtualizada)

      limparCampos()
      showAlert("Sucesso", "Agendamento atualizado!")
      return
    }

    const novoRef = push(userAgRef)
    await set(novoRef, novo)

    setAgendamentos([...agendamentos, { ...novo, id: novoRef.key }])
    limparCampos()
    showAlert("Sucesso", "Agendamento salvo!")
  }

  const carregarAgendamentos = async () => {
    const user = auth.currentUser
    if (!user) return

    const uid = user.uid

    try {
      const agRef = ref(database, `agendamentos/${uid}`)
      const snapshot = await get(agRef)

      if (snapshot.exists()) {
        const dados = snapshot.val()
        const lista = Object.keys(dados).map((key) => ({
          id: key,
          ...dados[key],
        }))
        setAgendamentos(lista)
      } else {
        setAgendamentos([])
      }
    } catch (e) {
      console.error("Erro ao carregar agendamentos", e)
    }
  }

  const excluirAgendamento = async (index: number) => {
    const user = auth.currentUser
    if (!user) return

    const uid = user.uid

    showAlert("Confirmar exclusão", "Deseja realmente excluir este agendamento?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          const agendamentoId = agendamentos[index].id
          if (!agendamentoId) return

          const agendamentoRef = ref(database, `agendamentos/${uid}/${agendamentoId}`)

          try {
            await remove(agendamentoRef)
            const novaLista = agendamentos.filter((_, i) => i !== index)
            setAgendamentos(novaLista)
            showAlert("Sucesso", "Agendamento excluído!")
          } catch (error: unknown) {
            const err = error as Error
            showAlert("Erro", "Erro ao excluir: " + (err.message || "Erro desconhecido"))
            console.error(error)
          }
        },
      },
    ])
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      carregarAgendamentos()
    }, 400)
    return () => clearTimeout(timer)
  }, [])

  return (
    <View style={styles.container}>
      
      {/* CABEÇALHO COM SPACER */}
      <View style={styles.headerContainer}>
        <Pressable 
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]} 
          onPress={() => navigation.navigate("Dashboard")}
        >
          <Text style={styles.backButtonText}>← Voltar</Text>
        </Pressable>
        
        <View style={styles.titleWrapper}>
          <Text style={styles.headerTitle}>📅 Agendamento</Text>
        </View>
        
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.formCard}>
          <TextInput
            placeholder="Nome do Agendamento"
            style={styles.input}
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={nomeAgendamento}
            onChangeText={setNomeAgendamento}
          />
          <TextInput
            placeholder="Nome do Cliente"
            style={styles.input}
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={nomeCliente}
            onChangeText={setNomeCliente}
          />
          <TextInput
            placeholder="Serviço"
            style={styles.input}
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={servico}
            onChangeText={setServico}
          />
          <TextInput
            placeholder="Data (ex: 20/10/2025)"
            style={styles.input}
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={data}
            onChangeText={setData}
          />
          <TextInput
            placeholder="Hora (ex: 14:00)"
            style={styles.input}
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={hora}
            onChangeText={setHora}
          />

          <Pressable
            onPress={salvarAgendamento}
            style={({ pressed }) => [styles.pressable, pressed && styles.pressablePressed]}
          >
            <LinearGradient
              colors={["#7f1d1d", "#ef4444"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.botao}
            >
              <Text style={styles.botaoTexto}>{editandoIndex !== null ? "✓ ATUALIZAR" : "+ SALVAR"}</Text>
            </LinearGradient>
          </Pressable>
        </View>

        <View style={styles.listSection}>
          <Text style={styles.listTitle}>Os teus Agendamentos</Text>
          {agendamentos.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📅</Text>
              <Text style={styles.emptyText}>Nenhum agendamento ainda</Text>
              <Text style={styles.emptySubtext}>Cria o teu primeiro agendamento acima</Text>
            </View>
          ) : (
            <FlatList
              data={agendamentos}
              scrollEnabled={false}
              keyExtractor={(item) => item.id ?? Math.random().toString()}
              renderItem={({ item, index }) => (
                <View style={styles.agendamentoItem}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemNome}>{item.nomeAgendamento}</Text>
                    <View style={styles.servicoBadge}>
                      <Text style={styles.servicoText}>{item.servico}</Text>
                    </View>
                  </View>
                  <Text style={styles.itemCliente}>Cliente: {item.nomeCliente}</Text>
                  <Text style={styles.itemDataHora}>
                    📅 {item.data} • ⏰ {item.hora}
                  </Text>

                  <View style={styles.acoes}>
                    <Pressable
                      onPress={() => {
                        setEditandoIndex(index)
                        setNomeAgendamento(item.nomeAgendamento)
                        setNomeCliente(item.nomeCliente)
                        setServico(item.servico)
                        setData(item.data)
                        setHora(item.hora)
                      }}
                      style={({ pressed }) => [
                        styles.acaoBotao,
                        styles.editarBotao,
                        pressed && styles.acaoBotaoPressed,
                      ]}
                    >
                      <Text style={styles.acaoTexto}>✏️ Editar</Text>
                    </Pressable>

                    <Pressable
                      onPress={() => excluirAgendamento(index)}
                      style={({ pressed }) => [
                        styles.acaoBotao,
                        styles.excluirBotao,
                        pressed && styles.acaoBotaoPressed,
                      ]}
                    >
                      <Text style={[styles.acaoTexto, { color: "#f87171" }]}>🗑️ Excluir</Text>
                    </Pressable>
                  </View>
                </View>
              )}
            />
          )}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f14",
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
  },
  
  // Header Spacer Layout
  headerContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16,
    marginBottom: 10,
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
  headerTitle: { color: "#ffffff", fontSize: 22, fontWeight: "800" },
  spacer: { width: 85 },

  scrollContent: { padding: 16, paddingBottom: 40 },
  
  formCard: {
    backgroundColor: "#1a1a1f",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.05)",
    color: "#ffffff",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 14,
    fontSize: 15,
  },
  pressable: { borderRadius: 12, overflow: "hidden", marginTop: 8 },
  pressablePressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  botao: { borderRadius: 12, paddingVertical: 16, alignItems: "center" },
  botaoTexto: { color: "#ffffff", fontWeight: "800", fontSize: 15, letterSpacing: 1 },
  
  listSection: { marginBottom: 18 },
  listTitle: { fontSize: 20, fontWeight: "800", color: "#ffffff", marginBottom: 16 },
  
  emptyState: {
    alignItems: "center",
    paddingVertical: 50,
    backgroundColor: "#1a1a1f",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  emptyIcon: { fontSize: 46, marginBottom: 12 },
  emptyText: { fontSize: 17, fontWeight: "700", color: "rgba(255,255,255,0.9)", marginBottom: 4 },
  emptySubtext: { fontSize: 13, color: "rgba(255,255,255,0.5)", fontWeight: "600" },
  
  agendamentoItem: {
    backgroundColor: "#1a1a1f",
    padding: 18,
    marginBottom: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  itemHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  itemNome: { fontSize: 18, fontWeight: "800", color: "#ffffff", flex: 1 },
  servicoBadge: {
    backgroundColor: "rgba(239,68,68,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.2)",
  },
  servicoText: { color: "#f87171", fontSize: 12, fontWeight: "700" },
  itemCliente: { color: "rgba(255,255,255,0.7)", fontSize: 14, fontWeight: "600", marginBottom: 6 },
  itemDataHora: { color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: "600", marginBottom: 16 },
  
  acoes: { flexDirection: "row", gap: 10 },
  acaoBotao: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  acaoBotaoPressed: { opacity: 0.8 },
  editarBotao: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  excluirBotao: {
    backgroundColor: "rgba(239,68,68,0.1)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.3)",
  },
  acaoTexto: { color: "#ffffff", fontWeight: "700", fontSize: 14 },
})