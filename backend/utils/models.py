from sqlalchemy import Table, Column, Integer, String, MetaData, JSON

metadata = MetaData()

users = Table(
    "users",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),  # safer PK
    Column("email", String, unique=True, nullable=False, index=True),
    Column("firstname", String, nullable=True),
    Column("user_images", JSON, nullable=True),  # store list of image paths/IDs
    Column("graphical_password", String, nullable=True),  # hashed pattern
    Column("status", String, nullable=False, default="pending"),  # 'pending' | 'active'
)
