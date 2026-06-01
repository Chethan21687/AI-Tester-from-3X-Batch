import random
from layers.2_test_data.models.product_model import Product

_counter = 0


def _next() -> int:
    global _counter
    _counter += 1
    return _counter


class ProductFactory:
    @staticmethod
    def create(**overrides) -> Product:
        n = _next()
        defaults = dict(
            name=f"Product {n}",
            price=round(random.uniform(1, 100), 2),
            description=f"Description for product {n}",
            category="General",
            sku=f"SKU-{n:05d}",
            in_stock=True,
        )
        defaults.update(overrides)
        return Product(**defaults)

    @staticmethod
    def create_out_of_stock(**overrides) -> Product:
        return ProductFactory.create(in_stock=False, **overrides)

    @staticmethod
    def create_many(count: int, **overrides) -> list[Product]:
        return [ProductFactory.create(**overrides) for _ in range(count)]

    @staticmethod
    def reset() -> None:
        global _counter
        _counter = 0
