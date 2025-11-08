"""
Generate dummy data for the Employee table.
"""
from __future__ import annotations

import argparse
from pathlib import Path
from typing import List

from _shared import DEFAULT_EMPLOYEE_DEPARTMENTS, generate_employees
from utils import (
    ensure_parent_dir,
    load_column_from_csv,
    parse_comma_separated,
    parse_comma_separated_ints,
    save_and_report,
)

DEFAULT_DESIGNATION_COLUMN = "designationId"


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Generate dummy Employee data.")
    parser.add_argument(
        "--count",
        type=int,
        default=50,
        help="Number of employee records to generate (default: 50).",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("employee.csv"),
        help="Output CSV path (default: employee.csv).",
    )
    parser.add_argument(
        "--designation-csv",
        type=Path,
        help="Optional path to designation CSV to source designation IDs.",
    )
    parser.add_argument(
        "--designation-column",
        type=str,
        default=DEFAULT_DESIGNATION_COLUMN,
        help=f"Column name in designation CSV containing IDs (default: {DEFAULT_DESIGNATION_COLUMN}).",
    )
    parser.add_argument(
        "--designation-ids",
        type=str,
        help="Comma separated designation IDs to sample from when no CSV is provided.",
    )
    parser.add_argument(
        "--departments",
        type=str,
        default=",".join(DEFAULT_EMPLOYEE_DEPARTMENTS),
        help="Comma separated list of department names to sample from.",
    )
    return parser


def resolve_designation_ids(args) -> List[int]:
    if args.designation_csv:
        values = load_column_from_csv(Path(args.designation_csv), args.designation_column)
        return [int(value) for value in values if value]
    if args.designation_ids:
        return parse_comma_separated_ints(args.designation_ids)
    # Fallback: simple sequential IDs
    return list(range(1, args.count + 1))


def main():
    parser = build_parser()
    args = parser.parse_args()

    designation_ids = resolve_designation_ids(args)
    if not designation_ids:
        raise SystemExit("No designation IDs available. Provide --designation-ids or --designation-csv.")

    departments = parse_comma_separated(args.departments) or DEFAULT_EMPLOYEE_DEPARTMENTS

    output_path = ensure_parent_dir(Path(args.output))
    with output_path.open("w", encoding="utf-8") as outfile:
        generate_employees(
            outfile,
            args.count,
            designation_ids=designation_ids,
            departments=departments,
        )

    save_and_report(output_path, "✓ Generated Employee data")


if __name__ == "__main__":
    main()

