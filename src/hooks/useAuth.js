import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import toast from 'react-hot-toast';

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));

    const navigate = useNavigate();
    const location = useLocation();

    // Initialize auth
    useEffect(() => {
        const initAuth = async () => {
            setIsLoading(true);
            try {
                if (token) {
                    const userData = await authService.getCurrentUser();
                    setUser(userData);
                    authService.setAuthHeader(token);
                }
            } catch (error) {
                console.error('Auth initialization failed:', error);
                clearAuth();
            } finally {
                setIsLoading(false);
            }
        };
        initAuth();
    }, [token]);

    // Clear authentication state
    const clearAuth = useCallback(() => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        sessionStorage.clear();
        authService.clearAuthHeader();
    }, []);

    // Login function
    const login = useCallback(async (credentials) => {
        try {
            setIsLoading(true);
            const { user, token } = await authService.login(credentials);
            const { rememberMe } = credentials;

            if (rememberMe) {
                localStorage.setItem('token', token);
            } else {
                sessionStorage.setItem('token', token);
            }

            setUser(user);
            setToken(token);
            authService.setAuthHeader(token);

            toast.success('Login successful!');
            return { success: true, user };
        } catch (error) {
            toast.error(error.message || 'Login failed');
            return { success: false, error: error.message };
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Register function
    const register = useCallback(async (userData) => {
        try {
            setIsLoading(true);
            const { user, token } = await authService.register(userData);

            localStorage.setItem('token', token);
            setUser(user);
            setToken(token);
            authService.setAuthHeader(token);

            toast.success('Registration successful!');
            return { success: true, user };
        } catch (error) {
            toast.error(error.message || 'Registration failed');
            return { success: false, error: error.message };
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Logout function
    const logout = useCallback(async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            clearAuth();
            toast.success('Logged out successfully');
            navigate('/login');
        }
    }, [clearAuth, navigate]);

    // Update user profile
    const updateProfile = useCallback(async (profileData) => {
        try {
            setIsLoading(true);
            const updatedUser = await userService.updateProfile(profileData);
            setUser(prev => ({ ...prev, ...updatedUser }));
            toast.success('Profile updated successfully');
            return { success: true, user: updatedUser };
        } catch (error) {
            toast.error(error.message || 'Failed to update profile');
            return { success: false, error: error.message };
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Check if user has role
    const hasRole = useCallback((role) => {
        return user?.role === role;
    }, [user]);

    return {
        // State
        user,
        isLoading,
        isAuthenticated: !!user,
        token,

        // Actions
        login,
        register,
        logout,
        updateProfile,

        // Utilities
        hasRole,
        clearAuth,
    };
};