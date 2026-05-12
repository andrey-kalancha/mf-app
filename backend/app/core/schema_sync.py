from sqlalchemy import text

from app.core.database import engine


def sync_dev_schema() -> None:
    """Small compatibility layer for existing dev databases without Alembic."""
    statements = [
        """
        ALTER TABLE categories
        ADD COLUMN IF NOT EXISTS parent_id INTEGER
        REFERENCES categories(id) ON DELETE SET NULL
        """,
        """
        CREATE INDEX IF NOT EXISTS ix_categories_parent_id
        ON categories(parent_id)
        """,
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50)",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS company VARCHAR(255)",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(100)",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS delivery_address VARCHAR(500)",
        "ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_address TEXT",
        "ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255)",
        "ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(50)",
        "ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_company VARCHAR(255)",
    ]

    with engine.begin() as connection:
        for statement in statements:
            connection.execute(text(statement))
