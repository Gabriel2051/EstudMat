"use client"

// src/contexts/StoreContext.tsx
import { onAuthStateChanged, type User } from "firebase/auth"
import { addDoc, collection, doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore"
import { createContext, type ReactNode, useContext, useEffect, useState } from "react"
import { auth, db } from "../services/connectionFirebase"
import { WebStorage } from "../utils/webStorage"

export type Reward = {
  id: string
  nome: string
  precoXP: number
  descricao?: string
  imagem?: string
}

type CartItem = Reward & { quantity: number }

type StoreContextType = {
  xp: number
  setXp: (v: number) => void
  cart: CartItem[]
  addToCart: (reward: Reward) => void
  removeFromCart: (rewardId: string) => void
  incrementQty: (rewardId: string) => void
  decrementQty: (rewardId: string) => void
  clearCart: () => void
  purchaseCart: (nomeCliente?: string) => Promise<{ success: boolean; message: string }>
  inventory: Reward[]
  reloadXP: () => Promise<void>
}

const StoreContext = createContext<StoreContextType | undefined>(undefined)

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error("useStore must be used within StoreProvider")
  return ctx
}

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [xp, setXp] = useState<number>(5000)
  const [cart, setCart] = useState<CartItem[]>([])
  const [inventory, setInventory] = useState<Reward[]>([])
  const [uid, setUid] = useState<string | null>(null)

  const [authLoading, setAuthLoading] = useState<boolean>(true)

  // -------------------------------------------------------------------
  // 🟦 Firebase auth listener
  // -------------------------------------------------------------------
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        setUid(user.uid)
      } else {
        setUid(null)
      }
      setAuthLoading(false)
    })

    return unsub
  }, [])

  const reloadXP = async () => {
    if (!uid) return

    try {
      const userRef = doc(db, "users", uid)
      const snap = await getDoc(userRef)

      if (snap.exists()) {
        const freshXP = snap.data()?.xp ?? 5000
        setXp(freshXP)
      }
    } catch (e) {
      console.error("Erro ao recarregar XP:", e)
    }
  }

  // -------------------------------------------------------------------
  // 🔥 Carrega o XP e inventário do usuário autenticado
  // -------------------------------------------------------------------
  useEffect(() => {
    if (authLoading) return

    if (!uid) {
      setInventory([])
      setXp(5000)
      setCart([])
      return
    }

    const loadUserData = async () => {
      try {
        const userRef = doc(db, "users", uid)
        const snap = await getDoc(userRef)

        if (snap.exists()) {
          const data = snap.data() as any
          setInventory(data.inventory ?? [])
          setXp(typeof data.xp === "number" ? data.xp : 5000)
        } else {
          await setDoc(userRef, {
            inventory: [],
            xp: 5000,
            createdAt: serverTimestamp(),
          })
          setInventory([])
          setXp(5000)
        }

        const cachedCart = await WebStorage.getItem(`@user_cart_${uid}`)
        if (cachedCart) {
          setCart(JSON.parse(cachedCart))
        }
      } catch (e) {
        console.error("Erro ao carregar inventário/xp:", e)
      }
    }

    loadUserData()
  }, [uid, authLoading])

  // -------------------------------------------------------------------
  // 💾 Cache local
  // -------------------------------------------------------------------
  useEffect(() => {
    if (!uid) return
    WebStorage.setItem(`@cache_inventory_${uid}`, JSON.stringify(inventory))
  }, [inventory, uid])

  useEffect(() => {
    if (!uid) return
    WebStorage.setItem(`@cache_xp_${uid}`, JSON.stringify(xp))
  }, [xp, uid])

  useEffect(() => {
    if (!uid) return
    WebStorage.setItem(`@user_cart_${uid}`, JSON.stringify(cart))
  }, [cart, uid])

  // -------------------------------------------------------------------
  // 🛒 Funções do carrinho
  // -------------------------------------------------------------------
  const addToCart = (reward: Reward) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.id === reward.id)
      if (exists) {
        return prev.map((i) => (i.id === reward.id ? { ...i, quantity: i.quantity + 1 } : i))
      }
      return [...prev, { ...reward, quantity: 1 }]
    })
  }

  const removeFromCart = (rewardId: string) => {
    setCart((prev) => prev.filter((i) => i.id !== rewardId))
  }

  const incrementQty = (rewardId: string) => {
    setCart((prev) => prev.map((i) => (i.id === rewardId ? { ...i, quantity: i.quantity + 1 } : i)))
  }

  const decrementQty = (rewardId: string) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.id === rewardId) {
            const newQty = i.quantity - 1
            if (newQty <= 0) return null
            return { ...i, quantity: newQty }
          }
          return i
        })
        .filter((i): i is CartItem => i !== null),
    )
  }

  const clearCart = () => setCart([])

  // -------------------------------------------------------------------
  // 🟩 Finalizar compra
  // -------------------------------------------------------------------
  const purchaseCart = async (nomeCliente?: string): Promise<{ success: boolean; message: string }> => {
    console.log("[v0] Iniciando purchaseCart...")
    console.log("[v0] uid:", uid)

    if (!uid) {
      console.log("[v0] Usuário não autenticado")
      return { success: false, message: "Usuário não autenticado." }
    }

    if (cart.length === 0) {
      console.log("[v0] Carrinho vazio")
      return { success: false, message: "Carrinho vazio" }
    }

    const total = cart.reduce((s, it) => s + it.precoXP * it.quantity, 0)
    const totalItens = cart.reduce((s, it) => s + it.quantity, 0)

    console.log("[v0] Total XP:", total, "Total itens:", totalItens)

    try {
      console.log("[v0] Buscando dados do usuário no Firestore...")
      const userRef = doc(db, "users", uid)

      let freshSnap
      let retries = 3

      while (retries > 0) {
        try {
          freshSnap = await getDoc(userRef)
          console.log("[v0] Snapshot obtido com sucesso")
          break
        } catch (error: any) {
          console.log("[v0] Erro ao buscar snapshot, tentativas restantes:", retries - 1)
          if (error.code === "unavailable" || error.message.includes("offline")) {
            retries--
            if (retries > 0) {
              await new Promise((resolve) => setTimeout(resolve, 1000))
              continue
            }
          }
          throw error
        }
      }

      if (!freshSnap) {
        throw new Error("Não foi possível obter os dados do usuário após múltiplas tentativas")
      }

      console.log("[v0] Snapshot exists:", freshSnap.exists())

      let currentXP = 5000

      if (!freshSnap.exists()) {
        console.log("[v0] Documento não existe, criando...")
        await setDoc(userRef, {
          inventory: [],
          xp: 5000,
          createdAt: serverTimestamp(),
        })
        currentXP = 5000
      } else {
        currentXP = freshSnap.data()?.xp ?? 5000
      }

      console.log("[v0] XP atual no Firestore:", currentXP)

      if (total > currentXP) {
        console.log("[v0] XP insuficiente")
        setXp(currentXP)
        return { success: false, message: `XP insuficiente. Você tem ${currentXP} XP e precisa de ${total} XP.` }
      }

      console.log("[v0] Criando comprovante...")
      await addDoc(collection(db, "users", uid, "comprovantes"), {
        nomeCliente: nomeCliente ?? "Anônimo",
        items: cart.map(({ quantity, ...r }) => ({ ...r, quantity })),
        totalXP: total,
        totalItens,
        createdAt: serverTimestamp(),
      })

      console.log("[v0] Atualizando inventário...")
      const newInventoryItems: Reward[] = []
      cart.forEach((cartItem) => {
        for (let i = 0; i < cartItem.quantity; i++) {
          const { quantity, ...reward } = cartItem
          newInventoryItems.push(reward)
        }
      })

      const newInventory = [...inventory, ...newInventoryItems]
      const newXp = Math.max(0, currentXP - total)

      console.log("[v0] Novo XP:", newXp, "Novo inventário count:", newInventory.length)

      await setDoc(
        userRef,
        {
          inventory: newInventory,
          xp: newXp,
          lastPurchase: serverTimestamp(),
        },
        { merge: true },
      )

      console.log("[v0] Firestore atualizado com sucesso!")

      setInventory(newInventory)
      setXp(newXp)

      await WebStorage.setItem(`@cache_xp_${uid}`, JSON.stringify(newXp))
      await WebStorage.setItem(`@cache_inventory_${uid}`, JSON.stringify(newInventory))

      clearCart()

      console.log("[v0] Compra finalizada com sucesso!")

      return {
        success: true,
        message: `Compra realizada! ${totalItens} item(ns) adicionado(s) ao inventário. Gasto: ${total} XP. Saldo: ${newXp} XP`,
      }
    } catch (e: any) {
      console.error("[v0] Erro detalhado ao processar compra:", e)
      console.error("[v0] Erro code:", e?.code)
      console.error("[v0] Erro message:", e?.message)

      let errorMessage = "Erro desconhecido ao processar compra"

      if (e?.code === "unavailable" || e?.message?.includes("offline")) {
        errorMessage = "Sem conexão com o servidor. Verifique sua internet e tente novamente."
      } else if (e?.code === "permission-denied") {
        errorMessage = "Permissão negada. Verifique as regras de segurança do Firebase."
      } else if (e?.message) {
        errorMessage = e.message
      }

      return { success: false, message: errorMessage }
    }
  }

  return (
    <StoreContext.Provider
      value={{
        xp,
        setXp,
        cart,
        addToCart,
        removeFromCart,
        incrementQty,
        decrementQty,
        clearCart,
        purchaseCart,
        inventory,
        reloadXP,
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}
