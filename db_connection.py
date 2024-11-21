import cx_Oracle
import os

# Configurar la conexión a la base de datos Oracle
def get_db_connection():
    try:
        # Obtén las credenciales desde variables de entorno para mayor seguridad
        user = os.getenv("ORACLE_USER", "Usuariolocal")  # Reemplaza con tu usuario predeterminado
        password = os.getenv("ORACLE_PASSWORD", "oracle")  # Reemplaza con tu contraseña predeterminada
        dsn = os.getenv("ORACLE_DSN", "localhost:1521/xepdb1")  # Reemplaza con tu DSN predeterminado

        # Crea la conexión
        connection = cx_Oracle.connect(user=user, password=password, dsn=dsn)

        # Configura el encoding y decoding si se trabaja con texto en Unicode
        connection.encoding = "UTF-8"
        connection.nencoding = "UTF-8"

        print("Conexión exitosa a la base de datos Oracle")
        return connection
    except cx_Oracle.DatabaseError as e:
        # Manejo de errores detallado
        error_obj, = e.args
        print(f"Error al conectar con la base de datos:\nCódigo: {error_obj.code}\nMensaje: {error_obj.message}")
        return None
