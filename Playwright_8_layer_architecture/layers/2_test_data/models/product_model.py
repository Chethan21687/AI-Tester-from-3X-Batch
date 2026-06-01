from dataclasses import dataclass, field


@dataclass
class Product:
    name: str
    price: float
    description: str
    category: str
    sku: str
    in_stock: bool = True
    id: str | None = None


@dataclass
class CartItem:
    product: Product
    quantity: int
