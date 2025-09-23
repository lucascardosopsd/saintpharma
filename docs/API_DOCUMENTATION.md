# API Documentation - Saint Pharma

This document provides comprehensive documentation for all API routes, including required parameters, request/response formats, and examples.

## Table of Contents

- [Authentication](#authentication)
- [User Management](#user-management)
- [Courses](#courses)
- [Lectures](#lectures)
- [Exams](#exams)
- [Certificates](#certificates)
- [Ranking](#ranking)
- [User Progress](#user-progress)
- [User Lives](#user-lives)
- [User Points](#user-points)
- [User Summary](#user-summary)
- [User Courses](#user-courses)
- [User Complete Data](#user-complete-data)
- [Sanity Integration](#sanity-integration)

---

## Authentication

### POST /api/auth/login

Authenticates a user via Clerk and returns user information.

**Headers:**

- `Authorization: Bearer <API_TOKEN>`

**Request Body:**

```json
{
  "clerkUserId": "string (required)",
  "sessionToken": "string (optional)",
  "createIfNotExists": "boolean (default: true)"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "clerkId": "string",
      "name": "string",
      "email": "string",
      "profileImage": "string",
      "points": "number",
      "createdAt": "string (ISO date)",
      "updatedAt": "string (ISO date)"
    },
    "ranking": {
      "position": "number",
      "totalUsers": "number"
    },
    "points": "number",
    "lastLogin": "string (ISO date)"
  },
  "timestamp": "string (ISO date)"
}
```

**Error Codes:**

- `MISSING_CLERK_USER_ID`: clerkUserId is required
- `CLERK_USER_NOT_FOUND`: User not found in Clerk
- `UNAUTHORIZED`: Invalid or missing API token

---

### POST /api/auth/logout

Performs user logout and updates session information.

**Headers:**

- `Authorization: Bearer <API_TOKEN>`
- `X-User-Id: <clerk_user_id>`

**Request Body (Optional):**

```json
{
  "sessionDuration": "number (minutes)",
  "reason": "string (default: 'manual')"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Logout realizado com sucesso",
    "user": {
      "id": "string",
      "clerkId": "string",
      "name": "string",
      "email": "string"
    },
    "session": {
      "loginAt": "string (ISO date)",
      "logoutAt": "string (ISO date)",
      "duration": "number (minutes)",
      "reason": "string"
    },
    "recentActivity": {
      "lecturesCompleted": "number",
      "examsCompleted": "number",
      "certificatesEarned": "number",
      "period": "last 24 hours"
    },
    "logoutAt": "string (ISO date)"
  },
  "timestamp": "string (ISO date)"
}
```

---

### GET /api/auth/user

Returns information about the authenticated user.

**Headers:**

- `Authorization: Bearer <API_TOKEN>`
- `X-User-Id: <clerk_user_id>`

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "clerkId": "string",
    "name": "string",
    "email": "string",
    "profileImage": "string",
    "points": "number",
    "lives": "number",
    "createdAt": "string (ISO date)",
    "updatedAt": "string (ISO date)"
  },
  "timestamp": "string (ISO date)"
}
```

**Error Codes:**

- `MISSING_USER_ID`: X-User-Id header is required
- `USER_NOT_FOUND`: User not found

---

## User Management

### POST /api/clerk/upsert

Processes Clerk webhook events for user management.

**Headers:**

- `Content-Type: application/json`

**Request Body:**

```json
{
  "type": "string (user.created | user.updated | user.deleted)",
  "data": {
    "id": "string (clerk user id)",
    "email_addresses": [
      {
        "email_address": "string"
      }
    ],
    "first_name": "string",
    "image_url": "string"
  }
}
```

**Response:**

```json
{
  "status": 200,
  "message": "Usuário processado com sucesso"
}
```

**Error Codes:**

- `400`: Email é obrigatório / ClerkId é obrigatório para delete
- `404`: Usuário não encontrado
- `500`: Erro interno do servidor

---

## Courses

### GET /api/courses

Returns list of all available courses.

**Headers:**

- `Authorization: Bearer <API_TOKEN>`

**Response:**

```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "_id": "string",
        "name": "string",
        "description": "string",
        "banner": {
          "asset": {
            "url": "string"
          }
        },
        "points": "number",
        "workload": "number",
        "premiumPoints": "number"
      }
    ],
    "total": "number"
  },
  "timestamp": "string (ISO date)"
}
```

---

### GET /api/courses/[id]

Returns a specific course by ID.

**Headers:**

- `Authorization: Bearer <API_TOKEN>`

**Path Parameters:**

- `id`: Course ID

**Response:**

```json
{
  "success": true,
  "data": {
    "course": {
      "_id": "string",
      "name": "string",
      "description": "string",
      "banner": {
        "asset": {
          "url": "string"
        }
      },
      "points": "number",
      "workload": "number",
      "premiumPoints": "number"
    }
  },
  "timestamp": "string (ISO date)"
}
```

---

### POST /api/courses/[id]/complete

Marks a course as completed for the user and generates a certificate.

**Headers:**

- `Authorization: Bearer <API_TOKEN>`
- `X-User-Id: <clerk_user_id>`

**Path Parameters:**

- `id`: Course ID

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Curso concluído com sucesso",
    "certificate": {
      "id": "string",
      "userId": "string",
      "courseCmsId": "string",
      "courseTitle": "string",
      "description": "string",
      "points": "number",
      "workload": "number",
      "createdAt": "string (ISO date)"
    },
    "course": {
      "id": "string",
      "name": "string",
      "points": "number"
    }
  },
  "timestamp": "string (ISO date)"
}
```

**Error Codes:**

- `COURSE_NOT_FOUND`: Course not found
- `CERTIFICATE_ALREADY_EXISTS`: Certificate already exists for this course
- `INCOMPLETE_COURSE`: Not all lectures completed

---

## Lectures

### GET /api/lectures

Returns lectures for a specific course with user progress.

**Headers:**

- `Authorization: Bearer <API_TOKEN>`
- `X-User-Id: <clerk_user_id> (optional)`

**Query Parameters:**

- `courseId`: Course ID (required)

**Response:**

```json
{
  "success": true,
  "data": {
    "lectures": [
      {
        "_id": "string",
        "title": "string",
        "description": "string",
        "videoUrl": "string",
        "duration": "number",
        "order": "number",
        "isCompleted": "boolean",
        "completedAt": "string (ISO date) or null"
      }
    ],
    "course": {
      "_id": "string",
      "name": "string"
    },
    "progress": {
      "completed": "number",
      "total": "number",
      "percentage": "number"
    }
  },
  "timestamp": "string (ISO date)"
}
```

---

### GET /api/lectures/[id]

Returns a specific lecture by ID.

**Headers:**

- `Authorization: Bearer <API_TOKEN>`
- `X-User-Id: <clerk_user_id> (optional)`

**Path Parameters:**

- `id`: Lecture ID

**Response:**

```json
{
  "success": true,
  "data": {
    "lecture": {
      "_id": "string",
      "title": "string",
      "description": "string",
      "videoUrl": "string",
      "duration": "number",
      "order": "number",
      "course": {
        "_id": "string",
        "name": "string"
      }
    },
    "isCompleted": "boolean",
    "completedAt": "string (ISO date) or null"
  },
  "timestamp": "string (ISO date)"
}
```

---

### POST /api/lectures/[id]/complete

Marks a lecture as completed for the user.

**Headers:**

- `Authorization: Bearer <API_TOKEN>`
- `X-User-Id: <clerk_user_id>`

**Path Parameters:**

- `id`: Lecture ID

**Request Body:**

```json
{
  "courseId": "string (required)"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Aula marcada como concluída",
    "userLecture": {
      "id": "string",
      "lectureCmsId": "string",
      "courseId": "string",
      "userId": "string",
      "createdAt": "string (ISO date)"
    }
  },
  "timestamp": "string (ISO date)"
}
```

**Error Codes:**

- `LECTURE_NOT_FOUND`: Lecture not found
- `LECTURE_ALREADY_COMPLETED`: Lecture already completed

---

---

### GET /api/lectures/[id]/questions

Returns questions for a specific lecture.

**Headers:**

- `Authorization: Bearer <API_TOKEN>`

**Path Parameters:**

- `id`: Lecture ID

**Response:**

```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "_id": "string",
        "question": "string",
        "options": [
          {
            "text": "string",
            "isCorrect": "boolean"
          }
        ],
        "explanation": "string",
        "order": "number"
      }
    ],
    "lecture": {
      "_id": "string",
      "title": "string"
    }
  },
  "timestamp": "string (ISO date)"
}
```

---

## Exams

### GET /api/exams/eligibility

Verifica se o usuário pode iniciar um exame (tem vidas disponíveis).

**Headers:**

- `Authorization: Bearer <API_TOKEN>`
- `X-User-Id: <clerk_user_id>`

**Response:**

```json
{
  "success": true,
  "data": {
    "canTakeExam": "boolean",
    "remainingLives": "number",
    "totalLives": "number",
    "nextResetTime": "string (ISO date) | null",
    "message": "string (opcional)"
  },
  "timestamp": "string (ISO date)"
}
```

**Error Codes:**

- `MISSING_USER_ID`: Header X-User-Id é obrigatório
- `USER_NOT_FOUND`: Usuário não encontrado

---

### GET /api/exams

Returns user's exams with pagination.

**Headers:**

- `Authorization: Bearer <API_TOKEN>`
- `X-User-Id: <clerk_user_id>`

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `status`: Filter by status ('completed', 'pending', 'all')

**Response:**

```json
{
  "success": true,
  "data": {
    "exams": [
      {
        "id": "string",
        "complete": "boolean",
        "reproved": "boolean",
        "lectureCMSid": "string",
        "userId": "string",
        "createdAt": "string (ISO date)",
        "updatedAt": "string (ISO date)"
      }
    ],
    "pagination": {
      "page": "number",
      "limit": "number",
      "total": "number",
      "pages": "number",
      "hasNext": "boolean",
      "hasPrev": "boolean"
    }
  },
  "timestamp": "string (ISO date)"
}
```

---

### POST /api/exams

Creates a new exam for a specific lecture.

**Headers:**

- `Authorization: Bearer <API_TOKEN>`
- `X-User-Id: <clerk_user_id>`

**Request Body:**

```json
{
  "lectureCMSid": "string (required)",
  "timeLimit": "number (optional, em minutos)",
  "passingScore": "number (optional, porcentagem mínima para aprovação)"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "exam": {
      "id": "string",
      "lectureCMSid": "string",
      "userId": "string",
      "complete": "boolean",
      "reproved": "boolean",
      "createdAt": "string (ISO date)"
    },
    "quiz": {
      "_id": "string",
      "questions": "array"
    },
    "lecture": {
      "id": "string",
      "title": "string"
    }
  },
  "timestamp": "string (ISO date)"
}
```

**Error Codes:**

- `MISSING_LECTURE_ID`: lectureCMSid is required
- `USER_NOT_FOUND`: User not found
- `LECTURE_NOT_FOUND`: Lecture not found
- `QUIZ_NOT_FOUND`: Quiz not found for this lecture
- `INSUFFICIENT_LIVES`: Usuário não possui vidas suficientes para iniciar o exame

---

### GET /api/exams/[id]

Returns a specific exam by ID.

**Headers:**

- `Authorization: Bearer <API_TOKEN>`
- `X-User-Id: <clerk_user_id>`

**Path Parameters:**

- `id`: Exam ID

**Response:**

```json
{
  "success": true,
  "data": {
    "exam": {
      "id": "string",
      "lectureCMSid": "string",
      "userId": "string",
      "complete": "boolean",
      "reproved": "boolean",
      "timeLimit": "number (optional)",
      "passingScore": "number (optional)",
      "createdAt": "string (ISO date)",
      "updatedAt": "string (ISO date)"
    }
  },
  "timestamp": "string (ISO date)"
}
```

**Error Codes:**

- `EXAM_NOT_FOUND`: Exam not found
- `FORBIDDEN`: Access denied to exam

---

### PUT /api/exams/[id]

Updates an exam (completes it).

**Headers:**

- `Authorization: Bearer <API_TOKEN>`
- `X-User-Id: <clerk_user_id>`

**Path Parameters:**

- `id`: Exam ID

**Request Body:**

```json
{
  "complete": "boolean (required)",
  "reproved": "boolean (optional)",
  "courseId": "string (required if complete = true)"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Exame concluído com sucesso",
    "exam": {
      "id": "string",
      "lectureCMSid": "string",
      "userId": "string",
      "complete": "boolean",
      "reproved": "boolean",
      "updatedAt": "string (ISO date)"
    },
    "lectureCompleted": "boolean",
    "pointsEarned": "number"
  },
  "timestamp": "string (ISO date)"
}
```

**Error Codes:**

- `EXAM_NOT_FOUND`: Exam not found
- `FORBIDDEN`: Access denied to exam
- `EXAM_ALREADY_COMPLETED`: Exam already completed

---

### GET /api/exams/[id]/questions

Returns an exam with its questions and answers.

**Headers:**

- `Authorization: Bearer <API_TOKEN>`
- `X-User-Id: <clerk_user_id>`

**Path Parameters:**

- `id`: Exam ID

**Response:**

```json
{
  "success": true,
  "data": {
    "exam": {
      "id": "string",
      "lectureCMSid": "string",
      "userId": "string",
      "complete": "boolean",
      "reproved": "boolean",
      "questions": [
        {
          "id": "string",
          "title": "string",
          "question": "string",
          "cover": {
            "asset": {
              "url": "string"
            }
          },
          "answers": [
            {
              "answer": "string",
              "isCorrect": "boolean"
            }
          ],
          "order": "number"
        }
      ],
      "totalQuestions": "number",
      "timeLimit": "number (optional, em minutos)",
      "passingScore": "number (optional, porcentagem)",
      "createdAt": "string (ISO date)",
      "updatedAt": "string (ISO date)"
    }
  },
  "timestamp": "string (ISO date)"
}
```

**Error Codes:**

- `MISSING_USER_ID`: X-User-Id header is required
- `MISSING_EXAM_ID`: Exam ID is required
- `USER_NOT_FOUND`: User not found
- `EXAM_NOT_FOUND`: Exam not found

---

### POST /api/exams/[id]/submit

Submits exam answers and calculates results.

**Headers:**

- `Authorization: Bearer <API_TOKEN>`
- `X-User-Id: <clerk_user_id>`

**Path Parameters:**

- `id`: Exam ID

**Request Body:**

```json
{
  "answers": [
    {
      "questionId": "string",
      "selectedAnswer": "string"
    }
  ],
  "timeSpent": "number (em segundos)"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Exame aprovado!",
    "result": {
      "examId": "string",
      "score": "number",
      "totalQuestions": "number",
      "correctAnswers": "number",
      "passed": "boolean",
      "timeSpent": "number",
      "answers": [
        {
          "questionId": "string",
          "selectedAnswer": "string",
          "isCorrect": "boolean",
          "timeSpent": "number"
        }
      ],
      "completedAt": "string (ISO date)"
    }
  },
  "timestamp": "string (ISO date)"
}
```

**Error Codes:**

- `MISSING_USER_ID`: X-User-Id header is required
- `MISSING_EXAM_ID`: Exam ID is required
- `USER_NOT_FOUND`: User not found
- `SUBMISSION_VALIDATION_ERROR`: Validation errors in request
- `INVALID_ANSWERS_FORMAT`: answers must be a non-empty array
- `INVALID_TIME_SPENT`: timeSpent must be a positive number
- `INVALID_ANSWER_FORMAT`: Each answer must have questionId and selectedAnswer

---

### GET /api/exams/[id]/attempts

Returns exam attempts with pagination.

**Headers:**

- `Authorization: Bearer <API_TOKEN>`
- `X-User-Id: <clerk_user_id>`

**Path Parameters:**

- `id`: Exam ID

**Query Parameters:**

- `page`: Page number (default: 0)
- `limit`: Items per page (default: 10, max: 50)

**Response:**

```json
{
  "success": true,
  "data": {
    "attempts": [
      {
        "id": "string",
        "examId": "string",
        "userId": "string",
        "answers": "array",
        "score": "number",
        "totalQuestions": "number",
        "correctAnswers": "number",
        "timeSpent": "number",
        "completedAt": "string (ISO date)",
        "createdAt": "string (ISO date)",
        "updatedAt": "string (ISO date)"
      }
    ],
    "pagination": {
      "page": "number",
      "limit": "number",
      "total": "number",
      "pages": "number",
      "hasNext": "boolean",
      "hasPrev": "boolean"
    }
  },
  "timestamp": "string (ISO date)"
}
```

**Error Codes:**

- `MISSING_USER_ID`: X-User-Id header is required
- `MISSING_EXAM_ID`: Exam ID is required
- `USER_NOT_FOUND`: User not found
- `EXAM_NOT_FOUND`: Exam not found

---

### DELETE /api/exams/[id]

Deletes an exam.

**Headers:**

- `Authorization: Bearer <API_TOKEN>`
- `X-User-Id: <clerk_user_id>`

**Path Parameters:**

- `id`: Exam ID

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Exame deletado com sucesso"
  },
  "timestamp": "string (ISO date)"
}
```

**Error Codes:**

- `EXAM_NOT_FOUND`: Exam not found
- `FORBIDDEN`: Access denied to exam

---

## Certificates

### POST /api/certificate/create

Creates a certificate for a completed course.

**Headers:**

- `Authorization: Bearer <API_TOKEN>`

**Request Body:**

```json
{
  "userId": "string (required)",
  "course": {
    "_id": "string",
    "name": "string",
    "points": "number"
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "certificate": {
      "id": "string",
      "userId": "string",
      "courseCmsId": "string",
      "courseTitle": "string",
      "description": "string",
      "points": "number",
      "workload": "number",
      "createdAt": "string (ISO date)"
    }
  },
  "timestamp": "string (ISO date)"
}
```

**Error Codes:**

- `MISSING_USER_ID`: userId is required
- `USER_NOT_FOUND`: User not found
- `CERTIFICATE_ALREADY_EXISTS`: Certificate already exists for this course

---

### GET /api/certificate

Returns user's certificates with pagination.

**Headers:**

- `Authorization: Bearer <API_TOKEN>`
- `X-User-Id: <clerk_user_id>`

**Query Parameters:**

- `page`: Page number (default: 0)
- `limit`: Items per page (default: 20, max: 100)

**Response:**

```json
{
  "success": true,
  "data": {
    "certificates": [
      {
        "id": "string",
        "userId": "string",
        "courseCmsId": "string",
        "courseTitle": "string",
        "description": "string",
        "points": "number",
        "workload": "number",
        "createdAt": "string (ISO date)",
        "updatedAt": "string (ISO date)"
      }
    ],
    "pagination": {
      "page": "number",
      "limit": "number",
      "total": "number",
      "pages": "number",
      "hasNext": "boolean",
      "hasPrev": "boolean"
    }
  },
  "timestamp": "string (ISO date)"
}
```

**Error Codes:**

- `MISSING_USER_ID`: X-User-Id header is required
- `USER_NOT_FOUND`: User not found

---

### GET /api/certificate/[id]

Returns a specific certificate by ID.

**Headers:**

- `Authorization: Bearer <API_TOKEN>`
- `X-User-Id: <clerk_user_id>`

**Path Parameters:**

- `id`: Certificate ID

**Response:**

```json
{
  "success": true,
  "data": {
    "certificate": {
      "id": "string",
      "userId": "string",
      "courseCmsId": "string",
      "courseTitle": "string",
      "description": "string",
      "points": "number",
      "workload": "number",
      "createdAt": "string (ISO date)",
      "updatedAt": "string (ISO date)"
    }
  },
  "timestamp": "string (ISO date)"
}
```

**Error Codes:**

- `MISSING_USER_ID`: X-User-Id header is required
- `MISSING_CERTIFICATE_ID`: Certificate ID is required
- `USER_NOT_FOUND`: User not found
- `CERTIFICATE_NOT_FOUND`: Certificate not found
- `FORBIDDEN`: Access denied to certificate

---

## Ranking

### GET /api/ranking

Returns the general user ranking based on points.

**Headers:**

- `Authorization: Bearer <API_TOKEN>`

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

**Response:**

```json
{
  "success": true,
  "data": {
    "ranking": [
      {
        "userId": "string",
        "name": "string",
        "points": "number",
        "profileImage": "string",
        "position": "number"
      }
    ],
    "pagination": {
      "page": "number",
      "limit": "number",
      "total": "number",
      "pages": "number",
      "hasNext": "boolean",
      "hasPrev": "boolean"
    },
    "month": "string (YYYY-MM format)"
  },
  "timestamp": "string (ISO date)"
}
```

---

### GET /api/ranking/user

Returns user's points (total and weekly).

**Headers:**

- `Authorization: Bearer <API_TOKEN>`
- `X-User-Id: <clerk_user_id>`

**Response:**

```json
{
  "success": true,
  "data": {
    "userId": "string",
    "userName": "string",
    "totalPoints": "number",
    "weekPoints": "number",
    "profileImage": "string"
  },
  "timestamp": "string (ISO date)"
}
```

**Error Codes:**

- `MISSING_USER_ID`: X-User-Id header is required
- `USER_NOT_FOUND`: User not found

---

## User Progress

### GET /api/user/progress

Returns detailed user progress by course.

**Headers:**

- `Authorization: Bearer <API_TOKEN>`
- `X-User-Id: <clerk_user_id>`

**Query Parameters:**

- `courseId`: Specific course ID to filter (optional)
- `status`: Filter by status ('in_progress', 'completed', 'not_started', 'all')
- `includeDetails`: Include lecture details ('true'/'false', default: 'false')
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 50)

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "clerkId": "string",
      "name": "string",
      "email": "string"
    },
    "progress": {
      "overall": {
        "percentage": "number or null",
        "completedLectures": "number",
        "totalLectures": "number or null"
      },
      "courses": [
        {
          "courseId": "string",
          "status": "string",
          "progress": {
            "completed": "number",
            "total": "number or null",
            "percentage": "number or null"
          },
          "isCompleted": "boolean",
          "certificateId": "string or null",
          "completedAt": "string (ISO date) or null",
          "lastActivity": "string (ISO date) or null",
          "completedLectures": "array (if includeDetails=true)",
          "exams": "array (if includeDetails=true)"
        }
      ],
      "stats": {
        "totalCourses": "number",
        "completedCourses": "number",
        "inProgressCourses": "number",
        "notStartedCourses": "number",
        "totalLectures": "number or null",
        "completedLectures": "number"
      }
    },
    "pagination": {
      "page": "number",
      "limit": "number",
      "total": "number",
      "pages": "number",
      "hasNext": "boolean",
      "hasPrev": "boolean"
    },
    "filters": {
      "courseId": "string or null",
      "status": "string",
      "includeDetails": "boolean"
    }
  },
  "timestamp": "string (ISO date)"
}
```

---

## User Lives

### GET /api/user/lives

Returns user's remaining lives and regeneration information.

**Headers:**

- `Authorization: Bearer <API_TOKEN>`
- `X-User-Id: <clerk_user_id>`

**Response:**

```json
{
  "success": true,
  "data": {
    "userId": "string",
    "totalLives": "number",
    "remainingLives": "number",
    "damageCount": "number",
    "lastDamage": "string (ISO date) or null",
    "resetTime": "string (ISO date)",
    "livesRegenerating": "boolean"
  },
  "timestamp": "string (ISO date)"
}
```

---

### DELETE /api/user/lives

Removes a life from the user.

**Headers:**

- `Authorization: Bearer <API_TOKEN>`
- `X-User-Id: <clerk_user_id>`

**Request Body (Optional):**

```json
{
  "amount": "number (default: 1)"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "1 vida(s) removida(s) com sucesso",
    "userId": "string",
    "livesRemoved": "number",
    "totalLives": "number",
    "remainingLives": "number",
    "resetTime": "string (ISO date)",
    "livesRegenerating": "boolean"
  },
  "timestamp": "string (ISO date)"
}
```

**Error Codes:**

- `INSUFFICIENT_LIVES`: User has no lives remaining

---

## User Points

### PUT /api/user/points

Updates user's points with specific operation.

**Headers:**

- `Authorization: Bearer <API_TOKEN>`
- `X-User-Id: <clerk_user_id>`

**Request Body:**

```json
{
  "points": "number (required)",
  "operation": "string ('set', 'add', 'subtract', default: 'set')",
  "reason": "string (optional)"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Pontuação atualizada com sucesso",
    "user": {
      "id": "string",
      "name": "string",
      "email": "string",
      "points": "number"
    },
    "pointsChange": {
      "previous": "number",
      "new": "number",
      "difference": "number",
      "operation": "string"
    },
    "reason": "string or null"
  },
  "timestamp": "string (ISO date)"
}
```

**Error Codes:**

- `POINTS_VALIDATION_ERROR`: Validation errors in request
- `INVALID_POINTS_TYPE`: Points must be a number
- `INVALID_OPERATION`: Invalid operation type

---

### PATCH /api/user/points

Adds or subtracts points from user (alias for PUT with operation).

**Headers:**

- `Authorization: Bearer <API_TOKEN>`
- `X-User-Id: <clerk_user_id>`

**Request Body:**

```json
{
  "points": "number (required, positive to add, negative to subtract)",
  "reason": "string (optional)"
}
```

**Response:**
Same as PUT /api/user/points

---

## User Summary

### GET /api/user/summary

Returns comprehensive user summary with statistics.

**Headers:**

- `Authorization: Bearer <API_TOKEN>`
- `X-User-Id: <clerk_user_id>`

**Query Parameters:**

- `period`: Time period ('week', 'month', 'all', default: 'all')

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "clerkId": "string",
      "name": "string",
      "email": "string",
      "profileImage": "string",
      "points": "number",
      "lives": "number",
      "createdAt": "string (ISO date)",
      "updatedAt": "string (ISO date)"
    },
    "statistics": {
      "studyHours": {
        "total": "number",
        "weekly": "number",
        "monthly": "number"
      },
      "courses": {
        "completed": "number",
        "inProgress": "number",
        "total": "number"
      },
      "lectures": {
        "completed": "number",
        "total": "number"
      },
      "exams": {
        "completed": "number",
        "passed": "number",
        "failed": "number"
      },
      "certificates": [
        {
          "id": "string",
          "courseTitle": "string",
          "points": "number",
          "createdAt": "string (ISO date)"
        }
      ]
    },
    "ranking": {
      "position": "number",
      "totalUsers": "number"
    },
    "activities": {
      "recentLectures": [
        {
          "id": "string",
          "courseId": "string",
          "lectureId": "string",
          "lectureTitle": "string",
          "completedAt": "string (ISO date)"
        }
      ],
      "recentExams": [
        {
          "id": "string",
          "lectureId": "string",
          "lectureTitle": "string",
          "passed": "boolean",
          "completedAt": "string (ISO date)"
        }
      ]
    }
  },
  "timestamp": "string (ISO date)"
}
```

---

## User Courses

### GET /api/user/courses

Returns user's courses with progress information.

**Headers:**

- `Authorization: Bearer <API_TOKEN>`
- `X-User-Id: <clerk_user_id>`

**Query Parameters:**

- `status`: Filter by status ('completed', 'in_progress', 'all', default: 'all')

**Response:**

```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "id": "string",
        "title": "string",
        "description": "string",
        "imageUrl": "string or null",
        "points": "number",
        "workload": "number",
        "status": "string",
        "progress": "number",
        "completedLectures": "number",
        "totalLectures": "number",
        "createdAt": "string (ISO date) or null",
        "certificateId": "string or null",
        "completedAt": "string (ISO date) or null"
      }
    ],
    "summary": {
      "completed": "number",
      "inProgress": "number",
      "total": "number"
    }
  },
  "timestamp": "string (ISO date)"
}
```

---

### POST /api/user/courses

Marks a course as completed for the user (creates certificate).

**Headers:**

- `Authorization: Bearer <API_TOKEN>`
- `X-User-Id: <clerk_user_id>`

**Request Body:**

```json
{
  "courseId": "string (required)"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Curso marcado como concluído",
    "certificate": {
      "id": "string",
      "courseTitle": "string",
      "description": "string",
      "imageUrl": "string or null"
    },
    "completedAt": "string (ISO date)",
    "points": "number",
    "workload": "number"
  },
  "timestamp": "string (ISO date)"
}
```

**Error Codes:**

- `COURSE_NOT_FOUND`: Course not found
- `CERTIFICATE_ALREADY_EXISTS`: Certificate already exists
- `INCOMPLETE_COURSE`: Not all lectures completed

---

## User Complete Data

### PUT /api/user/complete

Completa dados do usuário, especificamente para adicionar ou atualizar o sobrenome e/ou nome do usuário.

**Headers:**

- `Authorization: Bearer <API_TOKEN>`
- `X-User-Id: <clerk_user_id>`
- `Content-Type: application/json`

**Request Body:**

```json
{
  "lastName": "string (opcional)",
  "firstName": "string (opcional)"
}
```

**Campos:**

- `lastName` (opcional): Sobrenome do usuário
- `firstName` (opcional): Nome do usuário

**Nota:** Pelo menos um dos campos deve ser fornecido.

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Dados do usuário completados com sucesso",
    "user": {
      "id": "string",
      "clerkId": "string",
      "name": "string",
      "email": "string",
      "profileImage": "string",
      "updatedAt": "string (ISO date)"
    }
  },
  "timestamp": "string (ISO date)"
}
```

