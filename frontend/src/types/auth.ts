export interface User {
    _id: string;
    username: string;
    email: string;
    role: 'admin' | 'user' | 'manager';
    isActive: boolean;
    isEmailVerified: boolean;
    lastLogin: string;
    createdAt: string;
    updatedAt: string;
}

export interface AuthResponse {
    status: 'success' | 'error';
    message?: string;
    accessToken?: string;
    data?: {
        user: User;
    };
    errors?: Array<{
        field: string;
        message: string;
    }>;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    username: string;
    email: string;
    password: string;
    role?: string;
}

export interface PasswordResetRequest {
    email: string;
}

export interface PasswordReset {
    password: string;
}

export interface ChangePassword {
    currentPassword: string;
    newPassword: string;
}

export interface UpdateProfile {
    username?: string;
}

export interface LoginHistory {
    timestamp: string;
    ip: string;
    userAgent: string;
    success: boolean;
}

export interface Session {
    _id: string;
    deviceInfo: string;
    createdAt: string;
    expiresAt: string;
    current?: boolean;
}

export interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    accessToken: string | null;

    // Authentication methods
    login: (credentials: LoginCredentials) => Promise<AuthResponse>;
    register: (data: RegisterData) => Promise<AuthResponse>;
    logout: () => Promise<void>;
    logoutAll: () => Promise<void>;

    // Password methods
    forgotPassword: (data: PasswordResetRequest) => Promise<AuthResponse>;
    resetPassword: (token: string, data: PasswordReset) => Promise<AuthResponse>;
    changePassword: (data: ChangePassword) => Promise<AuthResponse>;

    // Profile methods
    updateProfile: (data: UpdateProfile) => Promise<AuthResponse>;
    refreshToken: () => Promise<boolean>;

    // Verification methods
    verifyEmail: (token: string) => Promise<AuthResponse>;
    resendVerification: () => Promise<AuthResponse>;

    // History and sessions
    getLoginHistory: () => Promise<LoginHistory[]>;
    getSessions: () => Promise<Session[]>;
} 