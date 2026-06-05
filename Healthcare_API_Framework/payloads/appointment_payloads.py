"""
Layer 5 — Payloads
Appointment, Disease Management, Case Management, and Assessment payload builders.
"""
from dataclasses import dataclass, asdict, field
from typing import Optional


@dataclass
class CreateAppointmentPayload:
    patient_id: str
    provider_id: str
    appointment_date: str       # ISO-8601: YYYY-MM-DD
    appointment_time: str       # HH:MM (24h)
    appointment_type: str       # Consultation | Follow-up | Emergency | Procedure
    reason_for_visit: str
    duration_minutes: int = 30
    notes: Optional[str] = None
    is_telemedicine: bool = False

    def to_dict(self) -> dict:
        data = asdict(self)
        return {k: v for k, v in data.items() if v is not None}


@dataclass
class RescheduleAppointmentPayload:
    appointment_id: str
    new_date: str
    new_time: str
    reason: str

    def to_dict(self) -> dict:
        return asdict(self)


@dataclass
class CreateDiseaseRecordPayload:
    patient_id: str
    disease_code: str           # ICD-10 code
    disease_name: str
    diagnosis_date: str
    severity: str               # Mild | Moderate | Severe | Critical
    treating_provider_id: str
    treatment_plan: str
    medications: list = field(default_factory=list)
    follow_up_date: Optional[str] = None

    def to_dict(self) -> dict:
        return asdict(self)


@dataclass
class CreateCasePayload:
    patient_id: str
    case_type: str              # Clinical | Administrative | Social
    priority: str               # Low | Medium | High | Critical
    description: str
    assigned_provider_id: str
    department: str
    target_resolution_date: Optional[str] = None

    def to_dict(self) -> dict:
        return asdict(self)


@dataclass
class CreateAssessmentPayload:
    patient_id: str
    assessment_type: str        # Initial | Follow-up | Discharge | Annual
    provider_id: str
    assessment_date: str
    chief_complaint: str
    vital_signs: dict = field(default_factory=dict)
    physical_examination: Optional[str] = None
    clinical_notes: Optional[str] = None
    recommendations: Optional[str] = None

    def to_dict(self) -> dict:
        return asdict(self)


class AppointmentPayloadBuilder:
    """Factory for appointment-related payloads."""

    @staticmethod
    def create_consultation(patient_id: str, provider_id: str) -> dict:
        return CreateAppointmentPayload(
            patient_id=patient_id,
            provider_id=provider_id,
            appointment_date="2026-07-15",
            appointment_time="09:30",
            appointment_type="Consultation",
            reason_for_visit="Initial consultation for hypertension management",
            duration_minutes=45,
            notes="Patient requested morning slot"
        ).to_dict()

    @staticmethod
    def create_follow_up(patient_id: str, provider_id: str) -> dict:
        return CreateAppointmentPayload(
            patient_id=patient_id,
            provider_id=provider_id,
            appointment_date="2026-07-22",
            appointment_time="14:00",
            appointment_type="Follow-up",
            reason_for_visit="Follow-up on diabetes management and medication review",
            duration_minutes=30
        ).to_dict()

    @staticmethod
    def reschedule(appointment_id: str, new_date: str, new_time: str) -> dict:
        return RescheduleAppointmentPayload(
            appointment_id=appointment_id,
            new_date=new_date,
            new_time=new_time,
            reason="Patient schedule conflict"
        ).to_dict()


class DiseasePayloadBuilder:
    """Factory for disease management payloads."""

    @staticmethod
    def create_diabetes_record(patient_id: str, provider_id: str) -> dict:
        return CreateDiseaseRecordPayload(
            patient_id=patient_id,
            disease_code="E11.9",
            disease_name="Type 2 Diabetes Mellitus",
            diagnosis_date="2026-06-01",
            severity="Moderate",
            treating_provider_id=provider_id,
            treatment_plan="Lifestyle modification, Metformin 500mg twice daily, quarterly HbA1c monitoring",
            medications=["Metformin 500mg", "Lisinopril 10mg"],
            follow_up_date="2026-09-01"
        ).to_dict()

    @staticmethod
    def create_hypertension_record(patient_id: str, provider_id: str) -> dict:
        return CreateDiseaseRecordPayload(
            patient_id=patient_id,
            disease_code="I10",
            disease_name="Essential Hypertension",
            diagnosis_date="2026-05-15",
            severity="Mild",
            treating_provider_id=provider_id,
            treatment_plan="DASH diet, daily exercise, Amlodipine 5mg daily",
            medications=["Amlodipine 5mg"],
            follow_up_date="2026-08-15"
        ).to_dict()


class CasePayloadBuilder:
    """Factory for case management payloads."""

    @staticmethod
    def create_clinical_case(patient_id: str, provider_id: str) -> dict:
        return CreateCasePayload(
            patient_id=patient_id,
            case_type="Clinical",
            priority="High",
            description="Complex diabetes management with comorbid hypertension requiring multi-disciplinary coordination",
            assigned_provider_id=provider_id,
            department="Endocrinology",
            target_resolution_date="2026-12-31"
        ).to_dict()

    @staticmethod
    def create_social_case(patient_id: str, provider_id: str) -> dict:
        return CreateCasePayload(
            patient_id=patient_id,
            case_type="Social",
            priority="Medium",
            description="Patient requires transportation assistance for regular follow-up appointments",
            assigned_provider_id=provider_id,
            department="Social Work",
            target_resolution_date="2026-09-30"
        ).to_dict()


class AssessmentPayloadBuilder:
    """Factory for clinical assessment payloads."""

    @staticmethod
    def create_initial_assessment(patient_id: str, provider_id: str) -> dict:
        return CreateAssessmentPayload(
            patient_id=patient_id,
            assessment_type="Initial",
            provider_id=provider_id,
            assessment_date="2026-06-05",
            chief_complaint="Persistent fatigue, increased thirst, frequent urination for 3 months",
            vital_signs={
                "blood_pressure": "138/88",
                "heart_rate": 76,
                "temperature_f": 98.6,
                "respiratory_rate": 16,
                "oxygen_saturation": 98,
                "weight_lbs": 195,
                "height_in": 70,
                "bmi": 27.9
            },
            physical_examination="Alert and oriented x3. No acute distress. Mild abdominal adiposity.",
            clinical_notes="Fasting glucose 186 mg/dL. HbA1c ordered. Family history of T2DM (father, paternal uncle).",
            recommendations="Start Metformin 500mg twice daily with meals. Low-carb diet consultation. Ophthalmology referral."
        ).to_dict()

    @staticmethod
    def create_follow_up_assessment(patient_id: str, provider_id: str) -> dict:
        return CreateAssessmentPayload(
            patient_id=patient_id,
            assessment_type="Follow-up",
            provider_id=provider_id,
            assessment_date="2026-09-01",
            chief_complaint="Routine follow-up for diabetes management",
            vital_signs={
                "blood_pressure": "128/82",
                "heart_rate": 72,
                "temperature_f": 98.4,
                "respiratory_rate": 14,
                "oxygen_saturation": 99,
                "weight_lbs": 188,
                "height_in": 70,
                "bmi": 27.0
            },
            clinical_notes="HbA1c improved to 7.1%. Patient adherent to medication. Weight loss of 7 lbs.",
            recommendations="Continue current medication. Reinforce dietary modifications. Recheck HbA1c in 3 months."
        ).to_dict()
