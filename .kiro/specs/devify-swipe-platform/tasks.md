# Implementation Plan: Devify Swipe Platform

## Overview

This implementation plan is structured for a 4-person team with strict frontend/backend separation:

- **Backend Team (Phase 1):** Akshat (Lead) and Adarsh implement the complete backend API first
- **Frontend Team (Phase 2):** Divyam and Akash implement the React frontend after backend is complete
- **Technologies:** Node.js/Express/MongoDB (Backend), React/Bootstrap (Frontend)
- **Git Workflow:** Feature branches and pull requests are mandatory for all work

The phased approach ensures the frontend team has a working API to integrate against, preventing blocking dependencies and enabling parallel testing.

## Tasks

## Phase 1: Backend Implementation (Akshat, Adarsh)

### 1. Backend Project Setup and Infrastructure

- [ ] 1.1 Initialize Node.js backend project
  - Create `backend/` directory with `npm init`
  - Install dependencies: express, mongoose, bcryptjs, jsonwebtoken, socket.io, cors, dotenv
  - Set up `.env` file with PORT, MONGODB_URI, JWT_SECRET
  - Create `.gitignore` for node_modules and .env
  - Set up project structure: routes/, models/, middleware/, services/, config/
  - **Responsibility: Akshat**
  - _Requirements: 8.1, 8.2, 8.3, 9.1_

- [ ] 1.2 Configure MongoDB connection and error handling
  - Implement database connection using Mongoose
  - Add connection error handling and retry logic
  - Configure connection pool settings
  - Test connection on server startup
  - **Responsibility: Adarsh**
  - _Requirements: 8.3, 10.1, 10.5_

- [ ] 1.3 Create MongoDB schemas and models
  - Define User model (email, password, name)
  - Define Profile model (userId ref, bio, githubUrl, techStack)
  - Define Swipe model (swiperId ref, swipedId ref, action, timestamp)
  - Define Match model (developer1Id ref, developer2Id ref, createdAt)
  - Define Message model (matchId ref, senderId ref, receiverId ref, content, timestamp, read)
  - Add schema validations and indexes
  - **Responsibility: Akshat**
  - _Requirements: 10.1, 10.3, 10.4_


- [ ] 1.4 Set up Express middleware and error handling
  - Configure CORS for frontend origin
  - Add body-parser/express.json middleware
  - Create authentication middleware for JWT verification
  - Implement global error handler middleware
  - Add request logging middleware
  - **Responsibility: Adarsh**
  - _Requirements: 8.2, 8.5, 8.6_

- [ ]* 1.5 Write unit tests for database models
  - Test schema validations (required fields, formats)
  - Test unique constraints (email, compound indexes)
  - Test default values and timestamps
  - **Responsibility: Adarsh**
  - _Requirements: 10.3_

### 2. Authentication Service Implementation

- [ ] 2.1 Implement user registration endpoint (POST /api/auth/register)
  - Validate email format, password length, name length
  - Check for duplicate email addresses
  - Hash password with bcrypt (10 salt rounds)
  - Create User document in database
  - Create empty Profile document linked to user
  - Generate JWT token with 7-day expiration
  - Return token and user data (excluding password)
  - **Responsibility: Akshat**
  - _Requirements: 1.2, 1.5_

- [ ]* 2.2 Write property test for registration
  - **Property 1: Registration creates account and returns token**
  - **Validates: Requirements 1.2**
  - Verify valid credentials create account and return valid token
  - Test with various valid email/password combinations
  - **Responsibility: Akshat**
  - _Requirements: 1.2_


- [ ]* 2.3 Write property test for password hashing
  - **Property 4: Passwords are hashed before storage**
  - **Validates: Requirements 1.5**
  - Verify stored password differs from plaintext
  - Test bcrypt hash verification works correctly
  - **Responsibility: Akshat**
  - _Requirements: 1.5_

- [ ] 2.4 Implement login endpoint (POST /api/auth/login)
  - Validate email and password presence
  - Look up user by email
  - Compare password with bcrypt
  - Generate JWT token on successful authentication
  - Return token and user data
  - Return 401 for invalid credentials
  - **Responsibility: Adarsh**
  - _Requirements: 1.3_

