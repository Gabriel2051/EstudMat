"use client"

import { useNavigation } from "@react-navigation/native"
import { get, push, ref, remove, set } from "firebase/database"
import { useEffect, useState } from "react"
import { FlatList, Pressable, StyleSheet, Text, TextInput, View, ScrollView } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
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

  const navigation = useNavigation()

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

  //----------------------------------------------------------------------
  // 🔥 SALVAR + EDITAR AGENDAMENTO (corrigido com UID)
  //----------------------------------------------------------------------
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

    // EDITAR
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

    // NOVO AGENDAMENTO
    const novoRef = push(userAgRef)
    await set(novoRef, novo)

    setAgendamentos([...agendamentos, { ...novo, id: novoRef.key }])
    limparCampos()
    showAlert("Sucesso", "Agendamento salvo!")
  }

  //----------------------------------------------------------------------
  // 🔥 CARREGAR AGENDAMENTOS DO USUÁRIO
  //----------------------------------------------------------------------
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

  //----------------------------------------------------------------------
  // 🔥 EXCLUIR AGENDAMENTO
  //----------------------------------------------------------------------
  const excluirAgendamento = async (index: number) => {
    const user = auth.currentUser
    if (!user) return

    const uid = user.uid

    showAlert("Confirmar exclusão", "Deseja realmente excluir este agendamento?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
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

  //----------------------------------------------------------------------
  // 🔥 Carrega lista ao abrir
  //----------------------------------------------------------------------
  useEffect(() => {
    const timer = setTimeout(() => {
      carregarAgendamentos()
    }, 400)
    return () => clearTimeout(timer)
  }, [])

  //----------------------------------------------------------------------
  // 🔥 UI
  //----------------------------------------------------------------------
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.titulo}>Agendamentos</Text>
          <Text style={styles.subtitle}>Gerencie seus horários e compromissos</Text>
        </View>

        <View style={styles.formCard}>
          <TextInput
            placeholder="Nome do Agendamento"
            style={styles.input}
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={nomeAgendamento}
            onChangeText={setNomeAgendamento}
          />
          <TextInput
            placeholder="Nome do Cliente"
            style={styles.input}
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={nomeCliente}
            onChangeText={setNomeCliente}
          />
          <TextInput
            placeholder="Serviço"
            style={styles.input}
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={servico}
            onChangeText={setServico}
          />
          <TextInput
            placeholder="Data (ex: 20/10/2025)"
            style={styles.input}
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={data}
            onChangeText={setData}
          />
          <TextInput
            placeholder="Hora (ex: 14:00)"
            style={styles.input}
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={hora}
            onChangeText={setHora}
          />

          <Pressable
            onPress={salvarAgendamento}
            style={({ pressed }) => [styles.pressable, pressed && styles.pressablePressed]}
          >
            <LinearGradient
              colors={["#6366f1", "#8b5cf6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.botao}
            >
              <Text style={styles.botaoTexto}>{editandoIndex !== null ? "✓ Atualizar" : "+ Salvar"}</Text>
            </LinearGradient>
          </Pressable>
        </View>

        <View style={styles.listSection}>
          <Text style={styles.listTitle}>Seus Agendamentos</Text>
          {agendamentos.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📅</Text>
              <Text style={styles.emptyText}>Nenhum agendamento ainda</Text>
              <Text style={styles.emptySubtext}>Crie seu primeiro agendamento acima</Text>
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
                      <Text style={styles.acaoTexto}>🗑️ Excluir</Text>
                    </Pressable>
                  </View>
                </View>
              )}
            />
          )}
        </View>

        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.voltarPressable, pressed && styles.pressablePressed]}
        >
          <View style={styles.voltarBotao}>
            <Text style={styles.voltarTexto}>← Voltar ao Dashboard</Text>
          </View>
        </Pressable>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  titulo: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.6)",
  },
  formCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.2)",
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.05)",
    color: "#fff",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    fontSize: 15,
  },
  pressable: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 8,
  },
  pressablePressed: {
    opacity: 0.85,
  },
  botao: {
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  botaoTexto: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  listSection: {
    marginBottom: 20,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 16,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "rgba(255,255,255,0.8)",
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
  },
  agendamentoItem: {
    backgroundColor: "#1a1a1a",
    padding: 16,
    marginBottom: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  itemNome: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    flex: 1,
  },
  servicoBadge: {
    backgroundColor: "rgba(99,102,241,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  servicoText: {
    color: "#a5b4fc",
    fontSize: 12,
    fontWeight: "600",
  },
  itemCliente: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    marginBottom: 6,
  },
  itemDataHora: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    marginBottom: 12,
  },
  acoes: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  acaoBotao: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  acaoBotaoPressed: {
    opacity: 0.8,
  },
  editarBotao: {
    backgroundColor: "rgba(34,197,94,0.15)",
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.3)",
  },
  excluirBotao: {
    backgroundColor: "rgba(239,68,68,0.15)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.3)",
  },
  acaoTexto: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  voltarPressable: {
    marginTop: 12,
  },
  voltarBotao: {
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  voltarTexto: {
    color: "rgba(255,255,255,0.8)",
    fontWeight: "600",
    fontSize: 15,
  },
})
