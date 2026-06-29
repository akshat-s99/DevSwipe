# DevSwipe Frontend Setup

## Project Structure

```
frontend/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── api/
│   │   └── axiosConfig.js         # Axios instance with interceptors
│   ├── components/                 # Reusable components (to be created)
│   ├── context/
│   │   └── AuthContext.jsx         # Authentication context provider
│   ├── pages/
│   │   ├── AuthPage.jsx            # Login/Register page
│   │   ├── SwipePage.jsx           # Swiping interface
│   │   ├── MatchesPage.jsx         # Matches dashboard
│   │   └── ChatPage.jsx            # Messaging interface
│   ├── styles/
│   │   ├── AuthPage.css
│   │   ├── SwipePage.css
│   │   ├── MatchesPage.css
│   │   └── ChatPage.css
│   ├── App.jsx                     # Main app with routing
│   ├── App.css
│   ├── index.js                    # Entry point
│   └── index.css
├── package.json
└── FRONTEND_SETUP.md
```

## Technologies

- **React 19.2.7** - UI library
- **React Router DOM 7.18** - Routing
- **Axios 1.18.1** - HTTP client with interceptors
- **Bootstrap 5.3.8** - CSS framework
- **Socket.io Client 4.8.3** - Real-time messaging
- **Vanilla CSS** - Styling (no Tailwind CSS)

## Setup Instructions

### 1. Install Dependencies

```bash
cd frontend
npm install
```

All required dependencies are already in `package.json`.

### 2. Environment Configuration

Create `.env` file in the frontend directory (if needed):

```
REACT_APP_API_URL=http://localhost:8000/api
```

### 3. Start Development Server

```bash
npm start
```

The app will open at `http://localhost:3000` and automatically reload on file changes.

## Features

### 1. Authentication System (`src/context/AuthContext.jsx`)

- User login and registration
- Token-based authentication
- Persistent sessions (localStorage)
- Auto-logout on token expiration

### 2. API Layer (`src/api/axiosConfig.js`)

- Centralized Axios instance
- Auto-attach Bearer token to all requests
- Request interceptor for authentication
- Response interceptor for error handling
- Auto-redirect to login on 401 errors

### 3. Routing (`src/App.jsx`)

- `/` - Login/Register (public)
- `/swipe` - Profile swiping interface (protected)
- `/matches` - Matches dashboard (protected)
- `/chat/:matchId` - Direct messaging (protected)

Protected routes redirect unauthenticated users to login.

### 4. Pages

#### AuthPage (`src/pages/AuthPage.jsx`)
- Toggle between login and registration
- Form validation
- Error handling
- Redirects to `/swipe` on successful auth

#### SwipePage (`src/pages/SwipePage.jsx`)
- Loads user profiles
- Swipe left (pass) or right (like)
- Profile information display
- Skills display with badges
- Progress indicator

#### MatchesPage (`src/pages/MatchesPage.jsx`)
- Grid display of all matches
- Profile cards with images
- Quick navigation to chat
- Skills preview

#### ChatPage (`src/pages/ChatPage.jsx`)
- Real-time messaging with Socket.io
- Message history display
- Auto-scroll to latest message
- Timestamp display
- User-friendly message bubbles

## API Integration

All pages follow the data structures defined in the backend API contract:

### Auth Endpoints
- `POST /api/auth/register` - Register new user
  ```json
  { "name": "string", "email": "string", "password": "string" }
  ```
- `POST /api/auth/login` - Login user
  ```json
  { "email": "string", "password": "string" }
  ```

### User Endpoints
- `GET /api/users/:userId` - Get user profile
- `GET /api/profiles` - Get profiles for swiping

### Swipe Endpoints
- `POST /api/swipes` - Record swipe action
  ```json
  { "targetUserId": "string", "action": "like|pass" }
  ```

### Match Endpoints
- `GET /api/matches` - Get all matches

### Message Endpoints
- `GET /api/messages/:matchId` - Get chat history
- `POST /api/messages` - Send message
  ```json
  { "recipientId": "string", "content": "string" }
  ```

## Styling

### Bootstrap 5
- Imported via CDN in `public/index.html` (if using CDN)
- Or via npm package: `import 'bootstrap/dist/css/bootstrap.min.css'`

### Custom CSS
- All pages have dedicated CSS files in `src/styles/`
- Global styles in `src/App.css` and `src/index.css`
- Standard CSS with transitions for smooth animations
- No Tailwind CSS or Framer Motion

### Color Scheme
- Primary: `#667eea` (Purple)
- Secondary: `#764ba2` (Dark Purple)
- Success: `#28a745` (Green)
- Danger: `#dc3545` (Red)
- Light: `#f8f9fa`

## Local Storage

The app uses localStorage for:
- `token` - JWT authentication token
- `user` - Current user object (JSON)

These are automatically managed by the AuthContext.

## Socket.io Integration

Real-time messaging uses Socket.io:
- Connection established on ChatPage mount
- Emits: `joinChat`, `sendMessage`
- Listens: `newMessage`, `error`
- Auto-disconnect on component unmount

## Development Tips

1. **Add Components**: Create reusable components in `src/components/`
2. **Add Pages**: Create new pages in `src/pages/`
3. **API Calls**: Always use `axiosInstance` from `src/api/axiosConfig.js`
4. **Auth**: Use `useAuth()` hook from `src/context/AuthContext.jsx`
5. **Styling**: Follow existing CSS patterns; keep Bootstrap classes consistent

## Troubleshooting

### API Connection Issues
- Ensure backend is running on `http://localhost:8000`
- Check `.env` for correct `REACT_APP_API_URL`
- Check browser console for network errors

### Authentication Issues
- Clear localStorage and retry login
- Check token expiration
- Verify API responses match expected data structure

### Socket.io Connection Issues
- Ensure backend Socket.io is configured
- Check CORS settings on backend
- Verify token is being passed correctly

## Build for Production

```bash
npm run build
```

Creates optimized production build in `build/` directory.

## Testing

```bash
npm test
```

Runs tests using Jest and React Testing Library.
