from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class PriceList(Base):
    __tablename__ = "price_lists"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    client_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    discount_percent: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    currency: Mapped[str] = mapped_column(String(10), default="KZT", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    client = relationship("User")
    items = relationship(
        "PriceListItem",
        back_populates="price_list",
        cascade="all, delete-orphan",
        order_by="PriceListItem.id",
    )


class PriceListItem(Base):
    __tablename__ = "price_list_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    price_list_id: Mapped[int] = mapped_column(
        ForeignKey("price_lists.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    min_quantity: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)

    price_list = relationship("PriceList", back_populates="items")
    product = relationship("Product")
