"""
Layer 5 — Payloads
Provider request payload builders. US-standard names, medical specialties.
"""
from dataclasses import dataclass, asdict, field
from typing import Optional


@dataclass
class CreateProviderPayload:
    first_name: str
    last_name: str
    title: str                  # MD, DO, NP, PA
    specialty: str
    npi_number: str             # 10-digit National Provider Identifier
    license_number: str
    license_state: str
    phone: str
    email: str
    department: str
    accepting_patients: bool = True
    languages: list = field(default_factory=lambda: ["English"])

    def to_dict(self) -> dict:
        return asdict(self)


@dataclass
class UpdateProviderPayload:
    provider_id: str
    phone: Optional[str] = None
    email: Optional[str] = None
    accepting_patients: Optional[bool] = None
    department: Optional[str] = None

    def to_dict(self) -> dict:
        return {k: v for k, v in asdict(self).items() if v is not None}


@dataclass
class ProviderSearchPayload:
    provider_id: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    specialty: Optional[str] = None
    department: Optional[str] = None

    def to_params(self) -> dict:
        return {k: v for k, v in asdict(self).items() if v is not None}


class ProviderPayloadBuilder:
    """Factory producing US-standard provider payloads."""

    @staticmethod
    def create_dr_anderson() -> dict:
        return CreateProviderPayload(
            first_name="William",
            last_name="Anderson",
            title="MD",
            specialty="Cardiology",
            npi_number="1234567890",
            license_number="IL-MD-2019-003421",
            license_state="IL",
            phone="312-555-0501",
            email="dr.w.anderson@healthcare.example.com",
            department="Cardiovascular Medicine",
            accepting_patients=True,
            languages=["English", "Spanish"]
        ).to_dict()

    @staticmethod
    def create_dr_martinez() -> dict:
        return CreateProviderPayload(
            first_name="Patricia",
            last_name="Martinez",
            title="MD",
            specialty="Internal Medicine",
            npi_number="2345678901",
            license_number="TX-MD-2015-007812",
            license_state="TX",
            phone="713-555-0602",
            email="dr.p.martinez@healthcare.example.com",
            department="General Medicine",
            accepting_patients=True,
            languages=["English", "Spanish"]
        ).to_dict()

    @staticmethod
    def create_dr_taylor() -> dict:
        return CreateProviderPayload(
            first_name="James",
            last_name="Taylor",
            title="DO",
            specialty="Family Medicine",
            npi_number="3456789012",
            license_number="AZ-DO-2017-001834",
            license_state="AZ",
            phone="602-555-0703",
            email="dr.j.taylor@healthcare.example.com",
            department="Primary Care",
            accepting_patients=True,
            languages=["English"]
        ).to_dict()

    @staticmethod
    def create_dr_moore() -> dict:
        return CreateProviderPayload(
            first_name="Barbara",
            last_name="Moore",
            title="MD",
            specialty="Oncology",
            npi_number="4567890123",
            license_number="PA-MD-2012-009251",
            license_state="PA",
            phone="215-555-0804",
            email="dr.b.moore@healthcare.example.com",
            department="Oncology Center",
            accepting_patients=False,
            languages=["English", "French"]
        ).to_dict()

    @staticmethod
    def create_dr_harris() -> dict:
        return CreateProviderPayload(
            first_name="Richard",
            last_name="Harris",
            title="MD",
            specialty="Neurology",
            npi_number="5678901234",
            license_number="TX-MD-2010-005533",
            license_state="TX",
            phone="210-555-0905",
            email="dr.r.harris@healthcare.example.com",
            department="Neuroscience Center",
            accepting_patients=True,
            languages=["English"]
        ).to_dict()

    @staticmethod
    def search_by_specialty(specialty: str) -> dict:
        return ProviderSearchPayload(specialty=specialty).to_params()

    @staticmethod
    def search_by_name(first_name: str, last_name: str) -> dict:
        return ProviderSearchPayload(first_name=first_name, last_name=last_name).to_params()

    @staticmethod
    def update_accepting_patients(provider_id: str, accepting: bool) -> dict:
        return UpdateProviderPayload(provider_id=provider_id, accepting_patients=accepting).to_dict()

    @staticmethod
    def update_contact(provider_id: str, phone: str, email: str) -> dict:
        return UpdateProviderPayload(provider_id=provider_id, phone=phone, email=email).to_dict()

    @staticmethod
    def invalid_provider_missing_npi() -> dict:
        return {
            "first_name": "Test",
            "last_name": "Provider",
            "title": "MD",
            "specialty": "General",
            # npi_number intentionally missing
        }
