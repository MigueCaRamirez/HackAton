import cx_Oracle

# Configurar la conexión a la base de datos Oracle
def get_db_connection():
    try:
        connection = cx_Oracle.connect(
            user="USUARIOLOCAL",       # Reemplaza con tu usuario
            password="TU_PASSWORD",   # Reemplaza con tu contraseña
            dsn="localhost/XEPDB1"    # Reemplaza con tu DSN
        )
        return connection
    except cx_Oracle.Error as e:
        print("Error al conectar con la base de datos:", e)
        return None
