# package-deployment.ps1
# Automates the packaging of Laravel + Inertia.js React application for cPanel deployment

$ErrorActionPreference = "Stop"

Write-Host "==============================================" -ForegroundColor Green
Write-Host "   Laravel + React cPanel Packager            " -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green

Write-Host "1. Building frontend assets..." -ForegroundColor Cyan
bun run build

Write-Host "2. Preparing temporary directory..." -ForegroundColor Cyan
$tempDir = Join-Path $PSScriptRoot "deploy_temp"
$zipFile = Join-Path $PSScriptRoot "ptabb_deploy.zip"

# Clean up previous runs
if (Test-Path $tempDir) { Remove-Item -Recurse -Force $tempDir }
if (Test-Path $zipFile) { Remove-Item -Force $zipFile }

New-Item -ItemType Directory -Path $tempDir | Out-Null

Write-Host "3. Copying files to temporary directory..." -ForegroundColor Cyan
# Copy all directories and files except excluded ones
$excludeList = @("node_modules", ".git", ".github", "deploy_temp", "tests", "package-deployment.ps1", "ptabb_deploy.zip")
Get-ChildItem -Path $PSScriptRoot -Exclude $excludeList | ForEach-Object {
    $dest = Join-Path $tempDir $_.Name
    Copy-Item -Path $_.FullName -Destination $dest -Recurse -Force
}

# Clean storage directories but keep folders intact
$storagePaths = @(
    "storage/framework/cache/data",
    "storage/framework/sessions",
    "storage/framework/views",
    "storage/logs"
)
foreach ($path in $storagePaths) {
    $fullPath = Join-Path $tempDir $path
    if (Test-Path $fullPath) {
        Remove-Item -Path "$fullPath\*" -Force -Recurse -ErrorAction SilentlyContinue | Out-Null
    }
}

# Remove local .env and database backups from the zip to avoid security leakage
$sensitiveFiles = @(".env", "*.sql")
foreach ($file in $sensitiveFiles) {
    Remove-Item -Path (Join-Path $tempDir $file) -Force -ErrorAction SilentlyContinue | Out-Null
}

Write-Host "4. Creating ZIP archive: ptabb_deploy.zip..." -ForegroundColor Cyan
Compress-Archive -Path "$tempDir\*" -DestinationPath $zipFile -Force

Write-Host "5. Cleaning up temporary files..." -ForegroundColor Cyan
Remove-Item -Recurse -Force $tempDir

Write-Host "==============================================" -ForegroundColor Green
Write-Host "Done! Your production package 'ptabb_deploy.zip' is ready for upload." -ForegroundColor Green
Write-Host "File location: $zipFile" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green
