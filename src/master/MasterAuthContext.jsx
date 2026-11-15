import { createContext, useContext, useEffect, useState } from 'react';
import {
  masterApi,
  getMasterToken,
  getStoredOwner,
  setMasterSession,
  clearMasterSession,
} from './masterApi';

const MasterAuthContext = createContext(null);

export function MasterAuthProvider({ children }) {
  const [owner, setOwner] = useState(() => getStoredOwner());
  const [token, setToken] = useState(() => getMasterToken());
  const [loading, setLoading] = useState(Boolean(getMasterToken()));
  const [configured, setConfigured] = useState(true);
  const [statusLoaded, setStatusLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const status = await masterApi.status();
        if (!cancelled) setConfigured(Boolean(status.configured ?? status.hasMasterOwner));
      } catch {
        if (!cancelled) setConfigured(false);
      } finally {
        if (!cancelled) setStatusLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await masterApi.me();
        if (!cancelled) {
          setOwner(data.owner);
          setMasterSession(token, data.owner);
        }
      } catch {
        if (!cancelled) {
          clearMasterSession();
          setToken(null);
          setOwner(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  const login = async (email, password) => {
    const data = await masterApi.login({ email, password });
    setMasterSession(data.token, data.owner);
    setToken(data.token);
    setOwner(data.owner);
    return data.owner;
  };

  const logout = () => {
    clearMasterSession();
    setToken(null);
    setOwner(null);
  };

  return (
    <MasterAuthContext.Provider
      value={{
        owner,
        token,
        loading,
        configured,
        statusLoaded,
        isAuthenticated: Boolean(token && owner),
        login,
        logout,
      }}
    >
      {children}
    </MasterAuthContext.Provider>
  );
}

export function useMasterAuth() {
  const ctx = useContext(MasterAuthContext);
  if (!ctx) throw new Error('useMasterAuth must be used within MasterAuthProvider');
  return ctx;
}
