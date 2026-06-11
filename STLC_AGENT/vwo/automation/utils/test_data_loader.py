"""Pandas-backed loader. Reads the RICEPOT test-case CSV so specs stay data-driven."""
from __future__ import annotations

from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

import pandas as pd

# CSV lives one level up from automation/
_CSV_PATH = Path(__file__).resolve().parents[2] / "02_VWO_TestCases.csv"


@dataclass(frozen=True)
class TestCase:
    """Typed view over one row of the test-case repository."""
    tc_id: str
    module: str
    title: str
    ricepot: str
    test_type: str
    priority: str
    preconditions: str
    steps: str
    test_data: str
    expected: str
    prd_ref: str
    severity: str
    automation_candidate: bool


@lru_cache(maxsize=1)
def _frame() -> pd.DataFrame:
    df = pd.read_csv(_CSV_PATH).fillna("")
    df["Automation_Candidate"] = (
        df["Automation_Candidate"].astype(str).str.strip().str.lower().eq("yes")
    )
    return df


def _row_to_case(row: pd.Series) -> TestCase:
    return TestCase(
        tc_id=row["TC_ID"],
        module=row["Module"],
        title=row["Title"],
        ricepot=row["RICEPOT"],
        test_type=row["Test_Type"],
        priority=row["Priority"],
        preconditions=row["Preconditions"],
        steps=row["Test_Steps"],
        test_data=row["Test_Data"],
        expected=row["Expected_Result"],
        prd_ref=row["PRD_Ref"],
        severity=row["Severity"],
        automation_candidate=bool(row["Automation_Candidate"]),
    )


def get_case(tc_id: str) -> TestCase:
    """Return one TestCase by ID. Raises KeyError if absent."""
    df = _frame()
    match = df[df["TC_ID"] == tc_id]
    if match.empty:
        raise KeyError(f"Test case {tc_id} not found in {_CSV_PATH.name}")
    return _row_to_case(match.iloc[0])


def automation_candidates() -> list[TestCase]:
    """All rows flagged Automation_Candidate=Yes."""
    df = _frame()
    return [_row_to_case(r) for _, r in df[df["Automation_Candidate"]].iterrows()]


def coverage_summary() -> pd.DataFrame:
    """RICEPOT x Test_Type pivot - handy sanity check on suite breadth."""
    df = _frame()
    return pd.crosstab(df["RICEPOT"], df["Test_Type"], margins=True)
