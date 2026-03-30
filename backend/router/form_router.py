from fastapi import APIRouter, Depends

from controller.form_controllers import (
    submit_form,
    check_status,
    get_application_details,
    start_new_application,
    save_progress)
from controller.auth_controllers import verify_user

form_router = APIRouter(prefix="/form", tags=["Forms"],dependencies=[Depends(verify_user)])

form_router.add_api_route("/new-form", start_new_application, methods=["POST"])
form_router.add_api_route("/details/{application_id}", get_application_details, methods=["GET"])
form_router.add_api_route("/save/{application_id}", save_progress, methods=["PATCH"])
form_router.add_api_route("/submit/{application_id}", submit_form, methods=["PATCH"])
form_router.add_api_route("/status/{application_id}", check_status, methods=["GET"])