- [ ]* 2.5 Write property test for login authentication
  - **Property 2: Login with valid credentials returns token**
  - **Validates: Requirements 1.3**
  - Test valid email/password pairs return tokens
  - Verify returned token is valid and can be decoded
  - **Responsibility: Adarsh**
  - _Requirements: 1.3_

- [ ] 2.6 Implement JWT authentication middleware
  - Extract token from Authorization header
  - Verify token signature and expiration
  - Decode payload and attach user to request object
  - Return 401 for missing/invalid/expired tokens
  - **Responsibility: Akshat**
  - _Requirements: 1.4, 8.5_


- [ ]* 2.7 Write property test for token rejection
  - **Property 3: Invalid tokens are rejected**
  - **Validates: Requirements 1.4**
  - Test expired, malformed, and invalid tokens are rejected
  - Verify appropriate error responses
  - **Responsibility: Akshat**
  - _Requirements: 1.4_

- [ ]* 2.8 Write unit tests for authentication endpoints
  - Test registration with duplicate email returns 400
  - Test login with wrong password returns 401
  - Test missing fields return 400
  - **Responsibility: Adarsh**
  - _Requirements: 1.2, 1.3, 8.6_

### 3. Profile Service Implementation

- [ ] 3.1 Implement get profile endpoint (GET /api/profile)
  - Apply authentication middleware
  - Query profile by userId from JWT
  - Return complete profile data
  - Return 404 if profile not found
  - **Responsibility: Adarsh**
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 3.2 Implement update profile endpoint (PUT /api/profile)
  - Apply authentication middleware
  - Validate bio length (max 500 characters)
  - Validate GitHub URL format (starts with https://github.com/)
  - Validate tech stack entries (max 50 chars each)
  - Update profile document with new data
  - Return updated profile
  - **Responsibility: Akshat**
  - _Requirements: 2.4_


- [ ]* 3.3 Write property test for profile round-trip
  - **Property 5: Profile updates persist (round-trip)**
  - **Validates: Requirements 2.4**
  - Update profile and verify retrieval returns updated values
  - Test with various bio, GitHub URL, tech stack combinations
  - **Responsibility: Akshat**
  - _Requirements: 2.4_

- [ ] 3.4 Implement add tech to stack endpoint (POST /api/profile/tech)
  - Apply authentication middleware
  - Validate tech name is non-empty and max 50 characters
  - Check for duplicate tech in array
  - Add tech to techStack array
  - Return updated tech stack
  - **Responsibility: Adarsh**
  - _Requirements: 2.5_

- [ ]* 3.5 Write property test for adding tech
  - **Property 6: Adding tech increases array**
  - **Validates: Requirements 2.5**
  - Verify array length increases by one
  - Verify new tech appears in array
  - **Responsibility: Adarsh**
  - _Requirements: 2.5_

- [ ] 3.6 Implement remove tech from stack endpoint (DELETE /api/profile/tech/:techName)
  - Apply authentication middleware
  - Find and remove tech from techStack array
  - Return 400 if tech not found in stack
  - Return updated tech stack
  - **Responsibility: Akshat**
  - _Requirements: 2.6_


- [ ]* 3.7 Write property test for removing tech
  - **Property 7: Removing tech decreases array**
  - **Validates: Requirements 2.6**
  - Verify array length decreases by one
  - Verify tech no longer appears in array
  - **Responsibility: Akshat**
  - _Requirements: 2.6_

- [ ]* 3.8 Write unit tests for profile endpoints
  - Test profile validation errors (bio too long, invalid GitHub URL)
  - Test unauthorized access returns 401
  - Test profile not found returns 404
  - **Responsibility: Adarsh**
  - _Requirements: 2.4, 8.5, 8.6_

### 4. Swipe Service Implementation

- [ ] 4.1 Implement get next profile endpoint (GET /api/swipe/next)
  - Apply authentication middleware
  - Query for profiles excluding own profile and already-liked profiles
  - Use indexes for performance optimization
  - Return profile data (userId, name, bio, githubUrl, techStack)
  - Return "No more profiles" message if none available
  - Target response time: < 500ms
  - **Responsibility: Akshat**
  - _Requirements: 3.1, 3.4, 3.5, 3.6_

- [ ]* 4.2 Write property test for swipe recommendations
  - **Property 10: Swipe recommendations exclude own profile and already-liked**
  - **Validates: Requirements 3.5, 3.6**
  - Verify own profile never appears
  - Verify already-liked profiles are excluded
  - **Responsibility: Akshat**
  - _Requirements: 3.5, 3.6_

- [ ] 4.3 Implement record swipe endpoint (POST /api/swipe)
  - Apply authentication middleware
  - Validate action is either "pass" or "like"
  - Create Swipe document with swiperId, swipedId, action, timestamp
  - If action is "like", check for mutual like
  - Return swipe confirmation and mutual match status if applicable
  - **Responsibility: Adarsh**
  - _Requirements: 3.2_

- [ ]* 4.4 Write property test for swipe persistence
  - **Property 8: Swipe actions persist (round-trip)**
  - **Validates: Requirements 3.2**
  - Record swipe and verify it's stored in database
  - Test with both pass and like actions
  - **Responsibility: Adarsh**
  - _Requirements: 3.2_

- [ ]* 4.5 Write property test for passed profiles reappearing
  - **Property 9: Passed profiles can reappear**
  - **Validates: Requirements 3.3**
  - Pass on a profile and verify it can appear in future recommendations
  - **Responsibility: Akshat**
  - _Requirements: 3.3_

- [ ]* 4.6 Write unit tests for swipe endpoints
  - Test invalid action values return 400
  - Test swiping on non-existent profile returns 404
  - Test performance target (< 500ms response time)
  - **Responsibility: Adarsh**
  - _Requirements: 3.2, 3.4_

### 5. Match Service Implementation

- [ ] 5.1 Implement match creation logic
  - Create helper function checkMutualLike(userId1, userId2)
  - Check if both users have liked each other in swipes collection
  - Create Match document with alphabetically ordered userIds
  - Handle duplicate match prevention with unique compound index
  - Return match object with both user profiles
  - **Responsibility: Akshat**
  - _Requirements: 4.1, 4.3, 4.4_

- [ ]* 5.2 Write property test for mutual likes creating match
  - **Property 11: Mutual likes create match**
  - **Validates: Requirements 4.1**
  - Simulate two users liking each other and verify match creation
  - **Responsibility: Akshat**
  - _Requirements: 4.1_

- [ ]* 5.3 Write property test for duplicate match prevention
  - **Property 13: Duplicate matches are prevented (idempotence)**
  - **Validates: Requirements 4.4**
  - Attempt to create same match multiple times, verify only one exists
  - **Responsibility: Akshat**
  - _Requirements: 4.4_

- [ ] 5.4 Implement get matches endpoint (GET /api/matches)
  - Apply authentication middleware
  - Query matches where user is developer1Id or developer2Id
  - Join with profiles collection to get complete profile data
  - Sort by createdAt descending (most recent first)
  - Return array of match objects with profile information
  - Target response time: < 1 second
  - **Responsibility: Adarsh**
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ]* 5.5 Write property test for match dashboard completeness
  - **Property 14: Match dashboard returns complete data**
  - **Validates: Requirements 5.1, 5.2**
  - Verify all matches returned with complete profile info
  - **Responsibility: Adarsh**
  - _Requirements: 5.1, 5.2_

