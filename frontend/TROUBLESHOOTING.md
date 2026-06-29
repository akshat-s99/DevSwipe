# Frontend Troubleshooting Guide

## Common Issues & Solutions

### 1. Registration/Login Fails with "An error occurred"

**Problem**: You see an error but don't know what went wrong

**Solution**:
1. Open Browser DevTools: Press `F12`
2. Go to the **Console** tab
3. Try registering/logging in again
4. Look for messages starting with `[AuthPage]`
5. Check what the actual error is:
   - `Email already exists` → Use different email
   - `Missing fields` → Fill all fields
   - `Passwords do not match` → Make sure passwords match
   - `Password must be at least 6 characters` → Use longer password
   - Backend connection error → Ensure backend is running (see below)

**Check Backend Connection**:
1. Go to **Network** tab in DevTools
2. Try registering/logging in
3. Look for request to `http://localhost:5000/api/auth/register`
4. If it fails to connect, backend isn't running
5. If status is 500, backend has an error

---

### 2. "Failed to load profiles" or No profiles showing

**Problem**: Swipe page loads but no profiles appear

**Solution**:
1. Check browser console for `[SwipePage]` logs
2. In Network tab, check if request to `/swipe/next` is successful
3. Possible causes:
   - No profiles in database
   - Backend token validation failing
   - Database connection issue

**Fix**:
```javascript
// In browser console, check if you're logged in:
localStorage.getItem('token')    // Should show a long token string
localStorage.getItem('user')     // Should show user JSON
```

If either is empty, you're not logged in - logout and login again.

---

### 3. Messages not sending or loading

**Problem**: Chat page shows but messages aren't working

**Solution**:
1. Check console for `[ChatPage]` logs
2. In Network tab, check `/messages/:matchId` requests
3. Look for errors like:
   - **403 Forbidden** → You're not part of this match
   - **404 Not Found** → Match doesn't exist
   - **401 Unauthorized** → Token expired, logout and login again

**If messages send but don't appear**:
- Messages fetch every 2 seconds via polling
- Wait a moment for them to refresh
- Manually refresh page (F5) to see latest

**Check message structure**:
```javascript
// In browser console:
// Get the last message to see its structure:
JSON.stringify(messages[messages.length - 1], null, 2)
```

---

### 4. Blank page or "Loading..." stuck

**Problem**: Page won't load or stays on loading state

**Solution**:
1. Check browser console for errors
2. Check Network tab - see if requests are hanging
3. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
4. Check if backend is running:
   ```bash
   # In terminal, check if port 5000 is in use:
   lsof -i :5000  # Mac/Linux
   netstat -an | find ":5000"  # Windows
   ```

**If backend isn't running**:
```bash
# Start the backend from backend directory:
npm start  # or node server.js
```

---

### 5. Token/Authentication Issues

**Problem**: Getting redirected to login unexpectedly

**Solution**:
1. Token might have expired
2. Session was cleared
3. Logout and login again to get fresh token

**To manually check token**:
```javascript
// In browser console:
const token = localStorage.getItem('token');
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('Token decoded:', payload);
  console.log('Expires at:', new Date(payload.exp * 1000));
} else {
  console.log('No token found - user not logged in');
}
```

---

### 6. CORS or Network Errors

**Problem**: Console shows "CORS error" or network fails

**Likely cause**: Backend isn't running or wrong port

**Solution**:
1. Verify backend is running on port 5000
2. In a terminal, run: `curl http://localhost:5000/api/health`
3. Should see a response (not "Connection refused")

**If you see "Connection refused"**:
```bash
# Ensure backend is running:
cd backend
npm start  # or node server.js
# Should see: "Server running on port 5000"
```

---

### 7. Form Validation Errors

**Problem**: Can't submit login/register form

**Causes & Solutions**:

| Error | Solution |
|-------|----------|
| "Email is required" | Enter an email address |
| "Password is required" | Enter a password |
| "Name is required" | (Registration only) Enter your name |
| "Passwords do not match" | Make sure both passwords are identical |
| "Password must be at least 6 characters" | Use a longer password |
| "Email already exists" | (Registration) Try a different email |

---

## Browser Console Logging Format

All logs follow this pattern: `[ComponentName] Description`

**Examples**:
- `[API Request] POST http://localhost:5000/api/auth/login`
- `[AuthPage] Login successful: {...}`
- `[SwipePage] Swiping: like on profile: 507f1f77bcf86cd799439012`
- `[ChatPage] Fetching messages for match: 507f1f77bcf86cd799439013`
- `[API Error] 401 Unauthorized`

