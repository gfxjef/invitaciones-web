# Auth Module API Documentation

## Overview
Sistema de autenticación basado en JWT con tokens de acceso y refresh.

**Base URL**: `/api/auth`

## Endpoints

### 1. Register User
Registro de nuevo usuario en la plataforma.

**Endpoint**: `POST /api/auth/register`
**Authentication**: No requerida

#### Request Body
```json
{
  "email": "user@example.com",
  "password": "password123",  // Mínimo 8 caracteres
  "first_name": "Juan",
  "last_name": "Pérez",
  "phone": "+51999999999"  // Opcional
}
```

#### Response (201 Created)
```json
{
  "message": "User created successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "Juan",
    "last_name": "Pérez",
    "role": "user",
    "is_active": true
  },
  "access_token": "eyJ0eXAiOiJKV1...",
  "refresh_token": "eyJ0eXAiOiJKV1..."
}
```

#### Errors
- `400`: Datos inválidos
- `409`: Email ya registrado

---

### 2. Login
Inicio de sesión con email y contraseña.

**Endpoint**: `POST /api/auth/login`
**Authentication**: No requerida

#### Request Body
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Response (200 OK)
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "Juan",
    "last_name": "Pérez",
    "role": "user",
    "is_active": true
  },
  "access_token": "eyJ0eXAiOiJKV1...",
  "refresh_token": "eyJ0eXAiOiJKV1...",
  "token_type": "Bearer"
}
```

#### Errors
- `400`: Datos inválidos
- `401`: Credenciales incorrectas
- `403`: Cuenta desactivada

---

### 3. Refresh Token
Renovar token de acceso usando refresh token.

**Endpoint**: `POST /api/auth/refresh`
**Authentication**: No requerida (usa refresh token en body)

#### Request Body
```json
{
  "refresh_token": "eyJ0eXAiOiJKV1..."
}
```

#### Response (200 OK)
```json
{
  "access_token": "eyJ0eXAiOiJKV1...",
  "refresh_token": "eyJ0eXAiOiJKV1...",  // Nuevo refresh token
  "token_type": "Bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "Juan",
    "last_name": "Pérez"
  },
  "expires_in": 900  // 15 minutos
}
```

#### Errors
- `400`: Refresh token no proporcionado
- `422`: Token inválido o expirado
- `403`: Cuenta desactivada
- `404`: Usuario no encontrado

---

### 4. Logout
Cerrar sesión (limpieza en frontend).

**Endpoint**: `POST /api/auth/logout`
**Authentication**: Requerida (JWT)

#### Headers
```
Authorization: Bearer eyJ0eXAiOiJKV1...
```

#### Response (200 OK)
```json
{
  "message": "Logout successful",
  "authenticated": false
}
```

---

### 5. Verify Token
Verificar validez del token actual.

**Endpoint**: `GET /api/auth/verify`
**Authentication**: Requerida (JWT)

#### Headers
```
Authorization: Bearer eyJ0eXAiOiJKV1...
```

#### Response (200 OK)
```json
{
  "valid": true,
  "authenticated": true,
  "user_id": 1
}
```

#### Error Response (401)
```json
{
  "valid": false,
  "authenticated": false
}
```

---

### 6. Get Current User
Obtener información completa del usuario autenticado.

**Endpoint**: `GET /api/auth/me`
**Authentication**: Requerida (JWT)

#### Headers
```
Authorization: Bearer eyJ0eXAiOiJKV1...
```

#### Response (200 OK)
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "Juan",
    "last_name": "Pérez",
    "phone": "+51999999999",
    "role": "user",
    "is_active": true,
    "email_verified": false,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  },
  "authenticated": true
}
```

#### Errors
- `403`: Cuenta desactivada
- `404`: Usuario no encontrado

## Token Management

### Access Token
- **Duración**: 15 minutos
- **Uso**: Incluir en header `Authorization: Bearer <token>`
- **Renovación**: Usar endpoint `/refresh` antes de expirar

### Refresh Token
- **Duración**: 7 días
- **Uso**: Solo para renovar access token
- **Seguridad**: Guardar de forma segura en frontend (httpOnly cookie recomendado)

## Security Notes

1. **Password Requirements**: Mínimo 8 caracteres
2. **Token Storage**: Nunca almacenar tokens en localStorage en producción
3. **HTTPS**: Siempre usar HTTPS en producción
4. **Rate Limiting**: Implementar rate limiting en producción

## Integration Example

```javascript
// Login
const login = async (email, password) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();

  if (response.ok) {
    // Store tokens securely
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    return data.user;
  }

  throw new Error(data.message);
};

// Auto refresh
const refreshToken = async () => {
  const refresh_token = localStorage.getItem('refresh_token');

  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ refresh_token })
  });

  const data = await response.json();

  if (response.ok) {
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    return data.access_token;
  }

  // Redirect to login
  window.location.href = '/login';
};
```