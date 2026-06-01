from layers.2_test_data.models.user_model import User, UserRole

_counter = 0


def _next() -> int:
    global _counter
    _counter += 1
    return _counter


class UserFactory:
    @staticmethod
    def create(**overrides) -> User:
        n = _next()
        defaults = dict(
            email=f"user{n}@test.com",
            password="TestPass123!",
            first_name=f"First{n}",
            last_name=f"Last{n}",
            role="viewer",
        )
        defaults.update(overrides)
        return User(**defaults)

    @staticmethod
    def create_admin(**overrides) -> User:
        return UserFactory.create(role="admin", **overrides)

    @staticmethod
    def create_manager(**overrides) -> User:
        return UserFactory.create(role="manager", **overrides)

    @staticmethod
    def create_many(count: int, **overrides) -> list[User]:
        return [UserFactory.create(**overrides) for _ in range(count)]

    @staticmethod
    def reset() -> None:
        global _counter
        _counter = 0
