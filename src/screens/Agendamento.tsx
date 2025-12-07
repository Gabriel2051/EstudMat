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
    backgroundColor: "#0f0f14",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  header: {
    marginBottom: 20,
  },
  titulo: {
    fontSize: 28,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
  },
  formCard: {
    backgroundColor: "#1a1a1f",
    borderRadius: 14,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.04)",
    color: "#ffffff",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 11,
    fontSize: 14,
  },
  pressable: {
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 6,
  },
  pressablePressed: {
    opacity: 0.85,
  },
  botao: {
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
  },
  botaoTexto: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 0.5,
  },
  listSection: {
    marginBottom: 18,
  },
  listTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 14,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 42,
    backgroundColor: "#1a1a1f",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  emptyIcon: {
    fontSize: 42,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: "600",
    color: "rgba(255,255,255,0.8)",
    marginBottom: 3,
  },
  emptySubtext: {
    fontSize: 13,
    color: "rgba(255,255,255,0.5)",
  },
  agendamentoItem: {
    backgroundColor: "#1a1a1f",
    padding: 14,
    marginBottom: 11,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 7,
  },
  itemNome: {
    fontSize: 17,
    fontWeight: "700",
    color: "#ffffff",
    flex: 1,
  },
  servicoBadge: {
    backgroundColor: "rgba(99,102,241,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 7,
  },
  servicoText: {
    color: "#a5b4fc",
    fontSize: 11,
    fontWeight: "600",
  },
  itemCliente: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    marginBottom: 5,
  },
  itemDataHora: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    marginBottom: 10,
  },
  acoes: {
    flexDirection: "row",
    gap: 7,
    marginTop: 7,
  },
  acaoBotao: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 9,
    alignItems: "center",
  },
  acaoBotaoPressed: {
    opacity: 0.8,
  },
  editarBotao: {
    backgroundColor: "rgba(34,197,94,0.12)",
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.25)",
  },
  excluirBotao: {
    backgroundColor: "rgba(239,68,68,0.12)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.25)",
  },
  acaoTexto: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 13,
  },
  voltarPressable: {
    marginTop: 10,
  },
  voltarBotao: {
    backgroundColor: "rgba(255,255,255,0.04)",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  voltarTexto: {
    color: "rgba(255,255,255,0.8)",
    fontWeight: "600",
    fontSize: 14,
  },
})
