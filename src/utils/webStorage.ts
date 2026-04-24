import AsyncStorage from "@react-native-async-storage/async-storage"

const isWeb = typeof window !== "undefined"

export const WebStorage = {
  async getItem(key: string): Promise<string | null> {
    if (isWeb) {
      return localStorage.getItem(key)
    }
    try {
      return await AsyncStorage.getItem(key)
    } catch (error) {
      console.error("Erro ao obter item do AsyncStorage:", error)
      return null
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    if (isWeb) {
      localStorage.setItem(key, value)
    } else {
      try {
        await AsyncStorage.setItem(key, value)
      } catch (error) {
        console.error("Erro ao salvar item no AsyncStorage:", error)
      }
    }
  },

  async removeItem(key: string): Promise<void> {
    if (isWeb) {
      localStorage.removeItem(key)
    } else {
      try {
        await AsyncStorage.removeItem(key)
      } catch (error) {
        console.error("Erro ao remover item do AsyncStorage:", error)
      }
    }
  },

  async clear(): Promise<void> {
    if (isWeb) {
      localStorage.clear()
    } else {
      try {
        await AsyncStorage.clear()
      } catch (error) {
        console.error("Erro ao limpar AsyncStorage:", error)
      }
    }
  },
}
