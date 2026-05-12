from sqlalchemy import String, Integer, ForeignKey, Boolean, Numeric, JSON, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True)

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0)
    sku: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)

    brand: Mapped[str | None] = mapped_column(String(100), nullable=True, default="Lanttich")
    line: Mapped[str | None] = mapped_column(String(50), nullable=True)

    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    is_featured: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    in_stock: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    pack_quantity: Mapped[int | None] = mapped_column(Integer, nullable=True)
    weight_grams: Mapped[int | None] = mapped_column(Integer, nullable=True)

    load_capacity: Mapped[str | None] = mapped_column(String(100), nullable=True)
    color: Mapped[str | None] = mapped_column(String(100), nullable=True)
    coating: Mapped[str | None] = mapped_column(String(100), nullable=True)
    size_label: Mapped[str | None] = mapped_column(String(100), nullable=True)

    specifications: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"), nullable=False)

    category = relationship("Category", back_populates="products")
    images = relationship(
        "ProductImage",
        back_populates="product",
        cascade="all, delete-orphan",
        order_by="ProductImage.sort_order",
    )
    drawings = relationship(
        "ProductDrawing",
        back_populates="product",
        cascade="all, delete-orphan",
        order_by="ProductDrawing.sort_order",
    )


class ProductImage(Base):
    __tablename__ = "product_images"

    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    image_url: Mapped[str] = mapped_column(String(500), nullable=False)
    alt_text: Mapped[str | None] = mapped_column(String(255), nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    product = relationship("Product", back_populates="images")


class ProductDrawing(Base):
    __tablename__ = "product_drawings"

    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    file_url: Mapped[str] = mapped_column(String(500), nullable=False)
    preview_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    product = relationship("Product", back_populates="drawings")