**Error Codes:**

- `MISSING_USER_ID`: X-User-Id header é obrigatório
- `MISSING_FIELDS`: Pelo menos um campo (lastName ou firstName) deve ser fornecido
- `EMPTY_FIELD`: Campo não pode estar vazio
- `USER_NOT_FOUND`: Usuário não encontrado
- `UNAUTHORIZED`: Token de API inválido

**Exemplos de Uso:**

1. **Adicionar apenas o sobrenome:**

```json
{
  "lastName": "Silva"
}
```

2. **Adicionar nome e sobrenome:**

```json
{
  "firstName": "João",
  "lastName": "Silva"
}
```

3. **Atualizar apenas o primeiro nome:**

```json
{
  "firstName": "Maria"
}
```

**Comportamento da API:**

1. **Atualização do Nome Completo**: Quando `lastName` é fornecido, o sistema combina o `firstName` (se fornecido) ou o primeiro nome atual com o novo sobrenome.

2. **Atualização do Primeiro Nome**: Quando apenas `firstName` é fornecido, o sistema mantém o sobrenome existente e atualiza apenas o primeiro nome.

3. **Validação**: A API valida se os campos não estão vazios e se pelo menos um campo é fornecido.

4. **Autenticação**: A rota requer autenticação via token de API e identificação do usuário via header `X-User-Id`.

