# API Integration Guide

## Overview

This guide explains how the frontend integrates with the backend API through:
1. **Axios Configuration** - Centralized HTTP requests with interceptors
2. **Authentication** - Token-based auth with auto-refresh
3. **Error Handling** - Global error handling and 401 responses
4. **Real-time Communication** - Socket.io for messaging

## Axios Configuration (`src/api/axiosConfig.js`)

### Setup

The Axios instance is pre-configured with:
- Base URL: `http://localhost:8000/api`
- Bearer token attachment from localStorage
- Request/response interceptors

### Usage in Components

```jsx
import axiosInstance from '../api/axiosConfig';

// GET request
const { data } = await axiosInstance.get('/profiles');

// POST request
const { data } = await axiosInstance.post('/auth/login', {
  email: 'user@example.com',
  password: 'password123'
});

// With error handling
try {
  const response = await axiosInstance.get('/matches');
  setMatches(response.data);
} catch (error) {
  console.error('Error:', error.response?.data?.message);
}
```

### Request Interceptor

Automatically adds Authorization header:
```javascript
Authorization: Bearer <token>
```

The token is read from `localStorage.getItem('token')` on every request.

### Response Interceptor

Handles authentication errors:
- On **401** status: Clears token, removes user data, redirects to login
- Other errors: Pass through to component error handling

## Authentication Flow

### Registration

```jsx
import axiosInstance from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';

const { login } = useAuth();
const navigate = useNavigate();

const handleRegister = async (name, email, password) => {
  try {
    const response = await axiosInstance.post('/auth/register', {
      name,
      email,
      password
    });
    
    const { token, user } = response.data;
    login(user, token); // Updates context + localStorage
    navigate('/swipe');
  } catch (error) {
    console.error('Registration failed:', error.response.data.message);
  }
};
```

### Login

```jsx
const handleLogin = async (email, password) => {
  try {
    const response = await axiosInstance.post('/auth/login', {
      email,
      password
    });
    
    const { token, user } = response.data;
    login(user, token);
    navigate('/swipe');
  } catch (error) {
    console.error('Login failed:', error.response.data.message);
  }
};
```

### Using Authentication in Components

```jsx
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, token, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <p>Please log in</p>;
  }

  return (
    <div>
      <p>Welcome, {user.name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## API Endpoints

### Authentication

#### POST `/auth/register`
Register a new user.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "user": {
    "_id": "user123",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST `/auth/login`
Login user.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "user": {
    "_id": "user123",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Profiles

#### GET `/profiles`
Get profiles for swiping (excludes current user and already swiped profiles).

**Response:**
```json
[
  {
    "_id": "profile1",
    "name": "Jane Doe",
    "bio": "Full-stack developer",
    "profileImage": "https://example.com/jane.jpg",
    "skills": ["React", "Node.js", "MongoDB"]
  },
  {
    "_id": "profile2",
    "name": "John Smith",
    "bio": "Frontend engineer",
    "profileImage": "https://example.com/john.jpg",
    "skills": ["Vue.js", "TypeScript"]
  }
]
```

### Swipes

#### POST `/swipes`
Record a swipe action (like or pass).

**Request:**
```json
{
  "targetUserId": "profile1",
  "action": "like"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Swipe recorded"
}
```

**Actions:** `"like"` or `"pass"`

### Matches

#### GET `/matches`
Get all mutual matches for the current user.

**Response:**
```json
[
  {
    "_id": "match1",
    "name": "Jane Doe",
    "bio": "Full-stack developer",
    "profileImage": "https://example.com/jane.jpg",
    "skills": ["React", "Node.js"],
    "matchedAt": "2025-06-30T10:30:00Z"
  }
]
```

### Messages

#### GET `/messages/:matchId`
Get chat history with a specific match.

**Response:**
```json
[
  {
    "_id": "msg1",
    "senderId": "user123",
    "recipientId": "match1",
    "content": "Hey, how are you?",
    "createdAt": "2025-06-30T10:30:00Z"
  },
  {
    "_id": "msg2",
    "senderId": "match1",
    "recipientId": "user123",
    "content": "Doing great!",
    "createdAt": "2025-06-30T10:31:00Z"
  }
]
```

#### POST `/messages`
Send a message to a match.

**Request:**
```json
{
  "recipientId": "match1",
  "content": "Hey, how are you?"
}
```

**Response:**
```json
{
  "_id": "msg1",
  "senderId": "user123",
  "recipientId": "match1",
  "content": "Hey, how are you?",
  "createdAt": "2025-06-30T10:30:00Z"
}
```

### Users

#### GET `/users/:userId`
Get user profile information.

**Response:**
```json
{
  "_id": "user123",
  "name": "John Doe",
  "email": "john@example.com",
  "bio": "Full-stack developer",
  "profileImage": "https://example.com/john.jpg",
  "skills": ["React", "Node.js", "MongoDB"],
  "createdAt": "2025-01-01T00:00:00Z"
}
```

## Socket.io Events (Real-time Messaging)

### Client Events (Emit)

#### `joinChat`
Join a specific chat room.

```javascript
socket.emit('joinChat', { matchId: 'match1' });
```

#### `sendMessage`
Send a message in real-time.

```javascript
socket.emit('sendMessage', {
  recipientId: 'match1',
  content: 'Hello!'
});
```

#### `disconnect`
Gracefully close connection.

```javascript
socket.disconnect();
```

### Server Events (Listen)

#### `newMessage`
Receive a new message in real-time.

```javascript
socket.on('newMessage', (message) => {
  console.log('New message:', message);
  // Add message to state
});
```

#### `error`
Connection error event.

```javascript
socket.on('error', (error) => {
  console.error('Socket error:', error);
});
```

#### `connect`
Connection established.

```javascript
socket.on('connect', () => {
  console.log('Connected to server');
});
```

## Error Handling

### Global Error Handling (Interceptor)

The response interceptor automatically handles 401 errors:

```javascript
// Clears auth state and redirects to login
if (error.response?.status === 401) {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/';
}
```

### Component-Level Error Handling

```jsx
const [error, setError] = useState('');

