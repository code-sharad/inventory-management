interface JWTPayload {
    exp: number;
    iat: number;
    [key: string]: any;
}

/**
 * Decode JWT token without verification (for client-side use only)
 */
export function decodeJWT(token: string): JWTPayload | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }

        const payload = parts[1];
        const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
        return decoded as JWTPayload;
    } catch (error) {
        console.error('Error decoding JWT:', error);
        return null;
    }
}

/**
 * Check if JWT token is expired
 */
export function isTokenExpired(token: string): boolean {
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) {
        return true;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
}

/**
 * Check if JWT token will expire within the specified minutes
 */
export function isTokenExpiringSoon(token: string, minutesBuffer: number = 5): boolean {
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) {
        return true;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const bufferTime = minutesBuffer * 60; // Convert minutes to seconds
    return decoded.exp < (currentTime + bufferTime);
}

/**
 * Get time until token expires in seconds
 */
export function getTimeUntilExpiry(token: string): number {
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) {
        return 0;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    return Math.max(0, decoded.exp - currentTime);
} 