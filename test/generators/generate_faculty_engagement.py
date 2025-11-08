"""
Generate dummy data for the faculty_engagement table.
"""
from __future__ import annotations

import argparse
from pathlib import Path

from _shared import DEFAULT_DEPARTMENT_CODES, generate_faculty_engagements
from utils import ensure_parent_dir, save_and_report


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Generate dummy faculty engagement data.")
    parser.add_argument(
        "--count",
        type=int,
        default=80,
        help="Number of faculty engagement records to generate (default: 80).",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("faculty_engagement.csv"),
        help="Output CSV path (default: faculty_engagement.csv).",
    )
    parser.add_argument(
        "--departments",
        type=str,
        help="Optional comma separated list of department codes/names to sample from.",
    )
    return parser


def main():
    parser = build_parser()
    args = parser.parse_args()

    departments = (
        [dept.strip() for dept in args.departments.split(',') if dept.strip()]
        if args.departments
        else DEFAULT_DEPARTMENT_CODES
    )

    output_path = ensure_parent_dir(Path(args.output))
    with output_path.open("w", encoding="utf-8") as outfile:
        generate_faculty_engagements(outfile, args.count, departments)

    save_and_report(output_path, "✓ Generated faculty_engagement data")


if __name__ == "__main__":
    main()