const fetchData = async () => {
  try {
    const response = await axiosInstance.get('/profiles');
    setProfiles(response.data);
  } catch (err) {
    // Handle specific errors
    if (err.response?.status === 401) {
      setError('Unauthorized');
    } else if (err.response?.status === 404) {
      setError('Not found');
    } else {
      setError(err.response?.data?.message || 'An error occurred');
    }
  }
};
```

## Adding New API Calls

### Step 1: Use Axios Instance

```jsx
import axiosInstance from '../api/axiosConfig';

const response = await axiosInstance.get('/endpoint');
```

### Step 2: Handle Errors

```jsx
try {
  const response = await axiosInstance.get('/endpoint');
  // Use response.data
} catch (error) {
  console.error('Error:', error.response?.data?.message);
}
```

### Step 3: Update Component State

```jsx
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');

useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await axiosInstance.get('/endpoint');
      setData(response.data);
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);
```

## Best Practices

1. **Always use `axiosInstance`** - Never create raw axios calls
2. **Handle errors gracefully** - Show user-friendly error messages
3. **Use try-catch blocks** - Properly catch and handle promises
4. **Authenticate requests** - Token is automatically added
5. **Clean up subscriptions** - Disconnect socket.io on unmount
6. **Validate data** - Check response structure before using
7. **Use async/await** - Cleaner than .then() chains

## Debugging

### Check Token

```javascript
console.log('Token:', localStorage.getItem('token'));
console.log('User:', JSON.parse(localStorage.getItem('user')));
```

### Log API Calls

Add to `axiosConfig.js`:

```javascript
axiosInstance.interceptors.request.use((config) => {
  console.log('[API] Request:', config.method.toUpperCase(), config.url);
  return config;
});

axiosInstance.interceptors.response.use((response) => {
  console.log('[API] Response:', response.status, response.data);
  return response;
});
```

### Test Endpoints

Use browser console:

```javascript
const axiosInstance = require('./src/api/axiosConfig').default;
await axiosInstance.get('/profiles');
```

## Security Considerations

1. **Token Storage** - Currently uses localStorage (consider sessionStorage for more security)
2. **CORS** - Ensure backend allows requests from frontend origin
3. **HTTPS** - Use HTTPS in production
4. **Token Expiration** - Implement refresh token rotation if needed
5. **XSS Protection** - All data is sanitized by React
