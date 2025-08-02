# 🚀 How to Use Windows Scripts

## 📋 Preparation

1. **Open PowerShell as Administrator:**
   - Right-click on the PowerShell icon
   - Select "Run as administrator"

2. **Navigate to the scripts directory:**
   ```powershell
   cd "C:\path\to\just-dance-event-hub\scripts"
   ```

3. **Check execution policy:**
   ```powershell
   Get-ExecutionPolicy
   ```
   
   If the policy is "Restricted", temporarily change it to allow script execution:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
   ```

## 🔧 Execution

### 1. Installation
```powershell
.\install-windows.ps1
```

The script will:
- Check and install dependencies (Node.js, PostgreSQL, PM2)
- Configure PostgreSQL database
- Set up environment variables (.env)
- Install application dependencies
- Build the application
- Configure PM2 for process management
- Create an admin user

### 2. Health Check
```powershell
.\health-check-windows.ps1
```

The script will check:
- Application installation
- System dependencies
- PostgreSQL and database
- PM2 and application status
- Application logs
- System resources
- API and endpoints

### 3. Uninstallation
```powershell
.\uninstall-windows.ps1
```

The script will:
- Stop services
- Optionally backup the database
- Remove the database (optional)
- Remove application files
- Remove global dependencies (optional)

## 📝 Complete Session Example

```powershell
# 1. Open PowerShell as Administrator

# 2. Navigate to the scripts directory
cd "C:\Users\username\just-dance-event-hub\scripts"

# 3. Allow script execution
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process

# 4. Run installation
.\install-windows.ps1

# 5. Follow on-screen instructions:
# - Enter PostgreSQL password
# - Choose whether to build the frontend
# - Enter admin user email and password

# 6. Verify installation
.\health-check-windows.ps1

# 7. Test API
Invoke-WebRequest -Uri http://localhost:5000/api/health
```

## 🔧 Management Commands

After installation, use the created management script:

```powershell
# Start application
.\just-dance-hub.ps1 start

# Stop application
.\just-dance-hub.ps1 stop

# Restart application
.\just-dance-hub.ps1 restart

# View status
.\just-dance-hub.ps1 status

# View logs
.\just-dance-hub.ps1 logs

# Monitor resources
.\just-dance-hub.ps1 monit

# Start in development mode
.\just-dance-hub.ps1 dev
```

## 🚨 Troubleshooting

### If scripts don't execute:
```powershell
# Check execution policy
Get-ExecutionPolicy

# Allow execution for current process only
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process

# Run with explicit bypass
PowerShell -ExecutionPolicy Bypass -File .\install-windows.ps1
```

### If PostgreSQL is not accessible:
```powershell
# Check if service is running
Get-Service -Name postgresql*

# Start the service
Start-Service -Name postgresql*

# Verify connection
psql -U postgres -c "SELECT version();"
```

### If Node.js is not in PATH:
```powershell
# Verify installation
where.exe node

# Add to PATH temporarily
$env:Path += ";C:\Program Files\nodejs"
```

### If application doesn't start:
```powershell
# Check PM2 logs
pm2 logs

# Restart PM2
pm2 resurrect
pm2 reload all

# Check environment variables
Get-Content .\backend\.env
```

### Detailed verification:
```powershell
# Check database
psql -U postgres -c "\l"

# Check tables
psql -U postgres -d just_dance_hub -c "\dt"

# Check Node.js processes
Get-Process -Name node

# Check ports in use
netstat -ano | findstr "3000 5000"
```

---

**Remember:** Always backup before any critical operation!