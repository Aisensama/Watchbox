import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type {
  SafeUser,
  RegisterInput,
  LoginInput,
  UserProfileUpdate,
} from "@watchbox/shared";
import { apiClient } from "../api/client";
import { useToast } from "./ToastContext";

export interface AuthContextType {
  user: SafeUser | null;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<SafeUser>;
  register: (input: RegisterInput) => Promise<SafeUser>;
  logout: () => Promise<void>;
  updateProfile: (input: UserProfileUpdate) => Promise<SafeUser>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { showToast } = useToast();

  const refreshUser = useCallback(async () => {
    try {
      const data = await apiClient<{ user: SafeUser | null }>("/auth/me");
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    apiClient<{ user: SafeUser | null }>("/auth/me")
      .then((data) => {
        if (active) setUser(data.user);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const login = async (input: LoginInput): Promise<SafeUser> => {
    const data = await apiClient<{ user: SafeUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    });
    setUser(data.user);
    showToast(`Welcome back, ${data.user.displayName}!`, "success");
    return data.user;
  };

  const register = async (input: RegisterInput): Promise<SafeUser> => {
    const data = await apiClient<{ user: SafeUser }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    });
    setUser(data.user);
    showToast(`Welcome to WatchBox, ${data.user.displayName}!`, "success");
    return data.user;
  };

  const logout = async (): Promise<void> => {
    try {
      await apiClient("/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
      showToast("Logged out successfully", "info");
    }
  };

  const updateProfile = async (input: UserProfileUpdate): Promise<SafeUser> => {
    const data = await apiClient<{ user: SafeUser }>("/users/profile", {
      method: "PATCH",
      body: JSON.stringify(input),
    });
    setUser(data.user);
    showToast("Profile updated successfully", "success");
    return data.user;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
