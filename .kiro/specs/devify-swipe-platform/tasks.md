# Implementation Plan: Devify Swipe Platform

## Overview

This implementation plan is structured for a 4-person team with strict frontend/backend separation:

- **Backend Team (Phase 1):** Akshat (Lead) and Adarsh implement the complete backend API first
- **Frontend Team (Phase 2):** Divyam and Akash implement the React frontend after backend is complete
- **Technologies:** Node.js/Express/MongoDB (Backend), React/Bootstrap (Frontend)
- **Git Workflow:** Feature branches and pull requests are mandatory for all work

The phased approach ensures the frontend team has a working API to integrate against, preventing blocking dependencies and enabling parallel testing.

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

