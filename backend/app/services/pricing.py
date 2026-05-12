from decimal import Decimal, ROUND_HALF_UP

from sqlalchemy.orm import Session

from app.models.price_list import PriceList, PriceListItem
from app.models.product import Product


TWOPLACES = Decimal("0.01")


def normalize_money(value: Decimal | float | int | str) -> Decimal:
    return Decimal(str(value)).quantize(TWOPLACES, rounding=ROUND_HALF_UP)


def resolve_product_price(
    db: Session,
    *,
    user_id: int,
    product: Product,
    quantity: int = 1,
) -> dict:
    base_price = normalize_money(product.price or 0)

    price_lists = (
        db.query(PriceList)
        .filter(
            PriceList.is_active.is_(True),
            ((PriceList.client_id == user_id) | (PriceList.client_id.is_(None))),
        )
        .order_by(PriceList.client_id.is_(None).asc(), PriceList.id.desc())
        .all()
    )

    for price_list in price_lists:
        item = (
            db.query(PriceListItem)
            .filter(
                PriceListItem.price_list_id == price_list.id,
                PriceListItem.product_id == product.id,
                PriceListItem.min_quantity <= quantity,
            )
            .order_by(PriceListItem.min_quantity.desc(), PriceListItem.id.desc())
            .first()
        )

        if item:
            return {
                "unit_price": normalize_money(item.price),
                "base_price": base_price,
                "price_source": "price_list_item",
                "applied_price_list_id": price_list.id,
            }

        if price_list.discount_percent is not None:
            discount_percent = Decimal(str(price_list.discount_percent or 0))
            discounted_price = base_price * (
                Decimal("1") - discount_percent / Decimal("100")
            )
            return {
                "unit_price": normalize_money(discounted_price),
                "base_price": base_price,
                "price_source": "price_list_discount",
                "applied_price_list_id": price_list.id,
            }

    return {
        "unit_price": base_price,
        "base_price": base_price,
        "price_source": "base",
        "applied_price_list_id": None,
    }