- [ ]* 5.6 Write property test for match ordering
  - **Property 15: Matches ordered by recency**
  - **Validates: Requirements 5.4**
  - Create multiple matches and verify dashboard orders by timestamp
  - **Responsibility: Adarsh**
  - _Requirements: 5.4_

- [ ] 5.7 Implement match notification system
  - Emit WebSocket event "new_match" to both users when match created
  - Include match data and matched user profile in notification
  - Handle case where users are offline (store notification for delivery)
  - **Responsibility: Akshat**
  - _Requirements: 4.2_

- [ ]* 5.8 Write property test for match notifications
  - **Property 12: New matches trigger notifications**
  - **Validates: Requirements 4.2**
  - Create match and verify both users receive notification
  - **Responsibility: Akshat**
  - _Requirements: 4.2_

- [ ]* 5.9 Write unit tests for match endpoints
  - Test unauthorized access returns 401
  - Test performance target (< 1 second load time)
  - Test empty matches list returns empty array
  - **Responsibility: Adarsh**
  - _Requirements: 5.1, 5.3_

### 6. Messaging Service Implementation

- [ ] 6.1 Set up Socket.io server
  - Install and configure Socket.io on Express server
  - Implement socket authentication using JWT
  - Create socket connection handler with authentication check
  - Set up error handling for socket connections
  - **Responsibility: Akshat**
  - _Requirements: 6.1, 6.2_

