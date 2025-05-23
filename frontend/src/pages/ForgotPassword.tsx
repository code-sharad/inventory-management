import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, ArrowLeft } from 'lucide-react';

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
import { forgotPasswordSchema, ForgotPasswordFormData } from '@/lib/validations/auth';

export default function ForgotPassword() {
    const navigate = useNavigate();
    const { forgotPassword } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const form = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: '',
        },
    });

    const handleSubmit = async (data: ForgotPasswordFormData) => {
        try {
            setIsLoading(true);
            await forgotPassword(data);
            setEmailSent(true);
        } catch (error) {
            console.error('Forgot password failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (emailSent) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <Card className="w-[400px]">
                    <CardHeader className="space-y-1">
                        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-green-100 dark:bg-green-900 rounded-full">
                            <Mail className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <CardTitle className="text-2xl text-center">Check your email</CardTitle>
                        <p className="text-sm text-muted-foreground text-center">
                            We've sent a password reset link to your email address.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <p className="text-sm text-center text-muted-foreground">
                                Didn't receive the email? Check your spam folder or try again.
                            </p>
                            <div className="flex space-x-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setEmailSent(false)}
                                    className="flex-1"
                                >
                                    Try Again
                                </Button>
                                <Button
                                    onClick={() => navigate('/login')}
                                    className="flex-1"
                                >
                                    Back to Login
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <Card className="w-[400px]">
                <CardHeader className="space-y-1">
                    <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-blue-100 dark:bg-blue-900 rounded-full">
                        <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <CardTitle className="text-2xl text-center">Forgot your password?</CardTitle>
                    <p className="text-sm text-muted-foreground text-center">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
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
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full"
                            >
                                {isLoading ? 'Sending...' : 'Send reset link'}
                            </Button>
                        </form>
                    </Form>

                    <div className="mt-6 text-center">
                        <Link
                            to="/login"
                            className="inline-flex items-center text-sm text-primary hover:underline"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Back to login
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 