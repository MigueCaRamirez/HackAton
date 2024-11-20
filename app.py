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
        <h2>Nueva donación registrada</h2>
        <p><strong>Nombre del donante:</strong> {donor_name}</p>
        <p><strong>Correo:</strong> {donor_email}</p>
        <p><strong>Tipo de donación:</strong> {donation_type}</p>
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
