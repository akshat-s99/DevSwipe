# Design Document

## Overview

Devify is a swipe-based developer connection platform built on the MERN stack (MongoDB, Express, React, Node.js). The system enables developers to discover, connect, and communicate with other developers through a Tinder-like swipe interface. The architecture follows a clear client-server separation with a React/Bootstrap frontend and a Node.js/Express/MongoDB backend, designed to support a 4-person team with distinct frontend and backend responsibilities.

## Architecture

### System Architecture

The platform follows a three-tier architecture:

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend Client                       │
│           (React + Bootstrap + Socket.io Client)         │
│                                                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │   Auth   │  │  Swipe   │  │ Matches  │  │   Chat  │ │
│  │Component │  │Component │  │Dashboard │  │Component│ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────┘
                        │
                   HTTP + WebSocket
                        │
┌─────────────────────────────────────────────────────────┐
│                    Backend API Server                    │
│        (Node.js + Express + Socket.io Server)            │
│                                                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │   Auth   │  │  Profile │  │  Swipe   │  │  Match  │ │
│  │ Service  │  │ Service  │  │ Service  │  │ Service │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
│  ┌──────────┐                                            │
│  │Messaging │                                            │
│  │ Service  │                                            │
│  └──────────┘                                            │
└─────────────────────────────────────────────────────────┘
                        │
                    MongoDB Driver
                        │
┌─────────────────────────────────────────────────────────┐
│                    MongoDB Database                      │
│                                                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │  users   │  │  swipes  │  │ matches  │  │messages │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Team Responsibilities

**Frontend Team (Divyam, Akash):**
- React component development
- Bootstrap UI styling and responsive layouts
- Client-side routing and state management
- HTTP client integration with Backend API
- WebSocket client integration for real-time messaging
- JWT token storage and authentication headers
- Form validation and user input handling

**Backend Team (Akshat - Lead, Adarsh):**
- Express API server setup and routing
- MongoDB schema design and database operations
- JWT authentication and authorization middleware
- Business logic for swipe, match, and messaging services
- WebSocket server implementation for real-time messaging
- API endpoint implementation per contract
- Error handling and logging

### Communication Protocol

The two teams communicate exclusively through the **API Contract** (see api_contract.md). Frontend developers consume the documented endpoints without needing to understand backend implementation details. Backend developers implement the contract without needing to know frontend component structure.

## Components

### 1. Authentication Service

**Responsibility:** User registration, login, and JWT token management.

**Technology:**
- `bcryptjs` for password hashing (salt rounds: 10)
- `jsonwebtoken` for JWT creation and verification
- JWT payload: `{ userId, email }`
- Token expiration: 7 days

**Key Operations:**
- `register(email, password, name)` → Returns JWT token
- `login(email, password)` → Returns JWT token
- `verifyToken(token)` → Returns decoded payload or throws error

**Security:**
- All passwords hashed with bcrypt before storage
- JWT secret stored in environment variable
- Protected endpoints use authentication middleware to verify tokens

### 2. Profile Service

**Responsibility:** Manage developer profile data including bio, GitHub link, and tech stack.

**Data Model:**
```javascript
{
  userId: ObjectId,           // Reference to user
  name: String,
  email: String,
  bio: String,                // Optional, max 500 characters
  githubUrl: String,          // Optional, URL format
  techStack: [String],        // Array of technology names
  createdAt: Date,
  updatedAt: Date
}
```

**Key Operations:**
- `getProfile(userId)` → Returns profile document
- `updateProfile(userId, updates)` → Updates and returns profile
- `addTech(userId, techName)` → Adds tech to array
- `removeTech(userId, techName)` → Removes tech from array

**Validation:**
- Bio: max 500 characters
- GitHub URL: valid URL format starting with https://github.com/
- Tech stack entries: non-empty strings, max 50 characters each

### 3. Swipe Service

**Responsibility:** Handle swipe interactions (pass/like) and generate profile recommendations.

**Data Model (Swipes Collection):**
```javascript
{
  swiperId: ObjectId,         // User who performed swipe
  swipedId: ObjectId,         // User who was swiped
  action: String,             // "pass" or "like"
  timestamp: Date
}
```

**Key Operations:**
- `getNextProfile(userId)` → Returns next recommended profile
- `recordSwipe(swiperId, swipedId, action)` → Saves swipe action
- `checkMutualLike(userId1, userId2)` → Returns boolean

