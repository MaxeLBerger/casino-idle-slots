import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { UserInfo, getCurrentUser, onAuthStateChange, signInWithGitHub, signOut as doSignOut } from '../lib/auth';

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
    onAuthStateChange((u) => {
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

  const handleSignIn = useCallback(async (): Promise<void> => {
    await signInWithGitHub();
  }, []);

  const handleSignOut = useCallback(async (): Promise<void> => {
    await doSignOut();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      signIn: handleSignIn, 
      signOut: handleSignOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
