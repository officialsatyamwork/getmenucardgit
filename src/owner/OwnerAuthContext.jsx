import { createContext, useContext, useEffect, useState } from 'react';
import {
  clearOwnerSession,
  getOwnerToken,
  getStoredOwner,
  ownerApi,
  setOwnerSession,
} from './ownerApi';

const OwnerAuthContext = createContext(null);

export function OwnerAuthProvider({ children }) {
  const [owner, setOwner] = useState(() => getStoredOwner());
  const [loading, setLoading] = useState(Boolean(getOwnerToken()));

  useEffect(() => {
    let cancelled = false;
    const token = getOwnerToken();
    if (!token) {
      setLoading(false);
      return undefined;
    }
    (async () => {
      try {
        const data = await ownerApi.me();
        if (!cancelled) setOwner(data.owner);
      } catch {
        clearOwnerSession();
        if (!cancelled) setOwner(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const login = async (email, password) => {
    const data = await ownerApi.login({ email, password });
    setOwnerSession(data.token, data.owner);
    setOwner(data.owner);
    return data.owner;
  };

  const signup = async (payload) => {
    const data = await ownerApi.signup(payload);
    const ownerWithName = {
      ...data.owner,
      restaurantName: data.owner.restaurantName || payload.restaurantName || null,
    };
    setOwnerSession(data.token, ownerWithName);
    setOwner(ownerWithName);
    return ownerWithName;
  };

  const logout = () => {
    clearOwnerSession();
    setOwner(null);
  };

  return (
    <OwnerAuthContext.Provider
      value={{
        owner,
        loading,
        isAuthenticated: Boolean(owner),
        login,
        signup,
        logout,
      }}
    >
      {children}
    </OwnerAuthContext.Provider>
  );
}

export function useOwnerAuth() {
  const ctx = useContext(OwnerAuthContext);
  if (!ctx) throw new Error('useOwnerAuth must be used within OwnerAuthProvider');
  return ctx;
}