**Recommendation Algorithm:**
1. Exclude own profile
2. Exclude already-liked profiles (to avoid duplicates in current session)
3. Include passed profiles (they can reappear)
4. Return profiles in random or basic scoring order
5. Optimize query with indexes on userId fields

**Performance Target:** Profile load within 500ms

### 4. Match Service

**Responsibility:** Create and manage mutual matches between developers.

**Data Model (Matches Collection):**
```javascript
{
  developer1Id: ObjectId,     // Alphabetically first userId
  developer2Id: ObjectId,     // Alphabetically second userId
  createdAt: Date
}
```

**Key Operations:**
- `createMatch(userId1, userId2)` → Creates match if mutual like exists
- `getMatches(userId)` → Returns all matches with profile data
- `checkMatchExists(userId1, userId2)` → Returns boolean

**Match Creation Flow:**
1. When a like is recorded, check if the other user has also liked back
2. If mutual like exists, create match record
3. Prevent duplicates by ordering userIds alphabetically in document
4. Emit match notification event for both users

**Dashboard:**
- Retrieve all matches for a user
- Join with profile data to include name, bio, tech stack
- Order by createdAt descending (most recent first)
- Performance target: <1 second load time

### 5. Messaging Service

**Responsibility:** Enable real-time text messaging between matched developers.

**Data Model (Messages Collection):**
```javascript
{
  matchId: ObjectId,          // Reference to match
  senderId: ObjectId,         // User who sent message
  receiverId: ObjectId,       // User who receives message
  content: String,            // Message text
  timestamp: Date,
  read: Boolean               // Message read status
}
```

**Technology:**
- Socket.io for WebSocket communication
- Rooms: Each match gets a unique room (`match_${matchId}`)

**Key Operations:**
- `sendMessage(matchId, senderId, receiverId, content)` → Emits message via WebSocket and saves to DB
- `getMessageHistory(matchId)` → Returns all messages for a conversation
- `joinConversation(socket, matchId, userId)` → Joins user to WebSocket room

**Real-Time Flow:**
1. Client connects to Socket.io server with authenticated socket
2. Client joins room for each active match
3. When message is sent, emit to room (both users receive instantly)
4. Simultaneously save message to database for history
5. Display message in UI without page refresh

**Authorization:**
- Only matched developers can message each other
- Verify match exists before allowing message send/receive
- Verify user is part of match before joining WebSocket room

### 6. Frontend Components

**Technology Stack:**
- React 18+
- React Router for client-side routing
- Bootstrap 5 for styling
- Axios for HTTP requests
- Socket.io-client for WebSocket
- React Context API for global state (auth, matches)

**Component Structure:**

```
App
├── AuthContext (JWT token, user state)
├── Router
│   ├── /register → RegisterPage
│   ├── /login → LoginPage
│   ├── /profile → ProfilePage
│   ├── /swipe → SwipePage
│   ├── /matches → MatchesDashboard
│   └── /chat/:matchId → ChatPage
└── ProtectedRoute (requires authentication)
```

**Key Components:**

**SwipeCard Component:**
- Displays profile: name, bio, GitHub link, tech stack
- Pass button (red) and Like button (green)
- Handles swipe actions via API calls
- Loads next profile on action

**MatchesDashboard Component:**
- Lists all matches as cards
- Each card shows matched developer profile
- Click to open chat
- Real-time match notifications

**ChatComponent:**
- Message history display (scrollable)
- Input field and send button
- WebSocket integration for real-time updates
- Displays timestamps and sender names

**ProfileForm Component:**
- Edit bio, GitHub URL, tech stack
- Add/remove tech stack entries dynamically
- Form validation before submission

### 7. Backend API Server

**Technology Stack:**
- Node.js (v18+)
- Express 4.x
- Mongoose for MongoDB ODM
- Socket.io for WebSocket server
- bcryptjs for password hashing
- jsonwebtoken for JWT

**Middleware:**
- `authMiddleware`: Verifies JWT token on protected routes
- `errorHandler`: Catches and formats errors
- `requestLogger`: Logs incoming requests
- CORS configuration for frontend origin

**Error Handling:**
- Validation errors: 400 Bad Request
- Authentication errors: 401 Unauthorized
- Authorization errors: 403 Forbidden
- Not found errors: 404 Not Found
- Server errors: 500 Internal Server Error
- All errors return consistent JSON: `{ error: "message" }`

**Environment Variables:**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/devify
JWT_SECRET=<secret-key>
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### 8. Database Schema

**MongoDB Collections:**

