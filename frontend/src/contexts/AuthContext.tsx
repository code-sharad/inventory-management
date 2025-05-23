import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '@/api';
import { toast } from 'sonner';
import { isTokenExpired, isTokenExpiringSoon, getTimeUntilExpiry } from '@/lib/jwt-utils';
import {
    User,
    AuthResponse,
    LoginCredentials,
    RegisterData,
    PasswordResetRequest,
    PasswordReset,
    ChangePassword,
    UpdateProfile,
    LoginHistory,
    Session,
    AuthContextType,
} from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [accessToken, setAccessToken] = useState<string | null>(null);

    // Initialize from localStorage
    useEffect(() => {
        const initializeAuth = () => {
            try {
                const storedToken = localStorage.getItem('accessToken');
                const storedUser = localStorage.getItem('user');

                if (storedToken && storedUser) {
                    // Check if stored token is expired
                    if (isTokenExpired(storedToken)) {
                        console.warn('Stored token is expired, clearing auth state');
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('user');
                        toast.error('Your session has expired. Please log in again.');
                    } else {
                        setAccessToken(storedToken);
                        setUser(JSON.parse(storedUser));
                    }
                }
            } catch (error) {
                console.error('Error initializing auth:', error);
                // Clear corrupted data
                localStorage.removeItem('accessToken');
                localStorage.removeItem('user');
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();
    }, []);

    // Add event listeners for auth events from axios interceptor
    useEffect(() => {
        const handleLogout = () => {
            clearAuthState();
            toast.error('Your session has expired. Please log in again.');
        };

        const handleForbidden = (event: CustomEvent) => {
            toast.error(event.detail?.message || 'Access denied');
        };

        // Listen for auth events dispatched from axios interceptor
        window.addEventListener('auth:logout', handleLogout as EventListener);
        window.addEventListener('auth:forbidden', handleForbidden as EventListener);

        return () => {
            window.removeEventListener('auth:logout', handleLogout as EventListener);
            window.removeEventListener('auth:forbidden', handleForbidden as EventListener);
        };
    }, []);

    // Authentication methods
    const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
        try {
            const response = await authAPI.login(credentials);
            const data = response.data as AuthResponse;

            if (data.status === 'success' && data.accessToken && data.data?.user) {
                setAuthState(data.data.user, data.accessToken);
                toast.success('Login successful');
            }

            return data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Login failed';
            toast.error(errorMessage);
            throw error;
        }
    };

    const register = async (data: RegisterData): Promise<AuthResponse> => {
        try {
            const response = await authAPI.register(data);
            const result = response.data as AuthResponse;

            if (result.status === 'success') {
                toast.success('Registration successful');
            }

            return result;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Registration failed';
            toast.error(errorMessage);
            throw error;
        }
    };

    const logout = async (): Promise<void> => {
        try {
            await authAPI.logout();
            clearAuthState();
            toast.success('Logged out successfully');
        } catch (error: any) {
            // Even if the API call fails, clear local state
            clearAuthState();
            console.error('Logout error:', error);
        }
    };

    const logoutAll = async (): Promise<void> => {
        try {
            await authAPI.logoutAll();
            clearAuthState();
            toast.success('Logged out from all devices');
        } catch (error: any) {
            clearAuthState();
            const errorMessage = error.response?.data?.message || 'Failed to logout from all devices';
            toast.error(errorMessage);
            throw error;
        }
    };

    // Password methods
    const forgotPassword = async (data: PasswordResetRequest): Promise<AuthResponse> => {
        try {
            const response = await authAPI.forgotPassword(data.email);
            const result = response.data as AuthResponse;

            if (result.status === 'success') {
                toast.success('Password reset email sent');
            }

            return result;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to send password reset email';
            toast.error(errorMessage);
            throw error;
        }
    };

    const resetPassword = async (token: string, data: PasswordReset): Promise<AuthResponse> => {
        try {
            const response = await authAPI.resetPassword(token, data.password);
            const result = response.data as AuthResponse;

            if (result.status === 'success') {
                // Clear authentication state since all refresh tokens are cleared on password reset
                clearAuthState();
                toast.success('Password reset successful');
            }

            return result;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to reset password';
            toast.error(errorMessage);
            throw error;
        }
    };

    const changePassword = async (data: ChangePassword): Promise<AuthResponse> => {
        try {
            const response = await authAPI.changePassword(data);
            const result = response.data as AuthResponse;

            if (result.status === 'success') {
                // Clear authentication state since all refresh tokens are cleared on password change
                clearAuthState();
                toast.success('Password changed successfully - Please log in again');
            }

            return result;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to change password';
            toast.error(errorMessage);
            throw error;
        }
    };

    // Profile methods
    const updateProfile = async (data: UpdateProfile): Promise<AuthResponse> => {
        try {
            const response = await authAPI.updateProfile(data);
            const result = response.data as AuthResponse;

            if (result.status === 'success' && result.data?.user) {
                // Update local user state
                const updatedUser = { ...user, ...result.data.user };
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
                toast.success('Profile updated successfully');
            }

            return result;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to update profile';
            toast.error(errorMessage);
            throw error;
        }
    };

    const refreshToken = async (): Promise<boolean> => {
        try {
            const response = await authAPI.refreshToken();
            const data = response.data;

            if (data.status === 'success' && data.accessToken) {
                setAccessToken(data.accessToken);
                localStorage.setItem('accessToken', data.accessToken);
                console.log('Token refreshed successfully');
                return true;
            }

            return false;
        } catch (error: any) {
            // Check if it's the "No refresh token found" error - this is expected after password reset
            if (error.response?.data?.message === 'No refresh token found') {
                console.log('No refresh token found - user needs to log in');
                clearAuthState();
                return false;
            }

            console.error('Token refresh failed:', error);
            clearAuthState();
            return false;
        }
    };

    // Proactive token refresh timer - placed after refreshToken function definition
    useEffect(() => {
        if (!accessToken) return;

        const checkAndRefreshToken = async () => {
            if (isTokenExpiringSoon(accessToken, 5)) {
                console.log('Token expiring soon, attempting refresh...');
                const success = await refreshToken();
                if (!success) {
                    toast.error('Session refresh failed. Please log in again.');
                }
            }
        };

        // Check immediately
        checkAndRefreshToken();

        // Set up periodic checking (every minute)
        const interval = setInterval(checkAndRefreshToken, 60 * 1000);

        return () => clearInterval(interval);
    }, [accessToken, refreshToken]);

    // Verification methods
    const verifyEmail = async (token: string): Promise<AuthResponse> => {
        try {
            const response = await authAPI.verifyEmail(token);
            const result = response.data as AuthResponse;

            if (result.status === 'success') {
                toast.success('Email verified successfully');
            }

            return result;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Email verification failed';
            toast.error(errorMessage);
            throw error;
        }
    };

    const resendVerification = async (): Promise<AuthResponse> => {
        try {
            const response = await authAPI.resendVerification();
            const result = response.data as AuthResponse;

            if (result.status === 'success') {
                toast.success('Verification email sent');
            }

            return result;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to resend verification email';
            toast.error(errorMessage);
            throw error;
        }
    };

    // History and sessions
    const getLoginHistory = async (): Promise<LoginHistory[]> => {
        try {
            const response = await authAPI.getProfile();
            return response.data.data.user.loginHistory || [];
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch login history';
            toast.error(errorMessage);
            throw error;
        }
    };

    const getSessions = async (): Promise<Session[]> => {
        try {
            const response = await authAPI.getSessions();
            return response.data.data.sessions;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch sessions';
            toast.error(errorMessage);
            throw error;
        }
    };

    // Set auth state
    const setAuthState = (userData: User, token: string) => {
        setUser(userData);
        setAccessToken(token);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('accessToken', token);
    };

    // Clear auth state
    const clearAuthState = () => {
        setUser(null);
        setAccessToken(null);
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
    };

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user && !!accessToken,
        isLoading,
        accessToken,

        // Authentication methods
        login,
        register,
        logout,
        logoutAll,

        // Password methods
        forgotPassword,
        resetPassword,
        changePassword,

        // Profile methods
        updateProfile,
        refreshToken,

        // Verification methods
        verifyEmail,
        resendVerification,

        // History and sessions
        getLoginHistory,
        getSessions,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
} 