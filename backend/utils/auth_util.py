from datetime import datetime, timedelta, timezone
import jwt
import os


def sign_jwt(user_id: int) -> str:
    secret = os.getenv("JWT_SECRET")
    if not secret:
        raise ValueError("JWT_SECRET is not set")

    expiration_seconds = int(os.getenv("JWT_EXPIRATION_DELTA", 3600))

    payload = {
        "sub": str(user_id),
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
