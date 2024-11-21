from flask import Flask, render_template, request, jsonify
from db_connection import get_db_connection
import cx_Oracle

app = Flask(__name__)

# Ruta para el formulario principal
@app.route("/")
def index():
    return render_template("index.html")

# Ruta para guardar un donante en la base de datos
@app.route("/add_donor", methods=["POST"])
def add_donor():
    data = request.json  # Recibir datos desde el frontend
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        # Llama al procedimiento almacenado
        cursor.callproc("donations_package.add_donor", [
            data["name"],
            data["email"],
            data["donation_type"],
            data["amount"],
            data["organization_id"],
            data["message"]
        ])

        connection.commit()
        return jsonify({"success": True, "message": "Donación registrada con éxito."})
    except cx_Oracle.Error as e:
        print("Error:", e)
        return jsonify({"success": False, "message": "Error al registrar la donación."})
    finally:
        if connection:
            connection.close()

# Ruta para obtener estadísticas de donaciones
@app.route("/donation_stats", methods=["GET"])
def donation_stats():
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        cur = connection.cursor()

        # Llama al procedimiento almacenado
        cursor.callproc("donations_package.get_donation_stats", [cur])

        # Obtén los resultados
        stats = []
        for row in cur:
            stats.append({"organization": row[0], "total_donations": row[1]})

        return jsonify(stats)
    except cx_Oracle.Error as e:
        print("Error:", e)
        return jsonify([])
    finally:
        if connection:
            connection.close()

if __name__ == "__main__":
    app.run(debug=True)
