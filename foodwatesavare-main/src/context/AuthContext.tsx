import React, { createContext, useContext, useState, useEffect } from "react";

export type UserRole = "admin" | "user";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: AppUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  adminLogin: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "wasteless_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEY);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Mock login - accept any email/password
    const mockUser: AppUser = {
      id: "mock-" + Date.now(),
      name: email.split("@")[0],
      email,
      role: "user",
    };
    setUser(mockUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
    return { success: true };
  };

  const register = async (email: string, password: string, name: string) => {
    // Mock register
    const mockUser: AppUser = {
      id: "mock-" + Date.now(),
      name,
      email,
      role: "user",
    };
    setUser(mockUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
    return { success: true };
  };

  const adminLogin = async (username: string, password: string) => {
    if (username === "admin" && password === "admin") {
      const adminUser: AppUser = {
        id: "admin-mock",
        name: "Admin",
        email: "admin@wasteless.ai",
        role: "admin",
      };
      setUser(adminUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(adminUser));
      return { success: true };
    }
    return { success: false, error: "Invalid credentials" };
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value = {
    isLoggedIn: !!user,
    user,
    loading,
    login,
    register,
    adminLogin,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
