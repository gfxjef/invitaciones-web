
# Documentación del Sistema de Autenticación (Backend)

## 1. Resumen del Flujo de Autenticación

El sistema de autenticación se basa en JSON Web Tokens (JWT), un estándar abierto para crear tokens de acceso que permiten una autenticación segura entre el frontend y el backend.

El flujo general es el siguiente:

1.  **Registro/Login**: El usuario se registra o inicia sesión con sus credenciales (email y contraseña).
2.  **Recepción de Tokens**: Si las credenciales son válidas, el backend genera y devuelve dos tipos de tokens:
    *   `access_token`: Un token de corta duración (15 minutos) que se utiliza para autenticar al usuario en cada solicitud a rutas protegidas.
    *   `refresh_token`: Un token de larga duración (7 días) que se utiliza para obtener un nuevo `access_token` cuando el actual expira, sin necesidad de que el usuario vuelva a iniciar sesión.
3.  **Almacenamiento de Tokens**: El frontend debe almacenar estos tokens de forma segura. `localStorage` es una opción común.
4.  **Solicitudes Autenticadas**: Para acceder a rutas protegidas, el frontend debe incluir el `access_token` en la cabecera `Authorization` de cada solicitud, con el formato `Bearer <token>`.
5.  **Refresco de Token**: Cuando el `access_token` expira, el backend devolverá un error `401 Unauthorized`. El frontend debe interceptar este error y usar el `refresh_token` para solicitar un nuevo par de tokens.
6.  **Cierre de Sesión (Logout)**: El frontend elimina los tokens almacenados, finalizando la sesión del usuario.

---

## 2. Endpoints de Autenticación

Todos los endpoints de autenticación están prefijados con `/api/auth`.

### 2.1. Registro de Usuario

*   **Endpoint**: `POST /api/auth/register`
*   **Descripción**: Crea un nuevo usuario en el sistema.
*   **Body (Request)**:

    ```json
    {
      "email": "usuario@example.com",
      "password": "passwordSeguro123",
      "first_name": "Nombre",
      "last_name": "Apellido",
      "phone": "123456789"
    }
    ```

*   **Respuesta Exitosa (201)**:

    ```json
    {
      "message": "User created successfully",
      "user": {
        "id": 1,
        "email": "usuario@example.com",
        "first_name": "Nombre",
        "last_name": "Apellido",
        "phone": "123456789",
        "role": "USER",
        "is_active": true
      },
      "access_token": "ey...",
      "refresh_token": "ey..."
    }
    ```

*   **Respuesta de Error (409)**: Si el email ya está registrado.

    ```json
    {
      "message": "Email already registered"
    }
    ```

### 2.2. Inicio de Sesión

*   **Endpoint**: `POST /api/auth/login`
*   **Descripción**: Autentica a un usuario y devuelve los tokens de acceso.
*   **Body (Request)**:

    ```json
    {
      "email": "usuario@example.com",
      "password": "passwordSeguro123"
    }
    ```

*   **Respuesta Exitosa (200)**:

    ```json
    {
      "message": "Login successful",
      "user": {
        "id": 1,
        "email": "usuario@example.com",
        ...
      },
      "access_token": "ey...",
      "refresh_token": "ey...",
      "token_type": "Bearer"
    }
    ```

*   **Respuesta de Error (401)**: Si las credenciales son inválidas.

    ```json
    {
      "message": "Invalid credentials",
      "error": "invalid_credentials"
    }
    ```

### 2.3. Refrescar Token de Acceso

*   **Endpoint**: `POST /api/auth/refresh`
*   **Descripción**: Genera un nuevo `access_token` y `refresh_token` usando un `refresh_token` válido.
*   **Body (Request)**:

    ```json
    {
      "refresh_token": "el_refresh_token_recibido_en_el_login"
    }
    ```

*   **Respuesta Exitosa (200)**:

    ```json
    {
      "access_token": "ey... (nuevo)",
      "refresh_token": "ey... (nuevo)",
      "token_type": "Bearer",
      "user": { ... },
      "expires_in": 900
    }
    ```

*   **Respuesta de Error (422)**: Si el token de refresco es inválido o no es del tipo correcto.

### 2.4. Obtener Datos del Usuario Actual

