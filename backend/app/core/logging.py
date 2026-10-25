import json
import logging
import re
import sys
from contextvars import ContextVar
from datetime import datetime, timezone
from typing import Any, Optional

request_id_context: ContextVar[Optional[str]] = ContextVar("request_id", default=None)

SENSITIVE_PATTERNS = [
    (re.compile(r'(password[\'"]?\s*[:=]\s*[\'"]?)([^\'",\s]+)', re.IGNORECASE), r'\1[REDACTED]'),
    (re.compile(r'(token[\'"]?\s*[:=]\s*[\'"]?)([^\'",\s]+)', re.IGNORECASE), r'\1[REDACTED]'),
    (re.compile(r'(secret[\'"]?\s*[:=]\s*[\'"]?)([^\'",\s]+)', re.IGNORECASE), r'\1[REDACTED]'),
    (re.compile(r'(Bearer\s+)([A-Za-z0-9\-_=]+\.[A-Za-z0-9\-_=]+\.?[A-Za-z0-9\-_.+/=]*)', re.IGNORECASE), r'\1[REDACTED]'),
]


def redact_sensitive_text(text: str) -> str:
    """Redact passwords, tokens, and secrets from text."""
    if not isinstance(text, str):
        return text
    for pattern, replacement in SENSITIVE_PATTERNS:
        text = pattern.sub(replacement, text)
    return text


def redact_sensitive_value(v: Any) -> Any:
    if isinstance(v, str):
        return redact_sensitive_text(v)
    return v


class SensitiveDataFilter(logging.Filter):
    """Logging filter that redacts sensitive strings from log records."""

    def filter(self, record: logging.LogRecord) -> bool:
        if isinstance(record.msg, str):
            record.msg = redact_sensitive_text(record.msg)
        if record.args:
            if isinstance(record.args, dict):
                record.args = {k: redact_sensitive_value(v) for k, v in record.args.items()}
            elif isinstance(record.args, tuple):
                record.args = tuple(redact_sensitive_value(a) for a in record.args)
        return True


class HealthCheckFilter(logging.Filter):
    """Filter out noisy health check requests from access logs."""

    def filter(self, record: logging.LogRecord) -> bool:
        msg = record.getMessage()
        if "GET / " in msg or "GET /api/v1/health" in msg or "GET /docs" in msg:
            return False
        return True


class JSONLogFormatter(logging.Formatter):
    """Structured JSON formatter with request correlation ID and UTC timestamp."""

    def format(self, record: logging.LogRecord) -> str:
        log_entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "request_id": request_id_context.get(None),
            "file": f"{record.filename}:{record.lineno}",
        }

        if record.exc_info:
            log_entry["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_entry)


class TextLogFormatter(logging.Formatter):
    """Human-readable formatter with request ID."""

    def format(self, record: logging.LogRecord) -> str:
        s = super().format(record)
        req_id = request_id_context.get(None)
        if req_id:
            return f"[{req_id}] {s}"
        return s


def setup_logging(log_level: str = "INFO", log_format: str = "json") -> None:
    """Configure structured logging for the application."""
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, log_level.upper(), logging.INFO))

    for handler in list(root_logger.handlers):
        root_logger.removeHandler(handler)

    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(getattr(logging, log_level.upper(), logging.INFO))

    console_handler.addFilter(SensitiveDataFilter())

    if log_format.lower() == "json":
        console_handler.setFormatter(JSONLogFormatter())
    else:
        console_handler.setFormatter(
            TextLogFormatter("%(asctime)s | %(levelname)-7s | %(name)s | %(message)s")
        )

    root_logger.addHandler(console_handler)

    uvicorn_access = logging.getLogger("uvicorn.access")
    uvicorn_access.addFilter(HealthCheckFilter())