- [ ] 6.2 Implement message sending functionality
  - Create WebSocket event handler for "send_message"
  - Validate match exists and sender is participant
  - Save message to messages collection
  - Emit "receive_message" event to match room
  - Include message data (content, timestamp, senderId)
  - **Responsibility: Adarsh**
  - _Requirements: 6.2, 6.3_

- [ ]* 6.3 Write property test for message delivery
  - **Property 16: Messages delivered between matched developers**
  - **Validates: Requirements 6.2**
  - Send message and verify real-time delivery to recipient
  - **Responsibility: Adarsh**
  - _Requirements: 6.2_

- [ ]* 6.4 Write property test for message persistence
  - **Property 17: Message persistence (round-trip)**
  - **Validates: Requirements 6.3**
  - Send message and verify it's stored and retrievable from database
  - **Responsibility: Adarsh**
  - _Requirements: 6.3_

- [ ] 6.3 Implement get message history endpoint (GET /api/messages/:matchId)
  - Apply authentication middleware
  - Verify user is participant in the match
  - Query all messages for matchId
  - Sort by timestamp ascending (oldest first)
  - Return array of message objects
  - **Responsibility: Akshat**
  - _Requirements: 6.4_

- [ ]* 6.6 Write property test for complete message history
  - **Property 18: Complete message history retrieved**
  - **Validates: Requirements 6.4**
  - Send N messages and verify all N are returned when loading history
  - **Responsibility: Akshat**
  - _Requirements: 6.4_

- [ ] 6.7 Implement messaging authorization
  - Create middleware to verify match exists before message operations
  - Verify user is participant in the match (developer1Id or developer2Id)
  - Return 403 if user tries to message non-matched developer
  - Apply to both REST endpoint and WebSocket handlers
  - **Responsibility: Adarsh**
  - _Requirements: 6.5_

- [ ]* 6.8 Write property test for messaging restrictions
  - **Property 19: Messaging restricted to matches**
  - **Validates: Requirements 6.5**
  - Attempt to send message without match and verify rejection
  - **Responsibility: Adarsh**
  - _Requirements: 6.5_

- [ ] 6.9 Implement room management for WebSocket
  - Create helper to join user to match rooms on connection
  - Implement "join_conversation" event handler
  - Verify match authorization before joining room
  - Handle user disconnection and cleanup
  - **Responsibility: Akshat**
  - _Requirements: 6.6_

- [ ]* 6.10 Write unit tests for messaging service
  - Test unauthorized message access returns 403
  - Test invalid matchId returns 404
  - Test WebSocket connection with invalid token rejected
  - Test message content validation (max 1000 characters)
  - **Responsibility: Adarsh**
  - _Requirements: 6.5, 8.6_

### 7. Backend Checkpoint

- [ ] 7.1 Backend integration testing and API documentation
  - Run all backend tests to ensure they pass
  - Test all API endpoints with Postman or similar tool
  - Verify CORS configuration for frontend origin
  - Document any API contract changes needed
  - Ensure all environment variables are documented
  - Create sample .env file for frontend team
  - **Responsibility: Akshat (Lead)**
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [ ] 7.2 Deploy backend to development environment
  - Set up backend server on hosting service (Heroku/DigitalOcean)
  - Configure MongoDB Atlas connection
  - Set all environment variables in hosting platform
  - Test deployed API endpoints
  - Share backend API URL with frontend team
  - **Responsibility: Adarsh**
  - _Requirements: 8.3, 8.4_

