"""
Generate dummy data for the ExternshipInfo table.
"""
from __future__ import annotations

import argparse
from pathlib import Path

from _shared import generate_externship_info
from utils import (
    ensure_parent_dir,
    load_column_from_csv,
    save_and_report,
)

DEFAULT_EMPLOYEE_COLUMN = "employeeId"


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Generate dummy Externship Info data.")
    parser.add_argument(
        "--count",
        type=int,
        default=15,
        help="Number of externship records to generate (default: 15).",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("externship_info.csv"),
        help="Output CSV path (default: externship_info.csv).",
    )
    parser.add_argument(
        "--employee-csv",
        type=Path,
        help="Path to an employee CSV to reuse employee IDs.",
    )
    parser.add_argument(
        "--employee-column",
        type=str,
        default=DEFAULT_EMPLOYEE_COLUMN,
        help=f"Column name for employee IDs in the CSV (default: {DEFAULT_EMPLOYEE_COLUMN}).",
    )
    parser.add_argument(
        "--employee-ids",
        type=str,
        help="Comma separated list of employee IDs if no CSV is supplied.",
    )
    return parser


def resolve_employee_ids(args):
    if args.employee_csv:
        return load_column_from_csv(Path(args.employee_csv), args.employee_column)
    if args.employee_ids:
        return [value.strip() for value in args.employee_ids.split(',') if value.strip()]
    raise SystemExit("Provide employee IDs via --employee-ids or --employee-csv.")


def main():
    parser = build_parser()
    args = parser.parse_args()

    employee_ids = resolve_employee_ids(args)
    output_path = ensure_parent_dir(Path(args.output))

    with output_path.open("w", encoding="utf-8") as outfile:
        generate_externship_info(outfile, args.count, employee_ids)

    save_and_report(output_path, "✓ Generated Externship Info data")


if __name__ == "__main__":
    main()

