"""Layer 2 — Test Data Models: typed dataclasses for VWO domain objects."""
from dataclasses import dataclass, field
from enum import Enum
from typing import Optional


class TestType(str, Enum):
    AB = "ab"
    SPLIT_URL = "split_url"
    MULTIVARIATE = "multivariate"


class TestStatus(str, Enum):
    DRAFT = "draft"
    RUNNING = "running"
    PAUSED = "paused"
    STOPPED = "stopped"


class GoalType(str, Enum):
    CLICK = "click"
    PAGE_VISIT = "page_visit"
    CUSTOM_CONVERSION = "custom_conversion"
    REVENUE = "revenue"


class AudienceConditionType(str, Enum):
    VISITOR_TYPE = "visitor_type"
    DEVICE = "device"
    LOCATION = "location"
    BROWSER = "browser"
    CUSTOM = "custom"


@dataclass
class VWOCredentials:
    email: str
    password: str


@dataclass
class Variation:
    name: str
    traffic_split: float = 50.0
    changes: list[str] = field(default_factory=list)


@dataclass
class TestGoal:
    name: str
    goal_type: GoalType = GoalType.CLICK
    selector: str = ""
    url_pattern: str = ""


@dataclass
class AudienceCondition:
    condition_type: AudienceConditionType
    operator: str
    value: str


@dataclass
class ABTest:
    name: str
    url: str
    test_type: TestType = TestType.AB
    variations: list[Variation] = field(default_factory=list)
    goals: list[TestGoal] = field(default_factory=list)
    audience_conditions: list[AudienceCondition] = field(default_factory=list)
    status: TestStatus = TestStatus.DRAFT
    test_id: Optional[str] = None


@dataclass
class Heatmap:
    name: str
    page_url: str
    sample_size: int = 1000
    duration_days: int = 30
    heatmap_id: Optional[str] = None


@dataclass
class PersonalizationCampaign:
    name: str
    page_url: str
    segment_conditions: list[AudienceCondition] = field(default_factory=list)
    variation_changes: list[str] = field(default_factory=list)
    campaign_id: Optional[str] = None


@dataclass
class PlanItem:
    hypothesis: str
    priority: str = "Medium"
    assignee: str = ""
    tags: list[str] = field(default_factory=list)
    item_id: Optional[str] = None
