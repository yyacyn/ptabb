# Deploying Laravel + Inertia.js (React) to cPanel

Deploying a Laravel application with a React (Inertia.js) frontend to cPanel can be challenging because of the thousands of files in `node_modules` and `vendor`. 

> [!WARNING]
> **Never upload your project file-by-file via FTP/File Manager.**
> Uploading thousands of individual files is extremely slow, prone to timeouts, and can easily hit cPanel's maximum connection/inode limits. Instead, always build your assets locally, compress the project into a single `.zip` file, upload it, and extract it on cPanel.

---

## Deployment Architecture: The Secure Structure (Recommended)

For security, your core Laravel files (including `.env`, database configuration, routes, and views) should **never** be accessible to the public. Only the contents of the `public/` directory should be exposed to the web root.

Here is how you should structure the files in cPanel:

```
/home/username/
├── ptabb-core/                 <-- All Laravel backend files go here
│   ├── app/
│   ├── bootstrap/
│   ├── config/
│   ├── database/
│   ├── routes/
│   ├── vendor/
│   ├── .env                    <-- Production .env file
│   └── ... (other files)
│
└── public_html/                <-- Your public web root (subdomain or main domain)
    ├── build/                  <-- Compiled CSS/JS assets (Vite)
    ├── index.php               <-- Modified to point to ptabb-core
    ├── .htaccess               <-- URL rewriting
    └── ... (other public assets)
```

---

## Step-by-Step Deployment Guide

### Step 1: Package Your Project for cPanel
We will compile the React assets and compress the required project files (excluding `node_modules`, git folders, local `.env`, and database backup files) into a single zip.

We have created an automated PowerShell script `package-deployment.ps1` in your project root.
1. Open PowerShell in your project root.
2. Run the script:
   ```powershell
   .\package-deployment.ps1
   ```
3. This will generate a file named `ptabb_deploy.zip` in your project folder.

### Step 2: Upload to cPanel
1. Log in to your **cPanel** account.
2. Open the **File Manager**.
3. Navigate to your Home directory (`/home/username/`).
4. Create a new folder named `ptabb-core` (this is where the backend files will live).
5. Open the `ptabb-core` folder, click **Upload**, and upload your `ptabb_deploy.zip` file.
6. Once uploaded, right-click `ptabb_deploy.zip` in File Manager and select **Extract**. Extract it into `/home/username/ptabb-core/`.

### Step 3: Move the Public Assets to the Web Root
Now we need to expose the public assets (the JS/CSS build files, images, `index.php`, `.htaccess`) to the web.
1. Navigate into `/home/username/ptabb-core/public/`.
2. Select **all files and folders** inside this `public` folder.
3. Click **Move** in the cPanel top menu.
4. Move them to your domain's web root directory (usually `/public_html` or `/public_html/subfolder` for a subdomain).
5. Once moved, you can safely delete the empty `/home/username/ptabb-core/public/` folder.

### Step 4: Configure `index.php` to Link the Core
Since the core files and `index.php` are now separated, we must update the paths in `index.php` so the application boots correctly.
1. Navigate to your web root (e.g., `/public_html/`).
2. Right-click `index.php` and click **Edit**.
3. Find the lines that load `autoload.php` and `app.php`. Modify the paths to point to your `ptabb-core` folder:

```php
// Find and replace these paths in public_html/index.php:

require __DIR__.'/../ptabb-core/vendor/autoload.php';

if (file_exists($maintenance = __DIR__.'/../ptabb-core/storage/framework/maintenance.php')) {
    require $maintenance;
}

$app = require_once __DIR__.'/../ptabb-core/bootstrap/app.php';
```
4. Save the changes.

### Step 5: Configure the Production `.env`
1. Navigate to `/home/username/ptabb-core/`.
2. Find the `.env.example` file, right-click it, select **Rename**, and change it to `.env`.
3. Edit the `.env` file and set your production values:
   ```ini
   APP_ENV=production
   APP_DEBUG=false
   APP_URL=https://yourdomain.com # Change to your live URL

   # Database settings (created in cPanel MySQL Database Wizard)
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=yourusername_ptabb
   DB_USERNAME=yourusername_dbuser
   DB_PASSWORD=your_secure_password
   ```

### Step 6: Create and Migrate the Database
1. In cPanel, open the **MySQL Database Wizard**.
2. Create a new database, create a new user, and assign the user to the database with **All Privileges**.
3. Note these credentials and save them in the `.env` file (Step 5).
4. Go to **phpMyAdmin** in cPanel, select your database, and import your SQL dump (e.g., `abbrnptabb_ptabb.sql`) if you have existing seed data, OR run migrations if you have terminal/SSH access.

### Step 7: Check Storage Permissions & Link
Laravel needs permission to write logs and cache files.
1. In File Manager, navigate to `/home/username/ptabb-core/`.
2. Ensure that the `storage` and `bootstrap/cache` folders have permissions set to `755` (or `775` if needed by the server).
3. Since your public files are separated from core files, if you have file uploads stored in `storage/app/public`, you will need to create a symlink from `/public_html/storage` to `/home/username/ptabb-core/storage/app/public`.
   - If you have SSH access, run: `ln -s /home/username/ptabb-core/storage/app/public /home/username/public_html/storage`
   - If you don't have SSH access, you can run this command via a simple PHP script or cron job in cPanel, then delete it.
