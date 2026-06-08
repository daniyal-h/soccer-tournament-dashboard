import logging
from collections.abc import Generator

from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session, declarative_base, sessionmaker

from app.core.config import settings

logger = logging.getLogger(__name__)

# enable automatic liveliness test on checkout
engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()

    try:
        # force connection inside
        db.connection()
        yield db

    except OperationalError:
        logger.warning("Database connection failed")

        raise HTTPException(
            status_code=503,
            detail="Database temporarily unavailable",
        )

    finally:
        db.close()
