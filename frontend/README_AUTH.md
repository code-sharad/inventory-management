# Frontend Authentication System

## Overview

This document describes the comprehensive React + TypeScript authentication system that integrates with the backend API. The system provides a complete user interface for all authentication features including login, 2FA, password management, and admin controls.

## Architecture

### Technology Stack
- **React 18** with TypeScript
- **React Hook Form** for form handling
- **Zod** for form validation
- **React Router DOM** for routing
- **Axios** for API communication
- **Sonner** for toast notifications
- **Tailwind CSS** + **Radix UI** for styling
- **Lucide React** for icons

### Key Components

#### 1. AuthContext (`src/contexts/AuthContext.tsx`)
Central authentication state management with:
- User authentication state
- Token management (access + refresh tokens)
- Automatic token refresh
- Event-driven logout handling
- Complete API integration

#### 2. ProtectedRoute (`src/components/ProtectedRoute.tsx`)
Route protection with:
- Authentication requirement
- Role-based access control
- Email verification checks
- Loading states
- Automatic redirects

#### 3. Enhanced API Layer (`src/api.ts`)
- Automatic access token injection
- Refresh token handling
- Request/response interceptors
- Error handling and retries
- Event dispatching for auth state

## Features

### 🔐 Authentication Pages

#### Login Page (`src/pages/Login.tsx`)
- Email/password authentication
- Password visibility toggle
- 2FA support with separate flow
- Remember me functionality
- Forgot password link
- Form validation with error handling

#### Forgot Password (`src/pages/ForgotPassword.tsx`)
- Email-based password reset
- Success state with email confirmation
- Resend functionality
- Back to login navigation

#### Reset Password (`src/pages/ResetPassword.tsx`)
- Token-based password reset
- Password confirmation
- Token validation
- Success/error states
- Auto-redirect to login

### 🛡️ Security Features

#### Two-Factor Authentication
- TOTP-based 2FA support
- QR code setup (backend integration)
- 6-digit code verification
- Backup codes support
- Enable/disable functionality

#### Token Management
- Short-lived access tokens (15 minutes)
- Long-lived refresh tokens (7 days)
- Automatic refresh before expiration
- Secure cookie storage
- Multi-device session support

#### Form Validation
- Real-time validation with Zod schemas
- Password strength requirements
- Email format validation
- Consistent error messaging
- Accessibility compliance

## File Structure

```
src/
├── contexts/
│   └── AuthContext.tsx          # Main auth state management
├── components/
│   ├── ProtectedRoute.tsx       # Route protection
│   ├── ui/                      # Reusable UI components
│   │   ├── form.tsx            # Form components
│   │   ├── button.tsx          # Button component
│   │   ├── input.tsx           # Input component
│   │   └── card.tsx            # Card component
│   ├── Navbar.tsx              # Navigation with auth state
│   └── Header.tsx              # Header with user menu
├── pages/
│   ├── Login.tsx               # Login page with 2FA
│   ├── ForgotPassword.tsx      # Password reset request
│   └── ResetPassword.tsx       # Password reset form
├── types/
│   └── auth.ts                 # TypeScript interfaces
├── lib/
│   └── validations/
│       └── auth.ts             # Zod validation schemas
└── api.ts                      # API configuration
```

## Configuration

### Environment Variables

Create `.env` file from `env.example`:

```bash
# API Configuration
VITE_BASE_URL=http://localhost:3000

# Application Configuration
VITE_APP_NAME=Billing Inventory Management
VITE_APP_VERSION=2.0.0
```

### Route Configuration

```tsx
// App.tsx
<Routes>
  {/* Public routes */}
  <Route path="/login" element={
    <ProtectedRoute requireAuth={false}>
      <Login />
    </ProtectedRoute>
  } />
  
  {/* Protected routes */}
  <Route element={
    <ProtectedRoute>
      <Navbar />
    </ProtectedRoute>
  }>
    <Route path="/dashboard" element={
      <ProtectedRoute requiredRole="admin">
        <Dashboard />
      </ProtectedRoute>
    } />
  </Route>
</Routes>
```

## Usage Examples

### Using AuthContext

```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  const handleLogin = async () => {
    try {
      await login({ email: 'user@example.com', password: 'password' });
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome, {user?.email}!</p>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

### Protected Routes

```tsx
// Admin-only route
<ProtectedRoute requiredRole="admin">
  <AdminPanel />
</ProtectedRoute>

// Multiple roles allowed
<ProtectedRoute requiredRole={["admin", "manager"]}>
  <ManagementPanel />
</ProtectedRoute>

