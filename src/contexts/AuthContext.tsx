import { createContext, useContext, useState, ReactNode } from "react";

export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: "freelancer" | "contratante";
  avatar: string;
}

const MOCK_USERS: { email: string; password: string; user: MockUser }[] = [
  {
    email: "freelancer@teste.com",
    password: "123456",
    user: {
      id: "1",
      name: "Lucas Oliveira",
      email: "freelancer@teste.com",
      role: "freelancer",
      avatar: "LO",
    },
  },
  {
    email: "empresa@teste.com",
    password: "123456",
    user: {
      id: "2",
      name: "Maria Santos",
      email: "empresa@teste.com",
      role: "contratante",
      avatar: "MS",
    },
  },
];

interface AuthContextType {
  user: MockUser | null;
  login: (email: string, password: string) => { success: boolean; error?: string; user?: MockUser };
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<MockUser | null>(() => {
    const stored = localStorage.getItem("freela_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = (email: string, password: string) => {
    const found = MOCK_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (found) {
      setUser(found.user);
      localStorage.setItem("freela_user", JSON.stringify(found.user));
      return { success: true, user: found.user };
    }
    return { success: false, error: "Email ou senha incorretos" };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("freela_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export { MOCK_USERS };
