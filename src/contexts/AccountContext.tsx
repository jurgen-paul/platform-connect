import React, { createContext, useContext, useState, useEffect } from 'react';

interface AccountContextType {
  accountId: string | null;
  setAccountId: (id: string | null) => void;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export const AccountProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accountId, setAccountIdState] = useState<string | null>(() => {
    return localStorage.getItem('stripe_account_id');
  });

  const setAccountId = (id: string | null) => {
    setAccountIdState(id);
    if (id) {
      localStorage.setItem('stripe_account_id', id);
    } else {
      localStorage.removeItem('stripe_account_id');
    }
  };

  useEffect(() => {
    // Check URL for accountId (e.g. returning from onboarding)
    const params = new URLSearchParams(window.location.search);
    const idFromUrl = params.get('accountId');
    if (idFromUrl) {
      setAccountId(idFromUrl);
      // Clean up URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  return (
    <AccountContext.Provider value={{ accountId, setAccountId }}>
      {children}
    </AccountContext.Provider>
  );
};

export const useAccount = () => {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error('useAccount must be used within an AccountProvider');
  }
  return context;
};
