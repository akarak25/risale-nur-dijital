// Auth helper functions

export const AUTH_TOKEN_KEY = 'risale_nur_token';
export const USER_KEY = 'risale_nur_user';

// Token işlemleri
export const getToken = () => {
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

export const setToken = (token) => {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
};

export const removeToken = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
};

// User işlemleri
export const getUser = () => {
  const userStr = localStorage.getItem(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

export const setUser = (user) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const removeUser = () => {
  localStorage.removeItem(USER_KEY);
};

// Auth durumunu kontrol et
export const isAuthenticated = () => {
  return !!getToken();
};

// Tüm auth verilerini temizle
export const clearAuthData = () => {
  removeToken();
  removeUser();
  localStorage.removeItem('userSettings');
};