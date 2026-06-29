# API Contract

## Overview

This document defines the contract between the frontend and backend teams. All API endpoints, request/response formats, status codes, and WebSocket events are specified here. Frontend developers consume these endpoints without needing backend implementation details. Backend developers implement exactly what is documented here.

**Base URL:** `http://localhost:5000/api` (development)

**Authentication:** Protected endpoints require JWT token in header:
```
Authorization: Bearer <jwt_token>
```

**Response Format:** All responses use JSON format.

**Error Format:** All errors return consistent JSON structure:
```json
{
  "error": "Error message description"
}
```

---

## Authentication Endpoints

### POST /api/auth/register

Register a new user account.

**Access:** Public

**Request Body:**
```json
{
  "email": "developer@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Validations:**
- `email`: Required, valid email format, unique
- `password`: Required, minimum 6 characters
- `name`: Required, minimum 2 characters

**Success Response (201 Created):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "developer@example.com",
    "name": "John Doe"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Validation error or email already exists
  ```json
  { "error": "Email already registered" }
  ```
- `500 Internal Server Error`: Server error

---

### POST /api/auth/login

Authenticate existing user.

**Access:** Public

**Request Body:**
```json
{
  "email": "developer@example.com",
  "password": "securePassword123"
}
```

**Success Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "developer@example.com",
    "name": "John Doe"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Missing fields
- `401 Unauthorized`: Invalid email or password
  ```json
  { "error": "Invalid email or password" }
  ```
- `500 Internal Server Error`: Server error

---

## Profile Endpoints

### GET /api/profile

Get the authenticated user's profile.

**Access:** Protected (requires JWT)

**Success Response (200 OK):**
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "developer@example.com",
  "bio": "Full-stack developer passionate about React and Node.js",
  "githubUrl": "https://github.com/johndoe",
  "techStack": ["React", "Node.js", "MongoDB", "Express"],
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-20T14:45:00Z"
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid token
- `404 Not Found`: Profile not found
- `500 Internal Server Error`: Server error

---

### PUT /api/profile

Update the authenticated user's profile.

**Access:** Protected (requires JWT)

**Request Body:**
```json
{
  "bio": "Full-stack developer passionate about React and Node.js",
  "githubUrl": "https://github.com/johndoe",
  "techStack": ["React", "Node.js", "MongoDB", "Express", "TypeScript"]
}
```

**Validations:**
- `bio`: Optional, max 500 characters
- `githubUrl`: Optional, must be valid URL starting with https://github.com/
- `techStack`: Optional, array of strings, each max 50 characters

**Success Response (200 OK):**
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "developer@example.com",
  "bio": "Full-stack developer passionate about React and Node.js",
  "githubUrl": "https://github.com/johndoe",
  "techStack": ["React", "Node.js", "MongoDB", "Express", "TypeScript"],
  "updatedAt": "2024-01-20T15:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request`: Validation error
  ```json
  { "error": "Bio exceeds 500 characters" }
  ```
- `401 Unauthorized`: Missing or invalid token
- `500 Internal Server Error`: Server error

---

### POST /api/profile/tech

Add a technology to the user's tech stack.

**Access:** Protected (requires JWT)

**Request Body:**
```json
{
  "techName": "TypeScript"
}
```

**Validations:**
- `techName`: Required, non-empty string, max 50 characters

**Success Response (200 OK):**
```json
{
  "techStack": ["React", "Node.js", "MongoDB", "Express", "TypeScript"]
}
```

**Error Responses:**
- `400 Bad Request`: Validation error or duplicate tech
- `401 Unauthorized`: Missing or invalid token
- `500 Internal Server Error`: Server error

---

### DELETE /api/profile/tech/:techName

Remove a technology from the user's tech stack.

**Access:** Protected (requires JWT)

**URL Parameters:**
- `techName`: The technology name to remove (URL encoded)

**Success Response (200 OK):**
```json
{
  "techStack": ["React", "Node.js", "MongoDB", "Express"]
}
```

**Error Responses:**
- `400 Bad Request`: Tech not found in stack
- `401 Unauthorized`: Missing or invalid token
- `500 Internal Server Error`: Server error

---

## Swipe Endpoints

### GET /api/swipe/next

Get the next profile to swipe on.

**Access:** Protected (requires JWT)

**Query Parameters:** None

**Success Response (200 OK):**
```json
{
  "userId": "507f1f77bcf86cd799439012",
  "name": "Jane Smith",
  "bio": "Backend developer specializing in scalable APIs",
  "githubUrl": "https://github.com/janesmith",
  "techStack": ["Python", "Django", "PostgreSQL", "Docker"]
}
```

