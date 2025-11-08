"""
Generate dummy data for the Alumni table (schema.sql).
"""
from __future__ import annotations

import argparse
from pathlib import Path

from _shared import generate_alumni
from utils import (
    ensure_parent_dir,
    load_column_from_csv,
    save_and_report,
)

DEFAULT_STUDENT_COLUMN = "rollno"


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Generate dummy Alumni data.")
    parser.add_argument(
        "--count",
        type=int,
        default=30,
        help="Number of alumni records to generate (default: 30).",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("alumni.csv"),
        help="Output CSV path (default: alumni.csv).",
    )
    parser.add_argument(
        "--student-csv",
        type=Path,
        help="Optional path to student CSV to reuse roll numbers.",
    )
    parser.add_argument(
        "--student-column",
        type=str,
        default=DEFAULT_STUDENT_COLUMN,
        help=f"Column name in the student CSV containing roll numbers (default: {DEFAULT_STUDENT_COLUMN}).",
    )
    return parser


def main():
    parser = build_parser()
    args = parser.parse_args()

    student_rollnos = None
    if args.student_csv:
        student_rollnos = load_column_from_csv(Path(args.student_csv), args.student_column)

    output_path = ensure_parent_dir(Path(args.output))
    with output_path.open("w", encoding="utf-8") as outfile:
        generate_alumni(outfile, args.count, student_rollnos)

    save_and_report(output_path, "✓ Generated Alumni data")


if __name__ == "__main__":
    main()

