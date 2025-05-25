import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { checkAuthStatus, forceLogout } from '@/lib/auth-utils';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export function AuthDebug() {
    const { user, isAuthenticated, logout, accessToken } = useAuth();
    const [authStatus, setAuthStatus] = useState<string>('');
    const [tokenInfo, setTokenInfo] = useState<any>(null);

    useEffect(() => {
        const updateStatus = () => {
            const status = checkAuthStatus();
            setAuthStatus(status);

            const token = localStorage.getItem('accessToken');
            if (token) {
                try {
                    const parts = token.split('.');
                    if (parts.length === 3) {
                        const payload = JSON.parse(atob(parts[1]));
                        const currentTime = Math.floor(Date.now() / 1000);
                        const timeLeft = payload.exp - currentTime;
                        setTokenInfo({
                            exp: payload.exp,
                            iat: payload.iat,
                            currentTime: currentTime,
                            timeLeft: timeLeft,
                            isExpired: timeLeft <= 0,
                            expiringSoon: timeLeft <= 60, // Less than 1 minute
                            expiresIn: timeLeft > 0 ? `${Math.floor(timeLeft / 60)}m ${timeLeft % 60}s` : 'EXPIRED',
                            issuedAt: new Date(payload.iat * 1000).toLocaleString(),
                            expiresAt: new Date(payload.exp * 1000).toLocaleString()
                        });
                    }
                } catch (e) {
                    setTokenInfo({ error: 'Invalid token format' });
                }
            } else {
                setTokenInfo(null);
            }
        };

        updateStatus();
        const interval = setInterval(updateStatus, 1000);
        return () => clearInterval(interval);
    }, [accessToken]);

    const handleNormalLogout = async () => {
        console.log('Testing normal logout...');
        try {
            await logout();
        } catch (error) {
            console.error('Normal logout failed:', error);
        }
    };

    const handleForceLogout = () => {
        console.log('Testing force logout...');
        forceLogout('Manual force logout test');
    };

    const handleClearStorage = () => {
        console.log('Clearing storage manually...');
        localStorage.clear();
        sessionStorage.clear();
        window.location.reload();
    };

    const handleSimulateExpiredToken = () => {
        console.log('Simulating expired access token...');
        // Set an expired token to test the flow
        const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMyIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNjAwMDAwMDAwLCJleHAiOjE2MDAwMDAwMDB9.expired';
        localStorage.setItem('accessToken', expiredToken);
        window.location.reload();
    };

    const makeTestApiCall = async () => {
        console.log('Making test API call to trigger auth flow...');
        try {
            const response = await fetch(`${import.meta.env.VITE_BASE_URL || 'http://localhost:3000'}/auth/profile`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });
            console.log('API call response:', response.status);
        } catch (error) {
            console.error('API call failed:', error);
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto mt-4">
            <CardHeader>
                <CardTitle>Auth Debug Panel - Token Expiry Testing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <strong>Auth Status:</strong>
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${authStatus === 'valid' ? 'bg-green-100 text-green-800' :
                            authStatus === 'token-expired' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                            }`}>
                            {authStatus}
                        </span>
                    </div>
                    <div>
                        <strong>Is Authenticated:</strong>
                        <span className={`ml-2 ${isAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
                            {isAuthenticated ? 'Yes' : 'No'}
                        </span>
                    </div>
                    <div>
                        <strong>User:</strong> {user ? user.username : 'None'}
                    </div>
                    <div>
                        <strong>Has Token:</strong>
                        <span className={`ml-2 ${accessToken ? 'text-green-600' : 'text-red-600'}`}>
                            {accessToken ? 'Yes' : 'No'}
                        </span>
                    </div>
                </div>

                {tokenInfo && !tokenInfo.error && (
                    <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Token Details:</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <strong>Expires In:</strong>
                                <span className={`ml-2 ${tokenInfo.isExpired ? 'text-red-600 font-bold' :
                                    tokenInfo.expiringSoon ? 'text-yellow-600 font-bold' :
                                        'text-green-600'
                                    }`}>
                                    {tokenInfo.expiresIn}
                                </span>
                            </div>
                            <div>
                                <strong>Status:</strong>
                                <span className={`ml-2 ${tokenInfo.isExpired ? 'text-red-600' :
                                    tokenInfo.expiringSoon ? 'text-yellow-600' :
                                        'text-green-600'
                                    }`}>
                                    {tokenInfo.isExpired ? 'EXPIRED' :
                                        tokenInfo.expiringSoon ? 'EXPIRING SOON' : 'VALID'}
                                </span>
                            </div>
                            <div className="col-span-2">
                                <strong>Issued At:</strong> {tokenInfo.issuedAt}
                            </div>
                            <div className="col-span-2">
                                <strong>Expires At:</strong> {tokenInfo.expiresAt}
                            </div>
                        </div>
                    </div>
                )}

                {tokenInfo && tokenInfo.error && (
                    <div className="text-xs bg-red-100 dark:bg-red-900 p-2 rounded">
                        <strong>Token Error:</strong> {tokenInfo.error}
                    </div>
                )}

                <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                        <Button onClick={handleNormalLogout} variant="outline" size="sm">
                            Normal Logout
                        </Button>
                        <Button onClick={handleForceLogout} variant="destructive" size="sm">
                            Force Logout
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <Button onClick={makeTestApiCall} variant="secondary" size="sm">
                            Test API Call
                        </Button>
                        <Button onClick={handleSimulateExpiredToken} variant="outline" size="sm">
                            Simulate Expired Token
                        </Button>
                    </div>

                    <Button onClick={handleClearStorage} variant="secondary" size="sm" className="w-full">
                        Clear All Storage & Reload
                    </Button>
                </div>

                <div className="text-xs text-muted-foreground border-t pt-2">
                    <strong>Test Scenarios:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>Wait for token to expire naturally (watch countdown)</li>
                        <li>Click "Test API Call" when token is expired to trigger refresh flow</li>
                        <li>Use "Simulate Expired Token" to immediately test expired token handling</li>
                        <li>Try logout when tokens are expired</li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
} 