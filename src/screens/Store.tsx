"use client"

import { auth, database } from "@/services/connectionFirebase";
import { WebStorage } from "@/utils/webStorage";
import { onAuthStateChanged } from "firebase/auth";
import { get, push, ref, set, update } from "firebase/database";
import { createContext, type ReactNode, useContext, useEffect, useState } from "react";

// Definição dos temas para usar em todo o app
export const THEMES = {
  padrao: { id: 'padrao', primary: "#ef4444", bg: "#0f0f14", card: "#1a1a1f", accent: "#7f1d1d" },
  esmeralda: { id: 'esmeralda', primary: "#10b981", bg: "#061a14", card: "#0a261e", accent: "#065f46" },
  dracula: { id: 'dracula', primary: "#bd93f9", bg: "#282a36", card: "#44475a", accent: "#6272a4" },
  oceano: { id: 'oceano', primary: "#3b82f6", bg: "#0f172a", card: "#1e293b", accent: "#1e40af" },
};

export type Reward = {
  id: string
  nome: string
  precoXP: number
  descricao?: string
  imagem?: string
  tipo?: 'TEMA' | 'ITEM' | 'ICONE' // Adicionado para lógica de customização
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
  addXP: (amount: number) => Promise<void>
  inventory: Reward[]
  reloadXP: () => Promise<void>
  // Novos campos para customização:
  temaAtivo: keyof typeof THEMES
  mudarTema: (temaId: keyof typeof THEMES) => Promise<void>
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
  const [temaAtivo, setTemaAtivo] = useState<keyof typeof THEMES>('padrao')
  const [uid, setUid] = useState<string | null>(null)

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setUid(user ? user.uid : null);
    });
  }, []);

  const loadUserData = async () => {
    if (!uid) return;
    
    const cachedCart = await WebStorage.getItem(`@user_cart_${uid}`);
    if (cachedCart) setCart(JSON.parse(cachedCart));

    const userRef = ref(database, `users/${uid}`);
    get(userRef).then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setXp(data.xp ?? 5000);
        setInventory(data.inventory ?? []);
        // Carrega o tema salvo no banco, se não existir usa o padrão
        if (data.temaAtual && THEMES[data.temaAtual as keyof typeof THEMES]) {
          setTemaAtivo(data.temaAtual as keyof typeof THEMES);
        }
      }
    }).catch(err => console.log("Erro ao carregar dados:", err));
  };

  const addXP = async (amount: number) => {
    if (!uid) return;
    const newXP = xp + amount;
    setXp(newXP);
    update(ref(database, `users/${uid}`), { xp: newXP });
  };

  // Função para mudar o tema e salvar a preferência
  const mudarTema = async (temaId: keyof typeof THEMES) => {
    setTemaAtivo(temaId);
    if (uid) {
      update(ref(database, `users/${uid}`), { temaAtual: temaId });
    }
  };

  useEffect(() => {
    if (uid) loadUserData();
  }, [uid]);

  const reloadXP = async () => loadUserData();

  const addToCart = (reward: Reward) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.id === reward.id);
      if (exists) return prev.map((i) => (i.id === reward.id ? { ...i, quantity: i.quantity + 1 } : i));
      return [...prev, { ...reward, quantity: 1 }];
    });
  };

  const removeFromCart = (rewardId: string) => setCart(p => p.filter(i => i.id !== rewardId));
  const incrementQty = (id: string) => setCart(p => p.map(i => i.id === id ? { ...i, quantity: i.quantity + 1 } : i));
  const decrementQty = (id: string) => setCart(p => p.map(i => i.id === id ? { ...i, quantity: Math.max(0, i.quantity - 1) } : i).filter(i => i.quantity > 0));
  const clearCart = () => setCart([]);

  const purchaseCart = async (nomeCliente?: string) => {
    if (!uid || cart.length === 0) return { success: false, message: "Erro" };
    
    const totalCost = cart.reduce((s, it) => s + it.precoXP * it.quantity, 0);
    if (totalCost > xp) return { success: false, message: "XP insuficiente" };

    const newItems: Reward[] = [];
    cart.forEach(c => { 
      for(let i=0; i<c.quantity; i++) {
        const { quantity, ...itemSemQty } = c;
        newItems.push(itemSemQty as Reward);
      }
    });
    
    const updatedXP = xp - totalCost;
    const updatedInventory = [...inventory, ...newItems];

    setXp(updatedXP);
    setInventory(updatedInventory);
    clearCart();

    const userRef = ref(database, `users/${uid}`);
    const receiptRef = push(ref(database, `users/${uid}/comprovantes`));
    
    update(userRef, { xp: updatedXP, inventory: updatedInventory });
    set(receiptRef, { 
      items: cart, 
      totalXP: totalCost, 
      nomeCliente: nomeCliente || "Estudante",
      createdAt: new Date().toISOString() 
    });

    return { success: true, message: "Compra realizada!" };
  }

  return (
    <StoreContext.Provider value={{ 
      xp, setXp, cart, addToCart, removeFromCart, incrementQty, 
      decrementQty, clearCart, purchaseCart, addXP, inventory, 
      reloadXP, temaAtivo, mudarTema 
    }}>
      {children}
    </StoreContext.Provider>
  )
}