**users:**
```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (hashed, required),
  name: String (required),
  createdAt: Date
}
```

**profiles:**
```javascript
{
  _id: ObjectId,
  userId: ObjectId (unique, required, ref: 'users'),
  bio: String (max 500),
  githubUrl: String,
  techStack: [String],
  updatedAt: Date
}
```

**swipes:**
```javascript
{
  _id: ObjectId,
  swiperId: ObjectId (required, ref: 'users'),
  swipedId: ObjectId (required, ref: 'users'),
  action: String (enum: ['pass', 'like'], required),
  timestamp: Date
}
```

**matches:**
```javascript
{
  _id: ObjectId,
  developer1Id: ObjectId (required, ref: 'users'),
  developer2Id: ObjectId (required, ref: 'users'),
  createdAt: Date
}
```

**messages:**
```javascript
{
  _id: ObjectId,
  matchId: ObjectId (required, ref: 'matches'),
  senderId: ObjectId (required, ref: 'users'),
  receiverId: ObjectId (required, ref: 'users'),
  content: String (required, max 1000),
  timestamp: Date,
  read: Boolean (default: false)
}
```

**Indexes:**
- users.email (unique)
- profiles.userId (unique)
- swipes: compound index on (swiperId, swipedId)
- swipes: index on swiperId for query optimization
- matches: compound index on (developer1Id, developer2Id, unique)
- messages: index on matchId for conversation queries

## Data Flow

### Registration Flow

1. User submits email, password, name via frontend form
2. Frontend sends POST /api/auth/register
3. Backend validates input, hashes password, creates user document
4. Backend creates empty profile document linked to user
5. Backend generates JWT token
6. Frontend stores JWT in localStorage
7. Frontend redirects to profile setup page

### Swipe Flow

1. Frontend requests GET /api/swipe/next
2. Backend queries for next recommended profile (excluding own, already-liked)
3. Backend returns profile data
4. User clicks pass or like
5. Frontend sends POST /api/swipe with action
6. Backend records swipe in database
7. If action is "like", backend checks for mutual like
8. If mutual like exists, backend creates match and emits notification
9. Frontend displays next profile

### Match Creation Flow

1. User A likes User B
2. Backend checks if User B has already liked User A
3. If mutual like confirmed, create match document
4. Emit WebSocket event to both users: "new_match"
5. Both users see real-time notification
6. Match appears in both users' dashboards

### Messaging Flow

1. Both users connected to Socket.io server
2. Both users join room: `match_${matchId}`
3. User A types message and clicks send
4. Frontend emits "send_message" event with matchId, content
5. Backend verifies match authorization
6. Backend saves message to database
7. Backend emits "receive_message" event to room
8. User B sees message instantly in UI without refresh
9. When User B opens conversation, load full history from database

## Error Handling

### Frontend Error Handling

- API errors: Display user-friendly error messages via toast/alert
- Network errors: Retry logic with exponential backoff
- Authentication errors: Clear token and redirect to login
- Validation errors: Display inline form validation messages
- WebSocket disconnection: Attempt reconnection and notify user

### Backend Error Handling

- All errors caught by error handling middleware
- Database errors: Log full error, return generic message to client
- Validation errors: Return specific field errors
- Authentication failures: Return 401 with clear message
- Duplicate key errors: Return 400 with meaningful message
- Unhandled errors: Log stack trace, return 500

### Logging

- Backend logs all errors with timestamp, user context, stack trace
- Use Winston or similar logging library
- Log levels: error, warn, info, debug
- Production: log to file and/or external service

## Performance Considerations

### Backend Optimization

- **Database Indexes:** Create indexes on frequently queried fields (userId, swiperId, matchId)
- **Query Optimization:** Use projection to return only needed fields
- **Connection Pooling:** Configure MongoDB connection pool size
- **Caching:** Consider Redis for session data and frequently accessed profiles
- **Target:** Profile load < 500ms, Match dashboard load < 1 second

### Frontend Optimization

- **Code Splitting:** Lazy load route components
- **Image Optimization:** Compress profile images if added later
- **Debouncing:** Debounce search and filter inputs
- **Pagination:** Paginate match lists if user has many matches
- **WebSocket Efficiency:** Only subscribe to active conversation rooms

### Scalability

- **Horizontal Scaling:** Stateless API servers can scale horizontally
- **WebSocket Scaling:** Use Redis adapter for Socket.io to support multiple server instances
- **Database Sharding:** Shard by userId if database grows large
- **CDN:** Serve static frontend assets via CDN

