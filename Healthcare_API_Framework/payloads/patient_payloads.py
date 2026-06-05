"""
Layer 5 — Payloads
Patient request payload builders. US-standard names. Ages 30–50 (DOB 1974–1996).
HIPAA: PHI fields follow minimum-necessary principle.
"""
from dataclasses import dataclass, asdict, field
from typing import Optional


@dataclass
class AddressPayload:
    street: str
    city: str
    state: str
    zip_code: str
    country: str = "US"


@dataclass
class ContactPayload:
    phone: str
    email: str
    emergency_contact_name: str
    emergency_contact_phone: str
    emergency_contact_relationship: str


@dataclass
class InsurancePayload:
    insurance_provider: str
    policy_number: str
    group_number: str
    subscriber_id: str


@dataclass
class CreatePatientPayload:
    first_name: str
    last_name: str
    date_of_birth: str          # ISO-8601: YYYY-MM-DD
    gender: str                 # Male | Female | Other | Unknown
    ssn_last4: str              # HIPAA: store last 4 only
    address: AddressPayload
    contact: ContactPayload
    insurance: InsurancePayload
    blood_type: Optional[str] = None
    allergies: list = field(default_factory=list)
    primary_diagnosis: Optional[str] = None
    marital_status: str = "Single"
    preferred_language: str = "English"

    def to_dict(self) -> dict:
        data = asdict(self)
        return data


@dataclass
class UpdatePatientPayload:
    patient_id: str
    address: Optional[AddressPayload] = None
    contact: Optional[ContactPayload] = None
    insurance: Optional[InsurancePayload] = None
    allergies: Optional[list] = None
    primary_diagnosis: Optional[str] = None

    def to_dict(self) -> dict:
        data = {k: v for k, v in asdict(self).items() if v is not None}
        return data


@dataclass
class PatientSearchPayload:
    patient_id: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    date_of_birth: Optional[str] = None

    def to_params(self) -> dict:
        return {k: v for k, v in asdict(self).items() if v is not None}


