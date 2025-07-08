import { useState, useEffect } from 'react';

interface User {
  id: number;
  username: string;
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatarUrl?: string;
  role?: string;
  subscriptionTier?: string;
  activitiesCreated?: number;
  postsCreated?: number;
  likesReceived?: number;
  location?: string;
  createdAt?: string;
}

let globalCurrentUser: User | null = null;
const subscribers = new Set<() => void>();

const getCurrentUser = (): User | null => {
  try {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

const notifySubscribers = () => {
  subscribers.forEach(callback => callback());
};

// Initialize global state
globalCurrentUser = getCurrentUser();

// Listen for storage changes globally
if (typeof window !== 'undefined') {
  window.addEventListener('storage', () => {
    const newUser = getCurrentUser();
    if (JSON.stringify(globalCurrentUser) !== JSON.stringify(newUser)) {
      globalCurrentUser = newUser;
      notifySubscribers();
    }
  });

  window.addEventListener('userChanged', () => {
    const newUser = getCurrentUser();
    if (JSON.stringify(globalCurrentUser) !== JSON.stringify(newUser)) {
      globalCurrentUser = newUser;
      notifySubscribers();
    }
  });
}

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<User | null>(globalCurrentUser);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const updateUser = () => {
      setCurrentUser(globalCurrentUser);
    };

    subscribers.add(updateUser);
    
    // Sync with current global state
    updateUser();

    return () => {
      subscribers.delete(updateUser);
    };
  }, []);

  const login = (user: User) => {
    localStorage.setItem('currentUser', JSON.stringify(user));
    globalCurrentUser = user;
    window.dispatchEvent(new CustomEvent('userChanged'));
    notifySubscribers();
  };

  const updateUser = (updatedUser: Partial<User>) => {
    if (globalCurrentUser) {
      const newUser = { ...globalCurrentUser, ...updatedUser };
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      globalCurrentUser = newUser;
      window.dispatchEvent(new CustomEvent('userChanged'));
      notifySubscribers();
    }
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    globalCurrentUser = null;
    window.dispatchEvent(new CustomEvent('userChanged'));
    notifySubscribers();
  };

  return {
    currentUser,
    isAuthenticated: !!currentUser,
    isLoading,
    login,
    logout,
    updateUser
  };
}