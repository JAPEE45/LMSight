import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import threading

def send_email_thread(recipient_email, subject, message, sender_email, app_password):
    try:
        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = recipient_email
        msg['Subject'] = subject

        msg.attach(MIMEText(message, 'plain'))

        # Connect to Gmail's SMTP server
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()
            server.login(sender_email, app_password)
            server.send_message(msg)
            print(f"Email sent successfully to {recipient_email}")
    except Exception as e:
        print(f"Failed to send email: {e}")

def send_email_notification(recipient_email, subject, message):
    """
    Sends an email notification asynchronously using a thread.
    """
    # Configuration
    SENDER_EMAIL = "alis.lmsight@gmail.com" # Placeholder, relying on App Password provided
    APP_PASSWORD = "kwlv tpei wrqc bgax"

    if not recipient_email:
        print("No recipient email provided.")
        return

    # Start email sending in a background thread to avoid blocking the request
    email_thread = threading.Thread(
        target=send_email_thread,
        args=(recipient_email, subject, message, SENDER_EMAIL, APP_PASSWORD)
    )
    email_thread.start()
