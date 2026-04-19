export const storage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(key)
  },
  
  setItem: (key: string, value: string): void => {
    if (typeof window === 'undefined') return
    localStorage.setItem(key, value)
  },
  
  removeItem: (key: string): void => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(key)
  },
  
  getJSON: <T>(key: string): T | null => {
    const item = storage.getItem(key)
    if (!item) return null
    try {
      return JSON.parse(item)
    } catch {
      return null
    }
  },
  
  setJSON: (key: string, value: unknown): void => {
    storage.setItem(key, JSON.stringify(value))
  }
}
