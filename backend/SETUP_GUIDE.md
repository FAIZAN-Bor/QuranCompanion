# Quran Companion Backend - Setup Guide

## Prerequisites

Before you begin, ensure you have:
- Node.js (v20 or higher) installed
- MongoDB Atlas account (free tier available)
- Gmail account for sending OTP emails

## Step-by-Step Setup

### 1. MongoDB Atlas Configuration

#### Create Database Cluster
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up or login
3. Click "Create" to create a new cluster
4. Choose **FREE** tier (M0 Sandbox)
5. Select your preferred region (closest to you)
6. Click "Create Cluster" (takes 1-3 minutes)

#### Create Database User
1. Click "Database Access" in left sidebar
2. Click "Add New Database User"
3. Create username and password (save these!)
4. Set privileges to "Read and write to any database"
5. Click "Add User"

#### Configure Network Access
1. Click "Network Access" in left sidebar
2. Click "Add IP Address"
3. For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
4. For production: Add your specific IP
5. Click "Confirm"

#### Get Connection String
1. Click "Database" in left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Replace `<dbname>` with `quran-companion`

Example:
```
mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/quran-companion?retryWrites=true&w=majority
```

### 2. Gmail App Password Setup

#### Enable 2-Factor Authentication
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable "2-Step Verification" if not already enabled

#### Generate App Password
1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select "Mail" and "Windows Computer" (or Other)
3. Click "Generate"
4. Copy the 16-character password (remove spaces)
5. This is your `EMAIL_PASSWORD` for .env

### 3. Environment Configuration

Update your `.env` file:

```env
# Environment
NODE_ENV=development

# Server
PORT=5000

# MongoDB - Paste your connection string here
MONGODB_URI=mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/quran-companion?retryWrites=true&w=majority

# JWT - Use a strong random secret in production
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=30d

# Email - Your Gmail credentials
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 4. Install Dependencies

```bash
cd backend
npm install
```

### 5. Start the Server

Development mode (with auto-restart):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

### 6. Verify Installation

Open your browser and visit:
```
http://localhost:5000
```

You should see:
```json
{
  "success": true,
  "message": "Quran Companion API is running",
  "version": "1.0.0",
  "timestamp": "2025-12-04T..."
}
```

## Testing the API

### 1. Test Signup

```bash
# Windows PowerShell
$body = @{
    name = "Test User"
    email = "test@example.com"
    password = "password123"
    role = "child"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/signup" -Method Post -Body $body -ContentType "application/json"
```

### 2. Check Email

You should receive an OTP email at the provided email address.

### 3. Verify OTP

```bash
$body = @{
    email = "test@example.com"
    otp = "123456"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/verify-otp" -Method Post -Body $body -ContentType "application/json"
```

### 4. Login

```bash
$body = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $body -ContentType "application/json"
```

## Troubleshooting

### MongoDB Connection Issues

**Problem**: "MongoNetworkError: failed to connect"
**Solution**: 
- Check your connection string is correct
- Verify IP address is whitelisted (0.0.0.0/0 for development)
- Ensure password doesn't contain special characters (use alphanumeric)

### Email Not Sending

**Problem**: OTP emails not arriving
**Solution**:
- Verify Gmail app password is correct (no spaces)
- Check 2-factor authentication is enabled
- Try generating a new app password
- Check spam folder

### Port Already in Use

**Problem**: "Port 5000 is already in use"
**Solution**:
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or change PORT in .env
PORT=3000
```

### Module Not Found

**Problem**: "Cannot find module 'xyz'"
**Solution**:
```bash
# Delete node_modules and reinstall
Remove-Item -Recurse -Force node_modules
npm install
```

## Next Steps

1. **Populate Content**: Use your admin web interface to add Quran, Qaida, and Dua content
2. **Test All Endpoints**: Use Postman or similar tool to test all API routes
3. **Connect Frontend**: Update mobile app API URL to `http://your-ip:5000/api`
4. **Deploy**: Consider deploying to Heroku, Railway, or AWS for production

## Security Checklist

Before deploying to production:

- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Set `NODE_ENV=production`
- [ ] Restrict MongoDB IP whitelist to your server IP
- [ ] Use environment variables (never commit .env)
- [ ] Enable HTTPS/SSL
- [ ] Set up proper CORS origins
- [ ] Add rate limiting
- [ ] Enable MongoDB Atlas monitoring
- [ ] Set up error tracking (Sentry, etc.)

## Support

For issues or questions:
- Check the main README.md for API documentation
- Review error logs in the console
- Verify all environment variables are set correctly