## Phase 2: Frontend Implementation (Divyam, Akash)

### 8. Frontend Project Setup

- [ ] 8.1 Initialize React frontend project
  - Create `frontend/` directory with `npx create-react-app`
  - Install dependencies: react-router-dom, axios, socket.io-client, bootstrap, react-bootstrap
  - Set up `.env` file with REACT_APP_API_URL and REACT_APP_SOCKET_URL
  - Configure Bootstrap CSS import in index.js
  - Set up project structure: components/, pages/, context/, utils/, services/
  - **Responsibility: Divyam**
  - _Requirements: 7.1, 7.2, 7.3_

- [ ] 8.2 Set up React Router and navigation
  - Install react-router-dom
  - Create Router component with routes for all pages
  - Define routes: /register, /login, /profile, /swipe, /matches, /chat/:matchId
  - Create ProtectedRoute component for authenticated routes
  - Set up navigation bar with links and logout button
  - **Responsibility: Akash**
  - _Requirements: 7.1_

- [ ] 8.3 Create authentication context and token management
  - Create AuthContext using React Context API
  - Implement token storage in localStorage
  - Create login, logout, register context methods
  - Create hook to access auth state in components
  - Implement automatic logout on token expiration
  - **Responsibility: Divyam**
  - _Requirements: 7.4_

- [ ]* 8.4 Write property test for authenticated requests
  - **Property 20: Authenticated requests include JWT**
  - **Validates: Requirements 7.4**
  - Verify all authenticated API calls include Authorization header
  - **Responsibility: Divyam**
  - _Requirements: 7.4_

- [ ] 8.5 Create API service layer with Axios
  - Create axios instance with base URL from environment
  - Add request interceptor to attach JWT token to headers
  - Add response interceptor for error handling
  - Create service methods for all API endpoints
  - Handle 401 errors by redirecting to login
  - **Responsibility: Akash**
  - _Requirements: 7.3, 7.4_

- [ ]* 8.6 Write unit tests for API service
  - Test token attachment in request headers
  - Test error handling for various HTTP status codes
  - Test automatic logout on 401 response
  - **Responsibility: Akash**
  - _Requirements: 7.4_

### 9. Authentication Pages Implementation

- [ ] 9.1 Create registration page component
  - Create form with email, password, name inputs
  - Add client-side validation (email format, password length)
  - Handle form submission and API call
  - Display error messages from backend
  - Redirect to profile setup on success
  - Apply Bootstrap styling and responsive layout
  - **Responsibility: Divyam**
  - _Requirements: 1.2, 7.2, 7.5_

- [ ] 9.2 Create login page component
  - Create form with email and password inputs
  - Handle form submission and API call
  - Display error messages from backend
  - Store JWT token in localStorage via AuthContext
  - Redirect to swipe page on success
  - Apply Bootstrap styling and responsive layout
  - **Responsibility: Akash**
  - _Requirements: 1.3, 7.2, 7.5_

- [ ]* 9.3 Write unit tests for authentication pages
  - Test form validation logic
  - Test successful registration flow
  - Test successful login flow
  - Test error message display
  - **Responsibility: Divyam**
  - _Requirements: 1.2, 1.3_

### 10. Profile Management Implementation

- [ ] 10.1 Create profile page component
  - Fetch profile data on component mount
  - Display current profile information (bio, GitHub URL, tech stack)
  - Create edit mode toggle for profile editing
  - Apply Bootstrap styling for profile display
  - **Responsibility: Akash**
  - _Requirements: 2.1, 2.2, 2.3, 7.2_

- [ ] 10.2 Create profile edit form component
  - Create form fields for bio, GitHub URL
  - Add tech stack management UI (add/remove chips)
  - Implement client-side validation (bio length, URL format)
  - Handle form submission and API call
  - Update profile display after successful save
  - Apply Bootstrap styling and responsive layout
  - **Responsibility: Divyam**
  - _Requirements: 2.4, 2.5, 2.6, 7.2_

