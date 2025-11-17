const TOKEN_KEY = 'rfid_token';
const USER_KEY = 'rfid_user';

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const setUser = (user: { username: string; nome_completo?: string }): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getUser = (): { username: string; nome_completo?: string } | null => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};