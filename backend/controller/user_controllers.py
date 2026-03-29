from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Depends, HTTPException
from pydantic import BaseModel
from prisma.errors import UniqueViolationError

from db.prisma_client import db
from utils.auth_util import decode_jwt

security = HTTPBearer()


class CreateUserPayload(BaseModel):
    phone_number: str
    email: str
    password_hash: str


async def get_users():
    users = await db.users.find_many(order={"created_at": "desc"})
    return {"users": users}


async def create_user(user: CreateUserPayload):
    try:
        created_user = await db.users.create(data=user.model_dump())
        return {"message": "User created", "user": created_user}
    except UniqueViolationError:
        raise HTTPException(status_code=409, detail="Email or phone number already exists")


async def verify_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials

    try:
        payload = decode_jwt(token)
        return payload
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
