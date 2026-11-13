import { useMemo, useState } from 'react';
import { AuthContext } from './auth-context.js';
import { getAuth, login as iniciarSesion, logout as cerrarSesion } from '../services/auth.js';

export default function AuthProvider({ children }) {
  const [session, setSession] = useState(getAuth);

  const value = useMemo(() => {
    async function login(correo, contrasena) {
      const user = await iniciarSesion(correo, contrasena);
      setSession(getAuth());
      return user;
    }

    function logout() {
      cerrarSesion();
      setSession(null);
    }

    return {
      user: session?.user ?? null,
      token: session?.token ?? null,
      isLoggedIn: Boolean(session?.token),
      login,
      logout,
    };
  }, [session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