**Success Response - No More Profiles (200 OK):**
```json
{
  "message": "No more profiles available"
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid token
- `500 Internal Server Error`: Server error

**Performance Target:** < 500ms response time

---

### POST /api/swipe

Record a swipe action (pass or like).

**Access:** Protected (requires JWT)

**Request Body:**
```json
{
  "swipedUserId": "507f1f77bcf86cd799439012",
  "action": "like"
}
```

**Validations:**
- `swipedUserId`: Required, valid MongoDB ObjectId
- `action`: Required, must be "pass" or "like"

**Success Response (200 OK) - No Match:**
```json
{
  "action": "like",
  "match": false
}
```

**Success Response (200 OK) - Match Created:**
```json
{
  "action": "like",
  "match": true,
  "matchId": "507f1f77bcf86cd799439013",
  "matchedUser": {
    "userId": "507f1f77bcf86cd799439012",
    "name": "Jane Smith",
    "bio": "Backend developer specializing in scalable APIs",
    "githubUrl": "https://github.com/janesmith",
    "techStack": ["Python", "Django", "PostgreSQL", "Docker"]
  }
}
```

**Error Responses:**
- `400 Bad Request`: Validation error or invalid action
  ```json
  { "error": "Invalid action. Must be 'pass' or 'like'" }
  ```
- `401 Unauthorized`: Missing or invalid token
- `404 Not Found`: Swiped user not found
- `500 Internal Server Error`: Server error

---

## Match Endpoints

### GET /api/matches

Get all matches for the authenticated user.

**Access:** Protected (requires JWT)

**Success Response (200 OK):**
```json
{
  "matches": [
    {
      "matchId": "507f1f77bcf86cd799439013",
      "matchedUser": {
        "userId": "507f1f77bcf86cd799439012",
        "name": "Jane Smith",
        "bio": "Backend developer specializing in scalable APIs",
        "githubUrl": "https://github.com/janesmith",
        "techStack": ["Python", "Django", "PostgreSQL", "Docker"]
      },
      "createdAt": "2024-01-20T16:30:00Z"
    },
    {
      "matchId": "507f1f77bcf86cd799439014",
      "matchedUser": {
        "userId": "507f1f77bcf86cd799439015",
        "name": "Bob Johnson",
        "bio": "Frontend developer who loves React",
        "githubUrl": "https://github.com/bobjohnson",
        "techStack": ["React", "TypeScript", "CSS", "Next.js"]
      },
      "createdAt": "2024-01-19T10:15:00Z"
    }
  ]
}
```

**Note:** Matches are ordered by `createdAt` descending (most recent first)

**Error Responses:**
- `401 Unauthorized`: Missing or invalid token
- `500 Internal Server Error`: Server error

**Performance Target:** < 1 second response time

---

## Messaging Endpoints

### GET /api/messages/:matchId

Get message history for a conversation.

**Access:** Protected (requires JWT)

**URL Parameters:**
- `matchId`: The match ID for the conversation

**Success Response (200 OK):**
```json
{
  "matchId": "507f1f77bcf86cd799439013",
  "messages": [
    {
      "messageId": "507f1f77bcf86cd799439020",
      "senderId": "507f1f77bcf86cd799439011",
      "senderName": "John Doe",
      "content": "Hey! I saw you work with Django. I'd love to learn more!",
      "timestamp": "2024-01-20T16:35:00Z",
      "read": true
    },
    {
      "messageId": "507f1f77bcf86cd799439021",
      "senderId": "507f1f77bcf86cd799439012",
      "senderName": "Jane Smith",
      "content": "Hi John! Sure, happy to chat about it.",
      "timestamp": "2024-01-20T16:40:00Z",
      "read": true
    }
  ]
}
```

**Note:** Messages are ordered by `timestamp` ascending (oldest first)

**Error Responses:**
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User is not part of this match
  ```json
  { "error": "You are not authorized to view this conversation" }
  ```
- `404 Not Found`: Match not found
- `500 Internal Server Error`: Server error

---

### POST /api/messages

Send a message (also triggers WebSocket event).

**Access:** Protected (requires JWT)

**Request Body:**
```json
{
  "matchId": "507f1f77bcf86cd799439013",
  "content": "Hey! I saw you work with Django. I'd love to learn more!"
}
```

**Validations:**
- `matchId`: Required, valid MongoDB ObjectId
- `content`: Required, non-empty string, max 1000 characters

**Success Response (201 Created):**
```json
{
  "messageId": "507f1f77bcf86cd799439020",
  "matchId": "507f1f77bcf86cd799439013",
  "senderId": "507f1f77bcf86cd799439011",
  "senderName": "John Doe",
  "content": "Hey! I saw you work with Django. I'd love to learn more!",
  "timestamp": "2024-01-20T16:35:00Z",
  "read": false
}
```

**Error Responses:**
- `400 Bad Request`: Validation error
  ```json
  { "error": "Message content cannot be empty" }
  ```
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User is not part of this match
- `404 Not Found`: Match not found
- `500 Internal Server Error`: Server error

**Note:** This endpoint also emits a WebSocket event to the matched user (see WebSocket section).

---

## WebSocket Events

### Connection

**URL:** `http://localhost:5000` (Socket.io connection)

