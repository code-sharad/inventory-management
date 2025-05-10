import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useUser } from '@/contexts/UserContext';
import axiosInstance from '@/api';
import { toast } from 'sonner';
import { Eye, EyeOff } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Trash2 } from 'lucide-react';

const AdminAccess: React.FC = () => {
    // Placeholder: Replace with your actual admin check logic
    const { user } = useUser();
    const isAdmin = user?.user.role === "admin"; // TODO: Replace with real check
    // State for Create User
    const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: '' });

    // State for Change Password
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

    // State for Change Email
    const [emails, setEmails] = useState({ newEmail: '', confirmEmail: '' });

    // State for Change User Password (by admin)
    const [userPassword, setUserPassword] = useState({ username: '', email: '', newPassword: '', confirmPassword: '' });

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
            setUsers(response.data);
        } catch (error) {
            toast.error('Failed to fetch users');
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

    // Handlers
    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axiosInstance.post("/auth/create-user", newUser);
            if (response.status === 200) {
                toast.success("User created successfully");
            } else {
                toast.error("User creation failed");
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "User creation failed");
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            toast.error("New passwords do not match");
            return;
        }
        try {
            const response = await axiosInstance.post("/auth/change-admin-password", passwords);
            if (response.status === 200) {
                toast.success("Password changed successfully");
            } else {
                toast.error("Password change failed");
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Password change failed");
        }
    };

    const handleChangeEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        if (emails.newEmail !== emails.confirmEmail) {
            toast.error("Emails do not match");
            return;
        }
        try {
            const response = await axiosInstance.post("/auth/change-admin-email", emails);
            if (response.status === 200) {
                toast.success("Email changed successfully");
            } else {
                toast.error("Email change failed");
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Email change failed");
        }
    };

    // Handler for changing any user's password (by admin)
    const handleChangeUserPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (userPassword.newPassword !== userPassword.confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }

        try {
            const response = await axiosInstance.post("/auth/change-user-password", userPassword);
            if (response.status === 200) {
                toast.success("User password changed successfully");
            } else {
                toast.error("User password change failed");
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "User password change failed");
        }
    };

    if (!isAdmin) {
        return <div className="flex items-center justify-center h-screen text-destructive text-lg font-semibold">Unauthorized: Admins only</div>;
    }

    return (
        <div className="max-w-5xl mx-auto py-10 px-4 space-y-8">
            <h2 className="text-3xl font-bold mb-2 text-center">Admin Access</h2>
            <p className="text-muted-foreground text-center mb-6">Manage users and your admin account</p>

            {/* First row: Admin change email and password */}
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
                        <div className="space-y-2">
                            <Label htmlFor="current-password">Current Password</Label>
                            <div className="relative">
                                <Input
                                    id="current-password"
                                    type={showCurrentPassword ? "text" : "password"}
                                    placeholder="Current Password"
                                    value={passwords.current}
                                    onChange={e => setPasswords({ ...passwords, current: e.target.value })}
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
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <div className="relative">
                                <Input
                                    id="new-password"
                                    type={showNewPassword ? "text" : "password"}
                                    placeholder="New Password"
                                    value={passwords.new}
                                    onChange={e => setPasswords({ ...passwords, new: e.target.value })}
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
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirm New Password</Label>
                            <div className="relative">
                                <Input
                                    id="confirm-password"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm New Password"
                                    value={passwords.confirm}
                                    onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
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
                        </div>
                        <Button type="submit" className="w-full">Change Password</Button>
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
                        <div className="space-y-2">
                            <Label htmlFor="new-email">New Email</Label>
                            <Input
                                id="new-email"
                                type="email"
                                placeholder="New Email"
                                value={emails.newEmail}
                                onChange={e => setEmails({ ...emails, newEmail: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm-email">Confirm New Email</Label>
                            <Input
                                id="confirm-email"
                                type="email"
                                placeholder="Confirm New Email"
                                value={emails.confirmEmail}
                                onChange={e => setEmails({ ...emails, confirmEmail: e.target.value })}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full">Change Email</Button>
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
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="Username"
                                value={newUser.username}
                                onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="user-email">Email</Label>
                            <Input
                                id="user-email"
                                type="email"
                                placeholder="Email"
                                value={newUser.email}
                                onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="user-password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="user-password"
                                    type={showUserPassword ? "text" : "password"}
                                    placeholder="Password"
                                    value={newUser.password}
                                    onChange={e => setNewUser({ ...newUser, password: e.target.value })}
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
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="user-role">Role</Label>
                            <Select
                                value={newUser.role}
                                onValueChange={role => setNewUser({ ...newUser, role })}
                                required
                            >
                                <SelectTrigger id="user-role">
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="user">User</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button type="submit" className="w-full">Create User</Button>
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
                        <div className="space-y-2">
                            <Label htmlFor="user-password-email">Email</Label>
                            <Input
                                id="user-password-email"
                                type="email"
                                placeholder="Email"
                                value={userPassword.email}
                                onChange={e => setUserPassword({ ...userPassword, email: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="user-new-password">New Password</Label>
                            <div className="relative">
                                <Input
                                    id="user-new-password"
                                    type={showUserNewPassword ? "text" : "password"}
                                    placeholder="New Password"
                                    value={userPassword.newPassword}
                                    onChange={e => setUserPassword({ ...userPassword, newPassword: e.target.value })}
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
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="user-confirm-password">Confirm New Password</Label>
                            <div className="relative">
                                <Input
                                    id="user-confirm-password"
                                    type={showUserConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm New Password"
                                    value={userPassword.confirmPassword}
                                    onChange={e => setUserPassword({ ...userPassword, confirmPassword: e.target.value })}
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
                        </div>
                        <Button type="submit" className="w-full">Change User Password</Button>
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
                            ) : users.length === 0 ? (
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
