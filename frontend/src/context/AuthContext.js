// src/context/AuthContext.js
import React, { createContext, useContext, useState, useMemo } from "react";

const AuthContext = createContext();

function safeParse(raw) {
  try {
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn("tc_auth parse failed", e);
    return null;
  }
}

export function AuthProvider({ children }) {
  // lazy init so localStorage is read synchronously during first render
  const initial = useMemo(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem("tc_auth") : null;
    const parsed = safeParse(raw) || {};
    return {
      user: parsed.user || null,
      token: parsed.token || null,
    };
  }, []);

  const [user, setUser] = useState(initial.user);
  const [token, setToken] = useState(initial.token);

  const login = (userObj, jwt) => {
    setUser(userObj);
    setToken(jwt);
    try {
      localStorage.setItem("tc_auth", JSON.stringify({ user: userObj, token: jwt }));
    } catch (e) {
      console.warn("Failed to save auth", e);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem("tc_auth");
    } catch (e) {
      console.warn("Failed to remove auth", e);
    }
  };

  const setUserOnly = (newUser) => {
    setUser(newUser);
    try {
      const raw = localStorage.getItem("tc_auth");
      const parsed = safeParse(raw) || {};
      const newPayload = { ...parsed, user: newUser };
      localStorage.setItem("tc_auth", JSON.stringify(newPayload));
    } catch (e) {
      console.warn("Failed to set user only", e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, setUserOnly }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
