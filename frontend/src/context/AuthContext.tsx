import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type PerfilUsuario = 'ADMIN' | 'FUNCIONARIO' | 'CIUDADANO';

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  perfil: PerfilUsuario;
}

interface AuthContextType {
  usuario: Usuario | null;
  setUsuario: (usuario: Usuario | null) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isFuncionario: boolean;
  isCiudadano: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Clave para localStorage
const AUTH_STORAGE_KEY = 'tramites_auth_user';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Inicializar desde localStorage si existe
  const [usuario, setUsuarioState] = useState<Usuario | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Error leyendo usuario de localStorage:', e);
    }
    return null;
  });

  // Guardar en localStorage cuando cambie el usuario
  const setUsuario = (user: Usuario | null) => {
    setUsuarioState(user);
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  };

  // Función de logout
  const logout = () => {
    setUsuario(null);
  };

  const isAuthenticated = usuario !== null;
  const isAdmin = usuario?.perfil === 'ADMIN';
  const isFuncionario = usuario?.perfil === 'FUNCIONARIO';
  const isCiudadano = usuario?.perfil === 'CIUDADANO';

  return (
    <AuthContext.Provider
      value={{
        usuario,
        setUsuario,
        logout,
        isAuthenticated,
        isAdmin,
        isFuncionario,
        isCiudadano,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};
