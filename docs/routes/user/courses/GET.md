# GET /api/user/courses

Retorna os cursos do usuário (em progresso e concluídos).

## Autenticação

Requer autenticação via token de API no header:

```
Authorization: Bearer <API_TOKEN>
```

## Headers

- `Authorization` (obrigatório): Bearer token de API
- `X-User-Id` (obrigatório): Clerk ID do usuário

## Query Parameters

- `status` (opcional): Status do curso para filtrar
  - `completed`: Apenas cursos concluídos
  - `in_progress`: Apenas cursos em progresso
  - `all`: Todos os cursos (padrão)

## Exemplo de Uso

```bash
GET /api/user/courses?status=completed
```

## Resposta de Sucesso (200)

```json
{
  "success": true,
  "completed": [
    {
      "id": "course_id_1",
      "title": "Curso de Farmacologia",
      "description": "Curso completo",
      "imageUrl": "https://example.com/image.jpg",
      "points": 100,
      "workload": 40,
      "status": "completed",
      "progress": 100,
      "completedAt": "2024-01-01T00:00:00.000Z",
      "certificateId": "cert_id_1",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "inProgress": [
    {
      "id": "course_id_2",
      "title": "Curso de Anatomia",
      "status": "in_progress",
      "progress": 60,
      "completedLectures": 6,
      "totalLectures": 10,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "totals": {
    "completed": 2,
    "inProgress": 3,
    "total": 5
  }
}
```

## Modelos de Dados Relacionados (Banco de Dados)

### Certificate (Prisma)

```prisma
model Certificate {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  courseCmsId String
  courseTitle String
  userId      String?  @db.ObjectId
  createdAt   DateTime @default(now())
}
```

### UserLecture (Prisma)

```prisma
model UserLecture {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  lectureCmsId String
  courseId     String
  userId       String?  @db.ObjectId
  createdAt    DateTime @default(now())
}
```

