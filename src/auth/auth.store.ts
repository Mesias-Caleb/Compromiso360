/**
 * auth.store.ts
 *
 * Demo-mode administrative authentication.
 *
 * IMPORTANT — SECURITY NOTICE:
 * This is a LOCAL DEMONSTRATION ONLY. No real passwords are stored, validated,
 * or exposed here. The "credential check" exists solely to prevent accidental
 * navigation to admin routes during the public event, NOT as real security.
 * Before any production deployment, replace this with a proper backend auth flow.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type AdminRole = 'admin';

export interface AdminSession {
  username: string;
  role: AdminRole;
  loginAt: string; // ISO timestamp
}

interface AuthState {
  session: AdminSession | null;
  isAuthenticated: boolean;
  /** Attempt demo login. Returns true on success. */
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

// Demo credential — intentionally NOT a real secret.
// This value is visible in client-side source. It is for demo gatekeeping only.
const DEMO_USERNAME = 'admin';
const DEMO_PASSWORD = 'pei2027';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      isAuthenticated: false,

      login: (username: string, password: string): boolean => {
        const usernameMatch = username.trim().toLowerCase() === DEMO_USERNAME;
        const passwordMatch = password === DEMO_PASSWORD;

        if (usernameMatch && passwordMatch) {
          const session: AdminSession = {
            username: username.trim(),
            role: 'admin',
            loginAt: new Date().toISOString(),
          };
          set({ session, isAuthenticated: true });
          return true;
        }
        return false;
      },

      logout: () => {
        set({ session: null, isAuthenticated: false });
      },
    }),
    {
      name: 'pei-admin-session',
      storage: createJSONStorage(() => sessionStorage), // expires with browser tab
    },
  ),
);
