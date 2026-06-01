from dataclasses import dataclass
from typing import Literal

UserRole = Literal["admin", "manager", "viewer"]


@dataclass
class User:
    email: str
    password: str
    first_name: str
    last_name: str
    role: UserRole
    id: str | None = None


@dataclass
class UserCredentials:
    email: str
    password: str
