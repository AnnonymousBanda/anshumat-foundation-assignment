from fastapi import APIRouter
from controller.user_controllers import (
    create_user, 
    login_with_email, 
    verify_user,
    send_otp,
    verify_otp_login
)

auth_router = APIRouter(prefix="/auth", tags=["Authentication"])

auth_router.add_api_route("/register", create_user, methods=["POST"])
auth_router.add_api_route("/login/email", login_with_email, methods=["POST"])
auth_router.add_api_route("/login/otp/send", send_otp, methods=["POST"])
auth_router.add_api_route("/login/otp/verify", verify_otp_login, methods=["POST"])
auth_router.add_api_route("/verify", verify_user, methods=["GET"])
