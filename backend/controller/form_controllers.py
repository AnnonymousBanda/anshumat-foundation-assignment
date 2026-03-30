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

        fd = payload.form_data
        personal = fd.get("personal")
        family = fd.get("family")
        addr = fd.get("address")

        async with db.tx() as transaction:
            updated_app = await transaction.applications.update(
                where={"id": application_id},
                data={
                    "current_step": payload.current_step,
                    "last_saved_at": datetime.now(timezone.utc),
                }
            )

            if personal is not None or family is not None:
                p = personal or {}
                f = family or {}

                dob_val = None
                if p.get("dob"):
                    try:
                        dob_val = datetime.fromisoformat(p.get("dob").replace("Z", "+00:00"))
                    except ValueError:
                        pass

                gender_val = None
                if p.get("gender"):
                    g = p.get("gender").upper()
                    if g in ["MALE", "FEMALE"]:
                        gender_val = g
                    elif g == "RATHER NOT SAY":
                        gender_val = "RATHER_NOT_SAY"

                existing_details = await transaction.application_details.find_unique(
                    where={"application_id": application_id}
                )

                update_data = {}
                if p:
                    if "firstName" in p: update_data["fName"] = p["firstName"]
                    if "lastName" in p: update_data["lName"] = p["lastName"]
                    if "gender" in p: update_data["gender"] = gender_val
                    if "dob" in p: update_data["dob"] = dob_val
                    if "placeOfBirth" in p: update_data["place_of_birth"] = p["placeOfBirth"]
                    if "birthState" in p: update_data["state_of_birth"] = p["birthState"]
                    if "email" in p: update_data["email"] = p["email"]
                    if "phone" in p: update_data["phone_number"] = p["phone"]
                if f:
                    if "fatherName" in f: update_data["father_name"] = f["fatherName"]
                    if "motherName" in f: update_data["mother_name"] = f["motherName"]
                    if "spouseName" in f: update_data["spouse_name"] = f["spouseName"]

                if existing_details:
                    if update_data:
                        await transaction.application_details.update(
                            where={"application_id": application_id},
                            data=update_data
                        )
                else:
                    await transaction.application_details.create(
                        data={
                            "application_id": application_id,
                            "fName": p.get("firstName"),
                            "lName": p.get("lastName"),
                            "gender": gender_val,
                            "dob": dob_val,
                            "place_of_birth": p.get("placeOfBirth"),
                            "state_of_birth": p.get("birthState"),
                            "email": p.get("email"),
                            "phone_number": p.get("phone"),
                            "father_name": f.get("fatherName"),
                            "mother_name": f.get("motherName"),
                            "spouse_name": f.get("spouseName")
                        }
                    )

            if addr is not None:
                app_addr = await transaction.application_addresses.find_first(
                    where={
                        "application_id": application_id,
                        "role": "PRESENT"
                    }
                )

                if app_addr:
                    update_addr = {}
                    if "addressLine1" in addr: update_addr["address_line_1"] = addr["addressLine1"]
                    if "addressLine2" in addr: update_addr["address_line_2"] = addr["addressLine2"]
                    if "city" in addr: update_addr["city"] = addr["city"]
                    if "state" in addr: update_addr["state"] = addr["state"]
                    if "pincode" in addr: update_addr["pincode"] = addr["pincode"]
                    if "country" in addr: update_addr["country"] = addr["country"]

                    if update_addr:
                        await transaction.addresses.update(
                            where={"id": app_addr.address_id},
                            data=update_addr
                        )
                else:
                    new_addr = await transaction.addresses.create(
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
                    await transaction.application_addresses.create(
                        data={
                            "application_id": application_id,
                            "address_id": new_addr.id,
                            "role": "PRESENT"
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

        form_data = {
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

        personal_details = await db.application_details.find_unique(
            where={"application_id": application_id}
        )

        address_details = await db.application_addresses.find_first(
            where={"application_id": application_id, "role": "PRESENT"},
            include={"address": True},
        )

        document_details = await db.application_documents.find_first(
            where={"application_id": application_id, "role": "PRESENT_ADDRESS_PROOF"},
            include={"document": True},
        )

        if personal_details:
            form_data["personal"] = {
                "firstName": personal_details.fName or "",
                "lastName": personal_details.lName or "",
                "dob": personal_details.dob.isoformat() if personal_details.dob else "",
                "gender": personal_details.gender or "",
                "birthState": personal_details.state_of_birth or "",
                "placeOfBirth": personal_details.place_of_birth or "",
                "email": personal_details.email or "",
                "phone": personal_details.phone_number or "",
            }
            form_data["family"] = {
                "motherName": personal_details.mother_name or "",
                "fatherName": personal_details.father_name or "",
                "spouseName": personal_details.spouse_name or "",
            }

        if address_details and address_details.address:
            form_data["address"] = {
                "addressLine1": address_details.address.address_line_1 or "",
                "addressLine2": address_details.address.address_line_2 or "",
                "city": address_details.address.city or "",
                "state": address_details.address.state or "",
                "pincode": address_details.address.pincode or "",
                "country": address_details.address.country or "",
            }

        if document_details and document_details.document:
            form_data["documents"] = {
                "aadhaarNumber": "",
                "panNumber": "",
                "addressProofType": "",
                "passportPhotoName": "",
                "idProofName": document_details.document.file_url or "",
            }

        return {
            "message": "Application details retrieved successfully",
            "application_id": app_record.id,
            "arn": app_record.arn,
            "status": app_record.status,
            "current_step": app_record.current_step,
            "form_data": form_data
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
