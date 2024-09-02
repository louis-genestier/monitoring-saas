import { create } from "zustand";
import { persist } from "zustand/middleware";

type AuthStore = {
  user: null | {
    id: string;
    email: string;
  };
  setUser: (user: null | { id: string; email: string }) => void;
  logout: () => void;
};

export const useAuthStore = create(
  persist<AuthStore>(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    {
      name: "user",
    }
  )
);