- [ ] 10.3 Implement tech stack add/remove functionality
  - Create input field for adding new tech
  - Create delete button for each tech chip
  - Call API to add/remove tech from stack
  - Update local state after successful API call
  - Display validation errors (duplicate tech, empty input)
  - **Responsibility: Akash**
  - _Requirements: 2.5, 2.6_

- [ ]* 10.4 Write unit tests for profile components
  - Test profile data display
  - Test edit form validation
  - Test tech stack add/remove operations
  - Test error handling
  - **Responsibility: Divyam**
  - _Requirements: 2.4, 2.5, 2.6_

### 11. Swipe Interface Implementation

- [ ] 11.1 Create swipe page component
  - Fetch next profile on component mount
  - Display loading state while fetching
  - Display "No more profiles" message when none available
  - Create pass and like button handlers
  - Fetch next profile after each action
  - Apply Bootstrap styling and responsive layout
  - **Responsibility: Divyam**
  - _Requirements: 3.1, 3.4, 7.2, 7.5_

- [ ] 11.2 Create profile card component
  - Display profile information: name, bio, GitHub link, tech stack
  - Style tech stack as Bootstrap badges
  - Make GitHub link clickable and open in new tab
  - Create pass button (red/danger) and like button (green/success)
  - Add card animations for swipe actions
  - Ensure responsive design for mobile
  - **Responsibility: Akash**
  - _Requirements: 3.1, 7.2, 7.5_

- [ ] 11.3 Implement swipe action handling
  - Create handlers for pass and like buttons
  - Call POST /api/swipe with action
  - Display match notification modal if mutual like
  - Handle API errors gracefully
  - Add loading state during API call
  - **Responsibility: Divyam**
  - _Requirements: 3.2_

- [ ] 11.4 Create match notification modal
  - Display modal on successful match creation
  - Show matched developer's profile information
  - Add "View Matches" and "Keep Swiping" buttons
  - Navigate to matches dashboard or continue swiping based on selection
  - Apply Bootstrap modal styling
  - **Responsibility: Akash**
  - _Requirements: 4.2_

- [ ]* 11.5 Write unit tests for swipe components
  - Test profile card rendering
  - Test pass and like button handlers
  - Test match notification display
  - Test "no more profiles" state
  - **Responsibility: Divyam**
  - _Requirements: 3.1, 3.2_

### 12. Matches Dashboard Implementation

- [ ] 12.1 Create matches dashboard page component
  - Fetch all matches on component mount
  - Display loading state while fetching
  - Display "No matches yet" message if empty
  - Render grid of match cards using Bootstrap
  - Ensure responsive layout (grid columns adjust to screen size)
  - **Responsibility: Akash**
  - _Requirements: 5.1, 5.3, 7.2, 7.5_

- [ ] 12.2 Create match card component
  - Display matched developer's profile: name, bio, tech stack
  - Add "Message" button to open chat
  - Navigate to /chat/:matchId on button click
  - Apply Bootstrap card styling
  - **Responsibility: Divyam**
  - _Requirements: 5.2, 7.2_

- [ ] 12.3 Implement real-time match notifications
  - Connect to Socket.io on component mount
  - Listen for "new_match" event
  - Display toast/alert notification when new match received
  - Refresh matches list to include new match
  - **Responsibility: Akash**
  - _Requirements: 4.2, 6.6_

- [ ]* 12.4 Write unit tests for matches dashboard
  - Test matches list rendering
  - Test match card click navigation
  - Test empty state display
  - Test real-time notification handling
  - **Responsibility: Divyam**
  - _Requirements: 5.1, 5.2_

### 13. Messaging Interface Implementation

- [ ] 13.1 Set up Socket.io client connection
  - Create socket service to manage connection
  - Connect to backend Socket.io server with JWT authentication
  - Implement connection error handling and reconnection logic
  - Create helpers to emit and listen for socket events
  - **Responsibility: Divyam**
  - _Requirements: 6.1, 6.2_

