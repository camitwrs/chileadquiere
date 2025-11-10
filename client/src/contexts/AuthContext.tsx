import { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "comprador" | "proveedor" | "administrador";

export interface User {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: UserRole;
  foto?: string;
}

interface AuthContextType {
  user: User | null;
  // Returns true if login successful, false otherwise
  login: (email: string, password: string, role?: UserRole) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users para demostración (coinciden con las cuentas de ejemplo en el login)
const mockUsers: Record<string, User> = {
  "comprador@example.com": {
    id: "1",
    nombre: "Juan",
    apellido: "Pérez",
    email: "comprador@example.com",
    rol: "comprador",
  },
  "proveedor@example.com": {
    id: "2",
    nombre: "María",
    apellido: "González",
    email: "proveedor@example.com",
    rol: "proveedor",
  },
  "admin@example.com": {
    id: "3",
    nombre: "Carlos",
    apellido: "Ramírez",
    email: "admin@example.com",
    rol: "administrador",
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    // Recuperar usuario de localStorage al iniciar
    const savedUser = localStorage.getItem("chileadquiere_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (email: string, _password: string, role?: UserRole) => {
    // Mock login - en producción validaría credenciales contra un backend
    const foundUser = mockUsers[email];
    if (foundUser && (!role || foundUser.rol === role)) {
      setUser(foundUser);
      localStorage.setItem("chileadquiere_user", JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("chileadquiere_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
