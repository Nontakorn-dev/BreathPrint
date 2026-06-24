import { create } from 'zustand'
import type { UserProfile } from '@/types'

interface AuthState {
  userId: string | null
  profile: UserProfile | null
  isOnboarded: boolean
  setUserId: (id: string) => void
  setProfile: (profile: UserProfile) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  profile: null,
  isOnboarded: false,
  setUserId: (id) => set({ userId: id }),
  setProfile: (profile) => set({ profile, isOnboarded: true }),
  clearAuth: () => set({ userId: null, profile: null, isOnboarded: false }),
}))
