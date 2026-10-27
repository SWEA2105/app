"""
One-time-password (OTP) issuance, verification and e-mail delivery.

Drives the student sign-in flow: a student submits their register number and
e-mail ID, a short-lived OTP is mailed to that address, and the code is then
exchanged for a signed JWT session.
"""

from __future__ import annotations

import hashlib
import logging
import secrets
import smtplib
import ssl
import time
from dataclasses import dataclass
from email.message import EmailMessage
from typing import Optional, Tuple

from app.core.config import settings

logger = logging.getLogger("app.core.otp")


class OtpStatus:
    """Outcome codes returned by :meth:`OtpStore.verify`."""

    OK = "ok"
    NOT_FOUND = "not_found"
    EXPIRED = "expired"
    MISMATCH = "mismatch"
    LOCKED = "locked"


def mask_email(email: str) -> str:
    """Mask the local part of an e-mail so it can safely be echoed back."""
    if "@" not in email:
        return email
    local, _, domain = email.partition("@")
    if len(local) <= 2:
        masked_local = local[0] + "*"
    else:
        masked_local = f"{local[0]}{'*' * (len(local) - 2)}{local[-1]}"
    return f"{masked_local}@{domain}"


def _hash_code(code: str) -> str:
    """Hash an OTP before storing it so the plain code is never persisted."""
    return hashlib.sha256(f"{settings.SECRET_KEY}:{code}".encode("utf-8")).hexdigest()


def _generate_code() -> str:
    """Return the OTP to dispatch (fixed in demo mode, random otherwise)."""
    fixed = settings.STUDENT_OTP_FIXED
    if fixed:
        return fixed
    return "".join(secrets.choice("0123456789") for _ in range(settings.STUDENT_OTP_LENGTH))


@dataclass
class OtpRecord:
    """A single outstanding OTP challenge."""

    code_hash: str
    expires_at: float
    resend_available_at: float
    attempts: int = 0


class OtpStore:
    """In-memory registry of outstanding OTP challenges keyed by "<regNo>|<email>"."""

    def __init__(self) -> None:
        self._records: dict[str, OtpRecord] = {}
        # Resend cooldowns are tracked separately so they survive a redeemed code.
        self._cooldowns: dict[str, float] = {}

    @staticmethod
    def _key(reg_no: str, email: str) -> str:
        return f"{reg_no.strip().lower()}|{email.strip().lower()}"

    def issue(self, reg_no: str, email: str) -> Tuple[str, OtpRecord]:
        """Create and store a fresh OTP challenge, returning the plain code."""
        now = time.time()
        key = self._key(reg_no, email)
        code = _generate_code()
        record = OtpRecord(
            code_hash=_hash_code(code),
            expires_at=now + settings.STUDENT_OTP_TTL_SECONDS,
            resend_available_at=now + settings.STUDENT_OTP_RESEND_COOLDOWN_SECONDS,
        )
        self._records[key] = record
        self._cooldowns[key] = record.resend_available_at
        return code, record

    def cooldown_remaining(self, reg_no: str, email: str) -> int:
        """Seconds the student must wait before another OTP can be requested."""
        key = self._key(reg_no, email)
        available_at = self._cooldowns.get(key)
        if available_at is None:
            return 0
        remaining = int(available_at - time.time())
        if remaining <= 0:
            self._cooldowns.pop(key, None)
            return 0
        return remaining

    def verify(self, reg_no: str, email: str, code: str) -> Tuple[bool, str]:
        """Validate a submitted OTP. Returns ``(success, status_code)``."""
        key = self._key(reg_no, email)
        record = self._records.get(key)
        if not record:
            return False, OtpStatus.NOT_FOUND
        if time.time() > record.expires_at:
            self._records.pop(key, None)
            return False, OtpStatus.EXPIRED
        if record.attempts >= settings.STUDENT_OTP_MAX_ATTEMPTS:
            self._records.pop(key, None)
            return False, OtpStatus.LOCKED
        if not secrets.compare_digest(record.code_hash, _hash_code(code.strip())):
            record.attempts += 1
            return False, OtpStatus.MISMATCH
        # Single-use: burn the challenge as soon as it is redeemed.
        self._records.pop(key, None)
        return True, OtpStatus.OK


otp_store = OtpStore()


def _build_email_body(otp: str, reg_no: str, student_name: str) -> Tuple[str, str]:
    """Return ``(plain_text_body, html_body)`` for the verification e-mail."""
    name = student_name or "Student"
    minutes = max(1, settings.STUDENT_OTP_TTL_SECONDS // 60)
    plain = (
        f"Dear {name},\n\n"
        f"Your verification code for the Academic Performance & Result Analyzer portal is:\n\n"
        f"    {otp}\n\n"
        f"Register Number: {reg_no}\n"
        f"This code expires in {minutes} minute(s) and can only be used once.\n\n"
        f"If you did not request this code you can safely ignore this e-mail.\n\n"
        f"- Academic Performance & Result Analyzer"
    )
    html = f"""
    <div style="font-family:'Segoe UI',Arial,sans-serif;background:#101010;padding:32px;color:#ffffff;">
      <div style="max-width:520px;margin:0 auto;background:#171717;border:1px solid #333;border-radius:20px;padding:32px;">
        <div style="font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#39ff14;font-weight:700;">
          Academic Result Analyzer
        </div>
        <h1 style="font-size:22px;margin:12px 0 6px;color:#ffffff;">Hi {name},</h1>
        <p style="font-size:14px;line-height:1.6;color:#bcbcbc;margin:0 0 24px;">
          Use the verification code below to complete your student sign-in.
          Register number <strong style="color:#fff94a;">{reg_no}</strong>.
        </p>
        <div style="font-size:34px;font-weight:700;letter-spacing:12px;text-align:center;
                    padding:20px;border-radius:16px;background:#101010;border:2px solid #ff2457;
                    box-shadow:0 0 22px rgba(255,36,87,.45);color:#fff94a;">{otp}</div>
        <p style="font-size:12px;color:#8a8a8a;margin:24px 0 0;line-height:1.6;">
          This code expires in {minutes} minute(s) and can only be used once.
          If you did not request it, please ignore this e-mail.
        </p>
      </div>
    </div>
    """
    return plain, html


def send_otp_email(to_email: str, otp: str, reg_no: str, student_name: str) -> bool:
    """
    Deliver the OTP to the student's mailbox.

    Returns ``True`` when the message was handed to the SMTP relay and ``False``
    when e-mail delivery is unavailable (development mode) or the send failed.
    """
    if not settings.is_smtp_configured:
        logger.info(
            "[OTP] SMTP not configured - verification code for %s (%s) is %s (development mode)",
            reg_no,
            mask_email(to_email),
            otp,
        )
        return False

    plain, html = _build_email_body(otp, reg_no, student_name)

    message = EmailMessage()
    message["Subject"] = f"Academic Portal - Login verification code for {reg_no}"
    message["From"] = settings.SMTP_FROM
    message["To"] = to_email
    message.set_content(plain)
    message.add_alternative(html, subtype="html")

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=20) as server:
            if settings.SMTP_USE_TLS:
                server.starttls(context=ssl.create_default_context())
            if settings.SMTP_USER:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(message)
        logger.info("[OTP] Verification code dispatched to %s", mask_email(to_email))
        return True
    except Exception as exc:  # noqa: BLE001 - never break the login flow on mail failure
        logger.error(
            "[OTP] Failed to dispatch verification code to %s: %s",
            mask_email(to_email),
            exc,
        )
        return False
