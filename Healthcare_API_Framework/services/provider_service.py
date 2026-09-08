"""
Layer 3 — Services
Provider CRUD service. Manages provider records and scheduling.
"""
from configuration.environments import EnvironmentConfig
from endpoints.endpoints import ProviderEndpoints
from services.base_service import BaseService


class ProviderService(BaseService):
    """CRUD operations for Provider records."""

    def __init__(self, env_config: EnvironmentConfig, token: str):
        super().__init__(env_config, token=token)

    def create_provider(self, payload: dict) -> dict:
        return self.post(ProviderEndpoints.BASE, payload=payload)

    def search_provider(self, params: dict) -> dict:
        return self.get(ProviderEndpoints.SEARCH, params=params)

    def get_provider_by_id(self, provider_id: str) -> dict:
        return self.get(ProviderEndpoints.by_id(provider_id))

    def update_provider(self, provider_id: str, payload: dict) -> dict:
        return self.put(ProviderEndpoints.by_id(provider_id), payload=payload)

    def patch_provider(self, provider_id: str, payload: dict) -> dict:
        return self.patch(ProviderEndpoints.by_id(provider_id), payload=payload)

    def delete_provider(self, provider_id: str) -> dict:
        return self.delete(ProviderEndpoints.by_id(provider_id))

    def get_provider_schedule(self, provider_id: str) -> dict:
        return self.get(ProviderEndpoints.schedule(provider_id))
