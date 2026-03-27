from fastapi import APIRouter

from controller.user_controllers import get_users, create_user

router = APIRouter()

router.add_api_route("/", get_users, methods=["GET"])
router.add_api_route("/", create_user, methods=["POST"])