*   **Endpoint**: `GET /api/auth/me`
*   **Descripción**: Devuelve la información del usuario autenticado actualmente. Requiere autenticación.
*   **Cabecera (Header)**: `Authorization: Bearer <access_token>`
*   **Respuesta Exitosa (200)**:

    ```json
    {
      "user": {
        "id": 1,
        "email": "usuario@example.com",
        ...
      },
      "authenticated": true
    }
    ```

### 2.5. Verificar Token

*   **Endpoint**: `GET /api/auth/verify`
*   **Descripción**: Endpoint rápido para verificar si el `access_token` actual es válido. Útil para comprobaciones de sesión en el frontend. Requiere autenticación.
*   **Cabecera (Header)**: `Authorization: Bearer <access_token>`
*   **Respuesta Exitosa (200)**:

    ```json
    {
      "valid": true,
      "authenticated": true,
      "user_id": 1
    }
    ```

### 2.6. Cerrar Sesión

*   **Endpoint**: `POST /api/auth/logout`
*   **Descripción**: Invalida la sesión del usuario en el lado del cliente. El frontend debe encargarse de eliminar los tokens. Requiere autenticación.
*   **Cabecera (Header)**: `Authorization: Bearer <access_token>`
*   **Respuesta Exitosa (200)**:

    ```json
    {
      "message": "Logout successful",
      "authenticated": false
    }
    ```

---

## 3. Guía de Implementación en el Frontend

Aquí se describe un flujo de trabajo recomendado para integrar la autenticación en una aplicación de frontend (como React, Vue, etc.).

### Paso 1: Configurar un Interceptor de API (Ej. con Axios)

Crea un wrapper o interceptor para tus llamadas a la API. Esto centralizará la lógica de autenticación.

```javascript
// api.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api', // O la URL de tu backend
});

// Interceptor para añadir el token a cada solicitud
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
```

### Paso 2: Manejar el Login y Almacenar Tokens

Cuando el usuario inicia sesión, guarda los tokens y los datos del usuario.

```javascript
// authService.js

async function login(email, password) {
  const response = await apiClient.post('/auth/login', { email, password });
  const { access_token, refresh_token, user } = response.data;

  // Almacenar tokens
  localStorage.setItem('access_token', access_token);
  localStorage.setItem('refresh_token', refresh_token);

  // Guardar datos del usuario en el estado de la app (ej. Redux, Zustand)
  // store.dispatch(setUser(user));

  return response.data;
}
```

### Paso 3: Manejar la Expiración del Token y Refrescarlo

El interceptor de `axios` también puede manejar la lógica de refresco de tokens.

```javascript
// api.js (continuación)

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Si el error es 401 y no es un reintento
    if (error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Si ya se está refrescando, encolar la solicitud
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return axios(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        // Logout si no hay refresh token
        return Promise.reject(error);
      }

      try {
        const rs = await axios.post('http://localhost:5000/api/auth/refresh', {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token } = rs.data;
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token); // El backend puede rotar el refresh token

        apiClient.defaults.headers.common['Authorization'] = 'Bearer ' + access_token;
        originalRequest.headers['Authorization'] = 'Bearer ' + access_token;
        
        processQueue(null, access_token);
        return apiClient(originalRequest);

      } catch (_error) {
        processQueue(_error, null);
        // Logout si el refresh token falla
        // store.dispatch(logoutUser());
        return Promise.reject(_error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
```

### Paso 4: Implementar el Logout

El logout es simple: solo necesitas eliminar los tokens del almacenamiento local.

```javascript
// authService.js (continuación)

function logout() {
  // Opcional: llamar al endpoint de logout del backend
  // apiClient.post('/auth/logout');

  // Eliminar tokens y datos de usuario
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  
  // Limpiar estado de la aplicación
  // store.dispatch(clearUser());
}
```

### Paso 5: Verificar la Sesión al Cargar la Aplicación

Cuando la aplicación se carga por primera vez, puedes usar el endpoint `/api/auth/me` o `/api/auth/verify` para comprobar si existe una sesión válida y obtener los datos del usuario.

```javascript
// App.js o similar

useEffect(() => {
  const checkUserSession = async () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const response = await apiClient.get('/auth/me');
        // store.dispatch(setUser(response.data.user));
      } catch (error) {
        // El token es inválido o ha expirado y no se pudo refrescar
        console.error("Sesión inválida", error);
        logout(); // Limpiar tokens
      }
    }
  };

  checkUserSession();
}, []);
```
