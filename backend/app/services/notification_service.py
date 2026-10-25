"""Notification Service for MaterialHub.

Handles email notifications via SendGrid and SMS notifications via Twilio.
Supports order updates, delivery notifications, OTP delivery, and alerts.
"""

import logging
from typing import Optional, Dict, List

from app.core.config import settings

logger = logging.getLogger(__name__)


class NotificationService:
    """Service for sending email and SMS notifications."""

    def __init__(self):
        self.sendgrid_client = None
        self.twilio_client = None

        if settings.SENDGRID_API_KEY:
            try:
                from sendgrid import SendGridAPIClient
                from sendgrid.helpers.mail import Mail

                self.sendgrid_client = SendGridAPIClient(api_key=settings.SENDGRID_API_KEY)
                self.Mail = Mail
                logger.info("SendGrid client initialized successfully.")
            except Exception as e:
                logger.error(f"Failed to initialize SendGrid client: {e}")
        else:
            logger.warning("SendGrid API key not configured. Email notifications disabled.")

        if settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN:
            try:
                from twilio.rest import Client
                self.twilio_client = Client(
                    settings.TWILIO_ACCOUNT_SID,
                    settings.TWILIO_AUTH_TOKEN
                )
                logger.info("Twilio client initialized successfully.")
            except Exception as e:
                logger.error(f"Failed to initialize Twilio client: {e}")
        else:
            logger.warning("Twilio credentials not configured. SMS notifications disabled.")

    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        plain_text_content: Optional[str] = None
    ) -> bool:
        """Send an email via SendGrid.

        Args:
            to_email: Recipient email address
            subject: Email subject
            html_content: HTML body content
            plain_text_content: Plain text fallback content

        Returns:
            True if email sent successfully, False otherwise
        """
        if not self.sendgrid_client:
            logger.warning(f"[SIMULATION] Email to {to_email}: {subject}")
            return True

        try:
            message = self.Mail(
                from_email=settings.SENDGRID_FROM_EMAIL or "noreply@materialhub.in",
                from_name=settings.SENDGRID_FROM_NAME,
                to_emails=to_email,
                subject=subject,
                plain_text_content=plain_text_content,
                html_content=html_content
            )

            response = self.sendgrid_client.send(message)
            logger.info(f"Email sent to {to_email}: status={response.status_code}")
            return response.status_code in [200, 202]

        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {e}")
            return False

    async def send_sms(
        self,
        to_phone: str,
        message: str
    ) -> bool:
        """Send an SMS via Twilio.

        Args:
            to_phone: Recipient phone number (with country code, e.g., +919876543210)
            message: SMS message content

        Returns:
            True if SMS sent successfully, False otherwise
        """
        if not self.twilio_client:
            logger.warning(f"[SIMULATION] SMS to {to_phone}: {message[:50]}...")
            return True

        try:
            twilio_message = self.twilio_client.messages.create(
                body=message,
                from_=settings.TWILIO_PHONE_NUMBER,
                to=to_phone
            )
            logger.info(f"SMS sent to {to_phone}: sid={twilio_message.sid}")
            return True

        except Exception as e:
            logger.error(f"Failed to send SMS to {to_phone}: {e}")
            return False

    async def send_order_confirmation(
        self,
        to_email: str,
        to_phone: str,
        order_id: str,
        customer_name: str,
        total_amount: float,
        delivery_address: str
    ) -> Dict[str, bool]:
        """Send order confirmation notification via email and SMS.

        Args:
            to_email: Customer email
            to_phone: Customer phone
            order_id: Order ID
            customer_name: Customer name
            total_amount: Order total
            delivery_address: Delivery address

        Returns:
            Dict with email_sent and sms_sent status
        """
        html_content = f"""
        <html>
        <body>
            <h2>Order Confirmed - MaterialHub</h2>
            <p>Dear {customer_name},</p>
            <p>Your order <strong>#{order_id}</strong> has been confirmed successfully.</p>
            <p><strong>Order Details:</strong></p>
            <ul>
                <li>Order ID: {order_id}</li>
                <li>Total Amount: ₹{total_amount:.2f}</li>
                <li>Delivery Address: {delivery_address}</li>
            </ul>
            <p>You will receive further updates as your order progresses.</p>
            <p>Thank you for choosing MaterialHub!</p>
            <p><em>This is an automated email. Please do not reply.</em></p>
        </body>
        </html>
        """

        plain_text_content = f"""
        Order Confirmed - MaterialHub

        Dear {customer_name},

        Your order #{order_id} has been confirmed successfully.

        Order Details:
        - Order ID: {order_id}
        - Total Amount: ₹{total_amount:.2f}
        - Delivery Address: {delivery_address}

        You will receive further updates as your order progresses.

        Thank you for choosing MaterialHub!
        """

        sms_message = f"MaterialHub: Order #{order_id} confirmed! Total: ₹{total_amount:.2f}. We'll notify you when it's out for delivery."

        email_sent = await self.send_email(
            to_email=to_email,
            subject=f"Order Confirmed - #{order_id}",
            html_content=html_content,
            plain_text_content=plain_text_content
        )

        sms_sent = await self.send_sms(to_phone=to_phone, message=sms_message)

        return {"email_sent": email_sent, "sms_sent": sms_sent}

    async def send_delivery_update(
        self,
        to_email: str,
        to_phone: str,
        order_id: str,
        status: str,
        eta: Optional[str] = None
    ) -> Dict[str, bool]:
        """Send delivery status update notification.

        Args:
            to_email: Customer email
            to_phone: Customer phone
            order_id: Order ID
            status: Delivery status
            eta: Estimated arrival time (optional)

        Returns:
            Dict with email_sent and sms_sent status
        """
        status_messages = {
            "out_for_delivery": "Your order is out for delivery",
            "arrived_at_site": "Driver has arrived at your site",
            "delivered": "Your order has been delivered successfully"
        }

        message = status_messages.get(status, f"Order status updated to: {status}")

        html_content = f"""
        <html>
        <body>
            <h2>Delivery Update - MaterialHub</h2>
            <p>Your order <strong>#{order_id}</strong> status has been updated.</p>
            <p><strong>Status:</strong> {status}</p>
            {f'<p><strong>ETA:</strong> {eta}</p>' if eta else ''}
            <p>Thank you for choosing MaterialHub!</p>
        </body>
        </html>
        """

        plain_text_content = f"""
        Delivery Update - MaterialHub

        Your order #{order_id} status has been updated.

        Status: {status}
        {f'ETA: {eta}' if eta else ''}

        Thank you for choosing MaterialHub!
        """

        sms_message = f"MaterialHub: Order #{order_id} - {message}.{f' ETA: {eta}' if eta else ''}"

        email_sent = await self.send_email(
            to_email=to_email,
            subject=f"Delivery Update - #{order_id}",
            html_content=html_content,
            plain_text_content=plain_text_content
        )

        sms_sent = await self.send_sms(to_phone=to_phone, message=sms_message)

        return {"email_sent": email_sent, "sms_sent": sms_sent}

    async def send_otp(
        self,
        to_phone: str,
        otp: str,
        purpose: str = "verification"
    ) -> bool:
        """Send OTP via SMS.

        Args:
            to_phone: Recipient phone number
            otp: OTP code
            purpose: Purpose of OTP (verification, delivery, etc.)

        Returns:
            True if SMS sent successfully, False otherwise
        """
        sms_message = f"MaterialHub: Your OTP for {purpose} is {otp}. Valid for 5 minutes. Do not share this with anyone."

        return await self.send_sms(to_phone=to_phone, message=sms_message)

    async def send_alert(
        self,
        to_emails: List[str],
        subject: str,
        message: str
    ) -> bool:
        """Send alert notification to multiple recipients (e.g., admin alerts).

        Args:
            to_emails: List of recipient email addresses
            subject: Alert subject
            message: Alert message

        Returns:
            True if email sent successfully to all recipients, False otherwise
        """
        html_content = f"""
        <html>
        <body>
            <h2>{subject}</h2>
            <p>{message}</p>
            <p><em>This is an automated alert from MaterialHub.</em></p>
        </body>
        </html>
        """

        all_sent = True
        for email in to_emails:
            sent = await self.send_email(
                to_email=email,
                subject=f"[ALERT] {subject}",
                html_content=html_content,
                plain_text_content=message
            )
            if not sent:
                all_sent = False

        return all_sent


notification_service = NotificationService()
