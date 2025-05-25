# Enhanced Authentication System Documentation

## Overview

This document describes the comprehensive authentication system implemented for the Billing Inventory Management API. The system provides enterprise-grade security features including JWT-based authentication, password security, email verification, two-factor authentication, and comprehensive audit logging.

## Features

### 🔐 Core Authentication
- **JWT Access & Refresh Tokens**: Short-lived access tokens (15 minutes) with long-lived refresh tokens (7 days)
- **Secure Password Storage**: bcrypt hashing with salt rounds

- **Session Management**: Track and manage user sessions across multiple devices

### 🛡️ Security Features
- **Two-Factor Authentication (2FA)**: TOTP-based using authenticator apps
- **Email Verification**: Secure email verification for new accounts
- **Password Reset**: Secure password reset via email with short-lived tokens
- **Rate Limiting**: Comprehensive rate limiting to prevent abuse
- **Input Validation**: Strict validation of all inputs
- **CORS Protection**: Configurable CORS with allowlist
- **Security Headers**: Helmet.js for security headers
- **NoSQL Injection Protection**: Sanitization of database queries

### 📊 Monitoring & Logging
- **Comprehensive Logging**: Winston-based logging with multiple levels
- **Login History**: Track login attempts with IP, timestamp, and success status
- **Audit Trail**: Complete audit trail for all authentication events
- **Error Tracking**: Detailed error logging for debugging

### 👥 User Management
- **Role-Based Access Control**: Admin, Manager, and User roles
- **User Profile Management**: Update profile information
- **Account Status Management**: Active/inactive account states
- **Bulk User Operations**: Admin tools for user management

## API Endpoints

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": "user"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

#### Verify 2FA
```http
POST /auth/verify-2fa
Content-Type: application/json

{
  "tempToken": "temporary_jwt_token",
  "token": "123456"
}
```

#### Refresh Token
```http
POST /auth/refresh-token
```

#### Logout
```http
POST /auth/logout
Authorization: Bearer <access_token>
```

#### Logout from All Devices
```http
POST /auth/logout-all
Authorization: Bearer <access_token>
```

### Email Verification

#### Verify Email
```http
GET /auth/verify-email/:token
```

#### Resend Verification Email
```http
POST /auth/resend-verification
Authorization: Bearer <access_token>
```

### Password Management

#### Forgot Password
```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### Reset Password
```http
PATCH /auth/reset-password/:token
Content-Type: application/json

{
  "password": "NewSecurePass123!"
}
```

#### Change Password
```http
PATCH /auth/change-password
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```

### Two-Factor Authentication

#### Enable 2FA
```http
POST /auth/enable-2fa
Authorization: Bearer <access_token>
```

#### Activate 2FA
```http
POST /auth/activate-2fa
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "token": "123456"
}
```

#### Disable 2FA
```http
POST /auth/disable-2fa
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "password": "CurrentPassword123!"
}
```

### User Management

#### Get Profile
```http
GET /auth/profile
Authorization: Bearer <access_token>
```

#### Update Profile
```http
PATCH /auth/profile
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "username": "newusername"
}
```

#### Get Users (Admin only)
```http
GET /auth/users
Authorization: Bearer <access_token>
```

#### Create User (Admin only)
```http
POST /auth/create-user
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "SecurePass123!",
  "role": "user"
}
```

#### Delete User (Admin only)
```http
DELETE /auth/users/:id
Authorization: Bearer <access_token>
```

#### Get Login History
```http
GET /auth/login-history
Authorization: Bearer <access_token>
```

#### Get Active Sessions
```http
GET /auth/sessions
Authorization: Bearer <access_token>
```

## Security Implementation

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&)

### Rate Limiting
- **Authentication endpoints**: 5 requests per 15 minutes per IP
- **Password reset**: 3 requests per hour per IP
- **Email verification**: 3 requests per hour per IP
- **Global rate limit**: 1000 requests per 15 minutes per IP

### Token Security
- **Access tokens**: 15-minute expiration
- **Refresh tokens**: 7-day expiration
- **Password reset tokens**: 10-minute expiration
- **Email verification tokens**: 24-hour expiration



## Environment Configuration

Copy `env.example` to `.env` and configure the following variables:

```bash
# Required
JWT_SECRET=your-super-secure-jwt-secret-key-at-least-32-characters-long
MONGODB_URI=mongodb://localhost:27017/billing_inventory

# Email (for production)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=Your App <noreply@yourapp.com>

