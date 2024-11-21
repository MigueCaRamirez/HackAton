from flask import Flask, render_template, request, jsonify, url_for
from db_connection import get_db_connection
import cx_Oracle
import os

app = Flask(__name__)

UPLOAD_FOLDER = os.path.join(os.getcwd(), 'static', 'images')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # Máximo 16MB por archivo permitido

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

@app.route('/upload_image', methods=['POST'])
def upload_image():
    if 'file' not in request.files:
        return jsonify({"error": "No se encontró un archivo"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "Nombre de archivo vacío"}), 400

    # Guardar el archivo en la carpeta configurada
    filename = file.filename
    file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
    return jsonify({"message": "Imagen subida con éxito", "image_url": f"/static/images/{filename}"}), 200

# Ruta para la página de organizaciones
@app.route('/organizations')
def organizations():
    return render_template('Estaticadeorganizaciones.html')
if __name__ == "__main__":
    app.run(debug=True)

