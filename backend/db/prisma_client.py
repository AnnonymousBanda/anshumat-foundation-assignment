import os
from urllib.parse import quote_plus

from prisma import Prisma


def resolve_database_url() -> str:
    db_url_template = os.getenv("DATABASE_URL")
    if not db_url_template:
        raise ValueError("DATABASE_URL is not set")

    if "<PASSWORD>" not in db_url_template:
        return db_url_template

    db_password = os.getenv("DATABASE_PASSWORD")
    if not db_password:
        raise ValueError(
            "DATABASE_PASSWORD is not set but DATABASE_URL contains <PASSWORD>"
        )

    return db_url_template.replace("<PASSWORD>", quote_plus(db_password))


def configure_database_url() -> str:
    resolved_url = resolve_database_url()
    os.environ["DATABASE_URL"] = resolved_url
    return resolved_url


configure_database_url()
db = Prisma()
