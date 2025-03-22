import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/getClientUserInfo');
      const data = await response.json();
      setIsAuthenticated(data.isAuthenticated);
      setUser(data.user);
    } catch (error) {
      console.error('서버 오류가 발생해 인증 확인 불가');
    }
  };

  const login = async (userHandle, password) => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userHandle, password }),
      });
      
      const data = await response.json();
      if (response.ok) {
        setIsAuthenticated(true);
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, message: '로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, checkAuthStatus}}>
      {children}
    </AuthContext.Provider>
  );
};