import random
import string
import time
from datetime import date
from dateutil.relativedelta import relativedelta


class TestDataHelper:
    @staticmethod
    def random_email(prefix: str = "test") -> str:
        suffix = "".join(random.choices(string.ascii_lowercase, k=5))
        return f"{prefix}-{int(time.time())}-{suffix}@test.com"

    @staticmethod
    def random_string(length: int = 8) -> str:
        return "".join(random.choices(string.ascii_lowercase, k=length))

    @staticmethod
    def random_int(min_val: int, max_val: int) -> int:
        return random.randint(min_val, max_val)

    @staticmethod
    def random_price(min_val: float = 1.0, max_val: float = 999.0) -> str:
        return f"{random.uniform(min_val, max_val):.2f}"

    @staticmethod
    def future_card_expiry(years_ahead: int = 2) -> str:
        future = date.today() + relativedelta(years=years_ahead)
        return f"{future.month:02d}/{str(future.year)[-2:]}"

    @staticmethod
    def test_credit_card() -> dict:
        return {
            "number": "4111111111111111",
            "expiry": TestDataHelper.future_card_expiry(),
            "cvc": "123",
        }
