"""Compatibility module exposing a Flask pp created by the refactored package.

This file is intentionally minimal so older tooling that imports
`from baapp import app` continues to work.
"""

from app import create_app

# Create the application once at module import time for backwards-compatibility
app = create_app()

__all__ = ["app"]
