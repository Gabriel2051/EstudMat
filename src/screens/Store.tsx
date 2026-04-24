"use client"

import { auth, database } from "@/services/connectionFirebase";
import { WebStorage } from "@/utils/webStorage";
import { onAuthStateChanged } from "firebase/auth";
import { get, push, ref, set, update } from "firebase/database";
import { createContext, type ReactNode, useContext, useEffect, useState } from "react";

export const THEMES = {
  padrao: { id: 'padrao', primary: "#ef4444", bg: "#0f0f14", card: "#1a1a1f", accent: "#7f1d1d" },
  esmeralda: { id: 'esmeralda', primary: "#10b981", bg: "#061a14", card: "#0a261e", accent: "#065f46" },
  dracula: { id: 'dracula', primary: "#bd93f9", bg: "#282a36", card: "#44475a", accent: "#6272a4" },
  oceano: { id: 'oceano', primary: "#3b82f6", bg: "#0f172a", card: "#1e293b", accent: "#1e40af" },
};

export type Reward = {
  id: string; nome: string; precoXP: number; descricao?: string; imagem?: string;
  tipo?: 'TEMA' | 'ITEM' | 'ICONE';
}

export type Challenge = {
  id: string; title: string; description: string; xp: number;
  progress: number; total: number; completed: boolean; phase: number;
}

export type Achievement = {
  id: string; title: string; description: string; icon: string;
  unlocked: boolean; unlockedAt?: number; requirement: string;
}

type CartItem = Reward & { quantity: number }

type StoreContextType = {
  xp: number; setXp: (v: number) => void; cart: CartItem[];
  addToCart: (reward: Reward) => void; removeFromCart: (rewardId: string) => void;
  incrementQty: (rewardId: string) => void; decrementQty: (rewardId: string) => void;
  clearCart: () => void; purchaseCart: (nomeCliente?: string) => Promise<{ success: boolean; message: string }>;
  addXP: (amount: number) => Promise<void>; inventory: Reward[];
  reloadXP: () => Promise<void>; temaAtivo: keyof typeof THEMES;
  mudarTema: (temaId: keyof typeof THEMES) => Promise<void>;
  challenges: Challenge[]; achievements: Achievement[];
  loadChallenges: () => Promise<void>; loadAchievements: () => Promise<void>;
  // Funções de Gamificação pedidas pelas telas:
  updateChallengeProgress: (id: string, phase: number) => Promise<void>;
  completeChallengeIfEligible: (id: string) => Promise<void>;
  calculateXPMultiplier: (acertos: number, total: number) => number;
  checkAndUnlockAchievements: (acertos: number, total: number, fase: number) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [xp, setXp] = useState<number>(5000);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [inventory, setInventory] = useState<Reward[]>([]);
  const [temaAtivo, setTemaAtivo] = useState<keyof typeof THEMES>('padrao');
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => { setUid(user ? user.uid : null); });
  }, []);

  const loadUserData = async () => {
    if (!uid) return;
    const userRef = ref(database, `users/${uid}`);
    get(userRef).then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setXp(data.xp ?? 5000);
        setInventory(data.inventory ?? []);
        if (data.temaAtual && THEMES[data.temaAtual as keyof typeof THEMES]) setTemaAtivo(data.temaAtual as keyof typeof THEMES);
        if (data.challenges) setChallenges(Object.values(data.challenges));
        if (data.achievements) setAchievements(Object.values(data.achievements));
      }
    }).catch(err => console.log("Erro carregar:", err));
  };

  useEffect(() => { if (uid) loadUserData(); }, [uid]);

  // --- LÓGICA DE XP ---
  const addXP = async (amount: number) => {
    if (!uid) return;
    const newXP = xp + amount;
    setXp(newXP);
    update(ref(database, `users/${uid}`), { xp: newXP });
  };

  const calculateXPMultiplier = (acertos: number, total: number) => {
    const ratio = acertos / total;
    if (ratio >= 1) return 2.0; // 100% acertos = 2x XP
    if (ratio >= 0.8) return 1.5;
    if (ratio >= 0.5) return 1.2;
    return 1.0;
  };

  // --- LÓGICA DE DESAFIOS ---
  const updateChallengeProgress = async (id: string, phase: number) => {
    if (!uid) return;
    setChallenges(prev => prev.map(ch => {
        if (ch.id === id && !ch.completed) {
            const newProg = Math.min(ch.progress + 1, ch.total);
            update(ref(database, `users/${uid}/challenges/${id}`), { progress: newProg });
            return { ...ch, progress: newProg };
        }
        return ch;
    }));
  };

  const completeChallengeIfEligible = async (id: string) => {
    if (!uid) return;
    const challenge = challenges.find(ch => ch.id === id);
    if (challenge && challenge.progress >= challenge.total && !challenge.completed) {
        addXP(challenge.xp);
        update(ref(database, `users/${uid}/challenges/${id}`), { completed: true });
        setChallenges(prev => prev.map(ch => ch.id === id ? { ...ch, completed: true } : ch));
    }
  };

  // --- LÓGICA DE CONQUISTAS ---
  const checkAndUnlockAchievements = async (acertos: number, total: number, fase: number) => {
    if (!uid) return;
    // Exemplo Simples: Se acertar tudo na fase 1
    if (acertos === total) {
        const achId = "perfeccionista";
        update(ref(database, `users/${uid}/achievements/${achId}`), { unlocked: true, unlockedAt: Date.now() });
    }
  };

  const mudarTema = async (temaId: keyof typeof THEMES) => {
    setTemaAtivo(temaId);
    if (uid) update(ref(database, `users/${uid}`), { temaAtual: temaId });
  };

  // --- FUNÇÕES COMPLEMENTARES ---
  const addToCart = (reward: Reward) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.id === reward.id);
      if (exists) return prev.map((i) => (i.id === reward.id ? { ...i, quantity: i.quantity + 1 } : i));
      return [...prev, { ...reward, quantity: 1 }];
    });
  };
  const removeFromCart = (id: string) => setCart(p => p.filter(i => i.id !== id));
  const incrementQty = (id: string) => setCart(p => p.map(i => i.id === id ? { ...i, quantity: i.quantity + 1 } : i));
  const decrementQty = (id: string) => setCart(p => p.map(i => i.id === id ? { ...i, quantity: Math.max(0, i.quantity - 1) } : i).filter(i => i.quantity > 0));
  const clearCart = () => setCart([]);

  const purchaseCart = async () => {
    if (!uid || cart.length === 0) return { success: false, message: "Vazio" };
    const totalCost = cart.reduce((s, it) => s + it.precoXP * it.quantity, 0);
    if (totalCost > xp) return { success: false, message: "XP insuficiente" };
    const newXP = xp - totalCost;
    setXp(newXP);
    update(ref(database, `users/${uid}`), { xp: newXP });
    clearCart();
    return { success: true, message: "Sucesso" };
  };

  return (
    <StoreContext.Provider value={{ 
      xp, setXp, cart, addToCart, removeFromCart, incrementQty, decrementQty, 
      clearCart, purchaseCart, addXP, inventory, reloadXP: loadUserData, 
      temaAtivo, mudarTema, challenges, achievements,
      loadChallenges: loadUserData, loadAchievements: loadUserData,
      updateChallengeProgress, completeChallengeIfEligible, calculateXPMultiplier, checkAndUnlockAchievements
    }}>
      {children}
    </StoreContext.Provider>
  );
};