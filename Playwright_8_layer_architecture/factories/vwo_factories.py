"""Layer 2 — Factories: builders for VWO domain objects with sensible defaults."""
import random
import string
from datetime import datetime

from models.vwo_models import (
    ABTest, AudienceCondition, AudienceConditionType, GoalType,
    Heatmap, PersonalizationCampaign, PlanItem, TestGoal,
    TestType, Variation,
)


def _uid(length: int = 6) -> str:
    return "".join(random.choices(string.ascii_lowercase + string.digits, k=length))


def _timestamp() -> str:
    return datetime.now().strftime("%Y%m%d_%H%M%S")


class ABTestFactory:
    @staticmethod
    def create(
        name: str | None = None,
        url: str = "https://example.com/landing",
        test_type: TestType = TestType.AB,
        variation_count: int = 2,
    ) -> ABTest:
        test_name = name or f"AutoTest_{_timestamp()}_{_uid()}"
        variations = [Variation(name="Control", traffic_split=50.0)]
        split = round(50.0 / max(variation_count - 1, 1), 2)
        for i in range(1, variation_count):
            variations.append(Variation(name=f"Variation {chr(64 + i)}", traffic_split=split))
        return ABTest(
            name=test_name,
            url=url,
            test_type=test_type,
            variations=variations,
            goals=[
                TestGoal(
                    name="Primary Conversion",
                    goal_type=GoalType.CLICK,
                    selector=".cta-button",
                )
            ],
        )

    @staticmethod
    def with_audience(
        test: ABTest,
        condition_type: AudienceConditionType = AudienceConditionType.VISITOR_TYPE,
        operator: str = "eq",
        value: str = "new",
    ) -> ABTest:
        test.audience_conditions.append(
            AudienceCondition(condition_type=condition_type, operator=operator, value=value)
        )
        return test

    @staticmethod
    def split_url(
        control_url: str = "https://example.com/page-a",
        variation_url: str = "https://example.com/page-b",
    ) -> ABTest:
        test = ABTestFactory.create(test_type=TestType.SPLIT_URL, url=control_url)
        test.variations[1].changes = [f"redirect:{variation_url}"]
        return test


class HeatmapFactory:
    @staticmethod
    def create(page_url: str = "https://example.com/") -> Heatmap:
        return Heatmap(
            name=f"Heatmap_{_timestamp()}",
            page_url=page_url,
            sample_size=500,
            duration_days=14,
        )


class PersonalizationFactory:
    @staticmethod
    def create(page_url: str = "https://example.com/") -> PersonalizationCampaign:
        return PersonalizationCampaign(
            name=f"Campaign_{_timestamp()}_{_uid()}",
            page_url=page_url,
            segment_conditions=[
                AudienceCondition(
                    condition_type=AudienceConditionType.VISITOR_TYPE,
                    operator="eq",
                    value="returning",
                )
            ],
        )


class PlanItemFactory:
    @staticmethod
    def create(hypothesis: str | None = None) -> PlanItem:
        return PlanItem(
            hypothesis=hypothesis or f"Hypothesis_{_uid()}: Changing CTA color will increase clicks",
            priority="High",
            assignee="",
        )
