export const XP_VALUES = {
  phase1: 50,  // Operações Básicas
  phase2: 150, // Equações 1º Grau (Aumentei para recompensar a dificuldade)
  phase3: 300, // Equações 2º Grau
};

// Fórmula de nível estilo RPG: cada nível exige mais XP que o anterior
// Nível 1: 0 XP | Nível 2: 500 XP | Nível 3: 1200 XP...
export const getLevelFromXP = (xp: number) => {
  if (xp < 500) return 1;
  if (xp < 1200) return 2;
  if (xp < 2500) return 3;
  return Math.floor(xp / 1000) + 1;
};

export const EXERCISE_COUNT_PER_PHASE = 10;

export const PHASE_NAMES = {
  1: "Operações Básicas",
  2: "Equações do 1º Grau",
  3: "Equações do 2º Grau",
};