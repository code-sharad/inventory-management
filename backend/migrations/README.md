# Database Migrations

This directory contains database migration scripts for the Billing Inventory Management system.

## Available Migrations

### remove-login-attempts.js

**Purpose**: Removes the `loginAttempts` and `lockUntil` fields from all user documents in the database.

**When to run**: After updating the codebase to remove the "Too many authentication attempts" functionality.

**How to run**:
```bash
cd backend
node migrations/remove-login-attempts.js
```

**What it does**:
- Connects to the MongoDB database using the connection string from your `.env` file
- Removes the `loginAttempts` and `lockUntil` fields from all user documents
- Reports the number of documents modified
- Safely closes the database connection

**Prerequisites**:
- Ensure your `.env` file is properly configured with `MONGODB_URI`
- Make sure the database is accessible
- It's recommended to backup your database before running migrations

**Output**:
The script will output:
- Connection status
- Migration progress
- Number of documents modified
- Completion status

**Safety**:
- This migration only removes fields and does not delete any user data
- The operation is idempotent (safe to run multiple times)
- Users will not be affected and can continue logging in normally

## Running Migrations

1. **Backup your database** (recommended):
   ```bash
   mongodump --uri="your_mongodb_uri" --out=backup_$(date +%Y%m%d_%H%M%S)
   ```

2. **Run the migration**:
   ```bash
   cd backend
   node migrations/remove-login-attempts.js
   ```

3. **Verify the migration**:
   Check that the fields have been removed from user documents in your database.

## Notes

- Always test migrations on a development/staging environment first
- Migrations should be run during maintenance windows when possible
- Keep migration scripts for historical reference and potential rollbacks 