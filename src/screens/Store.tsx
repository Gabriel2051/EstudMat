"use client"

import { onAuthStateChanged, type User } from "firebase/auth"
import { get, push, ref, set, update } from "firebase/database"; // Mudamos para Realtime DB
import { createContext, type ReactNode, useContext, useEffect, useState } from "react"
import { auth, database } from "../services/connectionFirebase"; // Usamos 'database' agora
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
  const [xp, setXp] = useState<number>(5000) // Valor inicial padrão visual
  const [cart, setCart] = useState<CartItem[]>([])
  const [inventory, setInventory] = useState<Reward[]>([])
  const [uid, setUid] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState<boolean>(true)

  // -------------------------------------------------------------------
  // 🟦 Auth Listener
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

  // -------------------------------------------------------------------
  // 🔥 Carregar dados do Realtime Database
  // -------------------------------------------------------------------
  const loadUserData = async () => {
    if (!uid) return

    try {
      const userRef = ref(database, `users/${uid}`)
      const snapshot = await get(userRef)

      if (snapshot.exists()) {
        const data = snapshot.val()
        // Se o XP não existir no banco, assumimos 5000
        const serverXP = typeof data.xp === "number" ? data.xp : 5000
        const serverInv = data.inventory || []
        
        setXp(serverXP)
        setInventory(serverInv)
      } else {
        // Usuário novo ou sem dados, define padrão
        setXp(5000)
        setInventory([])
      }

      // Carrinho local
      const cachedCart = await WebStorage.getItem(`@user_cart_${uid}`)
      if (cachedCart) {
        setCart(JSON.parse(cachedCart))
      }
    } catch (e) {
      console.error("Erro ao carregar dados do usuário:", e)
    }
  }

  useEffect(() => {
    if (!authLoading && uid) {
      loadUserData()
    } else if (!uid) {
      setInventory([])
      setXp(5000)
      setCart([])
    }
  }, [uid, authLoading])

  const reloadXP = async () => {
    await loadUserData()
  }

  // -------------------------------------------------------------------
  // 💾 Cache do carrinho
  // -------------------------------------------------------------------
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
      prev.map((i) => {
          if (i.id === rewardId) {
            const newQty = i.quantity - 1
            if (newQty <= 0) return null
            return { ...i, quantity: newQty }
          }
          return i
        }).filter((i): i is CartItem => i !== null),
    )
  }

  const clearCart = () => setCart([])

  // -------------------------------------------------------------------
  // 🟩 Finalizar compra (REALTIME DB)
  // -------------------------------------------------------------------
  const purchaseCart = async (nomeCliente?: string): Promise<{ success: boolean; message: string }> => {
    console.log("[Store] Iniciando compra...")
    if (!uid) return { success: false, message: "Usuário não autenticado." }
    if (cart.length === 0) return { success: false, message: "Carrinho vazio" }

    const totalCost = cart.reduce((s, it) => s + it.precoXP * it.quantity, 0)
    const totalItemsCount = cart.reduce((s, it) => s + it.quantity, 0)

    try {
      const userRef = ref(database, `users/${uid}`)
      const snapshot = await get(userRef)
      
      let currentXP = 5000
      let currentInventory: Reward[] = []

      if (snapshot.exists()) {
        const data = snapshot.val()
        currentXP = typeof data.xp === "number" ? data.xp : 5000
        currentInventory = data.inventory || []
      }

      if (totalCost > currentXP) {
        return { success: false, message: `XP insuficiente. Você tem ${currentXP} XP.` }
      }

      // 1. Preparar itens para adicionar ao inventário
      const newItems: Reward[] = []
      cart.forEach((cartItem) => {
        for (let i = 0; i < cartItem.quantity; i++) {
          const { quantity, ...reward } = cartItem
          newItems.push(reward)
        }
      })
      const updatedInventory = [...currentInventory, ...newItems]
      const updatedXP = currentXP - totalCost

      // 2. Criar comprovante no Realtime DB (users/UID/comprovantes)
      const receiptsRef = ref(database, `users/${uid}/comprovantes`)
      const newReceiptRef = push(receiptsRef)
      
      const receiptData = {
        nomeCliente: nomeCliente ?? "Usuário",
        items: cart,
        totalXP: totalCost,
        totalItens: totalItemsCount,
        createdAt: new Date().toISOString(), // Realtime DB prefere string ISO ou timestamp
      }

      // 3. Atualizar tudo atomicamente (ou em sequência)
      await set(newReceiptRef, receiptData)
      await update(userRef, {
        xp: updatedXP,
        inventory: updatedInventory
      })

      // Sucesso
      setXp(updatedXP)
      setInventory(updatedInventory)
      clearCart()

      return {
        success: true,
        message: `Compra realizada! Saldo restante: ${updatedXP} XP`,
      }

    } catch (e: any) {
      console.error("[Store] Erro na compra:", e)
      return { success: false, message: e.message || "Erro ao processar compra." }
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