**Casos de Uso:**

- Completar perfil do usuário após cadastro
- Permitir que usuários atualizem seus dados pessoais
- Integração com formulários de perfil
- Atualização de dados em fluxos de onboarding

---

## Sanity Integration

### POST /api/sanity/revalidate

Revalidates Sanity CMS data via webhook.

**Headers:**

- `Content-Type: application/json`

**Request Body:**

```json
{
  "_type": "string (required)",
  "slug": "string (optional)"
}
```

**Response:**

```json
{
  "status": 200,
  "revalidated": true,
  "now": "number (timestamp)",
  "body": "object"
}
```

**Error Codes:**

- `401`: Invalid Signature
- `400`: Bad Request
- `500`: Internal Server Error

---

## Error Response Format

All API endpoints return errors in the following format:

```json
{
  "error": "string (error message)",
  "code": "string (error code)",
  "timestamp": "string (ISO date)",
  "details": "array or object (optional, for validation errors)"
}
```

## Common Error Codes

- `UNAUTHORIZED`: Invalid or missing API token
- `FORBIDDEN`: Access denied to resource
- `MISSING_USER_ID`: X-User-Id header is required
- `USER_NOT_FOUND`: User not found
- `VALIDATION_ERROR`: Input validation failed
- `INTERNAL_SERVER_ERROR`: Internal server error
- `LECTURE_NOT_FOUND`: Lecture not found
- `LECTURE_ALREADY_COMPLETED`: Lecture already completed
- `EXAM_NOT_FOUND`: Exam not found
- `EXAM_ALREADY_COMPLETED`: Exam already completed
- `QUIZ_NOT_FOUND`: Quiz not found for this lecture
- `COURSE_NOT_FOUND`: Course not found
- `CERTIFICATE_ALREADY_EXISTS`: Certificate already exists for this course
- `INCOMPLETE_COURSE`: Not all lectures completed
- `INSUFFICIENT_LIVES`: User has no lives remaining
- `MISSING_LECTURE_ID`: lectureCMSid is required
- `MISSING_CLERK_USER_ID`: clerkUserId is required
- `CLERK_USER_NOT_FOUND`: User not found in Clerk
- `POINTS_VALIDATION_ERROR`: Validation errors in request
- `INVALID_POINTS_TYPE`: Points must be a number
- `INVALID_OPERATION`: Invalid operation type
- `MISSING_FIELDS`: At least one field (lastName or firstName) must be provided
- `EMPTY_FIELD`: Field cannot be empty
- `INVALID_SECRET`: Secret is required
- `MISSING_CERTIFICATE_ID`: Certificate ID is required
- `CERTIFICATE_NOT_FOUND`: Certificate not found
- `MISSING_EXAM_ID`: Exam ID is required
- `SUBMISSION_VALIDATION_ERROR`: Validation errors in exam submission
- `INVALID_ANSWERS_FORMAT`: answers must be a non-empty array
- `INVALID_TIME_SPENT`: timeSpent must be a positive number
- `INVALID_ANSWER_FORMAT`: Each answer must have questionId and selectedAnswer

## Authentication

All API endpoints require authentication via the `Authorization` header:

```
Authorization: Bearer <API_TOKEN>
```

The API token should be obtained from the environment variable `API_TOKEN`.

## Rate Limiting

API endpoints may be subject to rate limiting. Check response headers for rate limit information:

- `X-RateLimit-Limit`: Maximum requests per time window
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Time when the rate limit resets

## Pagination

Endpoints that support pagination return pagination metadata:

```json
{
  "pagination": {
    "page": "number (current page)",
    "limit": "number (items per page)",
    "total": "number (total items)",
    "pages": "number (total pages)",
    "hasNext": "boolean (has next page)",
    "hasPrev": "boolean (has previous page)"
  }
}
```

## Timestamps

All timestamps are returned in ISO 8601 format (e.g., `2024-01-15T10:30:00.000Z`).

## Success Response Format

All successful API responses follow this format:

```json
{
  "success": true,
  "data": "object or array (response data)",
  "timestamp": "string (ISO date)"
}
```
