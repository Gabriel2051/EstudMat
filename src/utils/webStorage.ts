const isWeb = typeof window !== "undefined"

export const WebStorage = {
  async getItem(key: string): Promise<string | null> {
    if (isWeb) {
      return localStorage.getItem(key)
    }
    // Fallback para ambiente sem localStorage
    return null
  },

  async setItem(key: string, value: string): Promise<void> {
    if (isWeb) {
      localStorage.setItem(key, value)
    }
  },

  async removeItem(key: string): Promise<void> {
    if (isWeb) {
      localStorage.removeItem(key)
    }
  },

  async clear(): Promise<void> {
    if (isWeb) {
      localStorage.clear()
    }
  },
}
