# Quick Reference Card

## 🚀 Startup

### Start Backend (Port 5000)
```bash
cd backend
npm start
```

### Start Frontend (Port 3000)
```bash
cd frontend
npm start
# Already running if you see preview
```

### Check if Running
```bash
curl http://localhost:5000/api/health  # Backend
curl http://localhost:3000              # Frontend
```

---

## 📝 Testing Flow

### 1. Register
- Go to http://localhost:3000
- Enter: name, email, password (6+ chars)
- Click Register

### 2. Swipe
- See profile name, bio, tech skills
- Click Like or Pass
- Next profile loads

### 3. Matches
- Click "Matches" button
- See list of matched users
- Click "Message" on a match

### 4. Chat
- See conversation history
- Type message
- Click Send
- Message appears after ~2 seconds

---

## 🐛 Debugging

### Check Status
```javascript
// Browser Console (F12)
localStorage.getItem('token')      // Should exist
localStorage.getItem('user')       // Should exist
```

### View Logs
```javascript
// Filter console:
[API        // All API calls
[AuthPage   // Auth errors
[SwipePage  // Swipe issues
[ChatPage   // Message issues
```

### Check Network
1. DevTools → Network tab
2. Do an action (register, swipe, send message)
3. Look for requests to `localhost:5000`
4. Check Response tab for errors

---

## 📡 API Endpoints Quick Map

| Action | Method | Endpoint | Notes |
|--------|--------|----------|-------|
| Register | POST | `/auth/register` | Body: name, email, password |
| Login | POST | `/auth/login` | Body: email, password |
| Get Profile | GET | `/swipe/next` | Next profile to swipe |
| Swipe | POST | `/swipe` | Body: swipedId, action |
| Get Matches | GET | `/matches` | Array of matches |
| Get Messages | GET | `/messages/:matchId` | Message history |
| Send Message | POST | `/messages` | Body: matchId, content |

---

## 🔑 Authorization

All requests except `/auth/*` need:
```
Authorization: Bearer <token>
```

Token auto-attached by axios interceptor (axiosConfig.js)

---

## ⚠️ Common Errors

| Error | Fix |
|-------|-----|
| Can't connect to API | Start backend on port 5000 |
| Login fails | Check email/password, see console |
| No profiles | Check backend returning data |
| Messages don't send | Verify matchId, check console |
| Blank page | Hard refresh: Ctrl+Shift+R |
| Token expired | Logout and login again |

---

## 📂 Important Files

| File | Purpose |
|------|---------|
| `src/api/axiosConfig.js` | API configuration + auth |
| `src/pages/AuthPage.jsx` | Login/Register form |
| `src/pages/SwipePage.jsx` | Swiping cards |
| `src/pages/MatchesPage.jsx` | Matches list |
| `src/pages/ChatPage.jsx` | Messaging |
| `src/context/AuthContext.jsx` | User auth state |

---

## 🎯 Key Changes (vs Original)

| File | Issue | Fix |
|------|-------|-----|
| axiosConfig.js | Wrong port (8000 → 5000) | ✅ Updated |
| AuthPage.jsx | No validation | ✅ Added checks |
| SwipePage.jsx | Wrong endpoints | ✅ Fixed to `/swipe/next` |
| MatchesPage.jsx | Wrong field names | ✅ Updated to `match.user.*` |
| ChatPage.jsx | Socket.io (not implemented) | ✅ Switched to polling |

---

## 📱 User Flow

```
[Login Page] 
    ↓ (register/login)
[Swipe Page] 
    ↓ (click Matches)
[Matches Page] 
    ↓ (click Message)
[Chat Page] 
    ↓ (click Back)
[Matches Page]
    ↓ (click Back to Swiping)
[Swipe Page]
```

---

## 💾 Local Storage

What gets stored:
- `token`: JWT authentication token
- `user`: Current user JSON object

To clear:
```javascript
localStorage.clear()
```

---

## 🔄 Polling (Messages)

Messages fetch every 2 seconds automatically:
- ✅ No real-time overhead
- ⏳ 2 second delay on new messages
- Can be changed in ChatPage.jsx line: `setInterval(fetchMessages, 2000)`

---

## 📊 Database Structure Reference

```javascript
// User
{ _id, email, password, name }

// Profile
{ _id, userId, bio, githubUrl, techStack }

// Swipe
{ _id, swiperId, swipedId, action, timestamp }

// Match
{ _id, developer1Id, developer2Id, createdAt }

// Message
{ _id, matchId, senderId, receiverId, content, timestamp }
```

---

## 🛠️ Environment Setup

### Frontend (.env if needed)
```
REACT_APP_API_URL=http://localhost:5000/api
```

### Backend (.env)
```
PORT=5000
DB_URL=mongodb://...
JWT_SECRET=your_secret_key
```

---

## 📞 Support Files

1. **FIXES_AND_CHANGES.md** - What was fixed and why
2. **TROUBLESHOOTING.md** - Detailed troubleshooting
3. **API_INTEGRATION_GUIDE.md** - Full API documentation
4. **IMPLEMENTATION_SUMMARY.md** - Overview of implementation

---

## ✅ Pre-Flight Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] Browser console shows no errors
- [ ] Can create account / login
- [ ] Can see profile on swipe page
- [ ] Can send message in chat
- [ ] localStorage has token

---

## 🎓 Learning Resources

Files to read in order:
1. **QUICK_REFERENCE.md** (this file) - Overview
2. **IMPLEMENTATION_SUMMARY.md** - What was fixed
3. **FIXES_AND_CHANGES.md** - Detailed changes
4. **TROUBLESHOOTING.md** - Problem solving
5. **API_INTEGRATION_GUIDE.md** - API details

---

**Last Updated**: 2026-06-30  
**Status**: ✅ Ready for Testing

For detailed information, see related documentation files.
