import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import api from "../services/api";
import type { IUser } from "../types";

// ─── Types ─────────────────────────────────────────────────────
interface AuthContextType {
  user: IUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: IUser) => void;
}

// ─── Context ───────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | null>(null);

// ─── Provider ──────────────────────────────────────────────────
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // ── Fetch current user profile ─────────────────────────────
  const fetchUser = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data.data);
    } catch {
      // Token invalid or expired — clear everything
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── On mount — check if token exists and fetch user ────────
  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setIsLoading(false);
    }
  }, [token, fetchUser]);

  // ── Called after Google OAuth redirect ─────────────────────
  // Stores token and fetches user profile
  const login = async (newToken: string): Promise<void> => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    await fetchUser();
  };

  // ── Clear all auth state ────────────────────────────────────
  const logout = (): void => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  // ── Update user locally after profile edit ──────────────────
  const updateUser = (updatedUser: IUser): void => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ─── Hook ──────────────────────────────────────────────────────
// Use this hook in any component to access auth state
// e.g. const { user, isAuthenticated, logout } = useAuth();
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
