import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type AuthUser = {
  email: string
  role: string
  token: string
}

type AuthStore = {
  user: AuthUser | null
  login: (user: AuthUser) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      login: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    { name: 'auth' }
  )
)