- [ ] 13.2 Create chat page component
  - Fetch message history on component mount
  - Join WebSocket room for the match
  - Display matched developer's name in header
  - Create scrollable message container
  - Load message history in chronological order
  - Auto-scroll to bottom on new messages
  - **Responsibility: Akash**
  - _Requirements: 6.4, 6.6, 7.2_

- [ ] 13.3 Create message display component
  - Render message content, timestamp, sender name
  - Style own messages differently from received messages (right vs left align)
  - Display timestamps in readable format
  - Apply Bootstrap styling for message bubbles
  - **Responsibility: Divyam**
  - _Requirements: 6.4, 7.2_

- [ ] 13.4 Implement message input and send functionality
  - Create input field and send button
  - Handle Enter key to send message
  - Emit "send_message" event via Socket.io
  - Clear input field after sending
  - Display sending state while message is being sent
  - **Responsibility: Akash**
  - _Requirements: 6.2_

- [ ] 13.5 Implement real-time message receiving
  - Listen for "receive_message" event from Socket.io
  - Append new message to conversation state
  - Auto-scroll to bottom on new message
  - Display message without page refresh
  - **Responsibility: Divyam**
  - _Requirements: 6.2, 6.6_

- [ ]* 13.6 Write unit tests for messaging components
  - Test message history loading
  - Test message sending
  - Test real-time message receiving
  - Test input field validation (max length)
  - **Responsibility: Akash**
  - _Requirements: 6.2, 6.4_

### 14. Frontend Integration and Polish

- [ ] 14.1 Implement error handling and user feedback
  - Create toast/alert component for notifications
  - Display API error messages to users
  - Handle network errors gracefully
  - Add retry logic for failed requests
  - Display loading spinners during async operations
  - **Responsibility: Divyam**
  - _Requirements: 7.3, 8.6_

- [ ] 14.2 Add responsive design improvements
  - Test all pages on mobile, tablet, desktop screen sizes
  - Adjust Bootstrap grid layouts for optimal mobile experience
  - Ensure navigation menu works on mobile (hamburger menu)
  - Test touch interactions for swipe buttons
  - **Responsibility: Akash**
  - _Requirements: 7.5_

- [ ] 14.3 Implement logout functionality
  - Create logout handler in AuthContext
  - Clear JWT token from localStorage
  - Disconnect Socket.io connection
  - Redirect to login page
  - Add logout button to navigation bar
  - **Responsibility: Divyam**
  - _Requirements: 1.4, 7.4_

- [ ]* 14.4 Write integration tests for user flows
  - Test complete registration → profile → swipe → match flow
  - Test login → matches → chat flow
  - Test logout and re-login
  - **Responsibility: Akash**
  - _Requirements: 1.2, 1.3, 3.1, 4.1, 6.1_

- [ ]* 14.5 Write property test for protected endpoint authentication
  - **Property 21: Protected endpoints reject invalid tokens**
  - **Validates: Requirements 8.5**
  - Attempt to access protected routes without token or with invalid token
  - Verify 401 response and redirect to login
  - **Responsibility: Divyam**
  - _Requirements: 8.5_

- [ ]* 14.6 Write property test for HTTP status codes
  - **Property 22: HTTP status codes match outcomes**
  - **Validates: Requirements 8.6**
  - Test various API operations and verify correct status codes
  - **Responsibility: Akash**
  - _Requirements: 8.6_

### 15. Final Checkpoint and Deployment

- [ ] 15.1 End-to-end testing of complete platform
  - Test complete user journey: register → profile → swipe → match → chat
  - Test with multiple users to verify real-time features
  - Verify all features work in production environment
  - Test on multiple browsers (Chrome, Firefox, Safari)
  - Test on mobile devices
  - **Responsibility: All team members**
  - _Requirements: All_

- [ ] 15.2 Deploy frontend to production
  - Build production bundle with `npm run build`
  - Deploy to hosting service (Vercel, Netlify)
  - Configure environment variables for production backend URL
  - Verify production deployment works correctly
  - Update CORS configuration in backend for production frontend URL
  - **Responsibility: Divyam**
  - _Requirements: 7.3_