## Security

### Authentication & Authorization

- All passwords hashed with bcrypt (salt rounds: 10)
- JWT tokens signed with secure secret
- Protected endpoints require valid JWT in Authorization header
- Tokens expire after 7 days
- No sensitive data in JWT payload

### Data Protection

- Input validation on all API endpoints
- Sanitize user input to prevent XSS attacks
- Use parameterized queries (Mongoose handles this)
- HTTPS in production for encrypted communication
- CORS configured to allow only frontend origin

### WebSocket Security

- Authenticate socket connections using JWT
- Verify user authorization before joining chat rooms
- Validate matchId exists and user is participant
- Rate limiting on message sending to prevent spam

### Environment Security

- All secrets in environment variables (never committed)
- Use `.env` file locally, environment configuration in production
- Separate development and production databases
- MongoDB authentication enabled in production

## Testing Strategy

### Unit Tests

Unit tests focus on specific examples, edge cases, and error conditions. They complement property-based tests by providing concrete examples and testing integration points.

**Frontend Unit Tests:**
- Component rendering with sample data
- User interaction handlers (button clicks, form submissions)
- API client error handling
- Token storage and retrieval
- Form validation logic

**Backend Unit Tests:**
- Service method behavior with specific examples
- Authentication middleware with valid/invalid tokens
- Error handling for specific error types
- Database connection error handling
- Input validation edge cases (empty strings, special characters)

### Property-Based Tests

Property-based tests verify universal properties across a wide range of generated inputs. Each test runs a minimum of 100 iterations with randomized data.

**Purpose:** Discover edge cases and validate correctness properties that should hold for all inputs.

**Coverage:** See Correctness Properties section below for detailed properties.

### Integration Tests

Integration tests verify end-to-end workflows and external integrations.

**Backend Integration Tests:**
- Full API endpoint tests with test database
- WebSocket connection and messaging flow
- Database operations with MongoDB test instance
- Authentication flow from registration to protected endpoint access

**Frontend Integration Tests:**
- User flows: registration → profile setup → swipe → match → chat
- API integration with mock backend
- WebSocket integration with mock server

### Performance Tests

- Profile load time: verify < 500ms
- Match dashboard load: verify < 1 second
- WebSocket message delivery latency
- Concurrent user load testing

## Development Workflow

### Git Workflow

1. **Main Branch:** Always stable, contains tested production code
2. **Feature Branches:** Named `feature/<feature-name>` or `fix/<bug-name>`
3. **Pull Requests:** Required for all merges to main
4. **Code Review:** At least one approval required before merge
5. **Branch Protection:** Main branch protected from direct pushes

### Frontend Development Workflow (Divyam, Akash)

1. Create feature branch from main
2. Implement React component based on API contract
3. Test component locally with mock data or development backend
4. Submit pull request with description of changes
5. Address code review feedback
6. Merge after approval

### Backend Development Workflow (Akshat, Adarsh)

1. Create feature branch from main
2. Implement API endpoint per contract specification
3. Write unit tests for service logic
4. Test endpoint with Postman or similar tool
5. Submit pull request with description of changes
6. Address code review feedback
7. Merge after approval

### Coordination

- **API Contract:** Central source of truth (api_contract.md)
- **Contract Changes:** Require agreement from both teams
- **Standup/Sync:** Regular check-ins to discuss blockers
- **Documentation:** Keep README updated with setup instructions

## Deployment

### Development Environment

**Frontend:**
- Run locally: `npm start` on port 3000
- Connects to backend: `http://localhost:5000`

**Backend:**
- Run locally: `npm start` on port 5000
- Connects to MongoDB: `mongodb://localhost:27017/devify`

### Production Environment

**Frontend:**
- Build: `npm run build`
- Deploy static files to hosting service (Vercel, Netlify)
- Set environment variable for backend API URL

**Backend:**
- Deploy to cloud service (Heroku, AWS, DigitalOcean)
- Set environment variables (MongoDB URI, JWT secret, etc.)
- Use managed MongoDB service (MongoDB Atlas)
- Enable HTTPS
- Configure CORS for production frontend URL

### Environment Configuration

**Development (.env.development):**
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

