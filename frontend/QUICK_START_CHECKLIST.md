# DevSwipe Frontend - Quick Start Checklist

## Pre-Start Requirements

- [ ] Node.js installed (v14+)
- [ ] Backend API running on `http://localhost:8000`
- [ ] Backend has required endpoints implemented

## Installation & Setup

- [ ] Navigate to frontend directory: `cd frontend`
- [ ] Install dependencies: `npm install`
- [ ] All dependencies are already in package.json ✓

## Start Development

- [ ] Run dev server: `npm start`
- [ ] App opens at `http://localhost:3000`
- [ ] No compilation errors in console

## Test Authentication

- [ ] Register new account at `/` login page
- [ ] Verify token saved to localStorage
- [ ] Redirect to `/swipe` page after registration
- [ ] Login with registered credentials
- [ ] Verify user info in AuthContext

## Test Core Features

### Swiping Feature (/swipe)
- [ ] Profiles load from API
- [ ] Profile card displays image, name, bio, skills
- [ ] Like button works (POST /api/swipes)
- [ ] Pass button works (POST /api/swipes)
- [ ] Progress indicator shows current/total profiles

### Matches Feature (/matches)
- [ ] Navigation button visible on /swipe page
- [ ] Matches grid loads from API (GET /api/matches)
- [ ] Match cards display correctly
- [ ] Message button navigates to /chat/:matchId

### Chat Feature (/chat/:matchId)
- [ ] Chat page loads previous messages (GET /api/messages/:matchId)
- [ ] Socket.io connects successfully
- [ ] Messages display in chronological order
- [ ] Send message works (POST /api/messages)
- [ ] Sent messages appear immediately
- [ ] New messages from server appear automatically

## Test Navigation

- [ ] Login page → Register page toggle works
- [ ] /swipe → /matches navigation works
- [ ] /matches → /chat/:matchId navigation works
- [ ] /chat → /matches back button works
- [ ] Logout button clears session and redirects to /

## Test Protected Routes

- [ ] Accessing /swipe while logged out redirects to /
- [ ] Accessing /matches while logged out redirects to /
- [ ] Accessing /chat/:matchId while logged out redirects to /

## Test Error Handling

- [ ] 401 error clears token and redirects to login
- [ ] Network errors show error messages
- [ ] API errors display appropriate messages
- [ ] Invalid form input shows validation messages

## Test Responsive Design

- [ ] Test on desktop (1920px+)
- [ ] Test on tablet (768px)
- [ ] Test on mobile (375px)
- [ ] All layouts are readable and functional

## Test Styling

- [ ] Bootstrap classes applied correctly
- [ ] Custom CSS loaded properly
- [ ] Animations are smooth (0.3s transitions)
- [ ] No Tailwind CSS classes present
- [ ] No Framer Motion animations used

## Browser Testing

- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

## Code Quality

- [ ] No console errors
- [ ] No console warnings (except vendor warnings)
- [ ] All imports are correct
- [ ] PropTypes defined where used
- [ ] No unused variables

## Performance

- [ ] App loads within 3 seconds
- [ ] Page transitions are smooth
- [ ] No noticeable lag when swiping
- [ ] Chat messages load quickly

## Documentation Review

- [ ] Read FRONTEND_SETUP.md
- [ ] Read API_INTEGRATION_GUIDE.md
- [ ] Review components/README.md
- [ ] Understand folder structure

## Backend Integration Checklist

- [ ] Backend has all required endpoints
- [ ] Bearer token authentication implemented
- [ ] CORS configured for `http://localhost:3000`
- [ ] Socket.io server running
- [ ] Database migrations completed
- [ ] Sample user data available

### Required Backend Endpoints

- [ ] `POST /api/auth/register` - Returns {user, token}
- [ ] `POST /api/auth/login` - Returns {user, token}
- [ ] `GET /api/profiles` - Returns array of profiles
- [ ] `GET /api/users/:userId` - Returns user profile
- [ ] `GET /api/matches` - Returns array of matches
- [ ] `GET /api/messages/:matchId` - Returns message history
- [ ] `POST /api/messages` - Creates message
- [ ] `POST /api/swipes` - Records swipe action

### Socket.io Events

- [ ] `joinChat` - Client joins chat room
- [ ] `sendMessage` - Client sends message
- [ ] `newMessage` - Server broadcasts new message
- [ ] `error` - Error event handling

## Feature Enhancements (Future)

- [ ] Add profile filtering options
- [ ] Implement message search
- [ ] Add typing indicators
- [ ] Add read receipts
- [ ] Implement notifications
- [ ] Add image upload
- [ ] Add user profile editing
- [ ] Add match history
- [ ] Add user blocking feature
- [ ] Add advanced search filters

## Known Limitations

- [ ] Messages stored in localStorage (consider backend persistence)
- [ ] No message persistence across sessions (will be fixed with backend)
- [ ] Profile images must be URLs (consider file upload)
- [ ] No image compression (may need optimization)
- [ ] Limited error messages (can be more specific)

## Debugging Tools

### Check Token
```javascript
console.log('Token:', localStorage.getItem('token'));
console.log('User:', JSON.parse(localStorage.getItem('user') || '{}'));
```

### Check API Response
```javascript
// In browser console
const axiosInstance = require('./src/api/axiosConfig').default;
await axiosInstance.get('/profiles');
```

### Check Socket Connection
```javascript
// Look in browser console for connection messages
// Check Network tab → WS for socket connection
```

### Check State
```javascript
// React DevTools browser extension
// Check AuthContext provider
```

## Common Issues & Solutions

### Issue: "Cannot GET /swipe"
**Solution**: Ensure routing is working. Check App.jsx and index.js

### Issue: 401 Errors
**Solution**: Clear localStorage, logout, and login again

### Issue: Socket.io not connecting
**Solution**: Check backend is running, verify token is being sent

### Issue: Profile images not loading
**Solution**: Check image URLs in API response, verify CORS headers

### Issue: Buttons not responding
**Solution**: Check console for errors, verify onClick handlers

### Issue: Styles not applying
**Solution**: Clear browser cache, verify CSS imports

## Next Steps After Setup

1. **Read Documentation**
   - FRONTEND_SETUP.md
   - API_INTEGRATION_GUIDE.md
   - components/README.md

2. **Understand Architecture**
   - Review App.jsx routing
   - Review AuthContext
   - Review axiosConfig

3. **Create Components**
   - Use COMPONENT_TEMPLATE.jsx
   - Add reusable UI components
   - Follow existing patterns

4. **Add Features**
   - New pages in src/pages/
   - New API calls via axiosInstance
   - New components in src/components/

5. **Test Thoroughly**
   - Unit tests for components
   - Integration tests for API
   - E2E tests for user flows

## Support & Resources

- **React**: https://react.dev
- **React Router**: https://reactrouter.com
- **Bootstrap**: https://getbootstrap.com
- **Axios**: https://axios-http.com
- **Socket.io**: https://socket.io
- **MDN Web Docs**: https://developer.mozilla.org

## Final Notes

✅ **Frontend is fully set up and ready!**

- All folders created
- All files generated
- Dependencies installed
- Boilerplate code ready
- Documentation complete

**You're ready to start development!** 🚀

Just ensure your backend is running and follow this checklist to verify everything works.

---

**Last Updated**: June 2026
**Frontend Version**: 1.0.0
**React Version**: 19.2.7
