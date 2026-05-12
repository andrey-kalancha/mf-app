from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import require_authenticated
from app.core.database import get_db
from app.core.security import hash_password, verify_password
from app.models.user import User
from app.schemas.user import UserOut, UserPasswordUpdate, UserUpdate

router = APIRouter(tags=["profile"])


@router.get("/profile", response_model=UserOut)
def get_profile(
    current_user: User = Depends(require_authenticated),
):
    return current_user


@router.put("/profile", response_model=UserOut)
def update_profile(
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_authenticated),
):
    existing_user = (
        db.query(User)
        .filter(User.email == user_in.email, User.id != current_user.id)
        .first()
    )
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Пользователь с таким email уже существует",
        )

    current_user.email = user_in.email
    current_user.first_name = user_in.first_name
    current_user.last_name = user_in.last_name
    current_user.phone = user_in.phone
    current_user.company = user_in.company
    current_user.city = user_in.city
    current_user.delivery_address = user_in.delivery_address

    db.commit()
    db.refresh(current_user)
    return current_user


@router.put("/profile/password")
def update_password(
    password_in: UserPasswordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_authenticated),
):
    if not verify_password(password_in.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Неверный текущий пароль",
        )

    if password_in.current_password == password_in.new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Новый пароль должен отличаться от текущего",
        )

    current_user.password_hash = hash_password(password_in.new_password)
    db.commit()

    return {"detail": "Пароль успешно изменен"}