**Production (.env.production):**
```
REACT_APP_API_URL=https://api.devify.com
REACT_APP_SOCKET_URL=https://api.devify.com
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Registration creates account and returns token

*For any* valid registration credentials (email, password, name), the Auth_Service SHALL create a new account in the database and return a valid JWT token that can be used for authentication.

**Validates: Requirements 1.2**

### Property 2: Login with valid credentials returns token

*For any* valid email and password pair that exists in the system, the Auth_Service SHALL authenticate the user and return a valid JWT token.

**Validates: Requirements 1.3**

### Property 3: Invalid tokens are rejected

*For any* expired, malformed, or invalid JWT token, the Auth_Service SHALL reject the authentication request and return an appropriate error.

**Validates: Requirements 1.4**

### Property 4: Passwords are hashed before storage

*For any* password provided during registration, the stored password in the database SHALL be a hashed value that differs from the original plaintext password.

**Validates: Requirements 1.5**

### Property 5: Profile updates persist (round-trip)

*For any* valid profile update (bio, GitHub URL, tech stack), updating a profile and then retrieving it SHALL return the updated values.

**Validates: Requirements 2.4**

### Property 6: Adding tech increases array

*For any* technology string added to a profile's tech stack, the tech stack array length SHALL increase by one and the array SHALL contain the new technology.

**Validates: Requirements 2.5**

### Property 7: Removing tech decreases array

*For any* existing technology in a profile's tech stack, removing it SHALL decrease the array length by one and the technology SHALL no longer appear in the array.

**Validates: Requirements 2.6**

### Property 8: Swipe actions persist (round-trip)

*For any* swipe action (pass or like) performed by a developer on another profile, the action SHALL be recorded in the database and retrievable.

**Validates: Requirements 3.2**

### Property 9: Passed profiles can reappear

*For any* profile that a developer has passed on, that profile SHALL be eligible to appear in future swipe recommendations.

**Validates: Requirements 3.3**

### Property 10: Swipe recommendations exclude own profile and already-liked

*For any* developer requesting profile recommendations, the Swipe_Engine SHALL never return the developer's own profile and SHALL exclude profiles the developer has already liked.

**Validates: Requirements 3.5, 3.6**

### Property 11: Mutual likes create match

*For any* two developers who have both liked each other's profiles, the Match_System SHALL create exactly one mutual Match record.

**Validates: Requirements 4.1**

### Property 12: New matches trigger notifications

*For any* newly created match, the Match_System SHALL send notifications to both developers involved in the match.

**Validates: Requirements 4.2**

### Property 13: Duplicate matches are prevented (idempotence)

*For any* pair of developers, attempting to create a match multiple times SHALL result in only one match record existing in the database.

**Validates: Requirements 4.4**

### Property 14: Match dashboard returns complete data

*For any* developer, retrieving their matches dashboard SHALL return all match records with complete profile information (name, bio, tech stack) for each matched developer.

**Validates: Requirements 5.1, 5.2**

### Property 15: Matches ordered by recency

*For any* set of matches for a developer, the dashboard SHALL order them by creation timestamp in descending order (most recent first).

**Validates: Requirements 5.4**

### Property 16: Messages delivered between matched developers

*For any* message sent by a developer to a matched developer, the Messaging_Service SHALL deliver the message in real-time (or store for delivery when recipient connects).

**Validates: Requirements 6.2**

### Property 17: Message persistence (round-trip)

*For any* message sent in a conversation, the message SHALL be stored in the database and retrievable when loading conversation history.

**Validates: Requirements 6.3**

### Property 18: Complete message history retrieved

*For any* conversation between matched developers with N messages, loading the conversation SHALL return all N messages in chronological order.

**Validates: Requirements 6.4**

### Property 19: Messaging restricted to matches

*For any* pair of developers without an active match, attempting to send a message SHALL be rejected by the Messaging_Service.

**Validates: Requirements 6.5**

### Property 20: Authenticated requests include JWT

*For any* authenticated API request from the frontend, the HTTP request SHALL include the JWT token in the Authorization header.

**Validates: Requirements 7.4**

### Property 21: Protected endpoints reject invalid tokens

*For any* protected API endpoint, requests with missing, expired, or invalid JWT tokens SHALL be rejected with a 401 Unauthorized response.

**Validates: Requirements 8.5**

### Property 22: HTTP status codes match outcomes

*For any* API operation result (success, validation error, authentication error, not found, server error), the Backend_API SHALL return the appropriate HTTP status code (200, 201, 400, 401, 404, 500).

**Validates: Requirements 8.6**

### Property 23: Database errors are logged and reported

*For any* database operation failure, the Backend_API SHALL log the error details and return an appropriate error message to the client.

**Validates: Requirements 10.5**

