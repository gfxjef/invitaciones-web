# 🔧 INSTRUCCIONES DE INSTALACIÓN - GOOGLE OAUTH

## ❌ **Problema**: ModuleNotFoundError: No module named 'flask_dance'

### ✅ **Solución Paso a Paso**

#### **Opción 1: Ejecutar script automático**

1. **Ejecutar en PowerShell desde la carpeta backend:**
   ```powershell
   .\install_venv.bat
   ```

#### **Opción 2: Instalación manual**

1. **Activar entorno virtual:**
   ```powershell
   venv\Scripts\activate
   ```

2. **Actualizar pip:**
   ```powershell
   python -m pip install --upgrade pip
   ```

3. **Instalar dependencias específicas:**
   ```powershell
   python -m pip install Flask-Dance[sqla]==7.1.0
   python -m pip install google-auth>=2.25.2
   ```

4. **Instalar todas las dependencias:**
   ```powershell
   python -m pip install -r requirements.txt
   ```

5. **Verificar instalación:**
   ```powershell
   python -c "import flask_dance; print('Flask-Dance OK')"
   python -c "from flask_dance.contrib.google import make_google_blueprint; print('Google Blueprint OK')"
   ```

6. **Ejecutar servidor:**
   ```powershell
   python app.py
   ```

#### **Opción 3: Reinstalar entorno virtual completo**

Si persisten los problemas:

1. **Eliminar entorno virtual:**
   ```powershell
   Remove-Item -Recurse -Force venv
   ```

2. **Crear nuevo entorno virtual:**
   ```powershell
   python -m venv venv
   ```

3. **Activar nuevo entorno:**
   ```powershell
   venv\Scripts\activate
   ```

4. **Instalar dependencias:**
   ```powershell
   python -m pip install --upgrade pip
   python -m pip install -r requirements.txt
   ```

### 🔍 **Verificación de Funcionamiento**

Una vez instalado, deberías ver:

```powershell
PS> python app.py
[INFO] Database tables created successfully!
 * Serving Flask app 'app'
 * Debug mode: on
 * Running on http://127.0.0.1:5000
```

Y poder acceder a:
- http://localhost:5000/health
- http://localhost:5000/api/auth/google/login

### 🚨 **Troubleshooting**

#### **Error**: "venv\Scripts\activate no existe"
**Solución**: Crear entorno virtual primero:
```powershell
python -m venv venv
```

#### **Error**: "pip no es reconocido"
**Solución**: Verificar que Python esté en PATH o usar:
```powershell
python -m pip install ...
```

#### **Error**: "Permission denied"
**Solución**: Ejecutar PowerShell como administrador

### ✅ **Verificación Final**

```powershell
# 1. Verificar que Flask-Dance está instalado
python -c "import flask_dance; print(flask_dance.__version__)"

# 2. Verificar que Google Auth está instalado
python -c "import google.auth; print('Google Auth OK')"

# 3. Verificar importación específica
python -c "from flask_dance.contrib.google import make_google_blueprint; print('Google Blueprint OK')"

# 4. Ejecutar servidor
python app.py
```

### 📝 **Notas Importantes**

- **Siempre activar el venv** antes de instalar dependencias
- **Usar python -m pip** en lugar de solo pip
- **Flask-Dance requiere SQLAlchemy** (ya incluido en requirements.txt)
- **El servidor debe funcionar** en http://localhost:5000

Si sigues estos pasos, el servidor debería iniciarse correctamente con Google OAuth funcionando! 🚀