**How to filter logs**:
1. Open browser console
2. Type in filter: `[AuthPage]` to see only auth logs
3. Or: `[API` to see all API logs
4. Or: `Error` to see only errors

---

## Network Tab Debugging

### How to check API calls:

1. Open DevTools → Network tab
2. Do an action (login, swipe, send message)
3. Look for requests to `localhost:5000`
4. Click on each request to see:
   - **Request Headers** - Shows Authorization token
   - **Request Body** - What data was sent
   - **Response** - What server returned
   - **Status** - HTTP status code (200, 401, 404, 500, etc.)

### Common Status Codes:

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | ✅ Everything working |
| 201 | Created | ✅ Resource created (register/login) |
| 400 | Bad Request | ❌ Check request body and field names |
| 401 | Unauthorized | ❌ Token missing/invalid, login again |
| 403 | Forbidden | ❌ You don't have permission |
| 404 | Not Found | ❌ Endpoint/resource doesn't exist |
| 500 | Server Error | ❌ Backend error, check backend logs |

---

## Local Storage Debugging

Check what's stored locally:

```javascript
// In browser console:

// Check if user is logged in:
console.log('Token:', localStorage.getItem('token'));
console.log('User:', localStorage.getItem('user'));

// Clear all (if needed):
localStorage.clear();

// Check specific key:
console.log(localStorage.getItem('token'));
```

---

## Refresh & Cache Issues

**If something seems broken after code changes**:

1. **Hard refresh**: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. **Clear cache**: DevTools → Application → Storage → Clear all
3. **Restart dev server**: Kill `npm start` and run again
4. **Check file saves**: Make sure edited files were actually saved

---

## Backend Connection Checklist

Before debugging frontend, verify backend is working:

```bash
# 1. Check if backend is running
ps aux | grep node

# 2. Test direct connection
curl http://localhost:5000/api/health

# 3. Check backend logs for errors
# (Look at terminal where backend is running)

# 4. Verify database connection
# (Check MongoDB/database running and connected)

# 5. Check environment variables
# (Backend should have correct DB_URL, JWT_SECRET, etc.)
```

---

## Performance Issues

**If app is slow or laggy**:

1. **Check Network** - Requests taking too long?
   - Slow backend response
   - Slow database queries
   - Network latency

2. **Check Console** - Too many logs?
   - Might be slowing browser
   - Disable console logging in production

3. **Check Memory** - DevTools → Memory tab
   - Memory leaks
   - Too many re-renders

4. **Polling Speed** - Chat polling every 2 seconds
   - Might cause lag on slow connection
   - Can be increased to 5 seconds in ChatPage.js

---

## Browser DevTools Tips

### Show only errors:
```javascript
// Filter console to show only errors and warnings
```

### Copy formatted logs:
```javascript
// Copy data for sharing:
copy(localStorage.getItem('user'))
copy(messages)
```

### Pause on error:
- DevTools → Sources → Enable "Pause on exceptions"
- Code will pause when error happens

---

## Getting Help

When reporting an issue, include:

1. **Error message** - Exact text from alert or console
2. **Console logs** - Screenshot or copy of `[v0]` logs
3. **Network tab** - Request/response details
4. **Steps to reproduce** - What you were doing
5. **Browser** - Chrome, Firefox, Safari, Edge
6. **Backend status** - Is it running? Any errors?

---

## Quick Fixes

### Page won't load
```bash
# Hard refresh
Ctrl+Shift+R or Cmd+Shift+R

# Clear cache
DevTools → Application → Storage → Clear All

# Restart dev server
# Kill: Ctrl+C in terminal
# Restart: npm start
```

### Login not working
```javascript
// Clear stored credentials
localStorage.clear()
// Try logging in again with correct email/password
```

### Messages not updating
```javascript
// Manually refresh chat page
// Or wait for next poll (every 2 seconds)
// Or check console for errors
```

### API connection issues
```bash
# Verify backend running
ps aux | grep node

# Test connection
curl http://localhost:5000/api/health

# Check port
lsof -i :5000  # Mac/Linux
netstat -an | find ":5000"  # Windows
```

---

## Reference Files

- **API Integration**: See `API_INTEGRATION_GUIDE.md`
- **Changes Made**: See `FIXES_AND_CHANGES.md`
- **Setup Info**: See `FRONTEND_SETUP.md`
- **Component Guide**: See `src/components/README.md`

---

Last Updated: 2026-06-30
