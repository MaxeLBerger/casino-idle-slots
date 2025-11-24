import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserInfo, getCurrentUser, onAuthStateChange, signInWithGitHub, signOut } from '../lib/auth';

interface AuthContextType {
  user: UserInfo | null;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial check
    getCurrentUser().then(u => {
      setUser(u);
      setIsLoading(false);
    });

    // Subscribe to changes
    const unsubscribe = onAuthStateChange((u) => {
      if (u) {
        // Map Supabase User to UserInfo
        const userInfo: UserInfo = {
          id: u.id,
          login: u.user_metadata?.user_name || u.email?.split('@')[0] || 'Anonymous',
          avatarUrl: u.user_metadata?.avatar_url || '',
          email: u.email || ''
        };
        setUser(userInfo);
      } else {
        setUser(null);
      }
    });

    return () => {
      // Unsubscribe if possible (onAuthStateChange returns void in current impl, might need fix)
    };
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      signIn: signInWithGitHub, 
      signOut: signOut 
    }}>
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
