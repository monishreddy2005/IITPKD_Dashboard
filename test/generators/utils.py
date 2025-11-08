from __future__ import annotations

import csv
from pathlib import Path
from typing import Iterable, List


def ensure_parent_dir(path: Path) -> Path:
    """
    Ensure the parent directory for ``path`` exists.
    Returns the original path for convenience.
    """
    path.parent.mkdir(parents=True, exist_ok=True)
    return path


def parse_comma_separated(values: str) -> List[str]:
    """
    Parse a comma separated string into a list of stripped values.
    """
    return [value.strip() for value in values.split(',') if value.strip()]


def parse_comma_separated_ints(values: str) -> List[int]:
    """
    Parse a comma separated string into a list of integers.
    """
    return [int(value.strip()) for value in values.split(',') if value.strip()]


def load_column_from_csv(csv_path: Path, column_name: str) -> List[str]:
    """
    Load values from a specific column in a CSV file.
    """
    with csv_path.open('r', encoding='utf-8') as infile:
        reader = csv.DictReader(infile)
        if column_name not in reader.fieldnames:
            raise ValueError(f"Column '{column_name}' not found in {csv_path}")
        return [row[column_name] for row in reader]


def save_and_report(path: Path, message: str):
    print(f"{message}: {path.resolve()}")

