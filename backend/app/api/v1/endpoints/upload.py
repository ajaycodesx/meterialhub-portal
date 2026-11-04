import os
import re
import uuid
import aiofiles
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from app.api.deps import get_current_user
from app.models.user import User, UserRole
from app.schemas.common import ApiResponse

router = APIRouter(tags=["File Uploads"])

UPLOAD_DIR = "uploads"
# SVG is excluded: it can carry script, and it is served from the same origin.
ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".gif"}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024


def _content_matches_extension(content: bytes, ext: str) -> bool:
    """Check the file's leading bytes so a renamed non-image is rejected."""
    if ext == ".png":
        return content.startswith(b"\x89PNG\r\n\x1a\n")
    if ext in (".jpg", ".jpeg"):
        return content.startswith(b"\xff\xd8\xff")
    if ext == ".gif":
        return content.startswith((b"GIF87a", b"GIF89a"))
    if ext == ".webp":
        return len(content) >= 12 and content[:4] == b"RIFF" and content[8:12] == b"WEBP"
    return False


@router.post("/upload", response_model=ApiResponse[dict])
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    # Only merchants and admins upload catalogue or banner images.
    if current_user.role not in (UserRole.VENDOR, UserRole.ADMIN):
        raise HTTPException(status_code=403, detail="Access denied. Vendor or admin role required.")

    if not file.filename:
        raise HTTPException(status_code=400, detail="Missing filename")

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
        )

    content = await file.read(MAX_FILE_SIZE_BYTES + 1)
    if len(content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="File size exceeds maximum limit of 10MB")
    if not _content_matches_extension(content, ext):
        raise HTTPException(status_code=400, detail="File content does not match its image type")

    clean_base = re.sub(r"[^a-zA-Z0-9_\-]", "_", os.path.splitext(file.filename)[0])[:30]
    unique_filename = f"{clean_base}_{uuid.uuid4().hex[:8]}{ext}"
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    try:
        async with aiofiles.open(file_path, "wb") as f:
            await f.write(content)

        relative_url = f"/uploads/{unique_filename}"
        return ApiResponse(
            data={
                "url": relative_url,
                "filename": unique_filename,
                "sizeBytes": len(content)
            },
            message="Image uploaded successfully"
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to save uploaded file: {str(exc)}") from exc
