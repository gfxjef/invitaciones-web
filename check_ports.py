"""
Analiza qué procesos están usando los puertos 3000 y 5000
"""
import subprocess
import re

def get_port_info(port):
    """Obtiene información sobre un puerto específico"""
    print(f"\n{'='*60}")
    print(f"Analizando puerto {port}")
    print(f"{'='*60}")

    try:
        # Ejecutar netstat
        result = subprocess.run(
            ['netstat', '-ano'],
            capture_output=True,
            text=True,
            timeout=5
        )

        # Buscar líneas que contengan el puerto
        lines = result.stdout.split('\n')
        found = False

        for line in lines:
            if f':{port}' in line and 'LISTENING' in line:
                found = True
                parts = line.split()
                if len(parts) >= 5:
                    pid = parts[-1]
                    print(f"\n✓ Puerto {port} ESTÁ EN USO")
                    print(f"  Estado: LISTENING")
                    print(f"  PID: {pid}")

                    # Obtener información del proceso
                    try:
                        task_result = subprocess.run(
                            ['tasklist', '/FI', f'PID eq {pid}', '/FO', 'CSV'],
                            capture_output=True,
                            text=True,
                            timeout=5
                        )

                        task_lines = task_result.stdout.strip().split('\n')
                        if len(task_lines) > 1:
                            # Segunda línea tiene la info del proceso
                            process_info = task_lines[1].replace('"', '').split(',')
                            if len(process_info) >= 2:
                                process_name = process_info[0]
                                print(f"  Proceso: {process_name}")

                    except Exception as e:
                        print(f"  Error obteniendo info del proceso: {e}")

        if not found:
            print(f"\n✗ Puerto {port} NO ESTÁ EN USO")

    except Exception as e:
        print(f"Error: {e}")

def test_connection(port, service_name):
    """Prueba si el servicio responde"""
    print(f"\n{'='*60}")
    print(f"Probando conexión a {service_name} (puerto {port})")
    print(f"{'='*60}")

    try:
        import socket
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(2)
        result = sock.connect_ex(('localhost', port))
        sock.close()

        if result == 0:
            print(f"✓ Puerto {port} ACEPTA CONEXIONES")
        else:
            print(f"✗ Puerto {port} NO ACEPTA CONEXIONES (error {result})")

    except Exception as e:
        print(f"✗ Error probando conexión: {e}")

if __name__ == '__main__':
    print("\n" + "="*60)
    print("ANÁLISIS DE PUERTOS - INVITACIONES WEB")
    print("="*60)

    # Analizar puertos
    get_port_info(5000)  # Backend Flask
    get_port_info(3000)  # Frontend Next.js

    # Probar conexiones
    test_connection(5000, "Backend Flask")
    test_connection(3000, "Frontend Next.js")

    print("\n" + "="*60)
    print("RECOMENDACIONES")
    print("="*60)
    print("\nSi algún puerto está en uso pero no acepta conexiones:")
    print("  1. El proceso puede estar colgado")
    print("  2. Reinicia el servicio correspondiente")
    print("\nPara reiniciar:")
    print("  Backend:  cd backend && python app.py")
    print("  Frontend: cd frontend && npm run dev")
    print("="*60 + "\n")
