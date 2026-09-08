"""FastMCP server exposing VWO test cases over the three MCP primitives."""

import csv
import json
import logging
import os
from pathlib import Path
from typing import Any

from fastmcp import FastMCP

logging.basicConfig(level=logging.INFO, format="%(levelname)s:%(name)s:%(message)s")
logger = logging.getLogger("vwo-testcases")

mcp = FastMCP("vwo-testcases")

DATASET_ENV = "VWO_DATASET_PATH"
DEFAULT_DATASET = Path(__file__).with_name("vwo_5000_test_cases.csv")
DATASET: list[dict[str, Any]] = []
LOAD_ERROR: str | None = None


def _resolve_dataset_path() -> Path:
    """Resolve the CSV path from env override, else relative to this file."""
    configured = os.getenv(DATASET_ENV)
    if configured:
        return Path(configured).expanduser().resolve()
    return DEFAULT_DATASET.resolve()

def _load_dataset() -> list[dict[str, Any]]:
    """Load the CSV and aggregate step rows into test cases."""

    path = _resolve_dataset_path()

    if not path.is_file():
        raise FileNotFoundError(f"Dataset not found at {path}")

    with path.open("r", encoding="utf-8", newline="") as handle:
        rows = list(csv.DictReader(handle))

    if not rows:
        raise ValueError("The dataset is empty")

    records: list[dict[str, Any]] = []
    current: dict[str, Any] | None = None

    for row in rows:
        tc_id = (row.get("TC_ID") or "").strip()

        # Start of a new test case
        if tc_id:
            if current is not None:
                records.append(current)

            current = {
                "id": tc_id,
                "module": (row.get("Module") or "Unknown").strip(),
                "title": (row.get("Title") or "Untitled").strip(),
                "priority": (row.get("Priority") or "Unknown").strip(),
                "test_type": (row.get("Test_Type") or "Unknown").strip(),
                "ricepot": (row.get("RICEPOT") or "Unknown").strip(),
                "severity": (row.get("Severity") or "Unknown").strip(),
                "status": (row.get("Status") or "Unknown").strip(),
                "steps": [],
            }

        # Ignore rows before the first test case
        if current is None:
            continue

        # Add the step to the current test case
        current["steps"].append(
            {
                "step_no": int(row.get("Step_No") or 0),
                "action": (row.get("Step_Action") or "").strip(),
                "test_data": (row.get("Test_Data") or "").strip(),
                "expected_result": (
                    row.get("Expected_Result") or ""
                ).strip(),
                "actual_result": (
                    row.get("Actual_Result") or ""
                ).strip(),
            }
        )

    # Add the final test case
    if current is not None:
        records.append(current)

    return records

try:
    DATASET = _load_dataset()
except Exception as exc:
    LOAD_ERROR = str(exc)
    logger.exception("Failed to load VWO dataset")

@mcp.tool
def search_test_cases(query: str, module: str | None = None, limit: int = 20) -> list[dict[str, Any]]:
    """Search test cases by keyword and optional module filter."""
    if LOAD_ERROR is not None:
        raise ValueError(LOAD_ERROR)
    if limit <= 0:
        raise ValueError("limit must be a positive integer")
    needle = query.strip().lower()
    results: list[dict[str, Any]] = []
    for case in DATASET:
        if module and case["module"].lower() != module.strip().lower():
            continue
        haystack = " ".join(
            [
                case["id"],
                case["module"],
                case["title"],
                case["priority"],
                case["test_type"],
                case["ricepot"],
                case["severity"],
            ]
        ).lower()
        if needle in haystack:
            results.append(
                {
                    "id": case["id"],
                    "module": case["module"],
                    "title": case["title"],
                    "priority": case["priority"],
                    "status": case["status"],
                    "step_count": len(case["steps"]),
                }
            )
        if len(results) >= limit:
            break
    if not results:
        raise ValueError("No test cases matched the request")
    return results


@mcp.tool
def get_test_case(test_id: str) -> dict[str, Any]:
    """Return the full details for one test case by its ID."""
    if LOAD_ERROR is not None:
        raise ValueError(LOAD_ERROR)
    target = test_id.strip().lower()
    for case in DATASET:
        if case["id"].lower() == target:
            return case
    raise ValueError(f"Unknown test_id: {test_id}")


@mcp.tool
def test_case_stats(group_by: str) -> dict[str, Any]:
    """Return counts of test cases grouped by module, priority, or status."""
    if LOAD_ERROR is not None:
        raise ValueError(LOAD_ERROR)
    valid = {"module", "priority", "status"}
    key = group_by.strip().lower()
    if key not in valid:
        raise ValueError("group_by must be one of: module, priority, status")
    counts: dict[str, int] = {}
    for case in DATASET:
        value = str(case[key])
        counts[value] = counts.get(value, 0) + 1
    return {"group_by": key, "counts": counts}


@mcp.resource("testcases://schema")
def testcases_schema() -> str:
    """Return the detected dataset schema as JSON."""
    if LOAD_ERROR is not None:
        raise ValueError(LOAD_ERROR)
    schema = {
        "columns": [
            "TC_ID",
            "Module",
            "Title",
            "Priority",
            "Test_Type",
            "RICEPOT",
            "Severity",
            "Step_No",
            "Step_Action",
            "Test_Data",
            "Expected_Result",
            "Actual_Result",
            "Status",
        ],
        "types": [
            "str",
            "str",
            "str",
            "str",
            "str",
            "str",
            "str",
            "int",
            "str",
            "str",
            "str",
            "str",
            "str",
        ],
        "record_count": len(DATASET),
    }
    return json.dumps(schema, indent=2)


@mcp.resource("testcases://all")
def all_testcases() -> str:
    """Return the full dataset as JSON."""
    if LOAD_ERROR is not None:
        raise ValueError(LOAD_ERROR)
    return json.dumps(DATASET, indent=2)


@mcp.resource("testcases://module/{name}")
def cases_by_module(name: str) -> str:
    """Return all test cases belonging to one module as JSON."""
    if LOAD_ERROR is not None:
        raise ValueError(LOAD_ERROR)
    matches = [case for case in DATASET if case["module"].lower() == name.strip().lower()]
    if not matches:
        raise ValueError(f"Unknown module: {name}")
    return json.dumps(matches, indent=2)


@mcp.prompt
def review_test_case(test_id: str) -> str:
    """Prompt template that asks the model to review one test case."""
    case = get_test_case(test_id)
    return (
        "Review this QA test case for coverage, clarity, and risk. "
        "Return a short assessment with strengths, gaps, and one suggested improvement.\n\n"
        f"{json.dumps(case, indent=2)}"
    )


@mcp.prompt
def generate_regression_suite(module: str) -> str:
    """Prompt template that asks the model to build a regression suite from one module."""
    if LOAD_ERROR is not None:
        raise ValueError(LOAD_ERROR)
    matches = [case for case in DATASET if case["module"].lower() == module.strip().lower()]
    if not matches:
        raise ValueError(f"Unknown module: {module}")
    return (
        "Create a concise regression suite for this module using the supplied cases. "
        "List the highest-value cases, suggest ordering, and note any missing coverage.\n\n"
        f"{json.dumps(matches, indent=2)}"
    )


if __name__ == "__main__":
    mcp.run()
