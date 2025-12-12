import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import threading
from datetime import datetime

def get_html_template(subject, message):
    # Convert newlines to <br> for HTML display
    formatted_message = message.replace('\n', '<br>')
    
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{subject}</title>
        <style>
            body {{
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
            }}
            .container {{
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                overflow: hidden;
            }}
            .header {{
                background-color: #2c3e50;
                color: #ffffff;
                padding: 20px;
                text-align: center;
            }}
            .header h1 {{
                margin: 0;
                font-size: 24px;
                letter-spacing: 1px;
            }}
            .content {{
                padding: 30px;
                color: #333333;
                line-height: 1.6;
                font-size: 16px;
            }}
            .footer {{
                background-color: #f8f9fa;
                padding: 15px;
                text-align: center;
                font-size: 12px;
                color: #6c757d;
                border-top: 1px solid #eeeeee;
            }}
            .button {{
                display: inline-block;
                padding: 10px 20px;
                background-color: #007bff;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                margin-top: 20px;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>LMSight</h1>
                <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.8;">Leave Management System</p>
            </div>
            <div class="content">
                <h2 style="color: #2c3e50; font-size: 20px; margin-top: 0;">{subject}</h2>
                <div style="margin-top: 20px;">
                    {formatted_message}
                </div>
            </div>
            <div class="footer">
                <p style="margin: 0;">This is an automated notification. Please do not reply to this email.</p>
                <p style="margin: 5px 0 0;">&copy; {datetime.now().year} LMSight. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """

def send_email_thread(recipient_email, subject, message, sender_email, app_password):
    try:
        msg = MIMEMultipart('alternative')
        msg['From'] = f"LMSight Notification <{sender_email}>"
        msg['To'] = recipient_email
        msg['Subject'] = subject

        # Create both plain text and HTML versions
        text_part = MIMEText(message, 'plain')
        html_content = get_html_template(subject, message)
        html_part = MIMEText(html_content, 'html')

        # Attach parts - email clients try to render the last part first (HTML)
        # and fall back to the first part (text) if they can't render HTML
        msg.attach(text_part)
        msg.attach(html_part)

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
    SENDER_EMAIL = "alissystem444@gmail.com"
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