# Frontend URLs
FRONTEND_URL=http://localhost:3000
VITE_FRONTEND_URL=http://localhost:5173
```

## Middleware Usage

### Authentication Middleware
```javascript
const { authenticate } = require('./middleware/auth');

// Protect routes that require authentication
app.use('/protected-route', authenticate, routeHandler);
```

### Role-Based Access Control
```javascript
const { authenticate, restrictTo } = require('./middleware/auth');

// Admin-only routes
app.use('/admin', authenticate, restrictTo('admin'), adminRoutes);

// Manager and Admin routes
app.use('/manager', authenticate, restrictTo('admin', 'manager'), managerRoutes);
```

### Email Verification Requirement
```javascript
const { authenticate, requireEmailVerification } = require('./middleware/auth');

// Routes that require verified email
app.use('/verified-only', authenticate, requireEmailVerification, routes);
```

### Optional Authentication
```javascript
const { optionalAuth } = require('./middleware/auth');

// Routes that work with or without authentication
app.use('/public', optionalAuth, publicRoutes);
```

## Database Models

### User Model Fields
```javascript
{
  username: String,           // Unique username
  email: String,             // Unique email (lowercase)
  password: String,          // Hashed password
  role: String,              // admin, manager, user
  isActive: Boolean,         // Account status
  isEmailVerified: Boolean,  // Email verification status
  twoFactorEnabled: Boolean, // 2FA status
  twoFactorSecret: String,   // 2FA secret (encrypted)

  refreshTokens: [{         // Active refresh tokens
    token: String,
    createdAt: Date,
    expiresAt: Date,
    deviceInfo: String
  }],
  loginHistory: [{          // Login attempt history
    timestamp: Date,
    ip: String,
    userAgent: String,
    success: Boolean
  }],
  passwordChangedAt: Date,   // Last password change
  lastLogin: Date,          // Last successful login
  lastActiveAt: Date,       // Last activity timestamp
  // Password reset fields
  passwordResetToken: String,
  passwordResetExpires: Date,
  // Email verification fields
  emailVerificationToken: String,
  emailVerificationExpires: Date
}
```

## Error Handling

The system includes comprehensive error handling with standardized response formats:

```javascript
{
  "status": "error",
  "message": "Error description",
  "errors": [] // Validation errors array (if applicable)
}
```

## Logging

All authentication events are logged with the following information:
- User ID and email
- IP address and User-Agent
- Timestamp
- Action performed
- Success/failure status
- Additional metadata

Log files are stored in the `logs/` directory:
- `combined.log`: All log entries
- `error.log`: Error-level logs only

## Testing

To test the authentication system:

1. **Start the server**:
   ```bash
   npm run dev
   ```

2. **Test registration**:
   ```bash
   curl -X POST http://localhost:3000/auth/register \
     -H "Content-Type: application/json" \
     -d '{"username":"testuser","email":"test@example.com","password":"TestPass123!","role":"user"}'
   ```

3. **Test login**:
   ```bash
   curl -X POST http://localhost:3000/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"TestPass123!"}'
   ```

## Migration from Old System

To migrate from the old authentication system:

1. **Update existing users**: Run the migration script to add new fields
2. **Update frontend**: Modify frontend to use new endpoints
3. **Test thoroughly**: Ensure all authentication flows work correctly
4. **Deploy gradually**: Use feature flags to gradually roll out new system

## Security Best Practices

1. **Always use HTTPS in production**
2. **Keep JWT secrets secure and rotate them regularly**
3. **Monitor authentication events and investigate suspicious activity**
4. **Regularly update dependencies**
5. **Use strong password policies**
6. **Enable 2FA for admin accounts**
7. **Regularly audit user accounts and permissions**
8. **Implement proper session timeout policies**
9. **Use secure cookie settings in production**
10. **Monitor and log all authentication events**

## Troubleshooting

### Common Issues

1. **JWT Token Expired**: Use refresh token endpoint to get new access token

3. **Email Not Verified**: Resend verification email
4. **2FA Issues**: Ensure authenticator app time is synchronized
5. **CORS Errors**: Check allowed origins in environment configuration

### Debug Mode

Enable debug logging by setting `LOG_LEVEL=debug` in your environment variables.

## Future Enhancements

Potential future improvements:
- OAuth2 integration (Google, Facebook, etc.)
- Biometric authentication support
- Advanced fraud detection
- Single Sign-On (SSO) support
- Mobile app-specific authentication flows
- Advanced session management with Redis
- Passwordless authentication options 