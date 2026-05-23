import json
import logging
import re
import sys
from datetime import datetime, timezone
from typing import Any

_EMAIL_RE = re.compile(r"[\w.+\-]+@[\w\-]+\.[\w.]+")


class PhiSafeFilter(logging.Filter):
    """Strip email addresses from log records to prevent PHI leakage."""

    def filter(self, record: logging.LogRecord) -> bool:
        record.msg = _EMAIL_RE.sub("[REDACTED]", str(record.msg))
        if record.args:
            if isinstance(record.args, dict):
                record.args = {
                    k: _EMAIL_RE.sub("[REDACTED]", str(v)) if isinstance(v, str) else v
                    for k, v in record.args.items()
                }
            elif isinstance(record.args, tuple):
                record.args = tuple(
                    _EMAIL_RE.sub("[REDACTED]", str(a)) if isinstance(a, str) else a
                    for a in record.args
                )
        return True


class JsonLogFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }

        for key in (
            "request_id",
            "correlation_id",
            "method",
            "path",
            "status_code",
            "duration_ms",
            "service",
            "environment",
        ):
            value = getattr(record, key, None)
            if value is not None:
                payload[key] = value

        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)

        return json.dumps(payload, separators=(",", ":"), default=str)


def configure_logging(log_level: str) -> None:
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JsonLogFormatter())
    handler.addFilter(PhiSafeFilter())

    root_logger = logging.getLogger()
    root_logger.handlers.clear()
    root_logger.addHandler(handler)
    root_logger.setLevel(log_level.upper())
