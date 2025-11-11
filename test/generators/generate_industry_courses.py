"""Generate dummy data for industry-collaborative courses."""
from __future__ import annotations

import argparse
from pathlib import Path

from _shared import DEFAULT_EMPLOYEE_DEPARTMENTS, generate_industry_courses
from utils import ensure_parent_dir, parse_comma_separated, save_and_report


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Generate dummy industry collaboration courses data.")
    parser.add_argument(
        "--start-year",
        type=int,
        default=2019,
        help="Starting year for course offerings (default: 2019).",
    )
    parser.add_argument(
        "--years",
        type=int,
        default=5,
        help="Number of yearly records to create (default: 5).",
    )
    parser.add_argument(
        "--courses-per-year",
        type=int,
        default=10,
        help="Number of industry courses per year (default: 10).",
    )
    parser.add_argument(
        "--departments",
        type=str,
        help="Optional comma separated list of departments to sample from.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("industry_courses.csv"),
        help="Output CSV path (default: industry_courses.csv).",
    )
    return parser


def main():
    parser = build_parser()
    args = parser.parse_args()

    dept_pool = parse_comma_separated(args.departments) if args.departments else DEFAULT_EMPLOYEE_DEPARTMENTS
    years = [args.start_year + offset for offset in range(max(args.years, 0))]
    output_path = ensure_parent_dir(Path(args.output))

    with output_path.open('w', encoding='utf-8') as outfile:
        generate_industry_courses(outfile, years, departments=dept_pool, courses_per_year=args.courses_per_year)

    save_and_report(output_path, '✓ Generated industry_courses.csv')


if __name__ == "__main__":
    main()
