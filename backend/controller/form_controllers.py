from fastapi import APIRouter, Body, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, Any
from datetime import datetime, timezone
from uuid import uuid4
from db.prisma_client import db
from controller.auth_controllers import verify_user
import traceback

class PatchProgressPayload(BaseModel):
    current_step: int
    form_data: Dict[str, Any]

class SubmitApplicationPayload(BaseModel):
    application_id: str


def _generate_arn() -> str:
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
    suffix = uuid4().hex[:8].upper()
    return f"ARN{timestamp}{suffix}"


async def start_new_application(current_user: dict = Depends(verify_user)):
    try:
        user_id = current_user["user"]["id"]

        existing_draft = await db.applications.find_first(
            where={
                "user_id": user_id,
                "status": "DRAFT"
            }
        )

        if existing_draft:
            return {
                "message": "Resuming existing draft",
                "application_id": existing_draft.id,
                "current_step": existing_draft.current_step,
                "form_data": {}
            }

        new_app = await db.applications.create(
            data={
                "user_id": user_id,
                "arn": _generate_arn(),
                "status": "DRAFT",
                "passport_type": "FRESH",
                "current_step": 0,
            }
        )

        return {
            "message": "New application started",
            "application_id": new_app.id,
            "current_step": new_app.current_step,
            "form_data": {}
        }

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to start application")


async def save_progress(
    application_id: str, 
    payload: PatchProgressPayload, 
    current_user: dict = Depends(verify_user)
):
    if not application_id:
        raise HTTPException(status_code=400, detail="Application ID is required")
        
    try:
        user_id = current_user["user"]["id"]
        
        existing_app = await db.applications.find_first(
            where={
                "id": application_id,
                "user_id": user_id
            }
        )
        
        if not existing_app:
            raise HTTPException(status_code=404, detail="Application not found or unauthorized")
            
        if existing_app.status != "DRAFT":
            raise HTTPException(status_code=400, detail="Cannot edit a submitted application")

        updated_app = await db.applications.update(
            where={"id": application_id},
            data={
                "current_step": payload.current_step,
                "last_saved_at": datetime.now(timezone.utc),
            }
        )

        return {
            "message": "Progress saved successfully", 
            "application_id": updated_app.id,
            "current_step": updated_app.current_step
        }

    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="An error occurred while saving progress")


async def check_status(application_id: str, current_user: dict = Depends(verify_user)):
    if not application_id:
        raise HTTPException(status_code=400, detail="Application ID is required")
        
    try:
        user_id = current_user["user"]["id"]
        
        app_record = await db.applications.find_first(
            where={
                "id": application_id,
                "user_id": user_id
            }
        )
        
        if not app_record:
            raise HTTPException(status_code=404, detail="Application not found or unauthorized")

        return {
            "message": "Application status retrieved successfully",
            "application_id": app_record.id,
            "arn": app_record.arn,
            "status": app_record.status,
            "current_step": app_record.current_step
        }

    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to retrieve application status")


async def get_application_details(
    application_id: str, 
    current_user: dict = Depends(verify_user)
):
    if not application_id:
        raise HTTPException(status_code=400, detail="Application ID is required")
        
    try:
        user_id = current_user["user"]["id"]
        
        app_record = await db.applications.find_first(
            where={
                "id": application_id,
                "user_id": user_id
            }
        )
        
        if not app_record:
            raise HTTPException(status_code=404, detail="Application not found or unauthorized")

        default_form_data = {
            "personal": {
                "firstName": "", "lastName": "", "dob": "", "gender": "",
                "birthState": "", "placeOfBirth": "", "email": "", "phone": ""
            },
            "family": {
                "motherName": "", "fatherName": "", "spouseName": ""
            },
            "address": {
                "addressLine1": "", "addressLine2": "", "city": "", "state": "",
                "pincode": "", "country": ""
            },
            "documents": {
                "aadhaarNumber": "", "panNumber": "", "addressProofType": "",
                "passportPhotoName": "", "idProofName": ""
            }
        }

        final_form_data = default_form_data

        return {
            "message": "Application details retrieved successfully",
            "application_id": app_record.id,
            "arn": app_record.arn,
            "status": app_record.status,
            "current_step": app_record.current_step,
            "form_data": final_form_data
        }

    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to retrieve application details")


async def submit_form(
    application_id: str,
    current_user: dict = Depends(verify_user)
):
    try:
        if not application_id:
            raise HTTPException(status_code=400, detail="Missing request body")
        
        if not application_id:
            raise HTTPException(status_code=400, detail="Application ID is required in the request body")

        user_id = current_user["user"]["id"]

        app_record = await db.applications.find_first(
            where={
                "id": application_id,
                "user_id": user_id
            }
        )

        if not app_record:
            raise HTTPException(status_code=404, detail="Application not found")
        
        if app_record.status != "DRAFT":
            raise HTTPException(status_code=400, detail="Application is already submitted")

        form_data = app_record.form_data if app_record.form_data else {}

        required_sections = ["personal", "family", "address", "documents"]
        missing_sections = [sec for sec in required_sections if sec not in form_data or not form_data[sec]]
        
        if missing_sections:
            missing_str = ", ".join(missing_sections)
            raise HTTPException(status_code=400, detail=f"Incomplete application. Missing sections: {missing_str}")

        async with db.tx() as transaction:
            addr = form_data.get("address", {})
            await transaction.addresses.create(
                data={
                    "user_id": user_id,
                    "address_line_1": addr.get("addressLine1", ""),
                    "address_line_2": addr.get("addressLine2", ""),
                    "city": addr.get("city", ""),
                    "state": addr.get("state", ""),
                    "pincode": addr.get("pincode", ""),
                    "country": addr.get("country", "")
                }
            )

            docs = form_data.get("documents", {})
            await transaction.documents.create(
                data={
                    "user_id": user_id,
                    "aadhaar_number": docs.get("aadhaarNumber", ""),
                    "pan_number": docs.get("panNumber", ""),
                    "address_proof_type": docs.get("addressProofType", ""),
                    "passport_photo_url": docs.get("passportPhotoName", ""),
                    "id_proof_url": docs.get("idProofName", "")
                }
            )

            updated_app = await transaction.applications.update(
                where={"id": application_id},
                data={
                    "status": "SUBMITTED"
                }
            )

        return {
            "message": "Form submitted successfully",
            "application_id": updated_app.id,
            "arn": updated_app.arn
        }

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to submit application")    
