# API Contract

## Overview

This document defines the current API contract based on the implemented backend.

Base URL (development): http://localhost:5000/api

Authentication: Protected endpoints require JWT in the Authorization header.

    Authorization: Bearer <jwt_token>

Response format: JSON

Error format:

    {
      "error": "Error message description"
    }

## Implemented Route Map (Server)

The server currently mounts these API groups:

- /api/auth
- /api/profile
- /api/swipe
- /api/matches
- /api/messages

All groups except /api/auth are protected by auth middleware.

---

## Authentication Endpoints

### POST /api/auth/register

Access: Public

Request body:

    {
      "email": "developer@example.com",
      "password": "securePassword123",
      "name": "John Doe"
    }

Success response (201):

    {
      "token": "jwt_token",
      "user": {
        "id": "507f1f77bcf86cd799439011",
        "email": "developer@example.com",
        "name": "John Doe"
      }
    }

Error responses:

- 400: Missing fields or duplicate email
- 500: Server error

### POST /api/auth/login

Access: Public

Request body:

    {
      "email": "developer@example.com",
      "password": "securePassword123"
    }

Success response (200):

    {
      "token": "jwt_token",
      "user": {
        "id": "507f1f77bcf86cd799439011",
        "email": "developer@example.com",
        "name": "John Doe"
      }
    }

Error responses:

- 400: Missing fields
- 401: Invalid credentials
- 500: Server error

---

## User and Profile Data Notes

### User model fields

- email
- password
- name

### Profile model fields

- userId
- bio
- githubUrl
- techStack

The latest profile updates support githubUrl and techStack directly through PUT /api/profile.

---

## Profile Endpoints

### GET /api/profile

Access: Protected

Current success response (200):

    {
      "_id": "profile_object_id",
      "userId": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "John Doe"
      },
      "bio": "Full-stack developer",
      "githubUrl": "https://github.com/johndoe",
      "techStack": ["React", "Node.js"],
      "__v": 0
    }

Error responses:

- 401: Missing or invalid token
- 404: Profile not found
- 500: Server error

### PUT /api/profile

Access: Protected

Request body (supported fields):

    {
      "bio": "Full-stack developer",
      "githubUrl": "https://github.com/johndoe",
      "techStack": ["React", "Node.js", "MongoDB"]
    }

Current success response (200):

    {
      "_id": "profile_object_id",
      "userId": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "John Doe"
      },
      "bio": "Full-stack developer",
      "githubUrl": "https://github.com/johndoe",
      "techStack": ["React", "Node.js", "MongoDB"],
      "__v": 0
    }

Error responses:

- 401: Missing or invalid token
- 404: Profile not found
- 500: Server error

Note: Endpoints for adding/removing tech with /api/profile/tech are not implemented in current backend.

---

## Swipe Endpoints

### GET /api/swipe/next

Access: Protected

Behavior:

- Excludes the current user using _id not equal to req.user.userId
- Filters out users already swiped by the current user

Standardized profile response fields (200):

    {
      "_id": "profile_object_id",
      "userId": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Jane Smith"
      },
      "bio": "Backend developer specializing in APIs",
      "githubUrl": "https://github.com/janesmith",
      "techStack": ["Python", "Django", "Docker"],
      "__v": 0
    }

No profile available (current implementation returns 404):

    {
      "message": "No more profiles available"
    }

Error responses:

- 401: Missing or invalid token
- 404: No more profiles or profile not found
- 500: Server error

### POST /api/swipe

Access: Protected

Request body (current backend fields):

    {
      "swipedId": "507f1f77bcf86cd799439012",
      "action": "like"
    }

Current success response (201):

    {
      "swipe": {
        "_id": "swipe_id",
        "swiperId": "507f1f77bcf86cd799439011",
        "swipedId": "507f1f77bcf86cd799439012",
        "action": "like",
        "timestamp": "2024-01-20T16:30:00Z",
        "__v": 0
      },
      "match": null
    }

If a mutual like exists, match is an object:

    {
      "swipe": { "...": "..." },
      "match": {
        "_id": "match_id",
        "developer1Id": "507f1f77bcf86cd799439011",
        "developer2Id": "507f1f77bcf86cd799439012",
        "createdAt": "2024-01-20T16:31:00Z",
        "__v": 0
      }
    }

Error responses:

- 400: Missing fields, invalid action, or self-swipe
- 401: Missing or invalid token
- 500: Server error

---

## Match Endpoints

### GET /api/matches

Access: Protected

Current success response (200):

    [
      {
        "matchId": "507f1f77bcf86cd799439013",
        "createdAt": "2024-01-20T16:30:00Z",
        "user": {
          "id": "507f1f77bcf86cd799439012",
          "name": "Jane Smith",
          "bio": "Backend developer",
          "githubUrl": "https://github.com/janesmith",
          "techStack": ["Python", "Django", "Docker"]
        }
      }
    ]

Error responses:

- 401: Missing or invalid token
- 500: Server error

---

## Messaging Endpoints

### POST /api/messages

Access: Protected

Request body fields (explicit):

- matchId
- receiverId
- content

Current backend behavior:

- matchId and content are required.
- senderId is derived from JWT.
- receiverId is derived from match participants on the server side.
- If receiverId is sent by client, server currently does not require or trust it.

Recommended request payload:

    {
      "matchId": "507f1f77bcf86cd799439013",
      "receiverId": "507f1f77bcf86cd799439012",
      "content": "Hey! I saw you work with Django."
    }

Current success response (201):

    {
      "_id": "message_id",
      "matchId": "507f1f77bcf86cd799439013",
      "senderId": "507f1f77bcf86cd799439011",
      "receiverId": "507f1f77bcf86cd799439012",
      "content": "Hey! I saw you work with Django.",
      "read": false,
      "timestamp": "2024-01-20T16:35:00Z",
      "__v": 0
    }

Error responses:

- 400: Missing required fields
- 401: Missing or invalid token
- 403: User is not part of the match
- 404: Match not found
- 500: Server error

### GET /api/messages/:matchId

Access: Protected

Current success response (200):

    [
      {
        "_id": "message_id_1",
        "matchId": "507f1f77bcf86cd799439013",
        "senderId": "507f1f77bcf86cd799439011",
        "receiverId": "507f1f77bcf86cd799439012",
        "content": "First message",
        "read": false,
        "timestamp": "2024-01-20T16:35:00Z",
        "__v": 0
      },
      {
        "_id": "message_id_2",
        "matchId": "507f1f77bcf86cd799439013",
        "senderId": "507f1f77bcf86cd799439012",
        "receiverId": "507f1f77bcf86cd799439011",
        "content": "Second message",
        "read": false,
        "timestamp": "2024-01-20T16:40:00Z",
        "__v": 0
      }
    ]

Ordering:

- Messages are returned in ascending time order.

Error responses:

- 401: Missing or invalid token
- 403: User is not part of this match
- 404: Match not found
- 500: Server error

---

## Status Code Reference

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Implementation Alignment Notes

- This contract reflects the implemented Express routes mounted in server.js.
- WebSocket event contracts are intentionally omitted here because they are not currently implemented in server.js.
- If frontend requires a stricter response shape (for example senderName in messages or wrapped matches array), backend controllers should be updated and this contract version should be bumped.

## Version

Version: 1.1
Date: 2026-06-30
Change summary: Updated to match implemented backend routes, profile fields, swipe response structure, and messaging behavior.
