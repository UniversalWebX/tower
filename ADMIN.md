# Tower Admin Account Setup

This guide explains how to create and manage admin accounts for the Tower platform.

## 🔧 Quick Setup

### Create Default Admin Account
```bash
npm run create-admin
```

### Create All Admin Templates
```bash
npm run create-admin:all
```

## 👥 Admin Account Templates

### 1. TowerAdmin (Default)
- **Username:** `TowerAdmin`
- **Password:** `TowerAdmin2024!`
- **Role:** Platform Administrator
- **Permissions:** Full admin access
- **Use Case:** General platform administration

### 2. SuperAdmin
- **Username:** `SuperAdmin`
- **Password:** `SuperAdmin2024!`
- **Role:** Super Administrator
- **Permissions:** All system permissions
- **Use Case:** Complete system control

### 3. Moderator
- **Username:** `Moderator`
- **Password:** `Moderator2024!`
- **Role:** Content Moderator
- **Permissions:** Content moderation only
- **Use Case:** Content management and user safety

### 4. Developer
- **Username:** `Developer`
- **Password:** `Developer2024!`
- **Role:** System Developer
- **Permissions:** Development and system access
- **Use Case:** Development and maintenance

## 🔐 Security Best Practices

### 1. Change Default Passwords
```bash
# After creating admin accounts, immediately change passwords
# Login to the account and update password in settings
```

### 2. Use Strong Passwords
- Minimum 12 characters
- Include uppercase, lowercase, numbers, and symbols
- Avoid common words or patterns

### 3. Limit Admin Access
- Only create admin accounts when necessary
- Use principle of least privilege
- Regularly review admin permissions

### 4. Backup Admin Data
```bash
# Backup encrypted admin data
cp data/tower-data.enc backup/tower-data-$(date +%Y%m%d).enc
```

## 🎛️ Admin Dashboard Features

### Statistics Overview
- Total users count
- Total posts count
- Total messages count
- Total chats count
- Total follows count

### System Information
- Platform version
- System uptime
- Node.js version
- Memory usage

### Admin Actions
- **Wipe All Posts:** Delete all user posts
- **Create Backup:** Generate system backup
- **Restore Backup:** Restore from backup
- **Export User Data:** Export all user data

### Quick Links
- View feed
- Create posts
- Platform settings

## 🔑 Accessing Admin Dashboard

1. **Login with Admin Account**
   - Go to `/login`
   - Use admin credentials
   - Navigate to `/admin`

2. **Admin Navigation**
   - Admin link appears in navigation for admin users
   - Access all admin features from dashboard

## 📝 Admin Permissions

### TowerAdmin Permissions
- `admin:users:read` - View user data
- `admin:users:write` - Modify user accounts
- `admin:users:delete` - Delete user accounts
- `admin:posts:read` - View all posts
- `admin:posts:write` - Modify posts
- `admin:posts:delete` - Delete posts
- `admin:system:wipe` - Wipe system data
- `admin:system:backup` - Create backups
- `admin:system:restore` - Restore backups
- `admin:analytics:read` - View analytics
- `admin:settings:write` - Modify settings

### SuperAdmin Permissions
- `admin:*` - All admin permissions
- `system:*` - All system permissions
- `user:*` - All user permissions

### Moderator Permissions
- `admin:posts:read` - View all posts
- `admin:posts:delete` - Delete posts
- `admin:users:read` - View user data
- `admin:analytics:read` - View analytics

### Developer Permissions
- `admin:system:backup` - Create backups
- `admin:system:restore` - Restore backups
- `admin:analytics:read` - View analytics
- `admin:settings:read` - View settings

## 🚨 Important Notes

### Data Storage
- All admin data is stored in `data/tower-data.enc`
- File is encrypted with AES-256-GCM
- Includes all user accounts, posts, and system data

### Recovery
- If admin account is lost, restore from backup
- Delete `data/tower-data.enc` and run `npm run create-admin`
- This will create a fresh admin account

### Security
- Never share admin credentials
- Regularly update admin passwords
- Monitor admin account activity
- Keep backup files secure

## 🛠️ Troubleshooting

### Admin Account Not Working
1. Check if admin exists in encrypted data
2. Verify password is correct
3. Ensure admin user is not suspended

### Admin Dashboard Not Loading
1. Verify user is logged in as admin
2. Check browser console for errors
3. Ensure encrypted data file is accessible

### Data Corruption
1. Restore from recent backup
2. Check file permissions
3. Verify encryption key is correct

## 📞 Support

For admin account issues:
1. Check this documentation first
2. Review error logs
3. Restore from backup if needed
4. Contact system administrator

---

**⚠️ SECURITY WARNING:** Default admin passwords are for initial setup only. Change all default passwords immediately after creating admin accounts.
