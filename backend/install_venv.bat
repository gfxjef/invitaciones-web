@echo off
echo ============================================
echo   INSTALADOR GOOGLE OAUTH - VENV
echo ============================================

echo [INFO] Activando entorno virtual...
call venv\Scripts\activate.bat

echo [INFO] Actualizando pip...
python -m pip install --upgrade pip

echo [INFO] Instalando dependencias desde requirements.txt...
python -m pip install -r requirements.txt

echo [INFO] Verificando instalación de Flask-Dance...
python -c "import flask_dance; print('[OK] Flask-Dance instalado correctamente')"

echo [INFO] Verificando instalación de Google Auth...
python -c "import google.auth; print('[OK] Google Auth instalado correctamente')"

echo [INFO] Verificando importación específica...
python -c "from flask_dance.contrib.google import make_google_blueprint; print('[OK] Google blueprint disponible')"

echo ============================================
echo   INSTALACION COMPLETADA
echo ============================================
echo Para ejecutar el servidor:
echo   python app.py
echo.
pause