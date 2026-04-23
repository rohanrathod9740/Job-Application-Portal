"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { getCurrentUser } from "../utils/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState(null);

    // Initialize from localStorage on mount
    useEffect(() => {
        const initAuth = async () => {
            try {
                const savedToken = typeof window !== "undefined" && localStorage.getItem("token");
                if (savedToken) {
                    setToken(savedToken);
                    
                    // Fetch user details
                    const userData = await getCurrentUser(savedToken);
                    if (userData._id) {
                        setUser(userData);
                        setRole(userData.role);
                    } else {
                        localStorage.removeItem("token");
                        setToken(null);
                    }
                }
            } catch (error) {
                console.error("Auth initialization error:", error);
                localStorage.removeItem("token");
                setToken(null);
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = async (userData, authToken) => {
        setUser(userData);
        setToken(authToken);
        setRole(userData.role);
        localStorage.setItem("token", authToken);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        setRole(null);
        localStorage.removeItem("token");
    };

    const refreshUser = async () => {
        if (token) {
            try {
                const userData = await getCurrentUser(token);
                if (userData._id) {
                    setUser(userData);
                    setRole(userData.role);
                }
            } catch (error) {
                console.error("Error refreshing user:", error);
            }
        }
    };

    const value = {
        user,
        token,
        loading,
        role,
        isAuthenticated: !!token,
        login,
        logout,
        refreshUser
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
}
