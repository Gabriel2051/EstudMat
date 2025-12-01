"use client"

// src/contexts/StoreContext.tsx
import AsyncStorage from "@react-native-async-storage/async-storage"
import { onAuthStateChanged, type User } from "firebase/auth"
import { addDoc, collection, doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore"
import { createContext, type ReactNode, useContext, useEffect, useState } from "react"
import { auth, db } from "../services/connectionFirebase"

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

  // 🔥 Agora temos loading real da autenticação
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
      setAuthLoading(false) // <-- agora sabemos que terminou de carregar
    })

    return unsub
  }, [])

  // -------------------------------------------------------------------
  // 🔥 Carrega o XP e inventário do usuário autenticado
  // -------------------------------------------------------------------
  useEffect(() => {
    if (authLoading) return // espera auth resolver

    if (!uid) {
      setInventory([])
      setXp(5000)
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
          })
          setInventory([])
          setXp(5000)
        }
      } catch (e) {
        console.warn("Erro ao carregar inventário/xp:", e)
      }
    }

    loadUserData()
  }, [uid, authLoading])

  // -------------------------------------------------------------------
  // 💾 Cache local
  // -------------------------------------------------------------------
  useEffect(() => {
    if (!uid) return
    AsyncStorage.setItem(`@cache_inventory_${uid}`, JSON.stringify(inventory))
  }, [inventory, uid])

  useEffect(() => {
    if (!uid) return
    AsyncStorage.setItem(`@cache_xp_${uid}`, JSON.stringify(xp))
  }, [xp, uid])

  useEffect(() => {
    if (!uid) {
      AsyncStorage.setItem("@user_cart", JSON.stringify(cart))
    } else {
      AsyncStorage.setItem(`@user_cart_${uid}`, JSON.stringify(cart))
    }
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
    setCart(
      (prev) =>
        prev
          .map((i) => {
            if (i.id === rewardId) {
              const newQty = i.quantity - 1
              // Se a quantidade for 0 ou menos, retorna null para filtrar depois
              if (newQty <= 0) return null
              return { ...i, quantity: newQty }
            }
            return i
          })
          .filter((i): i is CartItem => i !== null), // Remove itens nulos
    )
  }

  const clearCart = () => setCart([])

  // -------------------------------------------------------------------
  // 🟩 Finalizar compra
  // -------------------------------------------------------------------
  const purchaseCart = async (nomeCliente?: string): Promise<{ success: boolean; message: string }> => {
    // 🔥 Impede botão de travar
    if (authLoading) return { success: false, message: "Carregando autenticação..." }

    if (!uid) return { success: false, message: "Usuário não autenticado." }

    if (cart.length === 0) {
      return { success: false, message: "Carrinho vazio" }
    }

    const total = cart.reduce((s, it) => s + it.precoXP * it.quantity, 0)
    const totalItens = cart.reduce((s, it) => s + it.quantity, 0)

    if (total > xp) {
      return { success: false, message: "XP insuficiente" }
    }

    try {
      await addDoc(collection(db, "users", uid, "comprovantes"), {
        nomeCliente: nomeCliente ?? "Anônimo",
        items: cart.map(({ quantity, ...r }) => ({ ...r, quantity })),
        totalXP: total,
        totalItens,
        createdAt: serverTimestamp(),
      })

      const userRef = doc(db, "users", uid)

      const newInventoryItems: Reward[] = []
      cart.forEach((cartItem) => {
        for (let i = 0; i < cartItem.quantity; i++) {
          const { quantity, ...reward } = cartItem
          newInventoryItems.push(reward)
        }
      })

      const newInventory = [...inventory, ...newInventoryItems]
      const newXp = Math.max(0, xp - total)

      await setDoc(
        userRef,
        {
          inventory: newInventory,
          xp: newXp,
        },
        { merge: true },
      )

      setInventory(newInventory)
      setXp(newXp)

      await AsyncStorage.setItem(`@cache_xp_${uid}`, JSON.stringify(newXp))

      clearCart()

      return {
        success: true,
        message: `Compra realizada! ${totalItens} item(ns) adicionado(s) ao inventário. Gasto: ${total} XP`,
      }
    } catch (e) {
      console.error("Erro ao salvar comprovante:", e)
      return { success: false, message: "Erro ao processar compra" }
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
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}
