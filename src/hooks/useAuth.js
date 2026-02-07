import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import toast from 'react-hot-toast';

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [permissions, setPermissions] = useState([]);

    const navigate = useNavigate();
    const location = useLocation();

    // Initialize auth
    useEffect(() => {
        const initAuth = async () => {
            setIsLoading(true);

            try {
                if (token) {
                    const userData = await authService.getCurrentUser();
                    await setAuthState(userData, token);
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

    // Set authentication state
    const setAuthState = useCallback(async (userData, authToken) => {
        setUser(userData);
        setIsAuthenticated(true);
        setToken(authToken);

        // Store token
        localStorage.setItem('token', authToken);

        // Fetch user permissions
        try {
            const userPermissions = await userService.getUserPermissions(userData.id);
            setPermissions(userPermissions);
        } catch (error) {
            console.error('Failed to fetch permissions:', error);
        }

        // Set axios default header
        authService.setAuthHeader(authToken);
    }, []);

    // Clear authentication state
    const clearAuth = useCallback(() => {
        setUser(null);
        setIsAuthenticated(false);
        setToken(null);
        setPermissions([]);

        localStorage.removeItem('token');
        sessionStorage.clear();

        authService.clearAuthHeader();
    }, []);

    // Login function
    const login = useCallback(async (email, password, rememberMe = false) => {
        try {
            setIsLoading(true);

            const { user, token } = await authService.login(email, password);

            if (rememberMe) {
                localStorage.setItem('token', token);
            } else {
                sessionStorage.setItem('token', token);
            }

            await setAuthState(user, token);

            toast.success('Login successful!');
            return { success: true, user };
        } catch (error) {
            toast.error(error.message || 'Login failed');
            return { success: false, error: error.message };
        } finally {
            setIsLoading(false);
        }
    }, [setAuthState]);

    // Register function
    const register = useCallback(async (userData) => {
        try {
            setIsLoading(true);

            const { user, token } = await authService.register(userData);

            await setAuthState(user, token);

            toast.success('Registration successful!');
            return { success: true, user };
        } catch (error) {
            toast.error(error.message || 'Registration failed');
            return { success: false, error: error.message };
        } finally {
            setIsLoading(false);
        }
    }, [setAuthState]);

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

    // Check if user has permission
    const hasPermission = useCallback((permission) => {
        if (!permissions || permissions.length === 0) return false;

        // Check for exact permission or wildcard
        return permissions.includes(permission) ||
            permissions.includes('*') ||
            permissions.some(p => permission.startsWith(p.split(':')[0] + ':'));
    }, [permissions]);

    // Check if user has role
    const hasRole = useCallback((role) => {
        return user?.role === role;
    }, [user]);

    // Get user's campus
    const getUserCampus = useCallback(() => {
        return user?.campus_id || null;
    }, [user]);

    // Verify email
    const verifyEmail = useCallback(async (verificationCode) => {
        try {
            setIsLoading(true);

            const result = await authService.verifyEmail(verificationCode);

            if (result.success) {
                setUser(prev => ({ ...prev, is_verified: true }));
                toast.success('Email verified successfully!');
            }

            return result;
        } catch (error) {
            toast.error(error.message || 'Verification failed');
            return { success: false, error: error.message };
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Request password reset
    const requestPasswordReset = useCallback(async (email) => {
        try {
            await authService.requestPasswordReset(email);
            toast.success('Password reset link sent to your email');
            return { success: true };
        } catch (error) {
            toast.error(error.message || 'Failed to send reset link');
            return { success: false, error: error.message };
        }
    }, []);

    // Reset password
    const resetPassword = useCallback(async (token, newPassword) => {
        try {
            await authService.resetPassword(token, newPassword);
            toast.success('Password reset successfully');
            return { success: true };
        } catch (error) {
            toast.error(error.message || 'Failed to reset password');
            return { success: false, error: error.message };
        }
    }, []);

    // Change password
    const changePassword = useCallback(async (currentPassword, newPassword) => {
        try {
            await authService.changePassword(currentPassword, newPassword);
            toast.success('Password changed successfully');
            return { success: true };
        } catch (error) {
            toast.error(error.message || 'Failed to change password');
            return { success: false, error: error.message };
        }
    }, []);

    // Refresh token
    const refreshToken = useCallback(async () => {
        try {
            const { token: newToken } = await authService.refreshToken();
            setToken(newToken);
            localStorage.setItem('token', newToken);
            return newToken;
        } catch (error) {
            clearAuth();
            throw error;
        }
    }, [clearAuth]);

    // Check if user can access route
    const canAccessRoute = useCallback((routeConfig) => {
        if (!routeConfig) return true;

        const { roles = [], permissions: requiredPermissions = [] } = routeConfig;

        // Check roles
        if (roles.length > 0 && !roles.includes(user?.role)) {
            return false;
        }

        // Check permissions
        if (requiredPermissions.length > 0) {
            const hasAllPermissions = requiredPermissions.every(perm => hasPermission(perm));
            if (!hasAllPermissions) return false;
        }

        return true;
    }, [user, hasPermission]);

    // Get auth headers for API calls
    const getAuthHeaders = useCallback(() => {
        return {
            Authorization: `Bearer ${token}`,
        };
    }, [token]);

    // Auto-logout on inactivity
    useEffect(() => {
        if (!isAuthenticated) return;

        let timeout;
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

        const resetTimer = () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                toast.error('Session expired due to inactivity');
                logout();
            }, 30 * 60 * 1000); // 30 minutes
        };

        events.forEach(event => {
            window.addEventListener(event, resetTimer);
        });

        resetTimer();

        return () => {
            clearTimeout(timeout);
            events.forEach(event => {
                window.removeEventListener(event, resetTimer);
            });
        };
    }, [isAuthenticated, logout, location.pathname]);

    return {
        // State
        user,
        isLoading,
        isAuthenticated,
        token,
        permissions,

        // Actions
        login,
        register,
        logout,
        updateProfile,
        verifyEmail,
        requestPasswordReset,
        resetPassword,
        changePassword,
        refreshToken,

        // Permissions
        hasPermission,
        hasRole,
        canAccessRoute,

        // Utilities
        getUserCampus,
        getAuthHeaders,
        clearAuth,
    };
};

// Higher Order Component for protected routes
export const withAuth = (WrappedComponent, options = {}) => {
    return function WithAuthComponent(props) {
        const auth = useAuth();
        const navigate = useNavigate();
        const location = useLocation();

        useEffect(() => {
            if (!auth.isLoading) {
                // Check authentication
                if (options.requireAuth && !auth.isAuthenticated) {
                    navigate('/login', { state: { from: location.pathname } });
                    return;
                }

                // Check roles
                if (options.roles && !options.roles.includes(auth.user?.role)) {
                    navigate('/unauthorized');
                    return;
                }

                // Check permissions
                if (options.permissions) {
                    const hasAllPermissions = options.permissions.every(perm =>
                        auth.hasPermission(perm)
                    );
                    if (!hasAllPermissions) {
                        navigate('/unauthorized');
                        return;
                    }
                }
            }
        }, [auth, navigate, location, options]);

        if (auth.isLoading) {
            return <div>Loading...</div>;
        }

        return <WrappedComponent {...props} auth={auth} />;
    };
};

// Hook for checking auth status in real-time
export const useAuthStatus = () => {
    const [status, setStatus] = useState({
        isAuthenticated: false,
        isVerified: false,
        isVendor: false,
        isStudent: false,
        isAdmin: false,
    });

    const auth = useAuth();

    useEffect(() => {
        if (auth.user) {
            setStatus({
                isAuthenticated: auth.isAuthenticated,
                isVerified: auth.user.is_verified,
                isVendor: auth.user.role === 'vendor',
                isStudent: auth.user.role === 'student',
                isAdmin: auth.user.role === 'admin',
            });
        } else {
            setStatus({
                isAuthenticated: false,
                isVerified: false,
                isVendor: false,
                isStudent: false,
                isAdmin: false,
            });
        }
    }, [auth.user, auth.isAuthenticated]);

    return status;
};