// Email verification required
<ProtectedRoute requireEmailVerification>
  <VerifiedContent />
</ProtectedRoute>
```

### Form Validation

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '@/lib/validations/auth';

function LoginForm() {
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginFormData) => {
    // Handle form submission
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Form fields */}
      </form>
    </Form>
  );
}
```

## State Management

### Authentication State

```tsx
interface AuthContextType {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;

  // Authentication methods
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;

  // 2FA methods
  verify2FA: (data: TwoFactorVerification) => Promise<AuthResponse>;
  enable2FA: () => Promise<{ secret: string; qrCodeUrl: string }>;

  // Password methods
  forgotPassword: (data: PasswordResetRequest) => Promise<AuthResponse>;
  resetPassword: (token: string, data: PasswordReset) => Promise<AuthResponse>;
}
```

### User Object

```tsx
interface User {
  _id: string;
  username: string;
  email: string;
  role: 'admin' | 'user' | 'manager';
  isActive: boolean;
  isEmailVerified: boolean;
  twoFactorEnabled: boolean;
  lastLogin: string;
  createdAt: string;
}
```

## Error Handling

### Global Error Handling

```tsx
// API interceptor handles:
// - 401: Automatic token refresh or logout
// - 403: Permission denied notifications
// - Network errors: User-friendly messages

// Form validation errors
// - Real-time field validation
// - Server-side error display
// - Accessibility compliance
```

### Toast Notifications

```tsx
// Success notifications
toast.success('Login successful');

// Error notifications
toast.error('Invalid credentials');

// Info notifications
toast.info('Please check your email');
```

## Security Considerations

### Token Storage
- Access tokens in localStorage (short-lived)
- Refresh tokens in HTTP-only cookies
- Automatic cleanup on logout
- Cross-tab synchronization

### CSRF Protection
- SameSite cookie attributes
- Origin validation
- Custom headers for API requests

### XSS Prevention
- Input sanitization
- Content Security Policy headers
- Escape user-generated content

## Testing

### Component Testing

```tsx
import { render, screen } from '@testing-library/react';
import { AuthProvider } from '@/contexts/AuthContext';
import Login from '@/pages/Login';

test('renders login form', () => {
  render(
    <AuthProvider>
      <Login />
    </AuthProvider>
  );
  
  expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
});
```

### Integration Testing

```tsx
// Test authentication flow
// Test protected routes
// Test error handling
// Test token refresh
```

## Performance Optimizations

### Code Splitting
```tsx
// Lazy load authentication pages
const Login = lazy(() => import('@/pages/Login'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
```

### Memoization
```tsx
// Memoize expensive computations
const isUserAdmin = useMemo(() => user?.role === 'admin', [user?.role]);
```

### Bundle Optimization
- Tree shaking for unused code
- Dynamic imports for large dependencies
- Optimized build configuration

## Migration from Old System

### Steps to Upgrade

1. **Update Context Usage**
   ```tsx
   // Old
   import { useUser } from './contexts/UserContext';
   const { user } = useUser();
   
   // New
   import { useAuth } from '@/contexts/AuthContext';
   const { user } = useAuth();
   ```

2. **Update User Object Access**
   ```tsx
   // Old
   user?.user?.role
   
   // New
   user?.role
   ```

3. **Update Form Handling**
   - Replace manual form state with react-hook-form
   - Add Zod validation schemas
   - Update error handling

## Troubleshooting

### Common Issues

1. **"useAuth must be used within an AuthProvider"**
   - Ensure AuthProvider wraps your app
   - Check component hierarchy

2. **Token refresh failures**
   - Check backend /auth/refresh-token endpoint
   - Verify cookie configuration
   - Check network connectivity

3. **Form validation errors**
   - Verify Zod schema definitions
   - Check form resolver configuration
   - Validate input constraints

4. **Route protection not working**
   - Check ProtectedRoute configuration
   - Verify user role assignments
   - Check loading states

### Debug Mode

Enable detailed logging:

```tsx
// In development
if (process.env.NODE_ENV === 'development') {
  console.log('Auth state:', { user, isAuthenticated, accessToken });
}
```

## Future Enhancements

### Planned Features
- Social authentication (Google, GitHub)
- Biometric authentication
- Progressive Web App support
- Offline authentication handling
- Advanced session management
- Multi-factor authentication options

### Performance Improvements
- Service worker for caching
- Background token refresh
- Optimistic UI updates
- Better error boundaries

## Support

For issues or questions:
1. Check this documentation
2. Review the backend authentication guide
3. Check console for error messages
4. Verify network requests in browser dev tools 