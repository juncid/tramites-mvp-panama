import { createContext, useContext, useState, ReactNode } from 'react';

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
  isAdmin: boolean;
  isFuncionario: boolean;
  isCiudadano: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // TODO: En producción, obtener el usuario del token/sesión
  // Por ahora, establecemos un usuario por defecto para desarrollo
  const [usuario, setUsuario] = useState<Usuario | null>({
    id: 1,
    nombre: 'Juan Pérez',
    email: 'juan.perez@migracion.gob.pa',
    perfil: 'ADMIN', // Cambiar a 'FUNCIONARIO' o 'CIUDADANO' para testing
  });

  const isAdmin = usuario?.perfil === 'ADMIN';
  const isFuncionario = usuario?.perfil === 'FUNCIONARIO';
  const isCiudadano = usuario?.perfil === 'CIUDADANO';

  return (
    <AuthContext.Provider
      value={{
        usuario,
        setUsuario,
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
