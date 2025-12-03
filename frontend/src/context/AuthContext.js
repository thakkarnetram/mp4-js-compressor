import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    useEffect(() => {
        const raw = localStorage.getItem("tc_auth");
        if (raw) {
            try {
                const parsed = JSON.parse(raw);
                setUser(parsed.user);
                setToken(parsed.token);
            } catch (e) {
                console.warn("Failed to parse auth", e);
            }
        }
    }, []);

    const login = (userObj, jwt) => {
        setUser(userObj);
        setToken(jwt);
        localStorage.setItem("tc_auth", JSON.stringify({ user: userObj, token: jwt }));
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("tc_auth");
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
