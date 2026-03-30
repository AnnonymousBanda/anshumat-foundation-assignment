from pydantic import BaseModel, model_validator
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from db.prisma_client import db
from utils.auth_util import decode_jwt, generate_otp_hash, get_password_hash, sign_jwt, verify_password
import hmac
import time
import os
import traceback
import random

class CreateUserPayload(BaseModel):
    phone_number: str | None = None
    email: str | None = None
    password: str | None = None

    @model_validator(mode='after')
    def check_contact_provided(self) -> 'CreateUserPayload':
        if not self.phone_number and not self.email:
            raise ValueError('You must provide either a phone number or an email address.')
        return self

async def create_user(payload: CreateUserPayload):
    try:
        or_conditions = []
        if payload.email:
            or_conditions.append({"email": payload.email})
        if payload.phone_number:
            or_conditions.append({"phone_number": payload.phone_number})

        existing_user = await db.users.find_first(
            where={"OR": or_conditions}
        )
        
        if existing_user:
            raise HTTPException(status_code=409, detail="Account with this email or phone number already exists")
        
        data_to_insert = {
            "phone_number": payload.phone_number,
            "email": payload.email,
        }
        
        if payload.password:
            data_to_insert["password_hash"] = get_password_hash(payload.password)

        created_user = await db.users.create(data=data_to_insert)
        
        return {
            "message": "User created successfully", 
            "user": {
                "id": str(created_user.id),
                "email": created_user.email,
                "phone_number": created_user.phone_number
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating user: {e}")
        env = os.getenv("ENVIRONMENT", "development")
        if env == "development":
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=str(e))
        else:
            raise HTTPException(status_code=500, detail="Internal server error")

security = HTTPBearer()

async def verify_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = decode_jwt(token)
        user = await db.users.find_unique(where={"id": payload["sub"]})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return {
            "message": "User verified",
            "user": {
                "id": str(user.id),
                "email": user.email,
                "phone_number": user.phone_number
            }
        }
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


class LoginEmailPayload(BaseModel):
    email: str
    password: str

async def login_with_email(payload: LoginEmailPayload):
    try:
        user = await db.users.find_first(
            where={"email": payload.email}
        )
        
        if not user or not user.password_hash:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        is_password_correct = verify_password(payload.password, user.password_hash)
        
        if not is_password_correct:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        return {
            "message": "Login successful",
            "token": sign_jwt(str(user.id)),
            "user": {
                "id": str(user.id),
                "email": user.email,
                "phone_number": user.phone_number
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error logging in: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


class SendOTPPayload(BaseModel):
    phone_number: str

class VerifyOTPPayload(BaseModel):
    phone_number: str
    otp: str
    hash_value: str
    expires_at: int

async def send_otp(payload: SendOTPPayload):
    try:
        otp = str(random.randint(100000, 999999))
        expires_at = int(time.time()) + 300
        
        otp_hash = generate_otp_hash(payload.phone_number, otp, expires_at)
        
        # In a real implementation, you would send the OTP via SMS here.
        phone_number = "+91" + payload.phone_number[-10:]
        print(f"MOCK SMS -> To: {phone_number} | OTP: {otp}")
        
        return {
            "message": "OTP sent successfully",
            "hash": otp_hash,
            "expires_at": expires_at
        }
    except Exception as e:
        env = os.getenv("ENVIRONMENT", "development")
        if env == "development":
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=str(e))
        else:
            raise HTTPException(status_code=500, detail="Internal server error")


async def verify_otp_login(payload: VerifyOTPPayload):
    try:
        if int(time.time()) > payload.expires_at:
            raise HTTPException(status_code=401, detail="OTP has expired")
        
        expected_hash = generate_otp_hash(payload.phone_number, payload.otp, payload.expires_at)
        
        if not hmac.compare_digest(expected_hash, payload.hash_value):
            raise HTTPException(status_code=401, detail="Invalid OTP")
            
        user = await db.users.find_first(
            where={"phone_number": payload.phone_number}
        )
        
        if not user:
            user = await db.users.create(
                data={"phone_number": payload.phone_number}
            )
            
        return {
            "message": "Login successful",
            "token": sign_jwt(str(user.id)),
            "user": {
                "id": str(user.id),
                "email": user.email,
                "phone_number": user.phone_number
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        env = os.getenv("ENVIRONMENT", "development")
        if env == "development":
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=str(e))
        else:
            raise HTTPException(status_code=500, detail="Internal server error")
    
