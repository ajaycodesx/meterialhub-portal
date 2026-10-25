from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.config import settings
from app.core.database import get_db
from app.models.user import User, UserRole

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login",
    auto_error=False
)


async def get_current_user(
    db: AsyncSession = Depends(get_db),
    token: Optional[str] = Depends(oauth2_scheme)
) -> User:
    is_dev = settings.ENVIRONMENT.lower() == "development" and settings.DEBUG
    allow_mock = getattr(settings, "DEV_ALLOW_MOCK_AUTH", False)

    if not token:
        if is_dev and allow_mock:
            res = await db.execute(select(User).where(User.role == UserRole.BUYER))
            user = res.scalars().first()
            if user:
                return user

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token required"
        )
        
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            if is_dev and allow_mock:
                res = await db.execute(select(User).where(User.role == UserRole.BUYER))
                user = res.scalars().first()
                if user:
                    return user
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
    except JWTError:
        if is_dev and allow_mock:
            res = await db.execute(select(User).where(User.role == UserRole.BUYER))
            user = res.scalars().first()
            if user:
                return user
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")
        
    res = await db.execute(select(User).where(User.id == user_id))
    user = res.scalars().first()
    if not user:
        if is_dev and allow_mock:
            res = await db.execute(select(User).where(User.role == UserRole.BUYER))
            user = res.scalars().first()
            if user:
                return user
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user")
    return user
