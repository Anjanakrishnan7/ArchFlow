// Auth utility functions
// 
// ⚠️ DEPRECATION NOTICE:
// These functions are deprecated and should not be used in new code.
// Use `useAuth()` from `context/AuthContext` instead for proper state management.
// 
// These functions rely on localStorage which can cause race conditions
// and stale data issues. AuthContext provides a single source of truth.

/**
 * @deprecated Use `useAuth()` hook from AuthContext instead
 */
export const setAuth = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

/**
 * @deprecated Use `useAuth()` hook from AuthContext instead
 */
export const getAuth = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return {
    token,
    user: user ? JSON.parse(user) : null,
  };
};

/**
 * @deprecated Use `logout()` from AuthContext instead
 */
export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

/**
 * @deprecated Use `isAuthenticated` from useAuth() hook instead
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

/**
 * @deprecated Use `user.role` from useAuth() hook instead
 */
export const getRole = () => {
  const { user } = getAuth();
  return user?.role || null;
};
