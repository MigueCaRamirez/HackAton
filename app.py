from flask import Flask, request, jsonify
from flask_cors import CORS
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

app = Flask(__name__)
CORS(app)  # Permitir solicitudes desde el frontend

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
        Nueva donación registrada:
        - Nombre del donante: {donor_name}
        - Correo: {donor_email}
        - Tipo de donación: {donation_type}
        - Cantidad: ${donation_amount}
        - Organización: {organization}
        - Mensaje: {message}
        """
        send_email_smtp(
            SMTP_USER,
            "Nueva donación registrada",
            admin_message,
        )

        # Crear el mensaje para el usuario
        user_message = f"""
        Hola {donor_name},

        Gracias por tu generosa donación de ${donation_amount} a {organization}.
        Tu apoyo ayuda a transformar vidas y a fortalecer nuestra misión.

        ¡Sigue siendo una luz de esperanza!

        Atentamente,
        Donando Vida
        """
        send_email_smtp(
            donor_email,
            "Gracias por tu donación",
            user_message,
        )

        return jsonify({"message": "Correos enviados con éxito"}), 200

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500


def send_email_smtp(to_email, subject, body):
    """Función para enviar correos electrónicos utilizando SMTP"""
    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
        server.starttls()  # Iniciar conexión segura
        server.login(SMTP_USER, SMTP_PASS)  # Autenticar
        msg = MIMEMultipart()
        msg['From'] = SMTP_USER
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))  # Agregar el cuerpo del mensaje
        server.send_message(msg)  # Enviar mensaje


if __name__ == '__main__':
    app.run(debug=True)
