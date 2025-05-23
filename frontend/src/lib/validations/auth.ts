import { z } from 'zod';

// Login validation
export const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
});

// Register validation
export const registerSchema = z.object({
    username: z.string()
        .min(2, 'Username must be at least 2 characters')
        .max(50, 'Username must be less than 50 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/(?=.*[a-z])/, 'Password must contain at least one lowercase letter')
        .regex(/(?=.*[A-Z])/, 'Password must contain at least one uppercase letter')
        .regex(/(?=.*\d)/, 'Password must contain at least one number')
        .regex(/(?=.*[@$!%*?&])/, 'Password must contain at least one special character'),
    confirmPassword: z.string(),
    role: z.enum(['user', 'admin', 'manager']).optional(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

// Forgot password validation
export const forgotPasswordSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
});

// Reset password validation
export const resetPasswordSchema = z.object({
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/(?=.*[a-z])/, 'Password must contain at least one lowercase letter')
        .regex(/(?=.*[A-Z])/, 'Password must contain at least one uppercase letter')
        .regex(/(?=.*\d)/, 'Password must contain at least one number')
        .regex(/(?=.*[@$!%*?&])/, 'Password must contain at least one special character'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

// Change password validation
export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/(?=.*[a-z])/, 'Password must contain at least one lowercase letter')
        .regex(/(?=.*[A-Z])/, 'Password must contain at least one uppercase letter')
        .regex(/(?=.*\d)/, 'Password must contain at least one number')
        .regex(/(?=.*[@$!%*?&])/, 'Password must contain at least one special character'),
    confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

// Update profile validation
export const updateProfileSchema = z.object({
    username: z.string()
        .min(2, 'Username must be at least 2 characters')
        .max(50, 'Username must be less than 50 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
        .optional(),
});

// Email verification
export const verifyEmailSchema = z.object({
    token: z.string().min(1, 'Verification token is required'),
});

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
export type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>; 