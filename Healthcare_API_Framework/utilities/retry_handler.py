"""
Layer 6 — Utilities
Retry logic for transient API failures (429, 503, 504).
"""
import time
import logging
from functools import wraps
from typing import Callable, Any

logger = logging.getLogger(__name__)


class RetryConfig:
    def __init__(self, max_retries: int = 3, backoff_factor: float = 1.5, retry_on_status: tuple = (429, 503, 504)):
        self.max_retries = max_retries
        self.backoff_factor = backoff_factor
        self.retry_on_status = retry_on_status


def with_retry(config: RetryConfig = None):
    """Decorator: retry function if response status is in retry_on_status set."""
    if config is None:
        config = RetryConfig()

    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            last_result = None
            for attempt in range(1, config.max_retries + 1):
                result = func(*args, **kwargs)
                status = result.get("status_code", 0)
                if status not in config.retry_on_status:
                    return result
                wait = config.backoff_factor ** attempt
                logger.warning(
                    f"[RETRY] Attempt {attempt}/{config.max_retries} | "
                    f"status={status} | waiting {wait:.1f}s"
                )
                time.sleep(wait)
                last_result = result
            logger.error(f"[RETRY EXHAUSTED] {config.max_retries} retries failed")
            return last_result
        return wrapper
    return decorator


class RetryHandler:
    """Explicit retry handler for service-layer calls."""

    def __init__(self, config: RetryConfig = None):
        self.config = config or RetryConfig()

    def execute(self, func: Callable, *args, **kwargs) -> Any:
        for attempt in range(1, self.config.max_retries + 1):
            result = func(*args, **kwargs)
            status = result.get("status_code", 0)
            if status not in self.config.retry_on_status:
                return result
            wait = self.config.backoff_factor ** attempt
            print(f"[RETRY] Attempt {attempt}/{self.config.max_retries} | status={status} | waiting {wait:.1f}s")
            time.sleep(wait)
        return result