class PatientPayloadBuilder:
    """Factory producing US-standard patient payloads. Ages 30–50."""

    @staticmethod
    def create_john_smith() -> dict:
        return CreatePatientPayload(
            first_name="John",
            last_name="Smith",
            date_of_birth="1984-03-15",
            gender="Male",
            ssn_last4="4521",
            address=AddressPayload(
                street="742 Evergreen Terrace",
                city="Chicago",
                state="IL",
                zip_code="60601"
            ),
            contact=ContactPayload(
                phone="312-555-0142",
                email="john.smith@email.example.com",
                emergency_contact_name="Jane Smith",
                emergency_contact_phone="312-555-0198",
                emergency_contact_relationship="Spouse"
            ),
            insurance=InsurancePayload(
                insurance_provider="Blue Cross Blue Shield",
                policy_number="BCBS-IL-884721",
                group_number="GRP-00421",
                subscriber_id="SUB-JS-1984"
            ),
            blood_type="O+",
            allergies=["Penicillin", "Sulfa"],
            primary_diagnosis="Type 2 Diabetes",
            marital_status="Married"
        ).to_dict()

    @staticmethod
    def create_sarah_johnson() -> dict:
        return CreatePatientPayload(
            first_name="Sarah",
            last_name="Johnson",
            date_of_birth="1978-07-22",
            gender="Female",
            ssn_last4="7834",
            address=AddressPayload(
                street="1620 N Lakeview Ave",
                city="Houston",
                state="TX",
                zip_code="77002"
            ),
            contact=ContactPayload(
                phone="713-555-0263",
                email="sarah.johnson@email.example.com",
                emergency_contact_name="Michael Johnson",
                emergency_contact_phone="713-555-0311",
                emergency_contact_relationship="Spouse"
            ),
            insurance=InsurancePayload(
                insurance_provider="Aetna Health",
                policy_number="AET-TX-221034",
                group_number="GRP-00834",
                subscriber_id="SUB-SJ-1978"
            ),
            blood_type="A-",
            allergies=["Aspirin"],
            primary_diagnosis="Hypertension",
            marital_status="Married"
        ).to_dict()

    @staticmethod
    def create_robert_williams() -> dict:
        return CreatePatientPayload(
            first_name="Robert",
            last_name="Williams",
            date_of_birth="1990-11-08",
            gender="Male",
            ssn_last4="3302",
            address=AddressPayload(
                street="3845 Maple Drive",
                city="Phoenix",
                state="AZ",
                zip_code="85001"
            ),
            contact=ContactPayload(
                phone="602-555-0177",
                email="robert.williams@email.example.com",
                emergency_contact_name="Linda Williams",
                emergency_contact_phone="602-555-0199",
                emergency_contact_relationship="Mother"
            ),
            insurance=InsurancePayload(
                insurance_provider="UnitedHealth Group",
                policy_number="UHG-AZ-441892",
                group_number="GRP-01122",
                subscriber_id="SUB-RW-1990"
            ),
            blood_type="B+",
            allergies=[],
            primary_diagnosis="Asthma",
            marital_status="Single"
        ).to_dict()

    @staticmethod
    def create_mary_brown() -> dict:
        return CreatePatientPayload(
            first_name="Mary",
            last_name="Brown",
            date_of_birth="1986-04-30",
            gender="Female",
            ssn_last4="6619",
            address=AddressPayload(
                street="2201 Oak Street",
                city="Philadelphia",
                state="PA",
                zip_code="19103"
            ),
            contact=ContactPayload(
                phone="215-555-0334",
                email="mary.brown@email.example.com",
                emergency_contact_name="Thomas Brown",
                emergency_contact_phone="215-555-0412",
                emergency_contact_relationship="Spouse"
            ),
            insurance=InsurancePayload(
                insurance_provider="Cigna Health",
                policy_number="CIG-PA-558243",
                group_number="GRP-00712",
                subscriber_id="SUB-MB-1986"
            ),
            blood_type="AB+",
            allergies=["Latex"],
            primary_diagnosis="Hypothyroidism",
            marital_status="Married"
        ).to_dict()

    @staticmethod
    def create_david_jones() -> dict:
        return CreatePatientPayload(
            first_name="David",
            last_name="Jones",
            date_of_birth="1994-01-17",
            gender="Male",
            ssn_last4="9821",
            address=AddressPayload(
                street="508 Pine Avenue",
                city="San Antonio",
                state="TX",
                zip_code="78201"
            ),
            contact=ContactPayload(
                phone="210-555-0088",
                email="david.jones@email.example.com",
                emergency_contact_name="Patricia Jones",
                emergency_contact_phone="210-555-0122",
                emergency_contact_relationship="Mother"
            ),
            insurance=InsurancePayload(
                insurance_provider="Humana",
                policy_number="HUM-TX-773341",
                group_number="GRP-02234",
                subscriber_id="SUB-DJ-1994"
            ),
            blood_type="O-",
            allergies=["Codeine"],
            primary_diagnosis="Anxiety Disorder",
            marital_status="Single"
        ).to_dict()

    @staticmethod
    def search_by_name(first_name: str, last_name: str) -> dict:
        return PatientSearchPayload(first_name=first_name, last_name=last_name).to_params()

    @staticmethod
    def search_by_id(patient_id: str) -> dict:
        return PatientSearchPayload(patient_id=patient_id).to_params()

    @staticmethod
    def search_by_dob(date_of_birth: str) -> dict:
        return PatientSearchPayload(date_of_birth=date_of_birth).to_params()

    @staticmethod
    def update_address(patient_id: str, street: str, city: str, state: str, zip_code: str) -> dict:
        return UpdatePatientPayload(
            patient_id=patient_id,
            address=AddressPayload(street=street, city=city, state=state, zip_code=zip_code)
        ).to_dict()

    @staticmethod
    def update_diagnosis(patient_id: str, diagnosis: str) -> dict:
        return UpdatePatientPayload(patient_id=patient_id, primary_diagnosis=diagnosis).to_dict()

    @staticmethod
    def invalid_patient_missing_required() -> dict:
        return {
            "first_name": "James",
            # last_name intentionally missing
            "date_of_birth": "1985-06-10",
            "gender": "Male"
        }

    @staticmethod
    def invalid_patient_future_dob() -> dict:
        return CreatePatientPayload(
            first_name="Invalid",
            last_name="Patient",
            date_of_birth="2035-01-01",
            gender="Male",
            ssn_last4="0000",
            address=AddressPayload(street="100 Test St", city="Dallas", state="TX", zip_code="75201"),
            contact=ContactPayload(
                phone="214-555-0001",
                email="invalid@test.com",
                emergency_contact_name="Test Contact",
                emergency_contact_phone="214-555-0002",
                emergency_contact_relationship="Friend"
            ),
            insurance=InsurancePayload(
                insurance_provider="TestInsurance",
                policy_number="TEST-001",
                group_number="GRP-TEST",
                subscriber_id="SUB-TEST"
            )
        ).to_dict()
