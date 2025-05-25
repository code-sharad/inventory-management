import { decodeJWT, isTokenExpired } from './jwt-utils';

// Force logout utility that can be called from anywhere
export const forceLogout = (reason?: string) => {
    console.log('Force logout called:', reason || 'No reason provided');

    // Clear all auth-related localStorage items
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');

    // Clear sessionStorage as well (optional)
    sessionStorage.clear();

    // Dispatch logout event
    window.dispatchEvent(new CustomEvent('auth:logout', {
        detail: { reason }
    }));

    // Force redirect to login
    setTimeout(() => {
        if (!window.location.pathname.includes('/login') &&
            !window.location.pathname.includes('/reset-password') &&
            !window.location.pathname.includes('/forgot-password')) {
            console.log('Redirecting to login...');
            window.location.href = '/login';
        }
    }, 100);
};

// Check auth status utility
export const checkAuthStatus = () => {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');

    if (!token || !user) {
        return 'no-auth-data';
    }

    try {
        JSON.parse(user); // Validate user data
    } catch {
        return 'invalid-user-data';
    }

    if (isTokenExpired(token)) {
        return 'token-expired';
    }

    return 'valid';
};

// Initialize auth check on app load
export const initializeAuthCheck = () => {
    const status = checkAuthStatus();

    if (status !== 'valid') {
        console.log('Auth status check failed:', status);
        forceLogout(`Auth initialization failed: ${status}`);
    }

    return status === 'valid';
};

// Monitor auth status periodically
export const startAuthMonitoring = (intervalMs = 30000) => {
    const interval = setInterval(() => {
        const status = checkAuthStatus();
        if (status !== 'valid') {
            console.log('Auth monitoring detected issue:', status);
            forceLogout(`Auth monitoring failed: ${status}`);
            clearInterval(interval);
        }
    }, intervalMs);

    return () => clearInterval(interval);
}; 