**Authentication:** Send JWT token on connection
```javascript
const socket = io('http://localhost:5000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

**Backend Verification:** Server verifies JWT before accepting connection.

---

### Event: `join_conversation`

**Direction:** Client → Server

**Purpose:** Join a conversation room for real-time messaging.

**Payload:**
```json
{
  "matchId": "507f1f77bcf86cd799439013"
}
```

**Server Actions:**
- Verify user is part of the match
- Add socket to room: `match_${matchId}`

---

### Event: `send_message`

**Direction:** Client → Server

**Purpose:** Send a real-time message.

**Payload:**
```json
{
  "matchId": "507f1f77bcf86cd799439013",
  "content": "This is a real-time message"
}
```

**Server Actions:**
1. Verify user authorization (user is part of match)
2. Save message to database
3. Emit `receive_message` to room (both users)

---

### Event: `receive_message`

**Direction:** Server → Client

**Purpose:** Receive a real-time message.

**Payload:**
```json
{
  "messageId": "507f1f77bcf86cd799439022",
  "matchId": "507f1f77bcf86cd799439013",
  "senderId": "507f1f77bcf86cd799439012",
  "senderName": "Jane Smith",
  "content": "This is a real-time message",
  "timestamp": "2024-01-20T17:00:00Z",
  "read": false
}
```

**Client Action:** Display message in conversation UI without refresh.

---

### Event: `new_match`

**Direction:** Server → Client

**Purpose:** Notify user of a new match.

**Payload:**
```json
{
  "matchId": "507f1f77bcf86cd799439014",
  "matchedUser": {
    "userId": "507f1f77bcf86cd799439015",
    "name": "Bob Johnson",
    "bio": "Frontend developer who loves React",
    "githubUrl": "https://github.com/bobjohnson",
    "techStack": ["React", "TypeScript", "CSS", "Next.js"]
  },
  "createdAt": "2024-01-20T18:00:00Z"
}
```

**Client Action:** Display notification, update matches dashboard.

---

### Event: `disconnect`

**Direction:** Client ↔ Server

**Purpose:** Handle socket disconnection.

**Client Action:** Attempt reconnection with exponential backoff.

---

## Status Code Reference

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, DELETE requests |
| 201 | Created | Successful POST request that creates a resource |
| 400 | Bad Request | Validation error, malformed request |
| 401 | Unauthorized | Missing, invalid, or expired JWT token |
| 403 | Forbidden | User lacks permission for resource |
| 404 | Not Found | Resource does not exist |
| 500 | Internal Server Error | Server-side error |

---

## Common Error Scenarios

### Authentication Errors

**Missing Token:**
```json
{
  "error": "No token provided"
}
```
**Status:** 401 Unauthorized

**Invalid Token:**
```json
{
  "error": "Invalid token"
}
```
**Status:** 401 Unauthorized

**Expired Token:**
```json
{
  "error": "Token expired"
}
```
**Status:** 401 Unauthorized

### Validation Errors

**Missing Required Field:**
```json
{
  "error": "Email is required"
}
```
**Status:** 400 Bad Request

**Invalid Format:**
```json
{
  "error": "Invalid email format"
}
```
**Status:** 400 Bad Request

**Value Too Long:**
```json
{
  "error": "Bio exceeds 500 characters"
}
```
**Status:** 400 Bad Request

### Resource Errors

**Not Found:**
```json
{
  "error": "User not found"
}
```
**Status:** 404 Not Found

**Authorization Error:**
```json
{
  "error": "You are not authorized to access this resource"
}
```
**Status:** 403 Forbidden

---

## Testing the API

### Using cURL

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User"}'
```

**Get Profile:**
```bash
curl -X GET http://localhost:5000/api/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Swipe:**
```bash
curl -X POST http://localhost:5000/api/swipe \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"swipedUserId":"507f1f77bcf86cd799439012","action":"like"}'
```

### Using Postman

1. Import endpoints as a collection
2. Set environment variable for `token`
3. Use `{{token}}` in Authorization headers
4. Test each endpoint with valid and invalid data

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024-01-20 | Initial API contract |

---

## Notes for Teams

**Frontend Team:**
- All API responses are JSON
- Store JWT token in localStorage or sessionStorage
- Include token in Authorization header for protected endpoints
- Handle all listed error responses with user-friendly messages
- WebSocket connection requires JWT authentication

**Backend Team:**
- Implement exactly what is documented here
- Return consistent error format: `{ "error": "message" }`
- Use appropriate HTTP status codes
- Validate all inputs before processing
- Emit WebSocket events as specified
- Any changes to this contract must be communicated to frontend team

**Contract Changes:**
- Must be approved by both teams
- Document version changes
- Provide migration path if breaking changes
