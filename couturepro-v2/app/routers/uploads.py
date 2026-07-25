import os
import uuid
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException

from app.models import User
from app.dependencies import require_acces

router = APIRouter(prefix="/api/upload", tags=["Upload"])

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_SIZE_MB = 5

os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/photo")
async def upload_photo(
    file: UploadFile = File(...),
    current_user: User = Depends(require_acces("commandesPhotos")),
):
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Format non supporte (jpg, jpeg, png, webp uniquement).",
        )

    contents = await file.read()
    if len(contents) > MAX_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"Fichier trop volumineux (max {MAX_SIZE_MB}Mo).")
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Fichier vide.")

    # prefixe user_id + uuid : isole les fichiers entre utilisatrices et evite les collisions
    filename = f"{current_user.id}_{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    with open(filepath, "wb") as f:
        f.write(contents)

    return {"url": f"/uploads/{filename}"}
