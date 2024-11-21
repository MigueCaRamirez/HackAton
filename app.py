from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import json
import os

app = Flask(__name__)
CORS(app)  # Permitir solicitudes desde el frontend

# Ruta al archivo JSON
ORG_FILE = os.path.join(os.getcwd(), 'organizations.json')

# Leer organizaciones del archivo JSON
def read_organizations():
    if os.path.exists(ORG_FILE):
        with open(ORG_FILE, 'r', encoding='utf-8') as file:
            return json.load(file)
    return []

# Escribir organizaciones al archivo JSON
def write_organizations(organizations):
    with open(ORG_FILE, 'w', encoding='utf-8') as file:
        json.dump(organizations, file, indent=4, ensure_ascii=False)


# Ruta para agregar una nueva organización
@app.route('/organizations', methods=['POST'])
def add_organization():
    data = request.json
    organizations = read_organizations()

    # Nueva organización con ubicación
    new_org = {
        "id": f"org{len(organizations) + 1}",
        "name": data["name"],
        "description": data["description"],
        "image": data["image"],
        "location": {
            "lat": data["location"]["lat"],
            "lng": data["location"]["lng"]
        }
    }

    organizations.append(new_org)
    write_organizations(organizations)
    return jsonify({"message": "Organización agregada con éxito."})

# Ruta para obtener todas las organizaciones
@app.route('/organizations', methods=['GET'])
def get_organizations():
    organizations = read_organizations()
    return jsonify(organizations)

# Ruta para actualizar una organización existente
@app.route('/organizations/<org_id>', methods=['PUT'])
def update_organization(org_id):
    data = request.json
    organizations = read_organizations()

    for org in organizations:
        if org["id"] == org_id:
            org["name"] = data.get("name", org["name"])
            org["description"] = data.get("description", org["description"])
            org["image"] = data.get("image", org["image"])
            org["location"] = data.get("location", org["location"])
            break
    else:
        return jsonify({"error": "Organización no encontrada"}), 404

    write_organizations(organizations)
    return jsonify({"message": "Organización actualizada con éxito."})

# Ruta para eliminar una organización
@app.route('/organizations/<org_id>', methods=['DELETE'])
def delete_organization(org_id):
    organizations = read_organizations()
    organizations = [org for org in organizations if org["id"] != org_id]

    write_organizations(organizations)
    return jsonify({"message": "Organización eliminada con éxito."})

if __name__ == '__main__':
    app.run(debug=True)


# Configuración del servidor SMTP
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USER = "donandovida2@gmail.com"
SMTP_PASS = "auhq dftd xdjm glpd"

@app.route('/send-email', methods=['POST'])
def send_email():
    try:
        # Extraer datos enviados por el cliente
        data = request.json
        if not data:
            return jsonify({"error": "No se enviaron datos"}), 400

        # Extraer información del donante
        donor_name = data.get('name')  # Cambiado a 'name'
        donor_email = data.get('email')
        donation_type = data.get('donationType')
        donation_amount = data.get('amount')  # Cambiado a 'amount'
        organization = data.get('organization')
        message = data.get('message')

        # Validar campos obligatorios
        if not all([donor_name, donor_email, donation_amount, organization]):
            return jsonify({"error": "Faltan campos obligatorios"}), 400

        # Crear el mensaje para el administrador
        admin_message = f"""
        <h2>Nueva donación registrada</h2>
        <p><strong>Nombre del donante:</strong> {donor_name}</p>
        <p><strong>Correo:</strong> {donor_email}</p>
        
        <p><strong>Cantidad:</strong> ${donation_amount}</p>
        <p><strong>Organización:</strong> {organization}</p>
        <p><strong>Mensaje:</strong> {message}</p>
        """
        send_email_smtp(
            SMTP_USER,
            "Nueva donación registrada",
            admin_message,
            is_html=True
        )

        # Crear el mensaje para el usuario
        user_message = f"""
        <div style="font-family: Arial, sans-serif; text-align: center; color: #444;">
            <h1>Gracias por tu donación, {donor_name}!</h1>
            <p>Tu generosa contribución de <strong>${donation_amount}</strong> a <strong>{organization}</strong> nos ayuda a continuar nuestra misión.</p>
            <img src="https://via.placeholder.com/600x200.png?text=Gracias+por+donar" alt="Gracias por donar" style="width: 100%; max-width: 600px;">
            <p>¡Sigue siendo una luz de esperanza!</p>
            <p><em>- Equipo Donando Vida</em></p>
        </div>
        """
        send_email_smtp(
            donor_email,
            "Gracias por tu donación",
            user_message,
            is_html=True
        )

        return jsonify({"message": "Correos enviados con éxito"}), 200

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500


def send_email_smtp(to_email, subject, body, is_html=False):
    """Función para enviar correos electrónicos utilizando SMTP"""
    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
        server.starttls()  # Iniciar conexión segura
        server.login(SMTP_USER, SMTP_PASS)  # Autenticar
        msg = MIMEMultipart()
        msg['From'] = SMTP_USER
        msg['To'] = to_email
        msg['Subject'] = subject

        # Determinar si el cuerpo es HTML o texto plano
        if is_html:
            msg.attach(MIMEText(body, 'html'))  # Cuerpo HTML
        else:
            msg.attach(MIMEText(body, 'plain'))  # Cuerpo de texto plano

        server.send_message(msg)  # Enviar mensaje


if __name__ == '__main__':
    app.run(debug=True)
