"""
Generate dummy data for the EmploymentHistory table.
"""
from __future__ import annotations

import argparse
from pathlib import Path
from typing import List

from _shared import generate_employment_history
from utils import (
    ensure_parent_dir,
    load_column_from_csv,
    parse_comma_separated_ints,
    save_and_report,
)

DEFAULT_EMPLOYEE_COLUMN = "employeeId"
DEFAULT_DESIGNATION_COLUMN = "designationId"


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Generate dummy Employment History data.")
    parser.add_argument(
        "--count",
        type=int,
        default=60,
        help="Number of employment history records to generate (default: 60).",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("employment_history.csv"),
        help="Output CSV path (default: employment_history.csv).",
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
    parser.add_argument(
        "--designation-csv",
        type=Path,
        help="Path to a designation CSV to reuse designation IDs.",
    )
    parser.add_argument(
        "--designation-column",
        type=str,
        default=DEFAULT_DESIGNATION_COLUMN,
        help=f"Column name for designation IDs in the CSV (default: {DEFAULT_DESIGNATION_COLUMN}).",
    )
    parser.add_argument(
        "--designation-ids",
        type=str,
        help="Comma separated list of designation IDs if no CSV is supplied.",
    )
    return parser


def resolve_ids_from_args(values_arg: str | None, csv_arg: Path | None, column: str, *, cast=int) -> List:
    if csv_arg:
        values = load_column_from_csv(Path(csv_arg), column)
        return [cast(value) for value in values if value]
    if values_arg:
        if cast is int:
            return parse_comma_separated_ints(values_arg)
        return [cast(value) for value in values_arg.split(',') if value.strip()]
    return []


def main():
    parser = build_parser()
    args = parser.parse_args()

    employee_ids = resolve_ids_from_args(
        args.employee_ids,
        args.employee_csv,
        args.employee_column,
        cast=str,
    )
    if not employee_ids:
        raise SystemExit("No employee IDs available. Provide --employee-ids or --employee-csv.")

    designation_ids = resolve_ids_from_args(
        args.designation_ids,
        args.designation_csv,
        args.designation_column,
    )
    if not designation_ids:
        raise SystemExit("No designation IDs available. Provide --designation-ids or --designation-csv.")

    output_path = ensure_parent_dir(Path(args.output))
    with output_path.open("w", encoding="utf-8") as outfile:
        generate_employment_history(outfile, args.count, employee_ids, designation_ids)

    save_and_report(output_path, "✓ Generated Employment History data")


if __name__ == "__main__":
    main()

