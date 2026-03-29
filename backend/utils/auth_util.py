from datetime import datetime, timedelta, timezone
import jwt
import os
import hmac
import hashlib
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


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


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def generate_otp_hash(phone_number: str, otp: str, expires_at: int) -> str:
    secret = os.getenv("OTP_SECRET", "super_secret_key").encode('utf-8')
    data = f"{phone_number}.{otp}.{expires_at}".encode('utf-8')
    return hmac.new(secret, data, hashlib.sha256).hexdigest()