- [ ] 15.3 Final code review and documentation
  - Review all code for quality and consistency
  - Ensure all pull requests are merged
  - Update README with setup instructions
  - Document environment variables needed
  - Document Git workflow and contribution guidelines
  - **Responsibility: Akshat (Lead)**
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

## Notes

- **Tasks marked with `*` are optional** and can be skipped for faster MVP delivery. These include property-based tests, unit tests, and integration tests.
- **Each task references specific requirements** for traceability back to the requirements document.
- **Phase 1 (Backend) must be completed before Phase 2 (Frontend)** to ensure the frontend team has a working API to integrate against.
- **Responsibility labels** indicate which team member is primarily responsible, but collaboration is encouraged.
- **Checkpoints** (tasks 7.1, 7.2, 15.1) ensure validation at critical points and provide opportunities for team sync and questions.
- **Property-based tests** validate universal correctness properties defined in the design document across wide ranges of generated inputs (minimum 100 iterations).
- **Unit tests** validate specific examples, edge cases, and error conditions to complement property tests.
- **Git workflow is mandatory**: All work must be done in feature branches with pull requests for code review before merging to main.
- **API contract** serves as the interface between frontend and backend teams and should be considered the source of truth.
- **Performance targets**: Profile load < 500ms (Requirement 3.4), Match dashboard load < 1 second (Requirement 5.3).
- **Security requirements**: All passwords hashed, JWT tokens used for authentication, protected endpoints verify tokens.

## Task Dependency Graph

```json
{
  "waves": [
    {
      "id": 0,
      "tasks": ["1.1"]
    },
    {
      "id": 1,
      "tasks": ["1.2", "1.3", "1.4"]
    },
    {
      "id": 2,
      "tasks": ["1.5", "2.1", "2.4"]
    },
    {
      "id": 3,
      "tasks": ["2.2", "2.3", "2.5", "2.6", "2.8"]
    },
    {
      "id": 4,
      "tasks": ["2.7", "3.1", "3.2", "3.4", "3.6"]
    },
    {
      "id": 5,
      "tasks": ["3.3", "3.5", "3.7", "3.8", "4.1", "4.3"]
    },
    {
      "id": 6,
      "tasks": ["4.2", "4.4", "4.5", "4.6", "5.1"]
    },
    {
      "id": 7,
      "tasks": ["5.2", "5.3", "5.4", "5.7"]
    },
    {
      "id": 8,
      "tasks": ["5.5", "5.6", "5.8", "5.9", "6.1", "6.2"]
    },
    {
      "id": 9,
      "tasks": ["6.3", "6.4", "6.5", "6.7", "6.9"]
    },
    {
      "id": 10,
      "tasks": ["6.6", "6.8", "6.10"]
    },
    {
      "id": 11,
      "tasks": ["7.1", "7.2"]
    },
    {
      "id": 12,
      "tasks": ["8.1", "8.2"]
    },
    {
      "id": 13,
      "tasks": ["8.3", "8.5"]
    },
    {
      "id": 14,
      "tasks": ["8.4", "8.6", "9.1", "9.2"]
    },
    {
      "id": 15,
      "tasks": ["9.3", "10.1", "10.2", "10.3"]
    },
    {
      "id": 16,
      "tasks": ["10.4", "11.1", "11.2"]
    },
    {
      "id": 17,
      "tasks": ["11.3", "11.4"]
    },
    {
      "id": 18,
      "tasks": ["11.5", "12.1", "12.2"]
    },
    {
      "id": 19,
      "tasks": ["12.3"]
    },
    {
      "id": 20,
      "tasks": ["12.4", "13.1", "13.2", "13.3"]
    },
    {
      "id": 21,
      "tasks": ["13.4", "13.5"]
    },
    {
      "id": 22,
      "tasks": ["13.6", "14.1", "14.2", "14.3"]
    },
    {
      "id": 23,
      "tasks": ["14.4", "14.5", "14.6"]
    },
    {
      "id": 24,
      "tasks": ["15.1"]
    },
    {
      "id": 25,
      "tasks": ["15.2", "15.3"]
    }
  ]
}
```

