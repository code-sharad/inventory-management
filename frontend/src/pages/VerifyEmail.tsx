import React, { useState, useEffect, forwardRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Mail, Loader2, RefreshCw } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type VerificationStatus = 'loading' | 'success' | 'error' | 'expired';

const VerifyEmail = forwardRef<HTMLDivElement>((props, ref) => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const { verifyEmail, resendVerification, user, isAuthenticated } = useAuth();

    const [status, setStatus] = useState<VerificationStatus>('loading');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [isResending, setIsResending] = useState(false);

    useEffect(() => {
        const handleVerification = async () => {
            if (!token) {
                // No token provided - this means user was redirected here for email verification
                // Show a message asking them to check their email or resend verification
                setStatus('expired'); // Reuse expired status to show resend option
                setErrorMessage('Please check your email for a verification link');
                return;
            }

            try {
                setStatus('loading');
                const response = await verifyEmail(token);

                if (response.status === 'success') {
                    setStatus('success');

                    // Redirect after successful verification
                    setTimeout(() => {
                        if (isAuthenticated && user) {
                            if (user.role === 'admin') {
                                navigate('/');
                            } else {
                                navigate('/inventory');
                            }
                        } else {
                            navigate('/login');
                        }
                    }, 3000);
                } else {
                    setStatus('error');
                    setErrorMessage(response.message || 'Email verification failed');
                }
            } catch (error: any) {
                const message = error.response?.data?.message || error.message || 'Email verification failed';

                if (message.includes('expired') || message.includes('invalid')) {
                    setStatus('expired');
                } else {
                    setStatus('error');
                    setErrorMessage(message);
                }
            }
        };

        handleVerification();
    }, [token, verifyEmail, navigate, isAuthenticated, user]);

    const handleResendVerification = async () => {
        try {
            setIsResending(true);
            await resendVerification();
        } catch (error) {
            console.error('Failed to resend verification email:', error);
        } finally {
            setIsResending(false);
        }
    };

    const renderContent = () => {
        switch (status) {
            case 'loading':
                return (
                    <>
                        <CardHeader className="space-y-1">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-blue-100 dark:bg-blue-900 rounded-full">
                                <Loader2 className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-spin" />
                            </div>
                            <CardTitle className="text-2xl text-center">Verifying Email</CardTitle>
                            <p className="text-sm text-muted-foreground text-center">
                                Please wait while we verify your email address...
                            </p>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-center">
                                <div className="animate-pulse text-muted-foreground">
                                    Verification in progress...
                                </div>
                            </div>
                        </CardContent>
                    </>
                );

            case 'success':
                return (
                    <>
                        <CardHeader className="space-y-1">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-green-100 dark:bg-green-900 rounded-full">
                                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <CardTitle className="text-2xl text-center text-green-700 dark:text-green-400">
                                Email Verified!
                            </CardTitle>
                            <p className="text-sm text-muted-foreground text-center">
                                Your email has been successfully verified. You will be redirected shortly.
                            </p>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="text-center text-sm text-muted-foreground">
                                    Redirecting in 3 seconds...
                                </div>
                                <Button
                                    onClick={() => {
                                        if (isAuthenticated && user) {
                                            if (user.role === 'admin') {
                                                navigate('/');
                                            } else {
                                                navigate('/inventory');
                                            }
                                        } else {
                                            navigate('/login');
                                        }
                                    }}
                                    className="w-full"
                                >
                                    Continue to Dashboard
                                </Button>
                            </div>
                        </CardContent>
                    </>
                );

            case 'expired':
                return (
                    <>
                        <CardHeader className="space-y-1">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-orange-100 dark:bg-orange-900 rounded-full">
                                <Mail className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                            </div>
                            <CardTitle className="text-2xl text-center text-orange-700 dark:text-orange-400">
                                {!token ? 'Email Verification Required' : 'Link Expired'}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground text-center">
                                {!token
                                    ? 'Please check your email for a verification link, or request a new one below.'
                                    : 'This verification link has expired. Please request a new one.'
                                }
                            </p>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <Button
                                    onClick={handleResendVerification}
                                    disabled={isResending}
                                    className="w-full"
                                >
                                    {isResending ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Mail className="w-4 h-4 mr-2" />
                                            Send New Verification Email
                                        </>
                                    )}
                                </Button>
                                <div className="text-center">
                                    <Link
                                        to="/login"
                                        className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                                    >
                                        Back to Login
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </>
                );

            case 'error':
            default:
                return (
                    <>
                        <CardHeader className="space-y-1">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900 rounded-full">
                                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <CardTitle className="text-2xl text-center text-red-700 dark:text-red-400">
                                Verification Failed
                            </CardTitle>
                            <p className="text-sm text-muted-foreground text-center">
                                {errorMessage || 'We couldn\'t verify your email address. Please try again.'}
                            </p>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <Button
                                    onClick={handleResendVerification}
                                    disabled={isResending}
                                    variant="outline"
                                    className="w-full"
                                >
                                    {isResending ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Mail className="w-4 h-4 mr-2" />
                                            Resend Verification Email
                                        </>
                                    )}
                                </Button>
                                <div className="text-center">
                                    <Link
                                        to="/login"
                                        className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                                    >
                                        Back to Login
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </>
                );
        }
    };

    return (
        <div ref={ref} className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <Card className="w-[400px]">
                {renderContent()}
            </Card>
        </div>
    );
});

VerifyEmail.displayName = 'VerifyEmail';

export default VerifyEmail; 