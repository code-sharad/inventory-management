import React, { useState, forwardRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock, Mail, AlertCircle, Wifi, WifiOff } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { loginSchema, LoginFormData } from '@/lib/validations/auth';

// Define error types for better error handling
interface LoginError {
  type: 'validation' | 'authentication' | 'network' | 'server' | 'unknown';
  message: string;
  code?: string;
}

const Login = forwardRef<HTMLDivElement>((props, ref) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<LoginError | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Helper function to determine error type and create user-friendly messages
  const handleError = (error: any): LoginError => {
    // Network errors
    if (!navigator.onLine) {
      return {
        type: 'network',
        message: 'No internet connection. Please check your network and try again.',
        code: 'OFFLINE'
      };
    }

    if (error.name === 'NetworkError' || error.code === 'NETWORK_ERROR' || error.message?.includes('fetch')) {
      return {
        type: 'network',
        message: 'Unable to connect to the server. Please check your internet connection and try again.',
        code: 'NETWORK_ERROR'
      };
    }

    // Timeout errors
    if (error.name === 'TimeoutError' || error.code === 'TIMEOUT') {
      return {
        type: 'network',
        message: 'Request timed out. Please try again.',
        code: 'TIMEOUT'
      };
    }

    // Authentication errors
    if (error.status === 401 || error.code === 'UNAUTHORIZED') {
      return {
        type: 'authentication',
        message: 'Invalid email or password. Please check your credentials and try again.',
        code: 'INVALID_CREDENTIALS'
      };
    }

    if (error.status === 403 || error.code === 'FORBIDDEN') {
      return {
        type: 'authentication',
        message: 'Your account has been temporarily locked. Please contact support.',
        code: 'ACCOUNT_LOCKED'
      };
    }

    // Server errors
    if (error.status >= 500 && error.status < 600) {
      return {
        type: 'server',
        message: 'Server is temporarily unavailable. Please try again in a moment.',
        code: 'SERVER_ERROR'
      };
    }

    // Validation errors
    if (error.status === 400 || error.code === 'VALIDATION_ERROR') {
      return {
        type: 'validation',
        message: error.message || 'Please check your input and try again.',
        code: 'VALIDATION_ERROR'
      };
    }

    // Rate limiting
    if (error.status === 429) {
      return {
        type: 'server',
        message: 'Too many login attempts. Please wait a moment before trying again.',
        code: 'RATE_LIMITED'
      };
    }

    // Default unknown error
    return {
      type: 'unknown',
      message: error.message || 'An unexpected error occurred. Please try again.',
      code: 'UNKNOWN_ERROR'
    };
  };

  // Enhanced retry logic
  const handleRetry = () => {
    setError(null);
    setRetryCount(prev => prev + 1);
    loginForm.handleSubmit(handleLogin)();
  };

  const handleLogin = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError(null); // Clear any previous errors

      // Add timeout to login request
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT')), 2000) // 2 second timeout
      );

      const loginPromise = login(data);
      const response = await Promise.race([loginPromise, timeoutPromise]);

      if (response.status === 'success') {
        // Reset retry count on successful login
        setRetryCount(0);

        // Login successful, navigate based on user role
        if (response.data?.user?.role === 'admin') {
          navigate('/');
        } else {
          navigate('/inventory');
        }
      } else {
        // Handle API response errors
        const errorInfo = handleError({
          status: response.status === 'error' ? 400 : 200,
          message: response.message,
          code: response.code
        });
        setError(errorInfo);

        // Log error for monitoring (in production, send to error tracking service)
        console.error('Login failed:', {
          error: errorInfo,
          attempt: retryCount + 1,
          email: data.email,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error: any) {
      const errorInfo = handleError(error);
      setError(errorInfo);

      // Enhanced error logging
      console.error('Login exception:', {
        error: errorInfo,
        originalError: error,
        attempt: retryCount + 1,
        email: data.email,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        online: navigator.onLine
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get appropriate icon for error type
  const getErrorIcon = (errorType: LoginError['type']) => {
    switch (errorType) {
      case 'network':
        return navigator.onLine ? Wifi : WifiOff;
      default:
        return AlertCircle;
    }
  };

  // Get appropriate styling for error type
  const getErrorStyling = (errorType: LoginError['type']) => {
    switch (errorType) {
      case 'network':
        return 'border-orange-200 bg-orange-50 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300';
      case 'authentication':
        return 'border-red-200 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300';
      case 'server':
        return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300';
      default:
        return 'border-red-200 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300';
    }
  };

  return (
    <div ref={ref} className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-950">
      <Card className="w-[400px]">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-blue-100 scale-125 dark:bg-white rounded-full">
            <img src={"/logo.png"} alt="logo" className="w-14 h-14 rounded-[1000px] overflow-hidden bg-blue-100 dark:bg-zinc-900" />
          </div>
          <CardTitle className="text-2xl text-center">DEGROUP INVOICE</CardTitle>
          <p className="text-sm text-muted-foreground text-center">
            Enter your credentials to access your account
          </p>
        </CardHeader>
        <CardContent>
          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              {error && (
                <Alert className={`${getErrorStyling(error.type)} border`}>
                  <div className="flex items-start gap-2">
                    {React.createElement(getErrorIcon(error.type), { className: "h-4 w-4 mt-0.5 flex-shrink-0" })}
                    <div className="flex-1">
                      <AlertDescription className="text-sm">
                        {error.message}
                        {(error.type === 'network' || error.type === 'server') && retryCount < 3 && (
                          <div className="mt-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleRetry}
                              className="h-7 text-xs"
                            >
                              Try Again
                            </Button>
                          </div>
                        )}
                        {retryCount >= 3 && error.type === 'network' && (
                          <p className="mt-1 text-xs opacity-75">
                            If the problem persists, please check your internet connection or contact support.
                          </p>
                        )}
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              )}

              <FormField
                control={loginForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          {...field}
                          type="email"
                          placeholder="john@example.com"
                          className="pl-10"
                          autoComplete="email"
                          disabled={isLoading}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          {...field}
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          className="pl-10 pr-10"
                          autoComplete="current-password"
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-between">
                <div></div>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
          </Form>

        </CardContent>
      </Card>
    </div>
  );
});

Login.displayName = 'Login';

export default Login;
