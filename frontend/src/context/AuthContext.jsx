import React, { createContext, useContext, useEffect, useState } from "react";

import api from "../utils/api";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // On mount: ask backend who is logged in
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const token = sessionStorage.getItem("accessToken");
        if (!token) {
          if (mounted) setLoadingUser(false);
          return;
        }

        // Send token in Authorization header
        const { data } = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (mounted && data?.success && data.user) {
          setUser({ ...data.user, _id: data.user._id || data.user.id });
        }
      } catch (err) {
        console.error("/me error", err);
        // If token invalid/expired -> clear token and redirect to login
        if (err.response?.status === 401) {
          sessionStorage.removeItem("accessToken");
          delete api.defaults.headers.common["Authorization"];
          window.location.href = "/login";
        }
      } finally {
        if (mounted) setLoadingUser(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Called on login
  const login = (userData, accessToken) => {
    return new Promise((resolve) => {
      if (accessToken) {
        sessionStorage.setItem('accessToken', accessToken);
        api.defaults.headers.common["Authorization"] = "Bearer " + accessToken;
      }
      setUser({ ...userData, _id: userData._id || userData.id });
      setLoadingUser(false);
      setTimeout(() => {
        resolve();
      }, 0);
    });
  };

  // Called on logout
  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      console.error("[AuthContext] logout error", e);
    } finally {
      // ALWAYS clear state
      sessionStorage.removeItem('accessToken');
      delete api.defaults.headers.common["Authorization"];
      setUser(null);
      setLoadingUser(false);
      window.location.href = "/login";
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loadingUser,
        isAuthenticated: !!user && !loadingUser,
        token: null, // Token getter removed
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
