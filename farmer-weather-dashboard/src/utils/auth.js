// Authentication utilities
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

export const auth = {
    setToken: (token) => {
        localStorage.setItem(TOKEN_KEY, token);
    },
    
    getToken: () => {
        return localStorage.getItem(TOKEN_KEY);
    },
    
    setUser: (user) => {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    },
    
    getUser: () => {
        const userStr = localStorage.getItem(USER_KEY);
        return userStr ? JSON.parse(userStr) : null;
    },
    
    clear: () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    },
    
    isAuthenticated: () => {
        return !!localStorage.getItem(TOKEN_KEY);
    }
};

