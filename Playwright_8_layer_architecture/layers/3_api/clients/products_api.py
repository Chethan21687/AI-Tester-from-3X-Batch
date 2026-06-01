from playwright.sync_api import APIRequestContext
from layers.3_api.base_api import BaseAPI
from layers.2_test_data.models.product_model import Product


class ProductsAPI(BaseAPI):
    def __init__(self, request: APIRequestContext, base_url: str):
        super().__init__(request, base_url)

    def get_all(self) -> list[dict]:
        return self._get("/products")

    def get_by_id(self, product_id: str) -> dict:
        return self._get(f"/products/{product_id}")

    def create(self, product: Product, token: str) -> dict:
        response = self._request.post(
            f"{self._base_url}/products",
            data={
                "name": product.name,
                "price": product.price,
                "description": product.description,
                "category": product.category,
                "sku": product.sku,
                "in_stock": product.in_stock,
            },
            headers={"Authorization": f"Bearer {token}"},
        )
        if not response.ok:
            raise RuntimeError(f"Create product failed: {response.status}")
        return response.json()

    def delete(self, product_id: str, token: str) -> None:
        response = self._request.delete(
            f"{self._base_url}/products/{product_id}",
            headers={"Authorization": f"Bearer {token}"},
        )
        if not response.ok:
            raise RuntimeError(f"Delete product failed: {response.status}")
