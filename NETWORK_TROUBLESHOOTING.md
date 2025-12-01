# Network Troubleshooting Guide

## Current Setup

- **Backend IP**: `10.200.158.245`
- **Backend Port**: `8000`
- **API Base URL**: `http://10.200.158.245:8000`

## Checklist When Getting Network Errors

### 1. ✅ Check Backend is Running

```bash
# In backend directory
cd /home/tejast/Documents/Projects/face-recognizer/backend
source venv/bin/activate.fish
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

You should see:

```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started server process
```

### 2. ✅ Test Backend Locally

Open browser and go to:

- **Health Check**: http://localhost:8000/health
- **API Docs**: http://localhost:8000/docs

Should show: `{"status": "healthy"}`

### 3. ✅ Check Your IP Address

```bash
ip addr show | grep "inet " | grep -v "127.0.0.1" | awk '{print $2}' | cut -d/ -f1
```

If IP changed, update `API_BASE_URL` in `/app/index.tsx`

### 4. ✅ Verify Same WiFi Network

- Your phone must be on the **same WiFi network** as your PC
- Check phone WiFi name matches PC WiFi name
- Disable mobile data on phone to ensure it uses WiFi

### 5. ✅ Test Connection from Phone

In your app, tap the 🔗 button (top right) to test backend connection.

Should show: "Backend is running! Status: healthy"

### 6. ✅ Check Firewall

```bash
# Allow port 8000 through firewall (if needed)
sudo ufw allow 8000
# Or temporarily disable firewall for testing
sudo ufw disable
```

### 7. ✅ Test from Browser on Phone

Open phone browser and go to:

```
http://10.200.158.245:8000/health
```

Should show: `{"status": "healthy"}`

## Common Error Messages

### "Network request failed"

- Backend not running
- Wrong IP address
- Different WiFi networks
- Firewall blocking connection

### "Server error: 500"

- Backend crashed
- Check backend terminal for error logs
- Image processing failed

### "Server error: 404"

- Wrong endpoint URL
- Check API_BASE_URL is correct

## Quick Fix Commands

```bash
# Get your IP
ip addr show | grep "inet " | grep -v "127.0.0.1"

# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Restart backend
cd backend && source venv/bin/activate.fish && uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Test from PC
curl http://localhost:8000/health
curl http://10.200.158.245:8000/health
```

## Debug Console Output

The app now has enhanced logging. Check Metro bundler terminal for:

- 🔍 Request being sent
- 📡 API URL being used
- 📤 File being uploaded
- 📥 Response status
- ✅ Success or ❌ Error details

Look for these emoji in your console to track the request flow!
