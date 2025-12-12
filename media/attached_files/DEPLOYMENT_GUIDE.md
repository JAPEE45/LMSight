# InfinityFree Deployment Guide - Alagang Baras

## Step 1: Get Your Database Credentials

1. Log in to your InfinityFree Control Panel
2. Go to **MySQL Databases** section
3. Note down these details:
   - **MySQL Hostname**: (e.g., `sql110.infinityfree.com`)
   - **MySQL Username**: (e.g., `if0_40250158`)
   - **Database Name**: You need to create one if not exists
   - **MySQL Password**: (if you set one)

## Step 2: Create Database on InfinityFree

1. In MySQL Databases, click **Create New Database**
2. Name it something like: `baras` (it will become `if0_40250158_baras`)
3. Note down the full database name

## Step 3: Import Your Database

1. Go to **phpMyAdmin** in your control panel
2. Select your database (e.g., `if0_40250158_baras`)
3. Click **Import** tab
4. Upload your `baras (4).sql` file
5. Click **Go** to import
6. **IMPORTANT**: Also run `fix_healthmonitoring_schema.sql` after importing

## Step 4: Update Database Configuration

Open `config/db.php` and update the production section (lines 23-27):

```php
} else {
    // InfinityFree/Production configuration
    $host = 'sql110.infinityfree.com';     // Replace with YOUR hostname
    $db   = 'if0_40250158_baras';          // Replace with YOUR database name
    $user = 'if0_40250158';                // Replace with YOUR username
    $pass = '';                            // Add password if you set one
}
```

### Example with your actual credentials:
If your control panel shows:
- Hostname: `sql205.infinityfree.com`
- Username: `if0_40250158`
- Database: `if0_40250158_baras`
- Password: (none)

Update to:
```php
$host = 'sql205.infinityfree.com';
$db   = 'if0_40250158_baras';
$user = 'if0_40250158';
$pass = '';
```

## Step 5: Upload Files

### Option A: Using File Manager
1. Go to **File Manager** in control panel
2. Navigate to `htdocs` folder
3. Delete default files
4. Upload your project folder
5. Make sure the structure is:
   ```
   htdocs/
   └── AlagangBaras/
       ├── assets/
       ├── config/
       ├── helper/
       ├── html/
       └── uploads/
   ```

### Option B: Using FTP (Recommended)
1. Get FTP credentials from control panel
2. Use FileZilla or similar FTP client
3. Upload all files to `htdocs/AlagangBaras/`

## Step 6: Set Folder Permissions

1. In File Manager, set these folders to **0755** (read/write/execute):
   - `uploads/`
   - `uploads/qrcodes/`
   - `helper/phpqrcode/cache/`
   - `helper/phpqrcode/temp/`

## Step 7: Test Your Site

1. Visit: `http://yourusername.infinityfree.com/AlagangBaras/html/index.php`
2. Try logging in with existing credentials
3. Check if all pages load properly

## Common Issues and Solutions

### Issue: "Unable to connect to the database"
**Solution**: 
- Double-check database credentials in `config/db.php`
- Ensure database is created and imported
- Check if MySQL service is running (InfinityFree sometimes has maintenance)

### Issue: "Undefined variable $pdo"
**Solution**: 
- This is fixed in the new `config/db.php`
- Make sure you uploaded the updated file

### Issue: QR codes not generating
**Solution**:
- Check folder permissions on `uploads/qrcodes/` (must be 0755)
- InfinityFree has file write limitations, consider alternative hosting for production

### Issue: Health records not saving
**Solution**:
- Run `fix_healthmonitoring_schema.sql` in phpMyAdmin
- This fixes the `vaccine_given` column type issue

## Important Notes

### InfinityFree Limitations:
- **No cron jobs** - Automated tasks won't work
- **Limited file operations** - Some file uploads may be restricted
- **No email sending** (unless configured)
- **CPU/MySQL query limits** - Can hit limits with heavy traffic

### For Production Use:
Consider upgrading to:
- Paid hosting (HostGator, Bluehost, etc.)
- VPS hosting (DigitalOcean, Linode)
- Cloud hosting (AWS, Google Cloud)

### Security Recommendations:
1. Change default admin passwords immediately
2. Enable HTTPS (InfinityFree provides free SSL)
3. Update password hashing (currently using plain text - NOT SECURE!)
4. Add input sanitization to all forms
5. Implement CSRF protection

## Testing Checklist

After deployment, test:
- [ ] Login for all 3 roles (MAO, Coordinator, Vet)
- [ ] Dashboard loads with correct statistics
- [ ] Owner registration and listing
- [ ] Livestock profiling (add/edit/delete)
- [ ] Health record creation
- [ ] QR code generation
- [ ] All navigation links work
- [ ] Logout functionality

## Support

If you encounter issues:
1. Check browser console for JavaScript errors (F12)
2. Check InfinityFree error logs in control panel
3. Enable error display temporarily to debug:
   - Add to top of `html/index.php`: 
   ```php
   ini_set('display_errors', 1);
   error_reporting(E_ALL);
   ```
   - **REMOVE** before going live!

---
**Last Updated**: December 12, 2025
**System**: Alagang Baras Livestock Management System
