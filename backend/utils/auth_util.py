from datetime import datetime, timedelta, timezone
import jwt
import os
import hmac
import hashlib
import bcrypt


def sign_jwt(user_id: str) -> str:
    secret = os.getenv("JWT_SECRET")
    if not secret:
        raise ValueError("JWT_SECRET is not set")

    expiration_seconds = int(os.getenv("JWT_EXPIRATION_DELTA", 3600))

    payload = {
        "sub": user_id,
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(seconds=expiration_seconds),
    }

    return jwt.encode(payload, secret, algorithm="HS256")


def decode_jwt(token: str) -> dict:
    secret = os.getenv("JWT_SECRET")
    if not secret:
        raise ValueError("JWT_SECRET is not set")

    try:
        return jwt.decode(token, secret, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise ValueError("Token has expired")
    except jwt.InvalidTokenError:
        raise ValueError("Invalid token")


def _normalize_password(password: str) -> bytes:
    password_bytes = password.encode("utf-8")
    if len(password_bytes) > 72:
        return hashlib.sha256(password_bytes).hexdigest().encode("utf-8")
    return password_bytes


def get_password_hash(password: str) -> str:
    normalized = _normalize_password(password)
    return bcrypt.hashpw(normalized, bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        normalized = _normalize_password(plain_password)
        return bcrypt.checkpw(normalized, hashed_password.encode("utf-8"))
    except (TypeError, ValueError):
        return False


def generate_otp_hash(phone_number: str, otp: str, expires_at: int) -> str:
    secret = os.getenv("OTP_SECRET", "super_secret_key").encode('utf-8')
    data = f"{phone_number}.{otp}.{expires_at}".encode('utf-8')
    return hmac.new(secret, data, hashlib.sha256).hexdigest()
