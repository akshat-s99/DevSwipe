# Network Error - Quick Fix Guide

## What's Wrong?
You're seeing "Network Error" on the registration form because **the backend server is not running**.

## Quick Fix (3 Steps)

### Step 1: Open a New Terminal
```bash
# You should have 2 terminals open:
# Terminal 1 (already running): frontend on localhost:3000
# Terminal 2 (new): for backend
```

### Step 2: Start the Backend Server
```bash
cd /vercel/share/v0-project/backend
npm install
npm start
```

**Expected Output:**
```
> backend@1.0.0 start
> node server.js

Server running on port 5000
MongoDB connected (if using MongoDB)
```

### Step 3: Test in Browser
1. Go to `http://localhost:3000`
2. Fill in registration form
3. Click "Register"
4. Should work now!

---

## What's Different in the New UI?

### ✨ Design Changes
- **Dark Theme**: Black background instead of light gray
- **Green Accent**: Buttons and highlights now green instead of purple
- **Premium Feel**: Darker cards with subtle borders
- **Smooth Animations**: Cards slide in, buttons lift on hover
- **Better Errors**: Clear messages like "Cannot connect to server..."

### 🎨 Color Scheme
- **Background**: `#0f0f0f` (Almost black)
- **Primary**: `#22c55e` (Vibrant green)
- **Text**: `#e0e0e0` (Light gray)
- **Cards**: Dark gradient with green borders

---

## Troubleshooting

### Issue: Still seeing old colors (blue/purple)
**Solution**: Hard refresh your browser
- Windows: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

### Issue: Cannot access backend
**Check**: 
```bash
# Is backend running?
ps aux | grep node

# Is port 5000 free?
lsof -i :5000

# Check backend folder exists
ls -la /vercel/share/v0-project/backend/
```

### Issue: Backend won't start
**Try**:
```bash
cd /vercel/share/v0-project/backend
npm install  # Reinstall dependencies
npm start
```

---

## Backend Requirements

For the app to work fully, the backend must:

| Requirement | Details |
|------------|---------|
| Running | `npm start` from backend directory |
| Port | 5000 |
| URL | `http://localhost:5000` |
| Endpoints | /api/auth/register, /api/auth/login, etc. |
| Database | MongoDB (if configured) |

---

## Frontend is Ready!

The frontend is **already running on port 3000** with:

✅ Brand new dark theme UI
✅ Professional design
✅ All pages configured
✅ Error handling
✅ Mobile responsive

**Just need backend running to:**
- Register accounts
- Login
- Swipe profiles
- View matches
- Send messages

---

## Next: Try These Features

Once backend is running:

1. **Register** - Create a new account
2. **Login** - Login with credentials
3. **Swipe** - See profiles and like/pass
4. **Matches** - View matched developers
5. **Chat** - Send messages

---

## Quick Verification

Terminal 1 (Frontend):
```
✓ React app running on http://localhost:3000
✓ Port: 3000
✓ Status: Already running
```

Terminal 2 (Backend) - START THIS:
```
cd backend && npm start
✓ Server running on http://localhost:5000
✓ Port: 5000
✓ Status: Start it now!
```

---

**That's it!** The "Network Error" should disappear once the backend is running. The new UI will be live immediately!
