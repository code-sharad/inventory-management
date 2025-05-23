import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import axiosInstance from '@/api';
import { toast } from 'sonner';
import { Eye, EyeOff } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Trash2 } from 'lucide-react';

// Error display component
const ErrorMessage = ({ error }: { error?: string }) => {
    if (!error) return null;
    return <p className="text-sm text-destructive mt-1">{error}</p>;
};

// Helper function to extract field errors from backend response
const extractFieldErrors = (error: any) => {
    const fieldErrors: Record<string, string> = {};

    if (error?.response?.data?.errors) {
        // Handle validation errors array
        const errors = error.response.data.errors;
        errors.forEach((err: any) => {
            if (err.path) {
                fieldErrors[err.path] = err.message;
            }
        });
    } else if (error?.response?.data?.message) {
        // Handle single error message
        fieldErrors.general = error.response.data.message;
    } else {
        fieldErrors.general = error.message || 'An error occurred';
    }

    return fieldErrors;
};

const AdminAccess: React.FC = () => {
    // Placeholder: Replace with your actual admin check logic
    const { user, isLoading } = useAuth();

    // Show loading while auth is initializing
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    // Show unauthorized if not admin
    if (!user || user.role !== "admin") {
        return (
            <div className="flex items-center justify-center h-screen text-destructive text-lg font-semibold">
                Unauthorized: Admins only
            </div>
        );
    }

    const isAdmin = user.role === "admin";
    // State for Create User
    const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: '' });
    const [createUserErrors, setCreateUserErrors] = useState<Record<string, string>>({});
    const [createUserLoading, setCreateUserLoading] = useState(false);

    // State for Change Password
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
    const [passwordLoading, setPasswordLoading] = useState(false);

    // State for Change Email
    const [emails, setEmails] = useState({ newEmail: '', confirmEmail: '' });
    const [emailErrors, setEmailErrors] = useState<Record<string, string>>({});
    const [emailLoading, setEmailLoading] = useState(false);

    // State for Change User Password (by admin)
    const [userPassword, setUserPassword] = useState({ username: '', email: '', newPassword: '', confirmPassword: '' });
    const [userPasswordErrors, setUserPasswordErrors] = useState<Record<string, string>>({});
    const [userPasswordLoading, setUserPasswordLoading] = useState(false);

    // State for password visibility toggles
    const [showUserPassword, setShowUserPassword] = useState(false);
    const [showUserNewPassword, setShowUserNewPassword] = useState(false);
    const [showUserConfirmPassword, setShowUserConfirmPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Users state for table
    const [users, setUsers] = useState<any[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<any>(null);
    // Fetch users
    const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
            const response = await axiosInstance.get('/auth/users');
            // Handle different response structures
            const userData = response.data?.data?.users || response.data;
            console.log('Raw users response:', response.data);

            // Ensure userData is an array
            if (Array.isArray(userData)) {
                setUsers(userData);
            } else if (Array.isArray(response.data)) {
                setUsers(response.data);
            } else {
                console.error('Users data is not an array:', userData);
                setUsers([]);
                toast.error('Invalid users data format');
            }
        } catch (error) {
            console.error('Fetch users error:', error);
            toast.error('Failed to fetch users');
            setUsers([]); // Ensure users is always an array
        } finally {
            setLoadingUsers(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [setUsers]);

    // Delete user
    const handleDeleteUser = async () => {
        if (!userToDelete) return;
        try {
            await axiosInstance.delete(`/auth/delete-user/${userToDelete._id}`);
            toast.success('User deleted successfully');
            setDeleteDialogOpen(false);
            setUserToDelete(null);
            fetchUsers();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to delete user');
        }
    };

    // Client-side validation functions
    const validateCreateUser = () => {
        const errors: Record<string, string> = {};

        if (!newUser.username.trim()) {
            errors.username = 'Username is required';
        } else if (newUser.username.length < 3) {
            errors.username = 'Username must be at least 3 characters';
        }

        if (!newUser.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
            errors.email = 'Please enter a valid email address';
        }

        if (!newUser.password.trim()) {
            errors.password = 'Password is required';
        } else if (newUser.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }

        if (!newUser.role.trim()) {
            errors.role = 'Role is required';
        }

        return errors;
    };

    const validatePasswordChange = () => {
        const errors: Record<string, string> = {};

        if (!passwords.current.trim()) {
            errors.current = 'Current password is required';
        }

        if (!passwords.new.trim()) {
            errors.new = 'New password is required';
        } else if (passwords.new.length < 6) {
            errors.new = 'Password must be at least 6 characters';
        }

        if (!passwords.confirm.trim()) {
            errors.confirm = 'Please confirm your new password';
        } else if (passwords.new !== passwords.confirm) {
            errors.confirm = 'Passwords do not match';
        }

        return errors;
    };

    const validateEmailChange = () => {
        const errors: Record<string, string> = {};

        if (!emails.newEmail.trim()) {
            errors.newEmail = 'New email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emails.newEmail)) {
            errors.newEmail = 'Please enter a valid email address';
        }

        if (!emails.confirmEmail.trim()) {
            errors.confirmEmail = 'Please confirm your new email';
        } else if (emails.newEmail !== emails.confirmEmail) {
            errors.confirmEmail = 'Email addresses do not match';
        }

        return errors;
    };

    const validateUserPasswordChange = () => {
        const errors: Record<string, string> = {};

        if (!userPassword.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userPassword.email)) {
            errors.email = 'Please enter a valid email address';
        }

        if (!userPassword.newPassword.trim()) {
            errors.newPassword = 'New password is required';
        } else if (userPassword.newPassword.length < 6) {
            errors.newPassword = 'Password must be at least 6 characters';
        }

        if (!userPassword.confirmPassword.trim()) {
            errors.confirmPassword = 'Please confirm the new password';
        } else if (userPassword.newPassword !== userPassword.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        return errors;
    };

    // Handlers
    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();

        // Clear previous errors
        setCreateUserErrors({});

        // Client-side validation
        const validationErrors = validateCreateUser();
        if (Object.keys(validationErrors).length > 0) {
            setCreateUserErrors(validationErrors);
            return;
        }

        setCreateUserLoading(true);
        try {
            const response = await axiosInstance.post("/auth/create-user", newUser);
            if (response.status === 200 || response.status === 201) {
                toast.success("User created successfully");
                setNewUser({ username: '', email: '', password: '', role: '' });
                fetchUsers();
            }
        } catch (error: any) {
            console.error('Create user error:', error);
            const fieldErrors = extractFieldErrors(error);
            setCreateUserErrors(fieldErrors);

            if (fieldErrors.general) {
                toast.error(fieldErrors.general);
            } else {
                toast.error("Failed to create user");
            }
        } finally {
            setCreateUserLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        // Clear previous errors
        setPasswordErrors({});

        // Client-side validation
        const validationErrors = validatePasswordChange();
        if (Object.keys(validationErrors).length > 0) {
            setPasswordErrors(validationErrors);
            return;
        }

        setPasswordLoading(true);
        try {
            const response = await axiosInstance.post("/auth/change-admin-password", passwords);
            if (response.status === 200 || response.status === 201) {
                toast.success("Password changed successfully");
                setPasswords({ current: '', new: '', confirm: '' });
            }
        } catch (error: any) {
            console.error('Change password error:', error);
            const fieldErrors = extractFieldErrors(error);
            setPasswordErrors(fieldErrors);

            if (fieldErrors.general) {
                toast.error(fieldErrors.general);
            } else {
                toast.error("Failed to change password");
            }
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleChangeEmail = async (e: React.FormEvent) => {
        e.preventDefault();

        // Clear previous errors
        setEmailErrors({});

        // Client-side validation
        const validationErrors = validateEmailChange();
        if (Object.keys(validationErrors).length > 0) {
            setEmailErrors(validationErrors);
            return;
        }

        setEmailLoading(true);
        try {
            const response = await axiosInstance.post("/auth/change-admin-email", emails);
            if (response.status === 200 || response.status === 201) {
                toast.success("Email changed successfully");
                setEmails({ newEmail: '', confirmEmail: '' });
                fetchUsers();
            }
        } catch (error: any) {
            console.error('Change email error:', error);
            const fieldErrors = extractFieldErrors(error);
            setEmailErrors(fieldErrors);

            if (fieldErrors.general) {
                toast.error(fieldErrors.general);
            } else {
                toast.error("Failed to change email");
            }
        } finally {
            setEmailLoading(false);
        }
    };

    // Handler for changing any user's password (by admin)
    const handleChangeUserPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        // Clear previous errors
        setUserPasswordErrors({});

        // Client-side validation
        const validationErrors = validateUserPasswordChange();
        if (Object.keys(validationErrors).length > 0) {
            setUserPasswordErrors(validationErrors);
            return;
        }

        setUserPasswordLoading(true);
        try {
            const response = await axiosInstance.post("/auth/change-user-password", userPassword);
            if (response.status === 200) {
                toast.success("User password changed successfully");
                setUserPassword({ username: '', email: '', newPassword: '', confirmPassword: '' });
            }
        } catch (error: any) {
            console.error('Change user password error:', error);
            const fieldErrors = extractFieldErrors(error);
            setUserPasswordErrors(fieldErrors);

            if (fieldErrors.general) {
                toast.error(fieldErrors.general);
            } else {
                toast.error("Failed to change user password");
            }
        } finally {
            setUserPasswordLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto py-10 px-4 space-y-8">
            <h2 className="text-3xl font-bold mb-2 text-center">Admin Access</h2>
            <p className="text-muted-foreground text-center mb-6">Manage users and your admin account</p>

            {/* First row: Admin change email and passord */}
            <div className="flex flex-col md:flex-row gap-6">
                {/* Change Password Section */}
                <Card className="flex-1">
                    <CardHeader>
                        <div>
                            <h3 className="text-xl font-semibold">Change Admin Password</h3>
                            <CardDescription>Update your admin account password.</CardDescription>
                        </div>
                    </CardHeader>
                    <form onSubmit={handleChangePassword} className="space-y-4 px-6 pb-6">
                        {passwordErrors.general && (
                            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                                <ErrorMessage error={passwordErrors.general} />
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="current-password">Current Password</Label>
                            <div className="relative">
                                <Input
                                    id="current-password"
                                    type={showCurrentPassword ? "text" : "password"}
                                    placeholder="Current Password"
                                    value={passwords.current}
                                    onChange={e => {
                                        setPasswords({ ...passwords, current: e.target.value });
                                        if (passwordErrors.current) {
                                            setPasswordErrors({ ...passwordErrors, current: '' });
                                        }
                                    }}
                                    className={passwordErrors.current ? 'border-destructive' : ''}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                                    tabIndex={-1}
                                    onClick={() => setShowCurrentPassword(v => !v)}
                                    aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                                >
                                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            <ErrorMessage error={passwordErrors.current} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <div className="relative">
                                <Input
                                    id="new-password"
                                    type={showNewPassword ? "text" : "password"}
                                    placeholder="New Password"
                                    value={passwords.new}
                                    onChange={e => {
                                        setPasswords({ ...passwords, new: e.target.value });
                                        if (passwordErrors.new) {
                                            setPasswordErrors({ ...passwordErrors, new: '' });
                                        }
                                    }}
                                    className={passwordErrors.new ? 'border-destructive' : ''}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                                    tabIndex={-1}
                                    onClick={() => setShowNewPassword(v => !v)}
                                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                                >
                                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            <ErrorMessage error={passwordErrors.new} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirm New Password</Label>
                            <div className="relative">
                                <Input
                                    id="confirm-password"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm New Password"
                                    value={passwords.confirm}
                                    onChange={e => {
                                        setPasswords({ ...passwords, confirm: e.target.value });
                                        if (passwordErrors.confirm) {
                                            setPasswordErrors({ ...passwordErrors, confirm: '' });
                                        }
                                    }}
                                    className={passwordErrors.confirm ? 'border-destructive' : ''}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                                    tabIndex={-1}
                                    onClick={() => setShowConfirmPassword(v => !v)}
                                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            <ErrorMessage error={passwordErrors.confirm} />
                        </div>
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={passwordLoading}
                        >
                            {passwordLoading ? 'Changing Password...' : 'Change Password'}
                        </Button>
                    </form>
                </Card>
                {/* Change Email Section */}
                <Card className="flex-1">
                    <CardHeader>
                        <div>
                            <h3 className="text-xl font-semibold">Change Admin Email</h3>
                            <CardDescription>Update your admin account email address.</CardDescription>
                        </div>
                    </CardHeader>
                    <form onSubmit={handleChangeEmail} className="space-y-4 px-6 pb-6">
                        {emailErrors.general && (
                            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                                <ErrorMessage error={emailErrors.general} />
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="new-email">New Email</Label>
                            <Input
                                id="new-email"
                                type="email"
                                placeholder="New Email"
                                value={emails.newEmail}
                                onChange={e => {
                                    setEmails({ ...emails, newEmail: e.target.value });
                                    if (emailErrors.newEmail) {
                                        setEmailErrors({ ...emailErrors, newEmail: '' });
                                    }
                                }}
                                className={emailErrors.newEmail ? 'border-destructive' : ''}
                                required
                            />
                            <ErrorMessage error={emailErrors.newEmail} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm-email">Confirm New Email</Label>
                            <Input
                                id="confirm-email"
                                type="email"
                                placeholder="Confirm New Email"
                                value={emails.confirmEmail}
                                onChange={e => {
                                    setEmails({ ...emails, confirmEmail: e.target.value });
                                    if (emailErrors.confirmEmail) {
                                        setEmailErrors({ ...emailErrors, confirmEmail: '' });
                                    }
                                }}
                                className={emailErrors.confirmEmail ? 'border-destructive' : ''}
                                required
                            />
                            <ErrorMessage error={emailErrors.confirmEmail} />
                        </div>
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={emailLoading}
                        >
                            {emailLoading ? 'Changing Email...' : 'Change Email'}
                        </Button>
                    </form>
                </Card>
            </div>

            {/* Second row: Create user and change user password */}
            <div className="flex flex-col md:flex-row gap-6 mt-8">
                {/* Create User Section */}
                <Card className="flex-1">
                    <CardHeader>
                        <div>
                            <h3 className="text-xl font-semibold">Create User</h3>
                            <CardDescription>Create a new user account for your team.</CardDescription>
                        </div>
                    </CardHeader>
                    <form onSubmit={handleCreateUser} className="space-y-4 px-6 pb-6">
                        {createUserErrors.general && (
                            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                                <ErrorMessage error={createUserErrors.general} />
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="Username"
                                value={newUser.username}
                                onChange={e => {
                                    setNewUser({ ...newUser, username: e.target.value });
                                    if (createUserErrors.username) {
                                        setCreateUserErrors({ ...createUserErrors, username: '' });
                                    }
                                }}
                                className={createUserErrors.username ? 'border-destructive' : ''}
                                required
                            />
                            <ErrorMessage error={createUserErrors.username} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="user-email">Email</Label>
                            <Input
                                id="user-email"
                                type="email"
                                placeholder="Email"
                                value={newUser.email}
                                onChange={e => {
                                    setNewUser({ ...newUser, email: e.target.value });
                                    if (createUserErrors.email) {
                                        setCreateUserErrors({ ...createUserErrors, email: '' });
                                    }
                                }}
                                className={createUserErrors.email ? 'border-destructive' : ''}
                                required
                            />
                            <ErrorMessage error={createUserErrors.email} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="user-password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="user-password"
                                    type={showUserPassword ? "text" : "password"}
                                    placeholder="Password"
                                    value={newUser.password}
                                    onChange={e => {
                                        setNewUser({ ...newUser, password: e.target.value });
                                        if (createUserErrors.password) {
                                            setCreateUserErrors({ ...createUserErrors, password: '' });
                                        }
                                    }}
                                    className={createUserErrors.password ? 'border-destructive' : ''}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                                    tabIndex={-1}
                                    onClick={() => setShowUserPassword(v => !v)}
                                    aria-label={showUserPassword ? "Hide password" : "Show password"}
                                >
                                    {showUserPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            <ErrorMessage error={createUserErrors.password} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="user-role">Role</Label>
                            <Select
                                value={newUser.role}
                                onValueChange={role => {
                                    setNewUser({ ...newUser, role });
                                    if (createUserErrors.role) {
                                        setCreateUserErrors({ ...createUserErrors, role: '' });
                                    }
                                }}
                                required
                            >
                                <SelectTrigger
                                    id="user-role"
                                    className={createUserErrors.role ? 'border-destructive' : ''}
                                >
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="user">User</SelectItem>
                                </SelectContent>
                            </Select>
                            <ErrorMessage error={createUserErrors.role} />
                        </div>
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={createUserLoading}
                        >
                            {createUserLoading ? 'Creating User...' : 'Create User'}
                        </Button>
                    </form>
                </Card>
                {/* Change User Password (by admin) Section */}
                <Card className="flex-1">
                    <CardHeader>
                        <div>
                            <h3 className="text-xl font-semibold">Change User Password</h3>
                            <CardDescription>Change the password for any user by providing their username and email.</CardDescription>
                        </div>
                    </CardHeader>
                    <form onSubmit={handleChangeUserPassword} className="space-y-4 px-6 pb-6">
                        {userPasswordErrors.general && (
                            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                                <ErrorMessage error={userPasswordErrors.general} />
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="user-password-email">Email</Label>
                            <Input
                                id="user-password-email"
                                type="email"
                                placeholder="Email"
                                value={userPassword.email}
                                onChange={e => {
                                    setUserPassword({ ...userPassword, email: e.target.value });
                                    if (userPasswordErrors.email) {
                                        setUserPasswordErrors({ ...userPasswordErrors, email: '' });
                                    }
                                }}
                                className={userPasswordErrors.email ? 'border-destructive' : ''}
                                required
                            />
                            <ErrorMessage error={userPasswordErrors.email} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="user-new-password">New Password</Label>
                            <div className="relative">
                                <Input
                                    id="user-new-password"
                                    type={showUserNewPassword ? "text" : "password"}
                                    placeholder="New Password"
                                    value={userPassword.newPassword}
                                    onChange={e => {
                                        setUserPassword({ ...userPassword, newPassword: e.target.value });
                                        if (userPasswordErrors.newPassword) {
                                            setUserPasswordErrors({ ...userPasswordErrors, newPassword: '' });
                                        }
                                    }}
                                    className={userPasswordErrors.newPassword ? 'border-destructive' : ''}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                                    tabIndex={-1}
                                    onClick={() => setShowUserNewPassword(v => !v)}
                                    aria-label={showUserNewPassword ? "Hide password" : "Show password"}
                                >
                                    {showUserNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            <ErrorMessage error={userPasswordErrors.newPassword} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="user-confirm-password">Confirm New Password</Label>
                            <div className="relative">
                                <Input
                                    id="user-confirm-password"
                                    type={showUserConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm New Password"
                                    value={userPassword.confirmPassword}
                                    onChange={e => {
                                        setUserPassword({ ...userPassword, confirmPassword: e.target.value });
                                        if (userPasswordErrors.confirmPassword) {
                                            setUserPasswordErrors({ ...userPasswordErrors, confirmPassword: '' });
                                        }
                                    }}
                                    className={userPasswordErrors.confirmPassword ? 'border-destructive' : ''}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                                    tabIndex={-1}
                                    onClick={() => setShowUserConfirmPassword(v => !v)}
                                    aria-label={showUserConfirmPassword ? "Hide password" : "Show password"}
                                >
                                    {showUserConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            <ErrorMessage error={userPasswordErrors.confirmPassword} />
                        </div>
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={userPasswordLoading}
                        >
                            {userPasswordLoading ? 'Changing Password...' : 'Change User Password'}
                        </Button>
                    </form>
                </Card>
            </div>

            <Separator />

            {/* Users Table Section */}
            <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Users</h3>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Username</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead>Last Login</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loadingUsers ? (
                                <TableRow><TableCell colSpan={5}>Loading...</TableCell></TableRow>
                            ) : !Array.isArray(users) || users.length === 0 ? (
                                <TableRow><TableCell colSpan={5}>No users found.</TableCell></TableRow>
                            ) : (
                                users.map((u) => (
                                    <TableRow key={u._id}>
                                        <TableCell>{u.username}</TableCell>
                                        <TableCell>{u.email}</TableCell>
                                        <TableCell>{u.role}</TableCell>
                                        <TableCell>{u.createdAt ? new Date(u.createdAt).toLocaleString() : ''}</TableCell>
                                        <TableCell>{u.lastLogin ? new Date(u.lastLogin).toLocaleString() : ''}</TableCell>
                                        <TableCell>
                                            <Button variant="destructive" size="icon" onClick={() => { setUserToDelete(u); setDeleteDialogOpen(true); }}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete User</DialogTitle>
                    </DialogHeader>
                    <p>Are you sure you want to delete user <b>{userToDelete?.username}</b>?</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDeleteUser}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminAccess;
