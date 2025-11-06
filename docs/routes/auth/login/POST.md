# POST /api/auth/login

Autentica um usuário via Clerk e retorna informações do usuário.

## Autenticação

Requer autenticação via token de API no header:

```
Authorization: Bearer <API_TOKEN>
```

## Headers

- `Authorization` (obrigatório): Bearer token de API
- `Content-Type` (obrigatório): application/json

## Body

```json
{
  "clerkUserId": "string (obrigatório)",
  "sessionToken": "string (opcional)",
  "createIfNotExists": "boolean (opcional, padrão: true)"
}
```

## Exemplo de Uso

```bash
POST /api/auth/login
Headers:
  Authorization: Bearer <API_TOKEN>
Body:
{
  "clerkUserId": "user_2abc123def456",
  "sessionToken": "sess_xxx",
  "createIfNotExists": true
}
```

## Resposta de Sucesso (200)

```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "clerkId": "user_2abc123def456",
    "name": "João Silva",
    "email": "usuario@exemplo.com",
    "profileImage": "https://example.com/avatar.jpg",
    "points": 100
  },
  "clerk": { ... },
  "stats": {
    "totalCourses": 0,
    "ranking": 15,
    "points": 100,
    "lastLogin": "2024-01-01T00:00:00.000Z"
  },
  "session": {
    "loginAt": "2024-01-01T00:00:00.000Z",
    "sessionToken": "sess_xxx"
  }
}
```

## Modelo de Dados (Banco de Dados)

### User (Prisma)

```prisma
model User {
  id           String        @id @default(auto()) @map("_id") @db.ObjectId
  clerkId      String        @unique
  name         String?
  email        String        @unique
  profileImage String?
  points       Int           @default(0)
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
}
```

## Comportamento

- Se `createIfNotExists` for `true` e o usuário não existir no banco, ele será criado automaticamente
- O usuário é verificado no Clerk antes de ser criado/atualizado no banco
- `updatedAt` é atualizado a cada login

