"""
Generate dummy data for the AdditionalRoles table.
"""
from __future__ import annotations

import argparse
from pathlib import Path
from typing import List

from _shared import generate_additional_roles
from utils import (
    ensure_parent_dir,
    load_column_from_csv,
    parse_comma_separated_ints,
    save_and_report,
)

DEFAULT_HISTORY_COLUMN = "historyId"
DEFAULT_EMPLOYEE_COLUMN = "employeeId"


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Generate dummy Additional Roles data.")
    parser.add_argument(
        "--count",
        type=int,
        default=20,
        help="Number of additional roles records to generate (default: 20).",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("additional_roles.csv"),
        help="Output CSV path (default: additional_roles.csv).",
    )
    parser.add_argument(
        "--history-csv",
        type=Path,
        help="Path to an employment history CSV to reuse history IDs.",
    )
    parser.add_argument(
        "--history-column",
        type=str,
        default=DEFAULT_HISTORY_COLUMN,
        help=f"Column name for history IDs in the CSV (default: {DEFAULT_HISTORY_COLUMN}).",
    )
    parser.add_argument(
        "--history-ids",
        type=str,
        help="Comma separated list of history IDs if no CSV is supplied.",
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


def resolve_history_ids(args) -> List[int]:
    if args.history_csv:
        values = load_column_from_csv(Path(args.history_csv), args.history_column)
        return [int(value) for value in values if value]
    if args.history_ids:
        return parse_comma_separated_ints(args.history_ids)
    return []


def resolve_employee_ids(args) -> List[str]:
    if args.employee_csv:
        return load_column_from_csv(Path(args.employee_csv), args.employee_column)
    if args.employee_ids:
        return [value.strip() for value in args.employee_ids.split(',') if value.strip()]
    return []


def main():
    parser = build_parser()
    args = parser.parse_args()

    history_ids = resolve_history_ids(args)
    if not history_ids:
        raise SystemExit("No history IDs available. Provide --history-ids or --history-csv.")

    employee_ids = resolve_employee_ids(args)
    if not employee_ids:
        raise SystemExit("No employee IDs available. Provide --employee-ids or --employee-csv.")

    output_path = ensure_parent_dir(Path(args.output))
    with output_path.open("w", encoding="utf-8") as outfile:
        generate_additional_roles(outfile, args.count, history_ids, employee_ids)

    save_and_report(output_path, "✓ Generated Additional Roles data")


if __name__ == "__main__":
    main()

