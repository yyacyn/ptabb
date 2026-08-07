# Deployment Guide — PT. ABB Company Profile (cPanel / FTP)

This guide outlines the step-by-step deployment workflow for releasing **PT. ABB Company Profile** to a live cPanel hosting environment using FTP (WinSCP / FileZilla) and web-based execution endpoints.

---

## 🚀 Standard Deployment Steps

### Step 1: Build Frontend Assets Locally
Before uploading your project, compile the Inertia React frontend into optimized production bundles:
1. Open PowerShell or Terminal in your project root directory.
2. Execute the production build command:
   ```bash
   npm run build
   ```
   *or if using Bun:*
   ```bash
   bun run build
   ```
3. Verify that the `public/build/` directory has been generated containing the compiled JavaScript and CSS bundle assets.

### Step 2: Connect to Server via FTP / SFTP
1. Open your FTP client (such as **WinSCP**, **FileZilla**, or **Cyberduck**).
2. Log in using your cPanel FTP credentials (**Host / Server IP**, **Username**, **Password**, and Port `21` for FTP or `22` for SFTP).

### Step 3: Upload Project Files to Domain Folder
1. Navigate to your target domain root folder on cPanel (e.g., `public_html` or `/ptabb.com/`).
2. Drag and drop all required project files and folders from your local workspace to the domain folder.
   > **Note:** Ensure the newly compiled assets inside `public/build/` are included in the upload.

### Step 4: Configure Production `.env` Environment
1. On the server, locate `.env.example` in your domain root folder, rename it to `.env` (or create a new `.env` file).
2. Open `.env` and set your live production environment values:
   ```ini
   APP_NAME="PT. Pelayaran Andalas Bahtera Baruna"
   APP_ENV=production
   APP_KEY=base64:... # Ensure APP_KEY is set
   APP_DEBUG=false
   APP_URL=https://ptabb.com

   # Production MySQL Database Credentials (from cPanel MySQL Databases)
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=yourusername_ptabb
   DB_USERNAME=yourusername_dbuser
   DB_PASSWORD=your_secure_database_password
   ```

### Step 5: Remove Storage Folder inside `public/`
1. On the server, open the `public/` directory inside your domain folder.
2. If a `storage` folder or shortcut already exists inside `public/`, **delete it**.
   *This ensures a clean slate before generating the official storage link.*

### Step 6: Re-Link Storage via Web Endpoint
Open your web browser and visit the storage linking endpoint to connect `public/storage` to `storage/app/public`:
```http
https://ptabb.com/setup-storage-link
```
> **Expected Output:** `Storage link complete!`

### Step 7: Run Database Migrations & Seeders
Execute database table creation and seed default data by visiting the following web endpoints in order:

1. **Run Migrations:**
   ```http
   https://ptabb.com/run-migrate
   ```
   > **Expected Output:** `Migration complete!`

2. **Run Seeders:**
   ```http
   https://ptabb.com/run-seed
   ```
   > **Expected Output:** `Seeding complete!`

### Step 8: Optimize & Cache Warmup
Cache the route definitions, configuration settings, and Blade views for optimal production performance:

1. **Run Optimization:**
   ```http
   https://ptabb.com/run-optimize
   ```
   > **Expected Output:** `Optimization complete!`

2. **Clear & Refresh Cache:**
   ```http
   https://ptabb.com/clear-cache
   ```
   > **Expected Output:** `Cache clear complete!`

---

## 🛠️ Troubleshooting & Error Recovery Guide

If you encounter a `500 Internal Server Error`, broken image links, or stale page views after uploading, follow these troubleshooting steps in cPanel:

### 1. Remove Cached Route File
1. In cPanel **File Manager**, navigate to `bootstrap/cache/`.
2. Delete the file named `routes-v7.php` (or any cached `routes-*.php` / `config.php` files in this directory).
   *This forces Laravel to reload fresh route definitions.*

### 2. Reset & Re-link Public Storage
1. Navigate to your domain's `public/` directory.
2. Check for and remove the existing `storage` folder/shortcut.
3. Open your browser and re-trigger the storage link endpoint:
   ```http
   https://ptabb.com/setup-storage-link
   ```

### 3. Remove Vite `hot` File
1. In your domain's `public/` directory, check if a file named `hot` or `hot.php` exists.
2. If found, **delete `hot` / `hot.php`**.
   *This prevents Laravel from attempting to connect to a local Vite development server.*

### 4. Re-run Cache Clear & Optimization Endpoints
After performing the steps above, visit these endpoints sequentially in your browser to finalize recovery:
1. `https://ptabb.com/clear-cache`
2. `https://ptabb.com/run-optimize`

---

## 📋 Web Endpoints Quick Reference (`routes/web.php`)

| Endpoint Action | Browser URL | Artisan Command Executed |
| :--- | :--- | :--- |
| **Storage Link** | `GET /setup-storage-link` | `storage:link --force` |
| **Run Migration** | `GET /run-migrate` | `migrate --force` |
| **Run Seeder** | `GET /run-seed` | `db:seed --force` |
| **Optimize System** | `GET /run-optimize` | `config:cache`, `route:cache`, `view:cache` |
| **Clear All Cache** | `GET /clear-cache` | `optimize:clear`, `cache:clear`, `config:clear`, `route:clear`, `view:clear` |
