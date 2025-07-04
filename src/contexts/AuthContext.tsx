import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  auth,
  getUserData,
  loginUser,
  logoutUser,
  registerUser,
  sendPasswordReset
} from '../services/firebaseService';
import { User, RegisterCredentials, LoginCredentials, AuthState } from '../types';
import { onAuthStateChanged, reload } from 'firebase/auth';

interface AuthContextType extends AuthState {
  register: (credentials: RegisterCredentials) => Promise<User>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  });

  const refreshUser = async () => {
    if (auth.currentUser) {
      try {
        await reload(auth.currentUser);
        const userData = await getUserData(auth.currentUser.uid);
        if (userData) {
          setAuthState(prev => ({
            ...prev,
            user: {
              ...userData,
              isEmailVerified: auth.currentUser?.emailVerified || false
            }
          }));
        }
      } catch (error) {
        console.error('Error refreshing user:', error);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          await reload(firebaseUser);
          const userData = await getUserData(firebaseUser.uid);
          setAuthState({
            user: userData ? {
              ...userData,
              isEmailVerified: firebaseUser.emailVerified
            } : null,
            isLoading: false,
            error: !navigator.onLine ? 'Offline-Modus - eingeschränkte Funktionalität verfügbar' : null,
          });
        } else {
          setAuthState({
            user: null,
            isLoading: false,
            error: null,
          });
        }
      } catch (error: any) {
        console.error('Auth state change error:', error);
        setAuthState({
          user: null,
          isLoading: false,
          error: 'Verbindungsfehler - Bitte überprüfen Sie Ihre Internetverbindung',
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const register = async (credentials: RegisterCredentials): Promise<User> => {
    setAuthState({ ...authState, isLoading: true });
    try {
      const user = await registerUser(credentials);
      setAuthState({
        user,
        isLoading: false,
        error: null,
      });
      return user;
    } catch (error: any) {
      setAuthState({
        user: null,
        isLoading: false,
        error: error.message,
      });
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    setAuthState({ ...authState, isLoading: true });
    try {
      const firebaseUser = await loginUser(email, password);
      await reload(firebaseUser);
      const userData = await getUserData(firebaseUser.uid);
      setAuthState({
        user: userData ? {
          ...userData,
          isEmailVerified: firebaseUser.emailVerified
        } : null,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      setAuthState({
        user: null,
        isLoading: false,
        error: error.message,
      });
      throw error;
    }
  };

  const logout = async () => {
    setAuthState({ ...authState, isLoading: true });
    try {
      await logoutUser();
      setAuthState({
        user: null,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      setAuthState({
        ...authState,
        isLoading: false,
        error: error.message,
      });
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    setAuthState({ ...authState, isLoading: true });
    try {
      await sendPasswordReset(email);
      setAuthState({
        ...authState,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      setAuthState({
        ...authState,
        isLoading: false,
        error: error.message,
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        register,
        login,
        logout,
        resetPassword,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};