"""
Layer 6 — Utilities
Standardized f-string output printer for test execution results.
Writes to console and appends to output/execution_log.jsonl.
"""
import json
from datetime import datetime
from pathlib import Path
from colorama import Fore, Style, init

init(autoreset=True)

_OUTPUT_DIR = Path(__file__).parent.parent / "output"
_OUTPUT_DIR.mkdir(exist_ok=True)
_EXECUTION_LOG = _OUTPUT_DIR / "execution_log.jsonl"


class OutputManager:
    """Prints and persists test execution results using f-strings."""

    def print_response(
        self,
        test_name: str,
        method: str,
        url: str,
        status_code: int,
        response_time_ms: float,
        correlation_id: str,
        response_body: dict = None,
        expected_status: int = 200
    ) -> None:
        passed = status_code == expected_status
        status_color = Fore.GREEN if passed else Fore.RED
        timestamp = datetime.utcnow().isoformat() + "Z"

        print(f"\n{'='*70}")
        print(f"{Fore.CYAN}TEST       :{Style.RESET_ALL} {test_name}")
        print(f"{Fore.CYAN}TIMESTAMP  :{Style.RESET_ALL} {timestamp}")
        print(f"{Fore.CYAN}ENDPOINT   :{Style.RESET_ALL} {method} {url}")
        print(f"{Fore.CYAN}CORR-ID    :{Style.RESET_ALL} {correlation_id}")
        print(f"{status_color}STATUS     :{Style.RESET_ALL} {status_code} (expected {expected_status})")
        print(f"{Fore.CYAN}RESP TIME  :{Style.RESET_ALL} {response_time_ms:.1f} ms")
        print(f"{Fore.CYAN}RESULT     :{Style.RESET_ALL} {'PASS' if passed else 'FAIL'}")
        if response_body:
            print(f"{Fore.CYAN}RESPONSE   :{Style.RESET_ALL} {json.dumps(response_body, indent=2)[:500]}")
        print(f"{'='*70}")

        self._persist(
            test_name=test_name,
            method=method,
            url=url,
            status_code=status_code,
            response_time_ms=response_time_ms,
            correlation_id=correlation_id,
            passed=passed,
            timestamp=timestamp
        )

    def print_sla_check(self, test_name: str, operation: str, actual_ms: float, sla_ms: float) -> None:
        within_sla = actual_ms <= sla_ms
        color = Fore.GREEN if within_sla else Fore.YELLOW
        print(
            f"{color}[SLA]{Style.RESET_ALL} {test_name} | {operation} | "
            f"actual={actual_ms:.1f}ms | sla={sla_ms}ms | {'PASS' if within_sla else 'BREACH'}"
        )

    def print_validation_result(self, field: str, expected: str, actual: str) -> None:
        passed = str(expected) == str(actual)
        color = Fore.GREEN if passed else Fore.RED
        print(f"{color}[VALIDATE]{Style.RESET_ALL} {field}: expected='{expected}' actual='{actual}' → {'OK' if passed else 'FAIL'}")

    def print_schema_result(self, schema_name: str, passed: bool, errors: list = None) -> None:
        color = Fore.GREEN if passed else Fore.RED
        print(f"{color}[SCHEMA]{Style.RESET_ALL} {schema_name}: {'VALID' if passed else 'INVALID'}")
        if errors:
            for err in errors[:3]:
                print(f"  └─ {err}")

    def _persist(self, **kwargs) -> None:
        with open(_EXECUTION_LOG, "a", encoding="utf-8") as fh:
            fh.write(json.dumps(kwargs) + "\n")
